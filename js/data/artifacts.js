/**
 * ============================================================================
 * ARTIFACTS DATA FILE
 * ============================================================================
 *
 * This file contains all the artifacts that can be found in the game.
 * Artifacts are mysterious items that can be given to Ningle and his
 * colleagues at the Research Hut in the savannah.
 *
 * Each artifact has:
 * - id: Unique identifier
 * - name: Display name
 * - icon: Emoji representation
 * - rarity: common, uncommon, rare, legendary
 * - spawnType: 'random', 'hidden', 'event', or 'special'
 * - biome: Which biome it can spawn in (null = any)
 * - lore: The story Ningle tells you about it
 * - reward: What you get for giving it to a scientist (optional)
 * - unlocksbiome: ID of biome this artifact unlocks (optional, for future)
 *
 * ============================================================================
 */

window.ARTIFACTS = [
    // ========================================================================
    // ANCIENT ITEMS
    // ========================================================================
    {
        id: 'ancient_pocket_watch',
        name: 'Ancient Pocket Watch',
        icon: '⏱️',
        rarity: 'uncommon',
        spawnType: 'random',
        biome: null,  // Can spawn anywhere
        description: 'A tarnished brass pocket watch. The hands are frozen at 3:47.',
        lore: `"Remarkable! This is a Thornberry Timepiece, crafted by the famous clockmaker Horace Thornberry over 200 years ago. See these tiny gears? Each one was hoof-carved from brass.

The Thornberry family were the first peccaries to measure time precisely. Before them, we simply watched the sun! This particular watch... the hands stopped at 3:47. I wonder what happened at that exact moment?

Some say Horace stopped all his watches at the moment of his greatest discovery. Others say it was when he saw the love of his life for the first time. We may never know, but isn't the mystery wonderful?"`,
        reward: { coins: 50, score: 100 }
    },

    {
        id: 'explorers_compass',
        name: "Explorer's Compass",
        icon: '🧭',
        rarity: 'uncommon',
        spawnType: 'hidden',
        biome: 'savannah',
        description: 'A weathered compass with strange markings around the edge.',
        lore: `"Oh my! This belonged to Captain Bristlesnout, the legendary explorer who mapped these very lands!

See these unusual markings? They're not compass directions - they're coded messages! Bristlesnout was paranoid about rivals stealing her discoveries, so she invented her own navigation system.

She traveled further than any peccary before her, discovering three new biomes! Sadly, her final expedition notes were never found. But her compass... it still points true north after all these years. Magnificent craftsmanship!"`,
        reward: { coins: 75, score: 150 }
    },

    // ========================================================================
    // PERSONAL BELONGINGS
    // ========================================================================
    {
        id: 'professors_teddy',
        name: "Professor Snoutworth's Teddy",
        icon: '🧸',
        rarity: 'rare',
        spawnType: 'hidden',
        biome: 'arboreal',
        description: 'A well-loved teddy bear with one button eye missing.',
        lore: `"Could it be?! This is Mr. Buttons, the beloved companion of Professor Emilia Snoutworth!

Professor Snoutworth was the greatest scientist in peccary history. She discovered that mushrooms could be used for medicine, that certain berries restore health, and she even theorized about lands beyond our known world!

But her most remarkable discovery was the Dronglous Cat! In her field notes, she described finding these magnificent tree-dwelling predators in the savannah. 'They move like shadows through the acacia branches,' she wrote. 'Black as midnight, the males. Grey as storm clouds, the females. And the babies - oh, the babies are adorable, playing and chasing each other around the base of their home tree.'

She spent months studying them, documenting their hunting techniques - how they pounce from the branches with devastating precision. She noted how mothers fiercely defend their young, and how the males call to females during mating season with a distinctive yowling cry.

Professor Snoutworth believed the Dronglous Cat had ancient ancestors spread across many lands. 'I've found fossil teeth in the arboreal forest,' she wrote, 'and ancient claw marks on rocks in places I've never been. These cats have been here far longer than we have.'

She carried Mr. Buttons everywhere, even to important scientific meetings. 'He helps me think,' she would say. When she disappeared on her final research expedition, Mr. Buttons was lost too.

To find him here... it means she must have traveled through this very forest. Perhaps she was searching for more evidence of the ancient Dronglous Cat ancestors. Perhaps... she's still out there, exploring."`,
        reward: { coins: 100, score: 200 }
    },

    // ========================================================================
    // MYSTERIOUS DEVICES
    // ========================================================================
    {
        id: 'glowing_crystal',
        name: 'Pulsing Crystal Shard',
        icon: '💎',
        rarity: 'rare',
        spawnType: 'event',  // Drops from special events
        biome: null,
        description: 'A crystal fragment that pulses with an inner light.',
        lore: `"Extraordinary! A fragment of Lumina Crystal!

These crystals are incredibly rare. They're not from our world at all - they fell from the sky in the Great Meteor Shower, hundreds of years ago. The ancients believed they were pieces of the moon!

What's fascinating is the pulsing. See how it brightens and dims? Some scientists believe the crystals are... communicating. With what, we don't know. Other crystals? Something in the sky?

Drongat has been studying these for years. He believes they might be the key to reaching new lands. Imagine - doorways to places we've never seen! Keep finding these. They might be more important than we realize."`,
        reward: { coins: 150, score: 300 }
    },

    {
        id: 'mysterious_gear',
        name: 'Mysterious Metal Gear',
        icon: '⚙️',
        rarity: 'common',
        spawnType: 'random',
        biome: null,
        description: 'A precisely machined gear made of an unknown metal.',
        lore: `"Ah, another gear! These keep turning up all over the place, don't they?

They're made of a metal we can't identify. It doesn't rust, doesn't scratch, and stays cool even in fire. We've found hundreds of them, all identical, all perfect.

The question is: what were they part of? A machine of some kind, certainly. But what kind of machine needs thousands of identical gears? And who built it?

Pokeir thinks they're parts of an ancient clock that measured something other than time. I think they're from a vehicle of some sort. Drongat... well, Drongat thinks they're from visitors. Not from here. Not from anywhere we know.

Bring us more. The more we collect, the closer we get to solving the mystery!"`,
        reward: { coins: 25, score: 50 }
    },

    // ========================================================================
    // LEGENDARY FOSSILS
    // ========================================================================
    {
        id: 'felis_dronglaticus_skull',
        name: 'Felis Dronglaticus Skull',
        icon: '💀',
        rarity: 'epic',
        spawnType: 'fixed',  // Always at Ningle's hut wall — not random spawned
        biome: 'savannah',
        description: 'An ancient golden skull that shimmers with mysterious energy.',
        lore: `"BY MY SNOUT! This is... this is IMPOSSIBLE! You've found the skull of Felis Dronglaticus!

*Ningle's hooves are trembling as he carefully examines the golden skull*

This is the common ancestor of an entire branch of cat species, including our own Dronglous Cats! Professor Snoutworth searched her entire life for this fossil. She theorized it existed, based on teeth and claw marks she found, but she never... she never found the skull!

Look at these bone structures - the powerful jaw, the forward-facing eye sockets, the prominent sagittal crest. This was an apex predator, perfectly adapted for ambush hunting from trees. The golden coloration isn't paint - it's fossilized minerals from the soil where it was buried!

The age of this skull... at least 50,000 years old. Maybe more. This cat lived when the world was completely different. When there were lands we've never seen, covered in ice and snow...

Wait. Professor Snoutworth's notes mentioned something. She wrote: 'If Felis Dronglaticus exists, its homeland would be the mountains. Cold, high places where the ancient cats first evolved their tree-climbing abilities on rocky outcrops.'

Mountains. To the west, beyond our known lands. If this skull is here, then perhaps... perhaps there's a way to reach those mountains. The homeland of the ancient cats.

This changes everything we know about our world. Keep this skull safe - it might be the key to discovering lands we've only dreamed of!"`,
        reward: { coins: 500, score: 1000 },
        unlocksBiome: 'snowy_mountains'  // Unlocks the snowy mountain biome!
    },

    // ========================================================================
    // SNOWY MOUNTAINS ARTIFACTS
    // ========================================================================
    {
        id: 'drongulinat_cat_tooth',
        name: 'Drongulinat Cat Tooth',
        icon: '🦷',
        rarity: 'rare',
        spawnType: 'fixed',  // Always on the Snow Temple plinth
        biome: 'snowy_mountains',
        description: 'A massive fossilized canine tooth, perfectly preserved in ice. It glows faintly golden.',
        lore: `"INCREDIBLE! A tooth from a Drongulinat Cat! And not just any tooth — this is an ancient one, thousands of years old!

*Ningle holds the tooth up to the light, his eyes wide with excitement*

Do you remember the Felis Dronglaticus skull you found? That was the COMMON ANCESTOR — the original ancient cat. Well, over tens of thousands of years, that one species split into TWO branches!

The first branch adapted to warm forests and savannahs. They became smaller, learned to climb trees, and developed ambush hunting from the canopy. Those are our Dronglous Cats — the ones you see in the savannah, hiding in acacia trees!

The second branch went the OTHER way. They climbed higher, into the frozen mountains. They grew BIGGER, developed massive paws like snowshoes so they wouldn't sink in the snow, and became pursuit hunters — chasing prey across open ground instead of ambushing from above.

Those are the Drongulinat Cats. And this tooth proves they've been in those mountains for THOUSANDS of years!

Professor Snoutworth theorized this exact split. She wrote: 'The ancient cat faced a choice — the warmth of the lowlands, or the cold of the peaks. Some chose comfort. Others chose challenge. Both survived. Both thrived. That is the beauty of evolution.'

The Snow Temple where you found this... the Great Mages of Andurat built it to honor these magnificent predators. They carved cat faces into the totem poles with golden eyes — the same golden eyes both species inherited from their ancient ancestor.

This is a missing piece of the puzzle. With the skull AND the tooth, we now have evidence of the full evolutionary tree. Extraordinary work, young explorer!"`,
        reward: { coins: 200, score: 400 }
    },

    // ========================================================================
    // COASTAL ARTIFACTS
    // ========================================================================
    {
        id: 'uronal_seal_tooth',
        name: 'Uronal Seal Tooth',
        icon: '🦭',
        rarity: 'epic',
        spawnType: 'fixed',  // Always embedded in the Snow Temple west wall
        biome: 'snowy_mountains',
        description: 'A massive curved tooth from an ancient seal. Ice crystals still cling to its surface.',
        lore: `"ASTONISHING! This is a tooth from an Uronal Seal — a creature we thought was pure myth!

*Ningle nearly drops the tooth in his excitement, catching it at the last moment*

The Uronal Seal was an ancient marine mammal that once lived in the frozen mountain lakes! Can you imagine — seals, living at the top of the world? The Great Mages of Andurat carved stories about them on the temple walls.

But here's the fascinating part: as the mountains grew colder over thousands of years, the lakes froze solid. The seals couldn't survive in pure ice. So they migrated! They traveled DOWN from the peaks, through the arboreal forests, heading south...

Professor Snoutsworth found scratches on rocks in the arboreal biome that she couldn't explain. 'Something large dragged itself over these stones,' she wrote. 'Something with flippers, not paws.' She was right! It was the Uronal Seals, making their great migration!

They kept going south, past the forests, until they reached... the coast. Open water. The sea! That's where they settled — a whole new world at the edge of our land.

If seals traveled from the mountains to the coast, then there must BE a coast! South of the arboreal forest, beyond where any peccary has explored. This tooth is proof that there's an entire coastline waiting to be discovered!

The Mages embedded this tooth in the temple wall as a sacred waystone. They believed it would guide future explorers to the coast. And now... it can guide YOU."`,
        reward: { coins: 300, score: 600 },
        unlocksBiome: 'coastal'
    }
];

/**
 * Get artifact data by ID
 * @param {string} artifactId - The artifact ID
 * @returns {Object} - The artifact data
 */
window.getArtifactData = function(artifactId) {
    return ARTIFACTS.find(a => a.id === artifactId);
};

/**
 * Get all artifacts that can spawn in a specific biome
 * @param {string} biome - The biome ID
 * @param {string} spawnType - Optional: filter by spawn type
 * @returns {Array} - Array of matching artifacts
 */
window.getArtifactsForBiome = function(biome, spawnType) {
    return ARTIFACTS.filter(a => {
        const biomeMatch = a.biome === null || a.biome === biome;
        const typeMatch = !spawnType || a.spawnType === spawnType;
        return biomeMatch && typeMatch;
    });
};

/**
 * Get artifacts by rarity
 * @param {string} rarity - common, uncommon, rare, or legendary
 * @returns {Array} - Array of matching artifacts
 */
window.getArtifactsByRarity = function(rarity) {
    return ARTIFACTS.filter(a => a.rarity === rarity);
};
