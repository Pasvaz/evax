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
                    text: "Welcome, Pedro! Our village has stood here for generations. Badgers, weasels and other wild animals don't come too close.",
                    choices: [
                        { text: "Tell me about the village.", nextNode: 'village_history' },
                        { text: "What dangers are out there?", nextNode: 'dangers' },
                        { text: "Trade eggs.", nextNode: 'egg_trade_offer' },
                        { text: "About that cookie recipe...", nextNode: 'cookie_quest' },
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
                    text: "Visit us anytime, Pedro. You are always welcome here.",
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
                },

                'cookie_quest': {
                    text: "*Elder Hamsworth's eyes widen* Pedro... you've been asking around the village about the cookie recipe. I wondered when you'd finally come to me.",
                    choices: [
                        { text: "You know about it?!", nextNode: 'cookie_reveal_1' },
                        { text: "Everyone pointed me to you.", nextNode: 'cookie_reveal_1' }
                    ]
                },

                'cookie_reveal_1': {
                    text: "Know about it? My dear boy... I'm the one who WROTE it. The World's Best Cookie Recipe. It was my life's work. I spent forty years perfecting it — travelling to distant lands, collecting rare ingredients, testing thousands of combinations.",
                    choices: [
                        { text: "YOU wrote it?!", nextNode: 'cookie_reveal_2' }
                    ]
                },

                'cookie_reveal_2': {
                    text: "When it was finally perfect, I wrote it on a single page and locked it in a chest. But word got out. Creatures from every biome wanted it. So I hid it — scattered the clues across the lands where no one would think to look. And then... YOU arrived.",
                    choices: [
                        { text: "Me? What do you mean?", nextNode: 'cookie_reveal_3' }
                    ]
                },

                'cookie_reveal_3': {
                    text: "Don't you remember, Pedro? You came to this forest searching for the recipe. You'd heard rumours of the World's Best Cookie and travelled from far away to find it. But you got lost in the wilderness, stumbled into our village half-starved, and... well, you've been here ever since. You forgot WHY you came!",
                    choices: [
                        { text: "I... I remember now!", nextNode: 'cookie_reveal_4' }
                    ]
                },

                'cookie_reveal_4': {
                    text: "You've proven yourself, Pedro. You've helped every villager, explored dangerous lands, and survived things that would make most peccaries faint. You've EARNED this recipe. Here it is — the World's Best Cookie:\n\n- 2 cups flour\n- 1 cup fresh butter\n- 1 cup sugar\n- 2 eggs (NOT goose eggs!)\n- 1 teaspoon of REAL cinnamon\n- A pinch of sea salt from the coast\n- And the secret ingredient... a single moonberry, found only in lands yet undiscovered.\n\nThe recipe is incomplete. There are ingredients out there, in biomes you haven't explored yet. Your journey isn't over, Pedro — it's just beginning!",
                    choices: [
                        { text: "The coast... the moonberry... I have to keep exploring!", nextNode: 'cookie_final', effect: { type: 'quest_clue', clue: 'elder_hamsworth' } }
                    ]
                },

                'cookie_final': {
                    text: "That's the spirit! The sea salt can be found at the coast — if you can find a way there. And the moonberry... who knows what other lands await? Go, Pedro. Bake that cookie. And when you do... save one for an old pig, will you?",
                    choices: [
                        { text: "I will, Elder Hamsworth. Thank you!", nextNode: null }
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
                    text: "Oink oink! Welcome to my farm, Pedro! I grow the finest vegetables!",
                    choices: [
                        { text: "Tell me about your farm.", nextNode: 'farm_info' },
                        { text: "Can we trade?", nextNode: 'trade_offer' },
                        { text: "About that cookie recipe...", nextNode: 'cookie_quest' },
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
                },

                'cookie_quest': {
                    text: "Cookies?! Oh Pedro, you're still on about that recipe! Well, any good cookie needs fresh butter and eggs — and I mean GOOD eggs, not those goose ones. Here, take some of mine! But the real secret is a special spice. I don't have it, but Bruno the blacksmith travels all over. He might know where to find it!",
                    choices: [
                        { text: "Thanks Rosie! I'll ask Bruno.", nextNode: 'cookie_noted', effect: { type: 'give_resource', resources: { butter: 2, eggs: 3 }, clue: 'rosie' } },
                        { text: "Back to other things.", nextNode: 'greeting' }
                    ]
                },

                'cookie_noted': {
                    text: "Tell you what, Pedro — when you figure out that recipe, bring me a cookie and I'll trade you something special!",
                    choices: [
                        { text: "Deal!", nextNode: null }
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
                    text: "*CLANG CLANG* Oh! Didn't see you there, Pedro! Welcome to the forge!",
                    choices: [
                        { text: "What are you making?", nextNode: 'forge_info' },
                        { text: "Buy weapons", nextNode: 'buy_weapons' },
                        { text: "Buy materials", nextNode: 'buy_materials' },
                        { text: "Buy diving gear", nextNode: 'buy_diving' },
                        { text: "About that cookie recipe...", nextNode: 'cookie_quest' },
                        { text: "Goodbye.", nextNode: null }
                    ]
                },

                'forge_info': {
                    text: "I forge tools, weapons, and horseshoes. Tough work but honest living! I also smelt glass from sand.",
                    choices: [
                        { text: "Can I buy a weapon?", nextNode: 'buy_weapons' },
                        { text: "Can I buy some glass?", nextNode: 'buy_materials' },
                        { text: "Impressive!", nextNode: null }
                    ]
                },

                'buy_weapons': {
                    text: "Looking to defend yourself, Pedro? I've got swords, axes AND a special Barbanit Axe that can chop savannah and coastal trees!",
                    choices: [
                        {
                            text: "Buy Wood Sword (30 coins)",
                            nextNode: 'weapon_success',
                            effect: { type: 'trade', cost: { coins: 30 }, reward: { item: 'wood_sword' } },
                            failNode: 'buy_fail'
                        },
                        {
                            text: "Buy Wood Axe (30 coins)",
                            nextNode: 'weapon_success',
                            effect: { type: 'trade', cost: { coins: 30 }, reward: { item: 'wood_axe' } },
                            failNode: 'buy_fail'
                        },
                        {
                            text: "Buy Barbanit Axe (50 coins)",
                            nextNode: 'barbanit_success',
                            effect: { type: 'trade', cost: { coins: 50 }, reward: { item: 'barbanit_axe' } },
                            failNode: 'buy_fail'
                        },
                        { text: "Not now.", nextNode: 'greeting' }
                    ]
                },

                'barbanit_success': {
                    text: "A Barbanit Axe! This beauty can chop acacia trees in the savannah and birch trees at the coast. You'll get manglecacia wood and seaspray birch wood — perfect for crafting even better tools!",
                    choices: [
                        { text: "Buy another weapon", nextNode: 'buy_weapons' },
                        { text: "Thanks Bruno!", nextNode: null }
                    ]
                },

                'weapon_success': {
                    text: "Fine craftsmanship! Open your inventory and equip it to your hotbar. Sword hits enemies, axe chops trees!",
                    choices: [
                        { text: "Buy another weapon", nextNode: 'buy_weapons' },
                        { text: "Thanks!", nextNode: null }
                    ]
                },

                'buy_materials': {
                    text: "I've got glass fresh from the furnace! 3 pig coins per piece. Good for crafting all sorts of things.",
                    choices: [
                        {
                            text: "Buy 1 glass (3 coins)",
                            nextNode: 'buy_success',
                            effect: { type: 'trade', cost: { coins: 3 }, reward: { glass: 1 } },
                            failNode: 'buy_fail'
                        },
                        {
                            text: "Buy 5 glass (15 coins)",
                            nextNode: 'buy_success',
                            effect: { type: 'trade', cost: { coins: 15 }, reward: { glass: 5 } },
                            failNode: 'buy_fail'
                        },
                        { text: "Not now.", nextNode: 'greeting' }
                    ]
                },

                'buy_success': {
                    text: "Here you go! Handle it carefully, it's fragile stuff.",
                    choices: [
                        { text: "Buy more glass", nextNode: 'buy_materials' },
                        { text: "Thanks!", nextNode: null }
                    ]
                },

                'buy_diving': {
                    text: "Ah, looking to explore the deep ocean? I've been working on a special diving mask — forged glass lens, leather straps, sealed with tree sap. Not cheap though — 400 coins!",
                    choices: [
                        {
                            text: "Buy Diving Mask (400 coins)",
                            nextNode: 'diving_success',
                            effect: { type: 'trade', cost: { coins: 400 }, reward: { item: 'diving_mask' } },
                            failNode: 'buy_fail'
                        },
                        { text: "Too expensive!", nextNode: 'greeting' }
                    ]
                },

                'diving_success': {
                    text: "Here you go! Equip it from your hotbar, then walk into the deep ocean. You'll be able to swim underwater! But watch your oxygen — come up for air before it runs out!",
                    choices: [
                        { text: "Thanks Bruno!", nextNode: null }
                    ]
                },

                'buy_fail': {
                    text: "You don't have enough coins! Go collect some resources and come back.",
                    choices: [
                        { text: "I'll be back.", nextNode: 'greeting' }
                    ]
                },

                'combat_tips': {
                    text: "Those badgers have thick hides, but a good wood sword will do the trick! Two hits should take down most critters.",
                    choices: [
                        { text: "How do I use the sword?", nextNode: 'sword_tips' },
                        { text: "Got it. Thanks!", nextNode: null }
                    ]
                },

                'sword_tips': {
                    text: "Equip it to your hotbar, select it with a number key, then click on an enemy to swing! You need to be close though — no throwing swords here!",
                    choices: [
                        { text: "Thanks for the tip!", nextNode: null }
                    ]
                },

                'cookie_quest': {
                    text: "*stops hammering* Cookie recipe?! Ha! Pedro, you remind me of my grandmother. She baked the most incredible cookies — cinnamon was her secret. Real cinnamon, not the cheap stuff. She said the best cinnamon came from a merchant who traded with explorers from distant lands. Patches might know more — that sneaky merchant knows everyone!",
                    choices: [
                        { text: "Thanks Bruno! I'll ask Patches.", nextNode: 'cookie_noted', effect: { type: 'quest_clue', clue: 'bruno' } },
                        { text: "Back to other things.", nextNode: 'greeting' }
                    ]
                },

                'cookie_noted': {
                    text: "And Pedro? If that recipe calls for any special tools — a mixing bowl, a baking tray — you come to me. I'll forge them!",
                    choices: [
                        { text: "You're the best, Bruno!", nextNode: null }
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
                    text: "Psst! Hey Pedro! Looking to trade?",
                    choices: [
                        {
                            text: "Open Shop",
                            nextNode: 'shop_opened',
                            // This opens the shop menu!
                            effect: { type: 'open_shop' }
                        },
                        { text: "What do you have?", nextNode: 'trade_info' },
                        { text: "About that cookie recipe...", nextNode: 'cookie_quest' },
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
                    text: "I'll give you 15 health and 5 score for just 5 nuts!",
                    choices: [
                        {
                            text: "Trade 5 nuts",
                            nextNode: 'trade_success',
                            effect: {
                                type: 'trade',
                                cost: { berries: 0, nuts: 5, mushrooms: 0 },
                                reward: { health: 15, coins: 0, score: 5 }
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
                },

                'cookie_quest': {
                    text: "*leans in close* The cookie recipe? THE cookie recipe? Pedro, my friend, that's not just any recipe. That's the legendary World's Best Cookie — said to be so delicious that whoever eats one can never be sad again! I've heard whispers about it for years. Only one pig in this whole village is old enough to know the truth... Elder Hamsworth. He keeps the ancient secrets.",
                    choices: [
                        { text: "Elder Hamsworth knows?!", nextNode: 'cookie_noted', effect: { type: 'quest_clue', clue: 'patches' } },
                        { text: "Back to other things.", nextNode: 'greeting' }
                    ]
                },

                'cookie_noted': {
                    text: "But be warned — the Elder doesn't share secrets easily. You'll need to earn his respect first. And Pedro... if you DO get that recipe... I'll pay TOP coin for the first batch. Deal?",
                    choices: [
                        { text: "Deal, Patches!", nextNode: null }
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
                    text: "Oh Pedro dearie, you look tired! How can I help you?",
                    choices: [
                        { text: "Tell me about healing.", nextNode: 'health_advice' },
                        { text: "Can you heal me?", nextNode: 'healing_offer' },
                        { text: "About that cookie recipe...", nextNode: 'cookie_quest' },
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
                },

                'cookie_quest': {
                    text: "A cookie recipe? Oh Pedro, you sweet thing! I used to bake the most wonderful cookies when I was younger. You need flour and sugar as a base — that much I remember. Here, take some from my pantry! But the BEST recipe? The one everyone talks about? I think Farmer Rosie knows about the fresh ingredients you'd need. She grows all sorts of things!",
                    choices: [
                        { text: "Thanks Granny! I'll ask Rosie.", nextNode: 'cookie_noted', effect: { type: 'give_resource', resources: { flour: 3, sugar: 3 }, clue: 'granny_trotter' } },
                        { text: "Back to other things.", nextNode: 'greeting' }
                    ]
                },

                'cookie_noted': {
                    text: "Good luck, dearie! And Pedro... when you find that recipe, you better bake me a batch!",
                    choices: [
                        { text: "I promise!", nextNode: null }
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
