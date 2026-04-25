# Session Handoff

## Last Updated: 2026-04-18

---

## Changes This Session

### Bug Fixes (from CODE-AUDIT.md)
- **Dialog gift exploit** — Rosie/Granny could give unlimited resources by replaying dialog. Added `once` flag to `give_resource` effect in `js/effects.js`, tracked via `GameState.claimedGifts` (persisted in saves).
- **Dead dual dialog system** — Removed old `choice.action` / `executeDialogAction()` system from `js/dialogs.js`. Only `effectData` path remains.
- **failNode OR chain** — `js/dialogs.js:624` had `choice.failNode || 'trade_fail' || 'heal_fail'` where `heal_fail` was unreachable. Fixed with conditional lookup.
- **Duplicate villagers** — Added guard in `createVillagers()` to prevent re-initialization.
- **Stale pending heal** — `closeDialog()` now clears `_pendingHealPigletId` and `_pendingHealCost`.
- **Item duplication via hotbar swap** — Reordered operations in `js/inventory.js:equipToHotbar` (remove source before adding displaced).
- **NaN resource keys** — Added `(x || 0)` guard on petal subtraction in `js/effects.js`.
- **Cherry petal spam** — Added cooldown timer in `js/game.js` using `SETTINGS.BALANCE.CHERRY_PETAL_COOLDOWN`.
- **Sheep overpopulation** — Added pop cap check using `SETTINGS.BALANCE.SHEEP_POPULATION_CAP`.
- **Petal trail memory leak** — Capped trail array at `SETTINGS.BALANCE.PETAL_TRAIL_MAX` with proper geometry/material disposal.
- **Drongulinat Cat twitchy animation** — Walk used rotation.z, gallop used rotation.x, neither cleaned up the other axis. Added cross-axis decay in both modes. Reduced gallop cycle speed from `*12` to `*3` and spine bend from `0.8` to `0.4`.

### Data-Driven Settings
- Added `SETTINGS.BALANCE` section in `js/data/settings.js` with 25+ extracted constants (stamina, hunger, thirst, piglet abilities, interaction distances, sword spin, etc.).
- Replaced all hardcoded magic numbers in `js/game.js`, `js/player.js` with `SETTINGS.BALANCE.*` references.
- **Where weapon data lives**: Per-weapon stats (damage, chop behavior) are in `js/data/tools.js`. Combat timing (cooldown, stamina cost, spin range/duration) are in `js/data/settings.js` under `SETTINGS.BALANCE`.

### Sword Spin Slash (new combat mechanic)
- **Mechanic**: Click anywhere with sword equipped -> Pedro grabs sword in mouth -> 360 spin -> hits all enemies within range -> sword stays in mouth angled back during cooldown -> returns to back when ready.
- **Visual states**:
  - Sword on back (handle at shoulders, blade toward tail) = ready to swing
  - Sword in mouth, blade forward = spinning
  - Sword in mouth, angled diagonally back = recovering (cooldown active)
- **Key settings**: `SWORD_SPIN_RANGE: 5`, `SWORD_SPIN_DURATION: 0.4`, `SWORD_ATTACK_COOLDOWN: 3` in `js/data/settings.js`.
- **Sword positions** (in Pedro's local space):
  - Back mount: `position(0, 1.5, 0)`, `rotation.y = PI` (handle at shoulders)
  - Mouth (spinning): `position(2.2, 0.8, 0)`, `rotation(0,0,0)` (handle at snout, blade forward)
  - Mouth (recovering): `position(1.4, 0.8, -0.5)`, `rotation.y = PI*0.75` (angled back)
- **Files**: Combat logic in `js/game.js:onCombatClick`, spin animation in game loop, sword positions in `js/player.js` (`startSwordSpin` / `endSwordSpin` / `returnSwordToBack`).
- **Design**: AoE replaces old raycast-click-on-enemy. Missed swings still cost stamina + cooldown. Multi-hit if multiple enemies in range.
- **Combat hint**: Cooldown/stamina messages use `showCombatHint()` — small 22px text at bottom of screen, fades after 1.5s. Defined in `index.html` as `#combat-hint`, not the big centered `showBlockedMessage()`.

### Hotbar Unequip
- Click a filled hotbar slot to send item back to inventory.
- `UI.setupHotbar()` in `js/ui.js`, called during game init.

### Minimap Cleanup
- Removed: trees, goose nests, toad nests (noise).
- Simplified: resources use single gold color (`#e8c850`), arsenic mushrooms get purple (`#cc44ff`).
- Simplified: animals are red (hostile/retaliating) or grey (friendly), hostile dots bigger.
- CSS fix: added `overflow: hidden` + `box-sizing: border-box` to prevent canvas exceeding border.

### Toast Consistency
- `showToast` body now uses `innerHTML` (was `textContent`) so HTML formatting works.
- All key hints moved to the dedicated 3rd `key` parameter with consistent `Press <b>X</b>` format.
- Fixed HTML-in-title bug at `js/game.js` (title uses `textContent`, moved styling to body).

### Carcass System Improvements
- **Death pose**: Animals flip upside down (belly up, legs in air) via `enemy.rotation.x = Math.PI`. Height scales with animal size: `(groundY + size * 0.5)`.
- **Flies**: 1-3 random flies orbit each carcass. Size 0.025 radius, orbit scales with `animalSize`. Only visible within 20 units of player. Removed when carcass starts sinking.
- **Files**: `js/enemies.js:convertToCarcass` (death pose + flies), `updateCarcasses` (fly animation + cleanup).

### Resource Sparkle Particles
- **Bob**: Increased from `y = 0.1 ± 0.1` to `y = 0.5 ± 0.25` — resources float clearly above ground.
- **Sparkles**: Pool of 20 reusable tiny yellow spheres. Resources within 60 units emit sparkles; rate doubles between 30-60 units to help spot distant resources. Sparkles float upward with gentle gravity and fade out over ~0.6-1s.
- **Files**: `js/items.js` — `initSparklePool()`, `spawnSparkle()`, and update logic in `updateResources()`.

---

## Known Open Issues (from CODE-AUDIT.md)
- Geometry leaks on biome switch (#4)
- DOM rebuild on every inventory refresh (#14)
- DOM queries during drag (#15)
- Easter state not fully saved (#21)
- Various code smell items (#28-36)
- HTML/CSS items (#37-41)

See `CODE-AUDIT.md` for full details and testing checklist.

---

## Architecture Notes
- `js/data/` = pure data, `js/` = logic. `config.js` bridges them (maps `effect` -> `effectData` at lines 202-204).
- `GameState` is the central global state object.
- Pedro faces +X. Snout at x=1.6, head at x=1.2.
- Sword positions: back-mount at `(0, 1.5, 0)` rotated PI, mouth-spin at `(2.2, 0.8, 0)`, mouth-recover at `(1.4, 0.8, -0.5)`.
- Weapon stats: `js/data/tools.js` (per-weapon damage). Combat balance: `js/data/settings.js` (cooldowns, ranges, stamina costs).
- Cat animation: gallop uses rotation.x on legs/spine, walk uses rotation.z. Both modes must decay the other axis to prevent twitching.
