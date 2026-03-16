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

This game is split into **DATA files** and **LOGIC files**.

**DATA files** = What you edit! Simple settings, no coding needed.
**LOGIC files** = How the game works. You don't need to touch these!

---

## File Guide (What to Edit)

### DATA FILES (Edit these!)

| File | What's inside | Examples |
|------|---------------|----------|
| `js/data/settings.js` | Game settings (numbers) | World size, enemy speed, spawn rates |
| `js/data/villagers.js` | Villager characters | Names, colors, conversations, trades |
| `js/data/recipes.js` | Crafting recipes | What ingredients make what items |
| `js/data/shop-items.js` | Shop items | What you can buy with pig coins |
| `js/data/enemies.js` | Enemy stats | Badger/weasel speed, damage, colors |

### LOGIC FILES (Don't edit unless you know what you're doing)

| File | What it does |
|------|--------------|
| `js/config.js` | Connects data files to game |
| `js/effects.js` | Makes effects work |
| `js/game.js` | Game loop, sounds |
| `js/player.js` | Player movement |
| `js/enemies.js` | Enemy behavior |
| `js/dialogs.js` | Conversation system |
| `js/ui.js` | Menus and HUD |
| `js/items.js` | Resource collection |
| `js/environment.js` | Trees, ground, village |

---

## Easy Changes (js/data/settings.js)

Open `js/data/settings.js` to change game difficulty!

### Make the Game Easier or Harder

Find these lines:

```javascript
// How often do new enemies appear? (in milliseconds)
ENEMY_SPAWN_RATE: 4000,    // 4000 = 4 seconds

// Maximum number of enemies at once
MAX_ENEMIES: 15,

// How close before enemies notice you and start chasing?
ENEMY_DETECTION_RANGE: 40,
```

**EASY MODE:**
```javascript
ENEMY_SPAWN_RATE: 10000,    // Enemies appear less often
MAX_ENEMIES: 5,              // Fewer enemies
ENEMY_DETECTION_RANGE: 20,   // Enemies have bad eyesight
```

**HARD MODE:**
```javascript
ENEMY_SPAWN_RATE: 2000,     // Enemies appear every 2 seconds!
MAX_ENEMIES: 25,             // Lots of enemies!
ENEMY_DETECTION_RANGE: 60,   // Enemies see you from far away!
```

### Change Resource Prices

```javascript
RESOURCE_PRICES: {
    berries: 2,      // Collecting a berry gives you 2 coins
    nuts: 5,         // Collecting a nut gives you 5 coins
    mushrooms: 10    // Collecting a mushroom gives you 10 coins
},
```

### Change Food Healing

```javascript
FOOD_HEALING: {
    berries: 5,      // Eating a berry heals 5 health
    nuts: 8,         // Eating a nut heals 8 health
    mushrooms: 12    // Eating a mushroom heals 12 health
},
```

---

## Add a Shop Item (js/data/shop-items.js)

Open `js/data/shop-items.js` and add a new item:

```javascript
{
    id: 'mega_heal',           // Unique name (no spaces!)
    name: 'Mega Heal',         // What players see
    description: 'Full health + 100 bonus points!',
    price: 75,                 // Cost in pig coins
    icon: '💖',                // Any emoji works!

    // What happens when you buy it:
    effect: {
        type: 'combo',         // 'combo' = do multiple things
        effects: [
            { type: 'full_heal' },           // Heal to 100
            { type: 'give_score', amount: 100 }  // +100 points
        ]
    }
}
```

### Effect Types You Can Use

| Effect | What it does | Example |
|--------|--------------|---------|
| `heal` | Add health | `{ type: 'heal', amount: 30 }` |
| `full_heal` | Set health to 100 | `{ type: 'full_heal' }` |
| `give_coins` | Add pig coins | `{ type: 'give_coins', amount: 50 }` |
| `give_score` | Add score points | `{ type: 'give_score', amount: 100 }` |
| `combo` | Do multiple things | See example above |

---

## Add a Crafting Recipe (js/data/recipes.js)

Open `js/data/recipes.js` and add a new recipe:

