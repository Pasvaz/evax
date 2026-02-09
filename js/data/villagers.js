/**
 * ============================================================================
 * VILLAGERS DATA - Pure Data File
 * ============================================================================
 *
 * This file contains ALL the villager characters and their conversations.
 * No functions here - just data you can easily modify!
 *
 * ============================================================================
 * HOW TO ADD A NEW VILLAGER
 * ============================================================================
 *
 * 1. Copy an existing villager block (everything between { and })
 * 2. Paste it at the end of the VILLAGERS array (before the last ])
 * 3. Change the name, colors, position, and conversation
 * 4. Save and refresh your browser!
 *
 * ============================================================================
 * COLOR CODES
 * ============================================================================
 *
 * Colors use hexadecimal format: 0xRRGGBB
 *   - RR = Red (00 to FF)
 *   - GG = Green (00 to FF)
 *   - BB = Blue (00 to FF)
 *
 * Common colors:
 *   0xff0000 = Red        0x00ff00 = Green      0x0000ff = Blue
 *   0xffff00 = Yellow     0xff00ff = Pink       0x00ffff = Cyan
 *   0xffffff = White      0x000000 = Black      0x808080 = Gray
 *   0xffc0cb = Light Pink 0x8b4513 = Brown      0xffd700 = Gold
 *
 * Tip: Search "hex color picker" online to find any color!
 *
 * ============================================================================
 * HOW CONVERSATIONS WORK
 * ============================================================================
 *
 * Each villager has a "conversation" with:
 *   - start: The first dialog node to show (usually 'greeting')
 *   - nodes: All the different dialog screens
 *
 * Each node has:
 *   - text: What the villager says
 *   - choices: Buttons the player can click
 *
 * Each choice has:
 *   - text: The button label
 *   - nextNode: Which node to go to next (or null to end conversation)
 *   - effect: (optional) Something that happens when clicked
 *   - failNode: (optional) Where to go if the effect fails
 *
 * CONVERSATION FLOW EXAMPLE:
 *
 *   start: 'greeting'
 *        │
 *        ▼
 *   ┌─────────────────────────────────┐
 *   │  'greeting' node                │
 *   │  "Hello! How can I help?"       │
 *   │                                 │
 *   │  [Ask about trading] → 'trade'  │
 *   │  [Goodbye] → null (ends)        │
 *   └─────────────────────────────────┘
 *        │
 *        ▼ (if player clicks "Ask about trading")
 *   ┌─────────────────────────────────┐
 *   │  'trade' node                   │
 *   │  "I'll trade health for food!"  │
 *   │                                 │
 *   │  [Trade 5 berries] → 'success'  │
 *   │     (with effect and failNode)  │
 *   │  [No thanks] → null (ends)      │
 *   └─────────────────────────────────┘
 *
 * ============================================================================
 * EFFECT TYPES
 * ============================================================================
 *
 * Effects are things that happen when the player clicks a choice.
 * They are written as simple objects - no coding required!
 *
 * HEAL EFFECT - Restore player health
 *   effect: { type: 'heal', amount: 25 }
 *
 * GIVE COINS EFFECT - Give the player pig coins
 *   effect: { type: 'give_coins', amount: 50 }
 *
 * GIVE SCORE EFFECT - Add to the player's score
 *   effect: { type: 'give_score', amount: 100 }
 *
 * TRADE EFFECT - Take resources, give rewards
 *   effect: {
 *       type: 'trade',
 *       cost: { berries: 5, nuts: 0, mushrooms: 0 },  // What player pays
 *       reward: { health: 20, coins: 0, score: 0 }    // What player gets
 *   }
 *
 * FULL HEAL EFFECT - Restore health to 100
 *   effect: { type: 'full_heal' }
 *
 * OPEN SHOP EFFECT - Opens the shop menu
 *   effect: { type: 'open_shop' }
 *
 * ============================================================================
 */

