# Code Audit Report — Evax

**Date:** 2026-04-17  
**Scope:** Full codebase scan across all JS files + index.html  
**Focus:** Bugs, exploits, code smells, performance, bad practices

---

## Critical Issues

### 1. Dialog failNode fallback is broken
**File:** `js/dialogs.js` ~line 624  
**Type:** Bug  
```js
const failNodeId = choice.failNode || 'trade_fail' || 'heal_fail';
```
`'trade_fail'` is always truthy, so `'heal_fail'` is unreachable. Granny Trotter's healing failure will always try to route to `trade_fail` instead of `heal_fail`.

---

### 2. Item duplication via hotbar swap race condition
**File:** `js/inventory.js` ~line 517  
**Type:** Exploit  
When swapping items between hotbar slots, the existing item is added back to inventory *before* the source item is removed. Rapid swaps can duplicate items because `addItemToInventory()` runs before `splice()` removes the source.

---

### 3. XSS via innerHTML in inventory/quest rendering
**File:** `js/inventory.js` ~lines 1236, 1379  
**Type:** Security  
Artifact slots and quest log content are built with string concatenation and injected via `innerHTML`:
```js
html += '<div class="quest-clue-name">' + step.name + '</div>';
document.getElementById('quest-log-content').innerHTML = html;
```
All data is currently hardcoded so low immediate risk, but this pattern will break if any data ever comes from external sources. Should use `textContent` or `createElement`.

---

### 4. Geometry/material memory leaks on biome switch
**File:** `js/environment.js` (rebuildForBiome), `js/enemies.js` (model rebuilds)  
**Type:** Performance / Memory leak  
When switching biomes, meshes are removed from the scene with `scene.remove()` but their geometries and materials are never `.dispose()`d. Same issue when oxen/deer models are rebuilt (e.g. horn growth, pregnancy belly). Over a long session this leaks WebGL memory steadily.

---

### 5. Snow particle system unbounded growth
**File:** `js/environment.js` ~line 1401  
**Type:** Performance / Memory leak  
Snow particles are created every frame in the snowy biome but the particle array is never capped or cleaned. Extended play in the snow biome causes frame rate collapse.

---

### 6. Petal trail array unbounded growth (Blossom skin)
**File:** `js/game.js` ~line 4765  
**Type:** Performance / Memory leak  
`GameState.petalTrails` grows without bound when wearing the Blossom skin. Petals spawn every 0.2s, each creating a new mesh. After 5+ minutes of continuous movement, hundreds of meshes accumulate.

---

### 7. Piglet combat abilities have no range limit
**File:** `js/game.js` ~line 7036  
**Type:** Exploit  
`findNearestHostileEnemy()` searches ALL enemies with `nearestDist = Infinity` — no max range. A piglet with combat abilities (hair shot, fire charge, spice attack) can attack enemies across the entire map.

---

### 8. Flamingo mounting has no distance check
**File:** `js/game.js` ~line 8021  
**Type:** Exploit  
`tryMountFlamingo()` uses raycaster hit detection but never validates distance. If the camera is aimed correctly, a player can mount a flamingo from across the map.

---

### 9. Null reference in hunt prey lookup
**File:** `js/enemies.js` ~line 6172  
**Type:** Bug  
`triggerSnowCaninonHunt()` calls `findNearestPrey()` which can return null if no deer/oxen exist, but the code proceeds to access `prey.id` without a null check. Crashes when no prey is available.

---

### 10. Division by zero in hunt outcome
**File:** `js/enemies.js` ~line 6586  
**Type:** Bug  
`determineHuntOutcome()` uses pack size in probability calculations but has no guard against `packMembers.length === 0`, producing NaN results.

---

## High-Priority Issues

### 11. Larry quest completion can be double-clicked
**File:** `js/dialogs.js` ~line 445  
**Type:** Exploit  
The "Hand them over!" button on Larry's quest completion deducts resources and gives rewards, but doesn't immediately disable itself. Rapid clicking gives duplicate rewards.

