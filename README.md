# Peccary Survival Game

A fun 3D game where you play as a peccary (a wild pig) in a forest! Collect food, avoid enemies, and talk to friendly villagers.

## How to Play

1. Open `index.html` in your browser (Chrome, Firefox, Edge)
2. Click **Start Game**
3. Have fun!

| Key | What it does |
|-----|--------------|
| W A S D | Move around |
| SHIFT | Run fast |
| SPACE | Jump |
| 1 2 3 | Eat food to heal |
| E | Talk to villagers |
| TAB | Open crafting |
| ESC | Close menus |

---

# How to Change the Game

This section shows you how to make the game YOUR game! Each example shows exactly what to change.

---

## Easy Changes (config.js)

Open `js/config.js` to change these. This file has all the game settings!

### Make the Game Easier or Harder

Find these lines at the top:

```javascript
ENEMY_SPAWN_RATE: 4000,      // How often enemies appear (milliseconds)
MAX_ENEMIES: 15,              // How many enemies at once
ENEMY_DETECTION_RANGE: 40,    // How close before enemies chase you
```

**Easy mode:**
```javascript
ENEMY_SPAWN_RATE: 10000,     // Enemies appear less often
MAX_ENEMIES: 5,               // Fewer enemies
ENEMY_DETECTION_RANGE: 20,    // Enemies don't see you until very close
```

**Hard mode:**
```javascript
ENEMY_SPAWN_RATE: 2000,      // Enemies appear very often!
MAX_ENEMIES: 25,              // Lots of enemies!
ENEMY_DETECTION_RANGE: 60,    // Enemies see you from far away
```

### Change Resource Prices

```javascript
RESOURCE_PRICES: {
    berries: 2,      // Berries give you 2 coins
    nuts: 5,         // Nuts give you 5 coins
    mushrooms: 10    // Mushrooms give you 10 coins
},
```

**Make everything worth more:**
```javascript
RESOURCE_PRICES: {
    berries: 10,
    nuts: 20,
    mushrooms: 50
},
```

### Add a New Shop Item

Find `SHOP_ITEMS` and add a new item:

```javascript
SHOP_ITEMS: [
    // ... existing items ...
    {
        id: 'mega_heal',           // Unique name (no spaces!)
        name: 'Mega Heal',         // What players see
        description: 'Full health + 50 bonus points!',
        price: 100,                // Cost in pig coins
        icon: '💖',                // Any emoji works!
        effect: function() {
            GameState.health = 100;
            GameState.score += 50;
        }
    }
]
```

### Add a New Crafting Recipe

Find `CRAFT_RECIPES` and add:

```javascript
CRAFT_RECIPES: [
    // ... existing recipes ...
    {
        id: 'super_snack',
        name: 'Super Snack',
        description: 'Heals 50 health and gives 100 points!',
        cost: { berries: 8, nuts: 4, mushrooms: 3 },
        effect: function() {
            GameState.health = Math.min(100, GameState.health + 50);
            GameState.score += 100;
            Game.playSound('collect');
        }
    }
]
```

---

## Change Colors

Colors in this game use **hex codes**. Here's how they work:

```
0xRRGGBB
  ││││││
  ││││└└── Blue  (00 to FF)
  ││└└──── Green (00 to FF)
  └└────── Red   (00 to FF)
```

### Common Colors

| Color | Code | Color | Code |
|-------|------|-------|------|
| Red | `0xff0000` | Pink | `0xff69b4` |
| Green | `0x00ff00` | Purple | `0x800080` |
| Blue | `0x0000ff` | Orange | `0xffa500` |
| Yellow | `0xffff00` | Brown | `0x8b4513` |
| White | `0xffffff` | Black | `0x000000` |
| Gray | `0x808080` | Gold | `0xffd700` |

**Tip:** Search "hex color picker" online to find any color!

---

## Create Your Own Villager

Villagers are friendly pigs you can talk to. Here's how to add one!

### Step 1: Add Villager Data

In `js/config.js`, find `VILLAGER_DATA` and add:

```javascript
VILLAGER_DATA: [
    // ... existing villagers ...
    {
        name: "Max",                    // Villager's name
        role: "Adventurer",             // Their job
        skinColor: 0xffccaa,            // Skin color (pinkish)
        outfitColor: 0x0066ff,          // Clothes color (blue)
        hatColor: 0xff0000,             // Hat color (red) - remove this line for no hat
        position: { x: 30, z: 10 },     // Where they stand in the village
        conversationTree: {
            startNode: 'hello',
            nodes: {
                'hello': {
                    text: "Hey there! I'm Max the adventurer!",
                    choices: [
                        { text: "Hi Max!", nextNode: 'chat' },
                        { text: "Bye!", nextNode: null }
                    ]
                },
                'chat': {
                    text: "I've explored the whole forest! It's dangerous out there.",
                    choices: [
                        { text: "Any tips?", nextNode: 'tips' },
                        { text: "Cool! Bye!", nextNode: null }
                    ]
                },
                'tips': {
                    text: "Always keep food in your inventory! Press 1, 2, or 3 to eat when hurt.",
                    choices: [
                        { text: "Thanks!", nextNode: null }
                    ]
                }
            }
        }
    }
]
```

### How Conversations Work

```
startNode: 'hello'     <-- This is where the conversation begins
     │
     ▼
┌─────────────────────────────────────────┐
│  'hello' node:                          │
│  text: "Hey there!"                     │
│  choices:                               │
│    ├── "Hi Max!" ──────► goes to 'chat' │
│    └── "Bye!" ─────────► null = end     │
└─────────────────────────────────────────┘
     │
     ▼ (if player picks "Hi Max!")
┌─────────────────────────────────────────┐
│  'chat' node:                           │
│  text: "I've explored..."               │
│  choices:                               │
│    ├── "Any tips?" ────► goes to 'tips' │
│    └── "Cool! Bye!" ───► null = end     │
└─────────────────────────────────────────┘
```

### Villager That Trades With You

Want your villager to actually DO something? Add an `action`:

```javascript
{
    name: "Healer Pigsworth",
    role: "Doctor",
    skinColor: 0xffc0cb,
    outfitColor: 0xffffff,    // White coat
    position: { x: -20, z: 15 },
    conversationTree: {
        startNode: 'greeting',
        nodes: {
            'greeting': {
                text: "Hello! I'm the village doctor. Need healing?",
                choices: [
                    { text: "Heal me! (costs 5 berries)", action: 'heal_with_berries', nextNode: 'healed' },
                    { text: "No thanks", nextNode: null }
                ]
            },
            'healed': {
                text: "There you go! All better now!",
                choices: [
                    { text: "Thanks doc!", nextNode: null }
                ]
            },
            'heal_fail': {
                text: "Sorry, you need 5 berries for healing!",
                choices: [
                    { text: "I'll come back later", nextNode: null }
                ]
            }
        }
    }
}
```

Then in `js/dialogs.js`, find `executeDialogAction` and add your action:

```javascript
case 'heal_with_berries':
    if (GameState.resourceCounts.berries >= 5) {
        GameState.resourceCounts.berries -= 5;  // Take 5 berries
        GameState.health = 100;                  // Full health!
        UI.updateUI();
        return true;   // Success!
    }
    return false;      // Failed - not enough berries
```

### More Action Examples

```javascript
// Give the player coins
case 'give_coins':
    GameState.pigCoins += 50;
    UI.updateUI();
    return true;

// Trade nuts for health
case 'trade_nuts':
    if (GameState.resourceCounts.nuts >= 3) {
        GameState.resourceCounts.nuts -= 3;
        GameState.health = Math.min(100, GameState.health + 25);
        UI.updateUI();
        return true;
    }
    return false;

// Give score points
case 'bonus_points':
    GameState.score += 100;
    UI.updateUI();
    return true;

// Open the shop
case 'open_shop':
    UI.openShop();
    return true;
```

---

## Change the Player (Peccary)

Open `js/player.js` to change how your character looks and moves.

### Change Player Speed

Find this line (around line 143):

```javascript
const moveSpeed = isSprinting ? 12 : 6;
```

- `12` = speed when sprinting (holding SHIFT)
- `6` = normal walking speed

**Make player super fast:**
```javascript
const moveSpeed = isSprinting ? 25 : 15;
```

### Change Jump Height

Find this line (around line 175):

```javascript
GameState.velocity.y = 8;
```

**Jump higher:**
```javascript
GameState.velocity.y = 15;
```

**Super bouncy:**
```javascript
GameState.velocity.y = 25;
```

### Change Player Colors

Find these lines in the `createPeccary` function:

```javascript
// Body color (dark gray)
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });

// Collar color (white)
const collarMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
```