window.VILLAGERS = [

    // ========================================================================
    // VILLAGER 1: Elder Hamsworth - The Village Elder
    // ========================================================================
    // An old, wise pig who tells you about the village and dangers.
    // He doesn't trade, just gives advice.
    {
        // --------------------------------------------------------------------
        // APPEARANCE
        // --------------------------------------------------------------------
        name: "Elder Hamsworth",      // Name shown in dialog
        role: "Village Elder",        // Title shown under name

        // Colors (use 0xRRGGBB format)
        skinColor: 0xffb6c1,          // Light pink skin
        outfitColor: 0x4a0080,        // Purple robes
        hatColor: 0x2a0050,           // Dark purple hat (use null for no hat)

        // Position in village (relative to village center)
        position: { x: 5, z: 5 },     // In front of main hut, to the side

        // --------------------------------------------------------------------
        // CONVERSATION
        // --------------------------------------------------------------------
        conversation: {
            // Where the conversation starts
            start: 'greeting',

            // All dialog nodes
            nodes: {
                // The first node - player sees this when talking
                'greeting': {
                    text: "Welcome, young traveler! Our village has stood here for generations. Badgers,weasels and other wild animals dont come too close.",
                    choices: [
                        { text: "Tell me about the village.", nextNode: 'village_history' },
                        { text: "What dangers are out there?", nextNode: 'dangers' },
                        { text: "Trade eggs.", nextNode: 'egg_trade_offer' },
                        { text: "Goodbye.", nextNode: null }  // null = end conversation
                    ]
                },

                'village_history': {
                    text: "We've lived here peacefully for decades, surviving off the forest bounty. Animals dont threaten our lifestyle , ",
                    choices: [
                        { text: "How do you survive?", nextNode: 'survival_tips' },
                        { text: "Tell me more.", nextNode: 'more_lore' },
                        { text: "Thanks. Goodbye.", nextNode: null }
                    ]
                },

                'survival_tips': {
                    text: "Collect food to stay healthy. Press 1, 2, or 3 to eat from your supplies!",
                    choices: [
                        { text: "Good to know!", nextNode: 'farewell' },
                        { text: "What else?", nextNode: 'more_lore' }
                    ]
                },

                'more_lore': {
                    text: "This forest is ancient. Many secrets lie hidden in its depths.",
                    choices: [
                        { text: "Interesting!", nextNode: 'farewell' },
                        { text: "Goodbye.", nextNode: null }
                    ]
                },

                'dangers': {
                    text: "Badgers and weasels lurk in the shadows. They're aggressive predators! and other predators of uncomprehendable horror stalk the wilds. My father died by the hands of one.geese arent generally dangerous,but they kill all who attempt to steal their eggs,but,to be completely honest they have the right to do so as the eggs make a tasty omelet",
                    choices: [
                        { text: "How do I defend myself?", nextNode: 'defense' },
                        { text: "I'll be careful.", nextNode: 'farewell' }
                    ]
                },

                'defense': {
                    text: "Run! Sprint with SHIFT. Stay healthy by eating. The village is always safe.",
                    choices: [
                        { text: "Thank you!", nextNode: 'farewell' }
                    ]
                },

                'farewell': {
                    text: "Visit us anytime. You are always welcome here, young one.",
                    choices: [
                        { text: "Goodbye.", nextNode: null }
                    ]
                },

                'egg_trade_offer': {
                    text: "Ah, you've brought me a goose egg! These are rare delicacies. I'll give you 60 pig coins for each one.",
                    choices: [
                        {
                            text: "Trade 1 egg for 60 pig coins.",
                            nextNode: 'egg_trade_success',
                            effect: { type: 'trade', cost: { eggs: 1 }, reward: { coins: 60 } },
                            failNode: 'no_eggs'
                        },
                        { text: "Not now.", nextNode: 'greeting' }
                    ]
                },

                'egg_trade_success': {
                    text: "Excellent! Here are your coins. These eggs make the finest omelets!",
                    choices: [
                        { text: "Trade another egg.", nextNode: 'egg_trade_offer' },
                        { text: "Thanks! Goodbye.", nextNode: null }
                    ]
                },

                'no_eggs': {
                    text: "You don't have any eggs to trade. Come back when you've collected some from the riverbank geese!",
                    choices: [
                        { text: "I'll be back.", nextNode: 'greeting' }
                    ]
                }
            }
        }
    },

    // ========================================================================
    // VILLAGER 2: Rosie - The Farmer
    // ========================================================================
    // A friendly farmer who trades berries for health.
    {
        name: "Rosie",
        role: "Farmer",

        skinColor: 0xffc0cb,          // Pink skin
        outfitColor: 0x228b22,        // Forest green overalls
        hatColor: 0xdaa520,           // Golden straw hat #281532

        position: { x: 30, z: -8 },    // In front of hut4, to the side

        conversation: {
            start: 'greeting',
            nodes: {
                'greeting': {
                    text: "Oink oink! Welcome to my farm! I grow the finest vegetables!",
                    choices: [
                        { text: "Tell me about your farm.", nextNode: 'farm_info' },
                        { text: "Can we trade?", nextNode: 'trade_offer' },
                        { text: "Goodbye.", nextNode: null }
                    ]
                },

                'farm_info': {
                    text: "I grow carrots, potatoes, and beans. Hard work, but rewarding!",
                    choices: [
                        { text: "Do you trade?", nextNode: 'trade_offer' },
                        { text: "Sounds nice. Goodbye.", nextNode: null }
                    ]
                },

                'trade_offer': {
                    text: "I'd love to trade! Give me 10 berries and I'll restore 20 health.",
                    choices: [
                        {
                            text: "Trade 10 berries for health",
                            nextNode: 'trade_success',
                            // This effect takes berries and gives health
                            effect: {
                                type: 'trade',
                                cost: { berries: 10, nuts: 0, mushrooms: 0 },
                                reward: { health: 20, coins: 0, score: 0 }
                            },
                            // If player doesn't have enough, go here instead
                            failNode: 'trade_fail'
                        },
                        { text: "Maybe later.", nextNode: null }
                    ]
                },

                'trade_success': {
                    text: "Thank you! Here, this will help you feel better.",
                    choices: [
                        { text: "Thanks!", nextNode: null },
                        { text: "Can we trade more?", nextNode: 'trade_offer' }
                    ]
                },

                'trade_fail': {
                    text: "You don't have enough berries. Come back when you have 10!",
                    choices: [
                        { text: "I'll be back.", nextNode: null }
                    ]
                }
            }
        }
    },

    // ========================================================================
    // VILLAGER 3: Bruno - The Blacksmith
    // ========================================================================
    // A tough blacksmith who gives combat advice but doesn't trade.
    {
        name: "Bruno",
        role: "Blacksmith",

        skinColor: 0xcd853f,          // Tan/brown skin
        outfitColor: 0x2f2f2f,        // Dark gray apron
        hatColor: null,               // No hat

        position: { x: -12, z: 22 },   // In front of hut3, to the side

        conversation: {
            start: 'greeting',
            nodes: {
                'greeting': {
                    text: "*CLANG CLANG* Oh! Didn't see you there, little one.",
                    choices: [
                        { text: "What are you making?", nextNode: 'forge_info' },
                        { text: "Any combat tips?", nextNode: 'combat_tips' },
                        { text: "Goodbye.", nextNode: null }
                    ]
                },

                'forge_info': {
                    text: "I forge tools and horseshoes. Tough work but honest living!",
                    choices: [
                        { text: "Can you make weapons?", nextNode: 'weapons' },
                        { text: "Impressive!", nextNode: null }
                    ]
                },

                'weapons': {
                    text: "We're peaceful folk. No weapons here, just good sturdy tools.",
                    choices: [
                        { text: "I understand.", nextNode: null }
                    ]
                },

                'combat_tips': {
                    text: "Those badgers have thick hides. Best to run than fight!",
                    choices: [
                        { text: "What about weasels?", nextNode: 'weasel_advice' },
                        { text: "Got it. Thanks!", nextNode: null }
                    ]
                },

                'weasel_advice': {
                    text: "Weasels are fast but smaller. Still, running is your best bet!",
                    choices: [
                        { text: "Thanks for the advice!", nextNode: null }
                    ]
                }
            }
        }
    },

    // ========================================================================
    // VILLAGER 4: Patches - The Merchant
    // ========================================================================
    // A sneaky merchant who runs the shop and trades various items.
    {
        name: "Patches",
        role: "Merchant",

        skinColor: 0xffe4e1,          // Misty rose skin
        outfitColor: 0x8b4513,        // Saddle brown vest
        hatColor: 0x006400,           // Dark green hat

        position: { x: 18, z: 12 },

        conversation: {
            start: 'greeting',
            nodes: {
                'greeting': {
                    text: "Psst! Hey there! Looking to trade?",
                    choices: [
                        {
                            text: "Open Shop",
                            nextNode: 'shop_opened',
                            // This opens the shop menu!
                            effect: { type: 'open_shop' }
                        },
                        { text: "What do you have?", nextNode: 'trade_info' },
                        { text: "Goodbye.", nextNode: null }
                    ]
                },

                'shop_opened': {
                    text: "Browse my wares! I have the best deals in the village.",
                    choices: [
                        { text: "Thanks!", nextNode: null }
                    ]
                },

                'trade_info': {
                    text: "I collect nuts and mushrooms. Very valuable! Want to trade?",
                    choices: [
                        { text: "Trade nuts", nextNode: 'trade_nuts_offer' },
                        { text: "Trade mushrooms", nextNode: 'trade_mushrooms_offer' },
                        { text: "Open Shop", nextNode: 'shop_opened', effect: { type: 'open_shop' } },
                        { text: "Not now.", nextNode: null }
                    ]
                },

                'trade_nuts_offer': {
                    text: "I'll give you 15 health and 50 score for just 5 nuts!",
                    choices: [
                        {
                            text: "Trade 5 nuts",
                            nextNode: 'trade_success',
                            effect: {
                                type: 'trade',
                                cost: { berries: 0, nuts: 5, mushrooms: 0 },
                                reward: { health: 15, coins: 0, score: 50 }
                            },
                            failNode: 'trade_fail'
                        },
                        { text: "Maybe later.", nextNode: 'greeting' }
                    ]
                },

                'trade_mushrooms_offer': {
                    text: "Mushrooms are rare! I'll give you 30 health for just 3!",
                    choices: [
                        {
                            text: "Trade 3 mushrooms",
                            nextNode: 'trade_success',
                            effect: {
                                type: 'trade',
                                cost: { berries: 0, nuts: 0, mushrooms: 3 },
                                reward: { health: 30, coins: 0, score: 0 }
                            },
                            failNode: 'trade_fail'
                        },
                        { text: "Not right now.", nextNode: 'greeting' }
                    ]
                },

                'trade_success': {
                    text: "Pleasure doing business! Come back anytime.",
                    choices: [
                        { text: "Trade more", nextNode: 'trade_info' },
                        { text: "Thanks!", nextNode: null }
                    ]
                },

                'trade_fail': {
                    text: "You don't have enough! Come back when you've collected more.",
                    choices: [
                        { text: "I'll return.", nextNode: null }
                    ]
                }
            }
        }
    },

    // ========================================================================
    // VILLAGER 5: Granny Trotter - The Healer
    // ========================================================================
    // A kind old healer who can fully heal you for free!
    {
        name: "Granny Trotter",
        role: "Healer",

        skinColor: 0xffdab9,          // Peach skin
        outfitColor: 0xffffff,        // White dress
        hatColor: 0xff69b4,           // Hot pink bonnet

        position: { x: -16, z: -25 },  // In front of hut5, to the side

        conversation: {
            start: 'greeting',
            nodes: {
                'greeting': {
                    text: "Oh dearie, you look tired! How can I help you?",
                    choices: [
                        { text: "Tell me about healing.", nextNode: 'health_advice' },
                        { text: "Can you heal me?", nextNode: 'healing_offer' },
                        { text: "Goodbye.", nextNode: null }
                    ]
                },

                'health_advice': {
                    text: "Mushrooms have healing properties! Berries and nuts help too.",
                    choices: [
                        { text: "Any recipes?", nextNode: 'recipes' },
                        { text: "Good to know!", nextNode: null }
                    ]
                },

                'recipes': {
                    text: "Press TAB to open crafting. Mix foods to make powerful remedies!",
                    choices: [
                        { text: "Thank you!", nextNode: null }
                    ]
                },

                'healing_offer': {
                    text: "Let me see... Yes, I can make you feel better, dearie!",
                    choices: [
                        {
                            text: "Please heal me!",
                            nextNode: 'healed',
                            // Full heal effect - restores health to 100
                            effect: { type: 'full_heal' },
                            // If already at full health, go here
                            failNode: 'already_healthy'
                        },
                        { text: "I'm okay for now.", nextNode: null }
                    ]
                },

                'healed': {
                    text: "There you go! All better now. Take care of yourself out there!",
                    choices: [
                        { text: "Thank you so much!", nextNode: null }
                    ]
                },

                'already_healthy': {
                    text: "You're already in perfect health, dearie! No need for healing.",
                    choices: [
                        { text: "Thanks anyway!", nextNode: null }
                    ]
                }
            }
        }
    }

    // ========================================================================
    // ADD MORE VILLAGERS HERE!
    // ========================================================================
    // Copy one of the villagers above, paste it here (after the last }),
    // and customize it to create your own character!
    //
    // Don't forget:
    //   - Add a comma after the } of the villager above this comment
    //   - Each villager needs a unique position so they don't overlap
    //   - Test your changes by refreshing the game!

];