```javascript
{
    id: 'super_snack',
    name: 'Super Snack',
    description: 'Heals 50 health and gives 100 points!',

    // What resources are needed:
    cost: {
        berries: 8,
        nuts: 4,
        mushrooms: 3
    },

    // What happens when crafted:
    effect: {
        type: 'combo',
        effects: [
            { type: 'heal', amount: 50 },
            { type: 'give_score', amount: 100 }
        ]
    }
}
```

---

## Create Your Own Villager (js/data/villagers.js)

Open `js/data/villagers.js` and add a new villager!

### Simple Villager (Just Talks)

```javascript
{
    name: "Max",
    role: "Adventurer",

    // Colors (see color guide below)
    skinColor: 0xffccaa,       // Peachy skin
    outfitColor: 0x0066ff,     // Blue clothes
    hatColor: 0xff0000,        // Red hat (use null for no hat)

    // Where they stand in the village
    position: { x: 30, z: 10 },

    // What they say
    conversation: {
        start: 'hello',        // Which node to start with

        nodes: {
            'hello': {
                text: "Hey there! I'm Max the adventurer!",
                choices: [
                    { text: "Hi Max!", nextNode: 'chat' },
                    { text: "Bye!", nextNode: null }    // null = end conversation
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
                text: "Always keep food in your inventory! Press 1, 2, or 3 to eat.",
                choices: [
                    { text: "Thanks!", nextNode: null }
                ]
            }
        }
    }
}
```

### Trading Villager (Trades Resources for Rewards)

```javascript
{
    name: "Doc Hooves",
    role: "Village Doctor",

    skinColor: 0xffc0cb,       // Pink skin
    outfitColor: 0xffffff,     // White coat
    hatColor: null,            // No hat

    position: { x: -25, z: 5 },

    conversation: {
        start: 'greeting',

        nodes: {
            'greeting': {
                text: "Hello! I'm the village doctor. Need healing?",
                choices: [
                    {
                        text: "Heal me! (costs 5 berries)",
                        nextNode: 'healed',

                        // This is the trade!
                        effect: {
                            type: 'trade',
                            cost: { berries: 5, nuts: 0, mushrooms: 0 },
                            reward: { health: 100, coins: 0, score: 0 }
                        },

                        // If player doesn't have enough, go here:
                        failNode: 'not_enough'
                    },
                    { text: "No thanks", nextNode: null }
                ]
            },

            'healed': {
                text: "There you go! All better now!",
                choices: [
                    { text: "Thanks doc!", nextNode: null }
                ]
            },

            'not_enough': {
                text: "Sorry, you need 5 berries for healing!",
                choices: [
                    { text: "I'll come back later", nextNode: null }
                ]
            }
        }
    }
}
```

### How Conversations Flow

```
start: 'greeting'
     │
     ▼
┌─────────────────────────────────────────┐
│  'greeting' node:                       │
│  text: "Hello! Need healing?"           │
│                                         │
│  [Heal me!] ────► 'healed' (if success) │
│              └──► 'not_enough' (if fail)│
│  [No thanks] ───► null (end)            │
└─────────────────────────────────────────┘
```

---

## Change Colors

Colors use **hex codes**: `0xRRGGBB`

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

## Change Enemies (js/data/enemies.js)

Each enemy in the `ENEMIES` array has everything in one place: stats AND colors!

### Enemy Properties Explained

```javascript
{
    id: 'badger',              // Unique name for this enemy
    type: 'badger',            // Which 3D model ('badger' or 'weasel')
    speed: 3,                  // How fast (player walks at 6)
    speedVariation: 1,         // Random 0-1 added to speed
    damage: 15,                // Health lost per second when touching
    radius: 0.8,               // Collision hitbox size
    size: 1,                   // Model scale (1 = normal, 2 = double)
    health: 1,                 // Hits to kill (1 = one hit)
    spawnWeight: 1,            // Spawn frequency (see below)
    minimapColor: '#ff4444',   // Color on the minimap

    // Colors for the 3D model
    colors: {
        body: 0x2f2f2f,        // Dark gray body
        stripes: 0xffffff,     // White face stripes
        eyes: 0xff3333,        // Red eyes
        // ... more colors depending on type
    }
}
```

### Spawn Weight (Rarity)