---

### 12. Cherry petal collection has no cooldown
**File:** `js/game.js` ~line 5594  
**Type:** Exploit  
`collectCherryPetals()` can be called every frame by spamming E near a cherry tree. No cooldown tracking means unlimited petal farming.

---

### 13. Sheep population uncapped
**File:** `js/game.js` ~line 5241  
**Type:** Performance  
No cap on total sheep/lamb count. Mating cooldown resets, so sheep breed indefinitely. After hours of play, 1000+ sheep can exist, tanking performance.

---

### 14. Full DOM rebuild on every inventory refresh
**File:** `js/inventory.js` ~line 189  
**Type:** Performance  
`refreshInventory()` wipes `grid.innerHTML` and recreates all DOM elements from scratch on every call. This triggers full reflow/repaint and causes visible stuttering.

---

### 15. DOM queries on every mousemove during drag
**File:** `js/inventory.js` ~line 463  
**Type:** Performance  
`getHotbarSlotAtPosition()` calls `querySelectorAll('.hotbar-slot')` and `getBoundingClientRect()` on every mousemove event (100+ times/second). Slot rects should be cached at drag start.

---

### 16. Bestiary animation loop never stops
**File:** `js/inventory.js` ~line 974  
**Type:** Memory leak  
`animateBestiaryViewer()` uses `requestAnimationFrame` in a loop. If `cleanupBestiaryViewer()` isn't called (dialog closes unexpectedly, error during cleanup), the loop runs forever in the background. Opening/closing inventory repeatedly stacks multiple loops.

---

### 17. Villagers can be created twice
**File:** `js/dialogs.js` ~line 148  
**Type:** Bug  
`createVillagers()` pushes to `GameState.villagers` and adds to scene without checking if already initialized. If called twice (e.g. on scene reset), duplicate villagers appear with doubled dialog prompts.

---

### 18. Pending heal state never cleaned up
**File:** `js/dialogs.js` ~line 640  
**Type:** Bug  
`GameState._pendingHealPigletId` and `_pendingHealCost` persist indefinitely if the dialog is closed before completing. Stale values can cause wrong healing in future dialogs.

---

### 19. Resource keys can become NaN
**File:** `js/effects.js` ~line 174  
**Type:** Bug  
```js
GameState.resourceCounts.cherry_petals -= 30;
```
If `cherry_petals` doesn't exist yet, this produces `undefined - 30 = NaN`. The NaN then propagates through all resource math. Should use `(x || 0) - 30`.

---

### 20. Repeated `new THREE.Raycaster()` allocations
**File:** `js/game.js` ~lines 4610, 4657, 8320  
**Type:** Performance  
New raycaster objects are created on every click and some per-frame checks. Should be created once and reused.

---

## Medium-Priority Issues

### 21. Easter event state not saved
**File:** `js/game.js` / `js/save.js`  
**Type:** Data loss  
`GameState.easterEventActive`, `GameState.easterSheep`, `GameState.easterQuest` are never saved to localStorage. All Easter progress (sheep herds, active quests) is lost on page reload.

---

### 22. `O(n*m)` enemy distance checks every frame
**File:** `js/game.js` ~line 7035, `js/enemies.js` ~line 6172  
**Type:** Performance  
Piglet abilities iterate ALL enemies every frame. Hunt checks iterate ALL deer/oxen herds. With 100+ animals, these become performance bottlenecks. No spatial indexing.

---

### 23. River normals not recalculated after deformation
**File:** `js/environment.js` ~line 36  
**Type:** Bug (visual)  
Ground geometry vertices are manually repositioned for the river valley, but `computeVertexNormals()` is never called after. Lighting on the terrain near the river is incorrect.

---

