/**
 * ============================================================================
 * MEMORY FRAGMENTS - Pedro's Lost Memories
 * ============================================================================
 *
 * Pedro wakes up with amnesia. As he progresses through the game, he recovers
 * fragments of his memory that reveal his past and why he's here.
 *
 * ============================================================================
 * HOW IT WORKS
 * ============================================================================
 *
 * Each memory fragment has:
 *   - id: Unique identifier (used in GameState.memoriesFound array)
 *   - title: Display name shown in the journal and flashback
 *   - text: The memory narrative (what Pedro remembers)
 *   - trigger: How this memory is discovered:
 *       'intro'     — shown on the intro screen when starting a new game
 *       'milestone' — triggered when reaching a score milestone
 *       'npc'       — triggered by a dialog effect (type: 'trigger_memory')
 *       'biome'     — triggered when entering a biome for the first time
 *       'world'     — found as an object in the world
 *   - hint: Text shown in the journal for undiscovered fragments
 *
 * For 'milestone' triggers, also set:
 *   - milestoneScore: The score threshold that triggers this memory
 *
 * For 'score_since_last' triggers, also set:
 *   - scoreGap: How much score the player must earn AFTER the previous
 *     memory was found. These fragments form a chain — each one only
 *     starts counting after the previous one in the array was found.
 *
 * For 'island' triggers:
 *   - Triggered when the player walks onto an ocean island in the
 *     coastal biome (detected via isNearIsland check).
 *
 * ============================================================================
 * HOW TO ADD A NEW MEMORY
 * ============================================================================
 *
 * 1. Add a new object to the array below
 * 2. Give it a unique id (lowercase, underscores, no spaces)
 * 3. Write the memory text — make it vivid and mysterious!
 * 4. Set the trigger type and hint
 * 5. If trigger is 'milestone', add milestoneScore AND add
 *    memoryFragment: 'your_id' to the matching milestone in progression.js
 * 6. If trigger is 'npc', add this effect to a dialog choice in villagers.js:
 *    effect: { type: 'trigger_memory', memoryId: 'your_id' }
 * 7. Save and refresh!
 *
 * ============================================================================
 */

window.MEMORIES = [
    {
        id: 'awakening',
        title: 'The Awakening',
        text: "Wha? Where am I? Last thing I remember was... ermmm... OH YES! A cookie recipe, but what kind? Maybe the best one of all time? Hmmm, I'm going to ask Granny Trotter, in the corner of this village. I have heard of her tasty cookies, maybe she knows something I don't...",
        trigger: 'intro',
        hint: 'Start a new game'
    },
    {
        id: 'village_belonging',
        title: 'A Sense of Belonging',
        text: "This village... it feels familiar. The smell of pine wood, the sound of hooves on dirt paths. I think I lived somewhere like this once. Somewhere safe. But why did I leave?",
        trigger: 'milestone',
        milestoneScore: 100,
        hint: 'Reach Apprentice level'
    },
    {
        id: 'running_through_forest',
        title: 'Running Through the Forest',
        text: "You're running. Hooves pounding on wet leaves. The forest is dark — darker than you've ever seen it. Something behind you. You don't look back. You CAN'T look back. Branches scratch your sides. Your lungs burn. Then... nothing. Just darkness.",
        trigger: 'npc',
        hint: 'Talk to Elder Hamsworth about cookies'
    },
    {
        id: 'the_search',
        title: 'The Search',
        text: "Open grassland stretches in every direction. You remember this feeling — the wind on your snout, the tall golden grass brushing your sides. You were looking for something. Something important. You'd been told it was out here, beyond the trees, beyond everything you knew. But you weren't alone. Someone — or something — was following you. Why? What did they want?",
        trigger: 'biome',
        biomeId: 'savannah',
        hint: 'Explore beyond the forest'
    },
    {
        id: 'silenced',
        title: 'Silenced',
        text: "Ancient bones... a skull older than anything alive. And suddenly you remember: someone didn't want you to find this. Someone wanted to silence you. They said you knew too much, that you'd seen something you shouldn't have. But what? What did you see? And who wanted you gone?",
        trigger: 'artifact',
        hint: 'Give Ningle a certain ancient skull'
    },
    {
        id: 'the_cave',
        title: 'The Cave',
        text: "Salt wind... crashing waves... and suddenly it hits you. Somebody was hiding in some cave, somewhere along a coast like this. They sent a creature after me — because I knew where they were hiding. I knew too much...",
        trigger: 'biome',
        biomeId: 'coastal',
        hint: 'Explore the coastline'
    },
    {
        id: 'the_island',
        title: 'The Island',
        text: "Standing on this rocky island, surrounded by ocean, the memory floods back. Someone — a brilliant mind — made a breakthrough so dangerous they went into hiding. Their family sent me to look for them. And then they sent IT. A part of their breakthrough — a living, breathing result of their work. But what was their breakthrough...?",
        trigger: 'island',
        hint: 'Reach an island off the coast'
    },
    {
        id: 'the_breakthrough',
        title: 'The Breakthrough',
        text: "The breakthrough... it's coming back to me now. Something to do with bringing back things from a time unknown. Ancient things. Living things. But what time? What things? The pieces are so close... I just need to remember more...",
        trigger: 'score_since_last',
        scoreGap: 500,
        hint: 'Keep exploring and surviving'
    },
    {
        id: 'the_beasts',
        title: 'The Beasts',
        text: "The things were prehistoric beasts! Creatures that roamed this world long before any peccary walked these paths. But which ones? And what time were they from? Wait... the time... it was the time of a great felinid. A great cat, larger and fiercer than anything alive today...",
        trigger: 'score_since_last',
        scoreGap: 670,
        hint: 'The past is returning, keep going'
    },
    {
        id: 'the_ancestors',
        title: 'The Ancestors',
        text: "The beasts were ancestors of the animals we have today — and others that live in faraway parts of the planet. And the time? Well, it was the time of Felis Dronlaticus, the great prehistoric cat. And the person who brought them back? Emilia Snoutworth...",
        trigger: 'score_since_last',
        scoreGap: 1000,
        hint: 'The truth draws closer'
    },
    {
        id: 'the_revelation',
        title: 'The Revelation',
        text: "The beast! The one chasing me! I think it was... it was errmmm... I'VE GOT IT! The beast was Felis Dronlaticus — brought back from the dead by Emilia Snoutworth herself! And she put the skull near Ningle's hut... that's what I was looking for all along! And where is Emilia hiding? Who knows — probably in some other biome, far, far away. I will have to look in them all. But Emilia Snoutworth, know that I am coming for you. No matter how far you are, I will look for you, I will find you, and I will punish you by making you bake the best cookies of all time without instructions! And then I will send you to your family, and find a place for all the beasts you brought back...",
        trigger: 'score_since_last',
        scoreGap: 1000,
        hint: 'The final truth awaits'
    }
];