`spawnWeight` controls how often each enemy spawns:

- `spawnWeight: 1` = Normal (baseline)
- `spawnWeight: 2` = Twice as common
- `spawnWeight: 0.5` = Half as common
- `spawnWeight: 0.1` = Very rare (10% as common)
- `spawnWeight: 0.01` = Extremely rare

### Add a New Enemy (Easy!)

Just copy an existing enemy and change the values:

```javascript
// Add this to the ENEMIES array:
{
    id: 'fast_weasel',
    type: 'weasel',            // Uses weasel 3D model
    speed: 7,                  // Much faster!
    speedVariation: 1,
    damage: 5,                 // Less damage to balance
    radius: 0.6,
    size: 0.8,                 // Smaller (80% size)
    health: 1,
    spawnWeight: 0.5,          // Rarer (spawns half as often)
    minimapColor: '#ffcc00',   // Yellow dot

    // Same colors as regular weasel, or customize!
    colors: {
        body: 0x8b4513,
        snout: 0xd2691e,
        nose: 0x1a1a1a,
        eyes: 0xffff00,
        eyeGlow: 0x333300,
        ears: 0x8b4513,
        legs: 0x6b3310
    }
}
```

### Make a Giant Boss Enemy

Use `size` and `health` for tough enemies:

```javascript
{
    id: 'alpha_badger',
    type: 'badger',
    speed: 4,
    speedVariation: 1,
    damage: 25,
    radius: 1.2,
    size: 1.5,                 // 50% bigger!
    health: 3,                 // Takes 3 hits to kill!
    spawnWeight: 0.1,          // Very rare
    minimapColor: '#ff0000',

    colors: {
        body: 0x1a1a1a,        // Almost black (scarier!)
        stripes: 0xcccccc,
        snout: 0x0a0a0a,
        eyes: 0xff0000,        // Blood red eyes
        eyeGlow: 0x660000,
        legs: 0x0a0a0a
    }
}
```

### Make Tiny Enemies

```javascript
{
    id: 'tiny_weasel',
    type: 'weasel',
    speed: 6,
    speedVariation: 1,
    damage: 3,
    radius: 0.3,
    size: 0.5,                 // Half size!
    health: 1,
    spawnWeight: 0.3,
    minimapColor: '#ffcc00',
    colors: { /* weasel colors */ }
}
```

### Make Peaceful Enemies

Set damage to 0:

```javascript
{
    id: 'friendly_badger',
    type: 'badger',
    speed: 2,
    damage: 0,                 // No damage!
    size: 1,
    health: 1,
    // ...
}
```

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

### Easy Mode Settings (settings.js)
```javascript
ENEMY_SPAWN_RATE: 15000,
MAX_ENEMIES: 3,
ENEMY_DETECTION_RANGE: 15,
```

### Rich Start (settings.js)
```javascript
STARTING_COINS: 1000,
STARTING_RESOURCES: {
    berries: 50,
    nuts: 50,
    mushrooms: 50
},
```

### Super Healing Food (settings.js)
```javascript
FOOD_HEALING: {
    berries: 20,
    nuts: 35,
    mushrooms: 50
},
```

### Peaceful Enemies (enemies.js)

Change the damage to 0 in your enemies:

```javascript
damage: 0,    // No damage!
```

### Add a Rare Boss Enemy (enemies.js)

Add this to the ENEMIES array for a challenging rare enemy:

```javascript
{
    id: 'alpha_badger',
    type: 'badger',
    speed: 5,
    speedVariation: 1,
    damage: 25,
    radius: 1.2,
    size: 1.5,             // 50% larger!
    health: 3,             // Takes 3 hits to kill!
    spawnWeight: 0.1,      // Very rare (10% as common)
    minimapColor: '#ff0000',
    colors: {
        body: 0x1a1a1a,
        stripes: 0xcccccc,
        snout: 0x0a0a0a,
        eyes: 0xff0000,
        eyeGlow: 0x660000,
        legs: 0x0a0a0a
    }
}
```

---

## Have Fun!

This is YOUR game now. Try crazy things! Make it weird! If something breaks, you can always undo your changes or re-download the original files.

Happy coding!