### 24. Ocean wave animation is frame-rate dependent
**File:** `js/environment.js` ~line 1237  
**Type:** Bug  
Wave animation uses raw `time` without deltaTime normalization. Higher frame rates = faster waves.

---

### 25. Pup maturity timer uses wrong field
**File:** `js/enemies.js` ~line 7150  
**Type:** Bug  
Snow caninon pups are spawned with `maturityTime = now + 180000` but the update loop checks `userData.age` instead of `userData.maturityTime`. Pups never properly mature.

---

### 26. Skin features may be dead code
**File:** `js/data/skins.js`  
**Type:** Code smell  
Several skin properties need verification:
- `tailOverride: 'fuse'` (Shimmering Bomb) — does the tail renderer handle this?
- `fogReduction: 0.5` (Memory Collector) — does the fog system read this?
- `leavesPetalTrail: true` (Blossom) — petal trail system exists but may not check this flag

---

### 27. Lamb skin unlock conditions may never trigger
**File:** `js/data/skins.js` ~line 80  
**Type:** Bug  
15 lamb skins have `unlockCondition: { type: 'lambCaught', lambId: '...' }`. If the lamb catching system doesn't write to `GameState.lambsCaught` with matching IDs, these skins are permanently locked.

---

## Code Smells

### 28. Massive monolithic update functions
**Files:** `js/enemies.js`, `js/game.js`  
Functions like `updateSnowCaninonBehavior` (395 lines), `updateBakkaSealBehavior` (378 lines), and `updateEasterSheep` handle 5+ behavioral states in a single function. Should be broken into state-specific handlers.

---

### 29. Duplicated herd/pack following logic (4x)
**File:** `js/enemies.js`  
Nearly identical herd-following code is copy-pasted across antelope, wild dogs, snow caninons, and oxen. A shared `updateHerdFollowing()` function would eliminate ~300 lines of duplication.

---

### 30. Duplicated lamb AI code (2x)
**File:** `js/game.js` ~lines 4512 vs 5292  
`updateEasterLamb` and `updateSheepBornLambs` share 90+ lines of identical idle/running/looking_back state machine logic.

---

### 31. `useStoredResource()` switch statement duplication
**File:** `js/items.js` ~line 26  
Each resource type (berry, nut, mushroom, egg, etc.) has an identical case block differing only in the key name. Should be a lookup table:
```js
const config = resourceConfig[type];
if (GameState.resourceCounts[config.key] > 0) { ... }
```

---

### 32. `createResource()` mesh creation duplication
**File:** `js/items.js` ~line 121  
173 lines of nearly identical Three.js mesh creation code, one case per resource type. Should extract into per-resource builder functions or a data-driven approach.

---

### 33. Magic numbers everywhere
**Files:** All  
Hard-coded values scattered throughout with no named constants:
- `2` second biome transition wait
- `0.6` lamb flee randomness scale
- `180` second pregnancy duration
- `15` unit default piglet ability range
- `10` second dig time

---

### 34. Hardcoded state strings
**File:** `js/game.js`, `js/enemies.js`  
State machine states like `'idle'`, `'running'`, `'looking_back'`, `'hunting'`, `'fleeing'` are raw strings used in comparisons everywhere. A typo silently breaks logic.

---

### 35. Mixed `var`/`let`/`const` declarations
**Files:** All JS files  
Inconsistent variable declarations across the codebase. Some files use ES5 `var` exclusively, others mix in `let`/`const`. Should standardize on `const` by default, `let` when reassignment is needed.

---

### 36. Window globals for testing functions
**File:** `js/game.js` ~line 5605  
20+ functions attached directly to `window` (`startEaster`, `stopEaster`, `spawnTestBunny`, etc.). Players can call these from the browser console. Should be gated behind `isTestingMode`.

---

## HTML/CSS Issues

### 37. 2613 lines of inline CSS
**File:** `index.html`  
All CSS is in a single `<style>` tag. Cannot be browser-cached separately. Should be extracted to external stylesheet(s).

