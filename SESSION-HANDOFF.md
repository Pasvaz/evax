# Session Handoff — Save/Load System & Testing Mode

This document summarizes everything built in the current session with the Senior Developer so the next Claude session can get up to speed quickly and explain everything to the kid.

---

## What Was Built

### 1. Save/Load System (`js/save.js` — NEW FILE)

A full save/load engine using `localStorage`. Key features:

- **Save format version** (v1) with migration framework for future changes
- **13 fields saved**: health, hunger, thirst, score, pigCoins, timeElapsed, currentBiome, playerPosition, playerRotation, resourceCounts, inventoryItems, hotbarSlots, selectedHotbarSlot, artifacts, artifactsGiven, unlockedVillagers, currentLevel, hasSaddle, questClues, poopQueue, peeQueue
- **Bathroom queues** saved as deltas (`scheduledTime - timeElapsed`) and restored as (`timeElapsed + delta`)
- **Resource merging** — saved resources merged into `DEFAULT_RESOURCES` so new resource types default to 0
- **Item validation** — inventory/hotbar items checked against current `TOOL_STATS` on load; stale items stripped with warning
- **Biome validation** — checks biome still exists, score requirements, artifact requirements. On mismatch: warning + spawn in village
- **Artifact validation** — checks against current artifact data
- **Max 10 saves**, sorted newest first
- **Public API**: `gatherSaveData()`, `restoreSaveData()`, `getAllSaves()`, `saveGame(slotIndex, name)`, `deleteSave(index)`, `loadGame(index)`, `getMostRecentSave()`, `exportSave(index)`, `quickSave()`, `showSaveNotification(message)`

### 2. Start Screen Changes (`index.html`)

Replaced old buttons:
- ~~"Start Exploring"~~ → **"New Game"**
- ~~"Start Testing"~~ → **Removed** (now console-only)
- Added **"Continue"** button (hidden, shows if saves exist) — loads most recent save
- Added **"Load Game"** button (hidden, shows if saves exist) — opens saves modal

### 3. Saves Modal (`index.html` + `game.js`)

Full modal UI for managing saves:
- **Save mode**: shows "New Save" button + existing saves with "Overwrite" per slot
- **Load mode**: shows existing saves with "Load" per slot
- **Per-slot actions**: Overwrite/Load, Export JSON (downloads file), Delete (with confirm)
- **New Save** prompts for a name via `prompt()`. Overwrite keeps the existing name.
- Escape key closes the modal

### 4. Save Button in HUD (`index.html`)

- 💾 icon next to the "Time Survived" timer
- Important: `time-display` is now a `<span>` inside a `<div class="stat-value">` — the save button is a sibling, not a child (because `ui.js` overwrites `time-display.textContent` every frame)
- Has `pointer-events: auto` (required because `#ui-overlay` has `pointer-events: none`)
- Opens saves modal in save mode

### 5. Player Panel Layout (`index.html`)

- Score and progress bar now sit side-by-side (`.player-score-row` flex layout)
- This makes the stats panel fit in one row instead of wrapping to two lines

### 6. Testing Mode → Console Command (`game.js`)

- **Removed** the "Start Testing" button and password popup from the start screen
- **Added** `Game.test()` — activates testing mode from browser console
- **Added** `Game.test(false)` — exits testing mode
- **Snapshot/restore**: when entering test mode mid-game, snapshots 7 values (health, hunger, thirst, pigCoins, resourceCounts, hasSaddle, artifacts). On `Game.test(false)`, restores them so testing doesn't corrupt the real game state.

### 7. Extracted `spawnBiomeContent(biomeId)` (`game.js`)

- Extracted ~80 lines of biome-specific spawning code (animals, resources, artifacts, intervals) from `transitionToBiome` into a shared function
- Both `transitionToBiome` and `SaveSystem.restoreSaveData` call it
- Exported as `Game.spawnBiomeContent(biomeId)`

### 8. Enemy/Player Separation (`js/enemies.js`)

Added body separation logic in `updateEnemies()` (around line 11723) to prevent mesh overlapping during combat:

- **Enemy ↔ Player**: if an enemy overlaps the player, the enemy is pushed outward by 50% of the overlap distance along the separation axis
- **Enemy ↔ Enemy**: each pair of overlapping enemies is pushed apart by 25% of the overlap in opposite directions
- Both use `distance > 0.01` guard against division by zero
- Damage check reuses the same `separationRadius` variable
- Runs every frame, after movement but before damage
- **Known limitation**: enemies chasing from behind still overlap slightly because their forward chase speed competes with the push-back force. Works better when enemies are in front of the player.

### 9. setTimeout Race Condition Fix (`game.js`)

