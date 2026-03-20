/**
 * ============================================================================
 * PROGRESSION DATA - Pure Data File
 * ============================================================================
 *
 * This file defines the player progression milestones.
 * Score = EXP. As you earn score, you unlock new villagers!
 *
 * ============================================================================
 * HOW IT WORKS
 * ============================================================================
 *
 * Each milestone has:
 *   - score: How much score you need to reach this level
 *   - villager: Which villager unlocks (or null for the starting level)
 *   - title: Your level name (shown in the HUD)
 *   - unlockMessage: The message that pops up when you reach this level
 *
 * The lockedMessages object defines what each villager says when you
 * try to talk to them before reaching their required score.
 *
 * ============================================================================
 * HOW TO ADD A NEW MILESTONE
 * ============================================================================
 *
 * 1. Add a new object to the milestones array
 * 2. Make sure the score is higher than the one before it
 * 3. Set the villager name EXACTLY as it appears in villagers.js
 * 4. Add a locked message for that villager
 * 5. Save and refresh!
 *
 * ============================================================================
 */

window.PROGRESSION = {

    // ========================================================================
    // MILESTONES - Score thresholds that unlock villagers
    // ========================================================================
    milestones: [
        {
            score: 0,
            villager: null,
            title: "Newborn Peccary",
            unlockMessage: null
        },
        {
            score: 25,
            villager: "Granny Trotter",
            title: "Piglet Explorer",
            unlockMessage: "Granny Trotter trusts you enough to heal you!"
        },
        {
            score: 50,
            villager: "Rosie",
            title: "Forager",
            unlockMessage: "Farmer Rosie sees you've been working hard!"
        },
        {
            score: 100,
            villager: "Bruno",
            title: "Apprentice",
            unlockMessage: "Bruno respects your courage and opens his forge! Wood Sword and Wood Axe are now available!",
            memoryFragment: "village_belonging"
        },
        {
            score: 200,
            villager: "Patches",
            title: "Adventurer",
            unlockMessage: "Patches sees a worthy customer!"
        },
        {
            score: 450,
            villager: null,
            title: "Alchemist",
            unlockMessage: "You unlocked the Arsen Bomb recipe!"
        },
        {
            score: 500,
            villager: "Elder Hamsworth",
            title: "Village Champion",
            unlockMessage: "Elder Hamsworth invites you to his egg trade!"
        }
    ],

    // ========================================================================
    // LOCKED MESSAGES - What villagers say when you're not high enough level
    // ========================================================================
    lockedMessages: {
        "Granny Trotter": "Oh dearie, I don't know you well enough yet... Come back when you've explored a bit more, Pedro!",
        "Rosie": "Sorry Pedro! I only trade with experienced foragers. Keep collecting!",
        "Bruno": "*CLANG* Not ready for my tools yet, Pedro! Prove yourself first.",
        "Patches": "Psst! My special goods are for serious adventurers only, Pedro...",
        "Elder Hamsworth": "You are too young for egg trading, Pedro. Show me what you can do first!"
    }

};