---

### 38. Z-index chaos
**File:** `index.html`  
37 `position:fixed` elements with z-index values ranging from 2 to 9999. Five elements share `z-index: 100`. No systematic hierarchy — values appear arbitrary.

---

### 39. No CSS variables
**File:** `index.html`  
Colors, spacings, shadows, and timing values are hardcoded throughout. Color `#00ff88` appears in many places. Should use CSS custom properties.

---

### 40. No accessibility support
**File:** `index.html`  
Zero ARIA attributes across 197 element IDs and 123 buttons. No `role`, `aria-label`, `aria-live`, or semantic HTML tags (`<main>`, `<nav>`, `<section>`). No keyboard focus indicators.

---

### 41. Single media query for responsiveness
**File:** `index.html` ~line 1525  
Only one `@media` breakpoint defined. Complex game UI with fixed-position panels has no tablet/mobile adaptations.

---

## Summary

| Severity | Count | Key Areas |
|----------|-------|-----------|
| **Critical** | 10 | Memory leaks (3), exploits (3), null crashes (2), XSS (1), broken logic (1) |
| **High** | 10 | Exploits (3), performance (4), bugs (3) |
| **Medium** | 7 | Data loss, visual bugs, dead code, missing features |
| **Code Smell** | 9 | Duplication, magic numbers, naming, globals |
| **HTML/CSS** | 5 | Inline CSS, z-index, no variables, no a11y, no responsive |

### Recommended Fix Order