**Make a blue peccary with gold collar:**
```javascript
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0066ff });
const collarMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
```

---

## Change Enemies

Open `js/enemies.js` to change enemy behavior.

### Make Enemies Slower/Faster

Find these lines:

```javascript
// In createBadger (around line 70)
badger.userData = {
    type: 'badger',
    speed: 3 + Math.random() * 1,    // Speed: 3-4
    radius: 0.8,
    damage: 15                        // Damage per second
};

// In createWeasel (around line 140)
weasel.userData = {
    type: 'weasel',
    speed: 4.5 + Math.random() * 1.5, // Speed: 4.5-6
    radius: 0.6,
    damage: 10
};
```

**Slow, weak enemies:**
```javascript
speed: 1,
damage: 5
```

**Fast, dangerous enemies:**
```javascript
speed: 10,
damage: 30
```

### Change Enemy Colors

In `createBadger`, find:
```javascript
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2f2f2f });
```

In `createWeasel`, find:
```javascript
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
```

**Make a purple badger:**
```javascript
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x800080 });
```

---

## Change the World

### Change World Size

In `js/config.js`:

```javascript
WORLD_SIZE: 500,    // Current size
```

**Bigger world:**
```javascript
WORLD_SIZE: 1000,
```

**Tiny world:**
```javascript
WORLD_SIZE: 200,
```

### Change Starting Health/Coins

In `js/game.js`, find the `startGame` function:

```javascript
GameState.health = 100;
GameState.pigCoins = 50;
```

**Start with more:**
```javascript
GameState.health = 100;
GameState.pigCoins = 500;    // Rich!
```

---

## Add Sounds

Open `js/game.js` and find the `playSound` function. Each sound has:
- **frequency** = pitch (higher number = higher sound)
- **gain** = volume (0 to 1)
- **duration** = how long it plays

```javascript
case 'collect':
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    duration = 0.15;
    break;
```

**Make a deeper sound:**
```javascript
oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);  // Lower pitch
```

**Make it louder:**
```javascript
gainNode.gain.setValueAtTime(0.8, audioCtx.currentTime);  // Louder (max 1.0)
```

---

## File Guide

| File | What's inside | When to edit |
|------|---------------|--------------|
| `js/config.js` | All settings, shop items, recipes, villagers | Most changes go here! |
| `js/player.js` | Player looks and movement | Change speed, jump, colors |
| `js/enemies.js` | Enemy looks and behavior | Change enemy speed, damage |
| `js/items.js` | Resources and crafting | Add new collectibles |
| `js/dialogs.js` | How conversations work | Add dialog actions |
| `js/ui.js` | Screen displays | Change HUD, minimap |
| `js/game.js` | Game loop, sounds | Change sounds, starting values |
| `js/environment.js` | Trees, ground, village | Change world looks |
| `index.html` | Page layout, CSS styles | Change colors, fonts, layout |

---

## Testing Your Changes

1. **Save your file** after making changes
2. **Refresh the browser** (press F5 or Ctrl+R)
3. **If something breaks**, press F12 to open the console and see the error
4. **Undo your change** if it doesn't work, then try again

### Common Mistakes

| Problem | Solution |
|---------|----------|
| Game won't load | Check for missing commas, brackets, or quotes |
| Nothing changed | Did you save the file? Did you refresh? |
| Weird error message | You probably have a typo - check spelling! |
| "undefined" errors | Check that variable names match exactly |

---

## Quick Copy-Paste Examples

### Easy Mode Settings
```javascript
// In config.js
ENEMY_SPAWN_RATE: 15000,
MAX_ENEMIES: 3,
ENEMY_DETECTION_RANGE: 15,
```

### Give Player Lots of Starting Stuff
```javascript
// In game.js, in startGame function
GameState.health = 100;
GameState.pigCoins = 1000;
GameState.resourceCounts = { berries: 50, nuts: 50, mushrooms: 50 };
```

### Super Jump + Super Speed
```javascript
// In player.js
const moveSpeed = isSprinting ? 30 : 20;  // Super fast!
GameState.velocity.y = 20;                 // Super jump!
```

### Friendly Enemies (No Damage)
```javascript
// In enemies.js, for both badger and weasel
damage: 0
```

---

## Have Fun!

This is YOUR game now. Try crazy things! Make it weird! If something breaks, you can always undo your changes or re-download the original files.

Happy coding!