- `startGame()` has a 3-second `setTimeout` that spawns arboreal enemies
- When loading a save into a non-arboreal biome, this would fire and spawn wrong enemies
- Fixed by adding `&& GameState.currentBiome === 'arboreal'` check to the callback

### 10. Deferred Terrain Initialization (`game.js`)

- **Before**: `Game.init()` called `Environment.createGround()` + `Environment.createForest()` at page load, always building arboreal terrain — even when the player would load a savannah save
- **After**: `Game.init()` only sets up scene, camera, renderer, lighting, player mesh, UI, and event listeners. **No terrain is built at page load.**
- Terrain is now built at the moment we know the biome:
  - **New Game**: `Environment.rebuildForBiome('arboreal')` + `spawnBiomeContent('arboreal')`
  - **Continue/Load**: `restoreSaveData()` already calls `rebuildForBiome(targetBiome)` internally
  - **Game.test()** (from console, before game starts): `rebuildForBiome('arboreal')` + `spawnBiomeContent('arboreal')`
  - **Restart (death)**: always rebuilds arboreal via `rebuildForBiome('arboreal')`
- Every path now goes through `rebuildForBiome(biomeId)` — no special-case for arboreal
- `startGame()` is now a pure engine boot: UI visibility, audio init, testing flags, `gameRunning = true`
- Password popup HTML, CSS, and JS completely removed

---

## Files Changed

| File | Change |
|------|--------|
| `js/save.js` | **NEW** — entire save/load engine |
| `js/game.js` | Start screen wiring, save modal functions, `spawnBiomeContent()`, `Game.test()`/`Game.test(false)` with snapshot, setTimeout fix, deferred terrain init, password popup removed, M key map toggle |
| `js/enemies.js` | Enemy/player and enemy/enemy separation in `updateEnemies()` |
| `js/map.js` | **NEW** — hand-drawn SVG world map with biome regions, landmarks, player icon, locked overlays |
| `index.html` | Start screen buttons, saves modal HTML, save notification toast, save button in HUD, player panel layout, saves modal CSS, save button CSS, password popup removed, world map container + CSS |

---

## Script Load Order (in `index.html`)

```
js/config.js
js/save.js        ← NEW, loaded after config, before effects
js/effects.js
js/game.js
js/environment.js
...
```

---

## Known Design Decisions

- **No Ctrl+S shortcut** — removed, save is icon-only
- **Overwrite doesn't prompt for name** — keeps the existing save name
- **New Save prompts for name** — via browser `prompt()`, empty = auto-generated name (level + date)
- **Biome mismatch on load** — player spawns in village with a warning (not an error)
- **Testing mode via console** — `Game.test()` from console before game starts acts like New Game + test mode (no snapshot since there's nothing to restore). `Game.test()` mid-game takes a snapshot; `Game.test(false)` restores it.
- **Password popup removed** — HTML, CSS, and JS functions all deleted
- **No terrain at page load** — `Game.init()` no longer builds any terrain. The start screen shows over an empty canvas (the DOM overlay covers it). Terrain is built only when we know the biome.
- **Separation damage: stale distance** — the damage check uses the `distance` variable calculated BEFORE separation pushes the enemy away. This means an enemy that got pushed out of range still deals damage that frame. This is intentional for now — recalculating after push would make combat milder (enemies get one bite then bounce off). This is a **game design decision** for the kid to make. See `TEACHING-NOTES.md` "Separation vs Damage" section. My suggestion is to increase the damage and apply a bite and push mechanics.

### 11. World Map (`js/map.js` — NEW FILE)

Full-screen SVG world map with hand-drawn parchment style:
- **M key** to toggle open/close, **Escape** or click backdrop to close
- **4 biome regions**: Arboreal (center), Savannah (top), Snowy Mountains (top-right), Coastal (bottom)
- **Hand-drawn landmarks**: trees, acacia trees, birch trees, village huts, river, watering hole, research hut, snow temple, mountain peaks, ocean waves, shells, snowflakes
- **Peccary icon** showing player's current position (mapped from world coords to SVG)
- **Locked biomes**: foggy overlay with padlock + requirement text ("Score 500", "Skull Required", "Seal Tooth Required")
- **Lock state updates** dynamically based on score, artifacts, and testing mode
- **Parchment styling**: noise texture, double-line border, compass rose, Georgia serif font, sepia colors
- **Legend** in bottom-left showing map icons
- Dashed connection lines between biomes

---

## What's NOT Done Yet

- **Map: player movement while map is open** — player can still walk with WASD while viewing the map. If annoying, add a movement block when `WorldMap.isOpen()`.
- See `TECH_FEATS.md` and `ROADMAP.md` for other pending items.