1. **Memory leaks** (#4, #5, #6, #16) — these degrade the game over time
2. **Exploits** (#2, #7, #8, #12) — players can break the game
3. **Crashes** (#9, #10, #17, #19) — null refs and NaN propagation
4. **Dialog bug** (#1) — broken failNode routing
5. **Save gaps** (#21) — Easter progress lost on reload
6. **Performance** (#14, #15, #20, #22) — DOM thrashing and O(n^2) loops
7. **Code quality** (#28-#36) — duplication and maintainability
8. **HTML/CSS** (#37-#41) — structure and accessibility

---

## Fixes Applied (2026-04-17)

### What was fixed

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | failNode OR chain | FIXED | Now checks if `trade_fail` node exists before falling back to `heal_fail` |
| 2 | Item duplication via hotbar | FIXED | Reordered: remove source first, then add displaced back |
| 6 | Petal trail unbounded | FIXED | Capped at `SETTINGS.BALANCE.PETAL_TRAIL_MAX`, geometry/material disposed |
| 12 | Cherry petal spam | FIXED | Added `SETTINGS.BALANCE.CHERRY_PETAL_COOLDOWN` timer |
| 13 | Sheep overpopulation | FIXED | Mating blocked above `SETTINGS.BALANCE.SHEEP_POPULATION_CAP` |
| 17 | Duplicate villagers | FIXED | Guard prevents re-creation if villagers already exist |
| 18 | Stale pending heal | FIXED | `closeDialog()` now clears `_pendingHealPigletId/Cost` |
| 19 | NaN resource keys | FIXED | Defensive `(x \|\| 0)` on cherry petal subtraction |
| 33 | Magic numbers | FIXED | Extracted 25+ constants to `SETTINGS.BALANCE` in `settings.js` |
| N/A | Rosie/Granny infinite gifts | FIXED | Added `once` flag to `give_resource` effect + `claimedGifts` persistence |
| N/A | Old dialog action system | REMOVED | Dead `executeDialogAction` + `choice.action` path removed |

### False positives (verified, not bugs)

| # | Issue | Why it's fine |
|---|-------|---------------|
| 5 | Snow particles unbounded | Fixed-count `THREE.Points` system — recycles, doesn't grow |
| 8 | Flamingo teleport mount | Already has `nearestDist = 5` distance check |
| 9 | Null prey in hunt | Already has `if (!nearestPrey) return` at line 6205 |
| 10 | Division by zero in hunt | Uses additive modifiers, no division |
| 11 | Larry double-click | Rewards given at render time, not on click — index increments immediately |
| 16 | Bestiary anim loop leak | `close()` already calls `cleanupBestiaryViewer()` which cancels the frame |
| 23 | River normals | `computeVertexNormals()` already called after deformation |
| 25 | Pup maturity field | `maturityTime` used consistently in both spawn and check |

### Still open (not fixed yet)

| # | Issue | Priority |
|---|-------|----------|
| 3 | XSS via innerHTML | Medium — all data currently hardcoded, low immediate risk |
| 4 | Geometry leaks on biome switch | Medium — needs full dispose pass across environment.js |
| 14 | Full DOM rebuild on inventory refresh | Medium — needs incremental update approach |
| 15 | DOM queries during drag | Medium — needs slot rect caching |
| 20 | Repeated raycaster allocs | Low — small per-click cost |
| 21 | Easter state not saved | Medium — needs save/load integration |
| 22 | O(n*m) enemy distance checks | Low — acceptable at current scale |
| 26-27 | Skin features / lamb unlock | Need verification per feature |
| 28-36 | Code smells | Low — maintenance, not gameplay |
| 37-41 | HTML/CSS | Low — structure and a11y |

---

## Testing Checklist

After applying the fixes above, manually verify each item:

### Core mechanics (settings extraction)
- [ ] **Stamina** — Sprint until empty, stop, verify it refills. Should feel same as before
- [ ] **Hunger** — Watch hunger bar drain. Should feel same rate as before
- [ ] **Thirst** — Watch thirst bar drain. Should feel slower than hunger
- [ ] **Water restore** — Stand still in river. Thirst should refill
- [ ] **Dehydration** — Let thirst hit 0, wait ~10 seconds, verify you take damage
- [ ] **Melee stamina** — Swing sword 7 times. Should fully deplete stamina bar

### Dialog fixes
- [ ] **Rosie cookie gift** — Talk to Rosie, ask about recipe, get butter+eggs. Talk again — should NOT get more
- [ ] **Granny cookie gift** — Same test: flour+sugar given once only
- [ ] **Granny healing** — Get hurt, talk to Granny, heal. If already healthy, should say "already healthy" (NOT "trade fail")
- [ ] **Rosie trade** — Trade 10 berries for health. Works. Try with <10 berries — should fail gracefully
- [ ] **Village re-entry** — Leave village, come back. Verify no duplicate NPCs appeared

### Exploit fixes
- [ ] **Hotbar swap** — Equip item to slot 1, then swap to slot 2. Item count stays the same
- [ ] **Cherry petals** — Spam E near a cherry tree rapidly. Should only collect every ~2 seconds
- [ ] **Sheep breeding** — Let sheep breed (or speed up time in testing mode). Total count should not exceed ~30

### Piglet abilities
- [ ] **Combat piglet** — Equip a combat piglet (hair shot, fire charge). Verify it attacks nearby enemies but NOT ones far away
- [ ] **Hunger slow** — Equip Biscuit piglet. Hunger should drain 30% slower
- [ ] **Thirst slow** — Equip Puddle piglet. Thirst should drain 30% slower
- [ ] **Speed boost** — Equip Spark piglet. Should run noticeably faster
- [ ] **Catch distance** — Approach a wild piglet. Should be catchable from ~8 units

### Memory / performance
- [ ] **Blossom skin petal trail** — Wear blossom skin, run for 5+ minutes. No frame rate drop
- [ ] **Flamingo mount** — Approach flamingo, press E from close range — mounts. From far away — does nothing

### Save/Load
- [ ] **Gift persistence** — Claim Rosie's gift, save game, reload page, load save. Gift should stay claimed
- [ ] **New game** — Start fresh game. All systems initialize (claimedGifts empty, no errors in console)
