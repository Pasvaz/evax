# Evax Roadmap

## Priority 1 — Core Systems (Must Finish)

These are half-built and need to be completed before the game makes sense.

### Player Progression
- Score exists but means nothing
- Hunger/thirst push you to collect resources, but there's no growth
- **Ideas from FEATURES.md:** Score = EXP, spend it to unlock things
- **Questions to answer:** What do you unlock? Recipes? Biomes? Abilities?
- **Goal:** Clear sense of "I'm getting stronger / further / smarter"

### Trading System
- Currency (Pig Coins) exists but has no real purpose yet
- Merchants exist but trading feels pointless
- **Questions to answer:** What's worth buying? Why save money vs spend it?
- **Goal:** Player should feel "I need coins to progress" — buying items from merchants should unlock real advantages (gear, maps, access to new areas)

### Crafting System
- 6 basic recipes exist but crafting has no purpose
- **Ideas from FEATURES.md:**
  - Gas mask for wastelands biome
  - Weapons to hunt food
  - Speed boosters to escape predators
  - Magic items to summon/study animals
- **Questions to answer:** What can ONLY be obtained through crafting? What makes crafting feel rewarding?
- **Goal:** Crafting = survival advantage. You NEED to craft to explore dangerous biomes

---

## Priority 2 — Survival Features (Enhance the Loop)

These make the survival gameplay deeper and more fun.

### Thirst System
- Water bar on the left of hunger bar
- Fill by standing still in water
- Drains slower than hunger, fills a bit slower too
- Running out = lose 5 health every 10 seconds

### Pee and Defecation
- Funny realism mechanic
- 2 minutes after eating: peccary leaves a poo where it stands
- 2 minutes after drinking: leaves a puddle of pee
- Poo/pee disappear after 2 minutes
- Minimal gameplay impact, maximum comedy

---

## Priority 3 — World Features (Make It Feel Alive)

### Terrain Altitude (Snow Biome)
- Add hills/elevation to the snowy mountains biome
- Requires: height function, player/animal Y adjustment, object placement
- Could extend to all biomes later
- **Medium-large task** — touches player, animals, environment, camera

### New Biomes
- Wastelands (needs gas mask to enter — ties into crafting!)
- Other biomes unlockable through artifacts

### Artifacts Expansion
- Currently 6 artifacts with lore
- Add artifacts that unlock new biome access
- Ningle's research hut as the discovery hub

---

## Priority 4 — Polish and Details

### Village Improvements
- Houses updated with nicer cottage style
- Villager positions adjusted
- Could add: gardens, market stalls, animal pens

### Animal AI Improvements
- More complex herd behaviors
- Predator/prey interactions
- Seasonal patterns?

### Inventory Enhancements
- Bestiary system is in (all animals documented)
- Could add: item descriptions, crafting hints, quest tracking

---

## Done (Completed Features)

- [x] 3 biomes: Arboreal, Savannah, Snowy Mountains
- [x] Village with 5 NPCs and dialog trees
- [x] 11 animal species with male/female/baby variants
- [x] Complex animal AI (herds, mating, hunting)
- [x] Hunger system
- [x] Resource collection (berries, nuts, mushrooms, seaweed, eggs)
- [x] Basic crafting (6 recipes)
- [x] Basic trading with merchants
- [x] Inventory and Bestiary viewer
- [x] 6 artifacts with lore
- [x] Research hut (Ningle, Drongat, Pokeir)
- [x] Camera orbit (click and drag)
- [x] Camera-relative movement (WASD follows camera angle)
- [x] Sprint sound effect
- [x] Cottage-style village houses
- [x] Model rotation convention (all animals face +X)
- [x] Testing spawn menu for all biomes
