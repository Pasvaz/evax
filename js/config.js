/**
 * GAME CONFIGURATION
 * Contains all constants, settings, and data for the game.
 */

window.CONFIG = {
    // World settings
    WORLD_SIZE: 500,
    VILLAGE_CENTER: { x: -500 * 0.6, z: -500 * 0.6 },
    VILLAGE_RADIUS: 60,

    // Gameplay settings
    ENEMY_SPAWN_RATE: 4000,
    RESOURCE_SPAWN_RATE: 2500,
    MAX_ENEMIES: 15,
    MAX_RESOURCES: 40,
    ENEMY_DETECTION_RANGE: 40,

    // Resource prices - how many pig coins you get per resource
    RESOURCE_PRICES: {
        berries: 2,
        nuts: 5,
        mushrooms: 10
    },

    // Shop items - items you can BUY with pig coins
    SHOP_ITEMS: [
        {
            id: 'health_potion',
            name: 'Health Potion',
            description: 'Restore 30 health',
            price: 15,
            icon: '💊',
            effect: function() {
                GameState.health = Math.min(100, GameState.health + 30);
            }
        },
        {
            id: 'speed_boost',
            name: 'Speed Boost',
            description: 'Temporarily increase movement speed',
            price: 25,
            icon: '⚡',
            effect: function() {
                // TODO: Implement speed boost effect
                GameState.score += 50;
            }
        },
        {
            id: 'super_heal',
            name: 'Super Healing Elixir',
            description: 'Restore health to maximum',
            price: 40,
            icon: '✨',
            effect: function() {
                GameState.health = 100;
            }
        },
        {
            id: 'lucky_charm',
            name: 'Lucky Charm',
            description: 'Gain 200 score points',
            price: 30,
            icon: '🍀',
            effect: function() {
                GameState.score += 200;
            }
        }
    ],

    // Crafting recipes
    CRAFT_RECIPES: [
        {
            id: 'health_potion',
            name: 'Health Potion',
            description: 'Restore 40 health instantly',
            cost: { berries: 5, nuts: 3, mushrooms: 2 },
            effect: function() {
                GameState.health = Math.min(100, GameState.health + 40);
                Game.playSound('collect');
            }
        },
        {
            id: 'energy_boost',
            name: 'Energy Boost',
            description: 'Gain 100 score points',
            cost: { berries: 10, nuts: 5, mushrooms: 0 },
            effect: function() {
                GameState.score += 100;
                Game.playSound('collect');
            }
        },
        {
            id: 'super_heal',
            name: 'Super Healing Elixir',
            description: 'Restore health to maximum',
            cost: { berries: 15, nuts: 10, mushrooms: 8 },
            effect: function() {
                GameState.health = 100;
                Game.playSound('collect');
            }
        },
        {
            id: 'score_multiplier',
            name: 'Fortune Charm',
            description: 'Gain 250 score points',
            cost: { berries: 20, nuts: 15, mushrooms: 10 },
            effect: function() {
                GameState.score += 250;
                Game.playSound('collect');
            }
        }
    ],

    // Villager data
    VILLAGER_DATA: [
        {
            name: "Elder Hamsworth",
            role: "Village Elder",
            skinColor: 0xffb6c1,
            outfitColor: 0x4a0080,
            hatColor: 0x2a0050,
            position: { x: 0, z: 0 },
            conversationTree: {
                startNode: 'greeting',
                nodes: {
                    'greeting': {
                        text: "Welcome, young traveler! Our village has stood here for generations.",
                        choices: [
                            { text: "Tell me about the village.", nextNode: 'village_history' },
                            { text: "What dangers are out there?", nextNode: 'dangers' },
                            { text: "Goodbye.", nextNode: null }
                        ]
                    },
                    'village_history': {
                        text: "We've lived here peacefully for decades, surviving off the forest bounty.",
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
                        text: "Badgers and weasels lurk in the shadows. They're aggressive predators!and other predators of uncomprehendable horror stalk the wilds.my father died by the hands of one",
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
                    }
                }
            }
        },
        {
            name: "Rosie",
            role: "Farmer",
            skinColor: 0xffc0cb,
            outfitColor: 0x228b22,
            hatColor: 0xdaa520,
            position: { x: 25, z: -15 },
            conversationTree: {
                startNode: 'greeting',
                nodes: {
                    'greeting': {
                        text: "Oink oink! Welcome to my farm! I grow the finest vegetables!",
                        choices: [
                            { text: "Tell me about your farm.", nextNode: 'farm_info' },
                            { text: "I have berries to trade.", nextNode: 'trade_check' },
                            { text: "Goodbye.", nextNode: null }
                        ]
                    },
                    'farm_info': {
                        text: "I grow carrots, potatoes, and beans. Hard work, but rewarding!",
                        choices: [
                            { text: "Do you trade?", nextNode: 'trade_check' },
                            { text: "Sounds nice. Goodbye.", nextNode: null }
                        ]
                    },
                    'trade_check': {
                        text: "I'd love to trade! Bring me 10 berries and I'll give you something.",
                        choices: [
                            { text: "Trade berries for health.", nextNode: 'trade_berries', action: 'trade_berries' },
                            { text: "Maybe later.", nextNode: null }
                        ]
                    },
                    'trade_berries': {
                        text: "Thank you! Here, this will help you feel better.",
                        choices: [
                            { text: "Thanks!", nextNode: null }
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
        {
            name: "Bruno",
            role: "Blacksmith",
            skinColor: 0xcd853f,
            outfitColor: 0x2f2f2f,
            hatColor: null,
            position: { x: -20, z: 18 },
            conversationTree: {
                startNode: 'greeting',
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
        {
            name: "Patches",
            role: "Merchant",
            skinColor: 0xffe4e1,
            outfitColor: 0x8b4513,
            hatColor: 0x006400,
            position: { x: 18, z: 12 },
            conversationTree: {
                startNode: 'greeting',
                nodes: {
                    'greeting': {
                        text: "Psst! Hey there! Looking to trade?",
                        choices: [
                            { text: "Open Shop", nextNode: 'open_shop', action: 'open_shop' },
                            { text: "What do you trade?", nextNode: 'trade_info' },
                            { text: "I have nuts to trade.", nextNode: 'trade_nuts_check' },
                            { text: "Goodbye.", nextNode: null }
                        ]
                    },
                    'open_shop': {
                        text: "Welcome to my shop! Browse my wares!",
                        choices: [
                            { text: "Thanks!", nextNode: null }
                        ]
                    },
                    'trade_info': {
                        text: "I collect nuts and mushrooms. Very valuable! I'll trade for them.",
                        choices: [
                            { text: "Trade nuts?", nextNode: 'trade_nuts_check' },
                            { text: "Trade mushrooms?", nextNode: 'trade_mushrooms_check' },
                            { text: "Not now.", nextNode: null }
                        ]
                    },
                    'trade_nuts_check': {
                        text: "I'll give you health and score for 5 nuts!",
                        choices: [
                            { text: "Trade 5 nuts.", nextNode: 'trade_nuts', action: 'trade_nuts' },
                            { text: "Maybe later.", nextNode: null }
                        ]
                    },
                    'trade_nuts': {
                        text: "Perfect! I've been looking for these. Here's your reward!",
                        choices: [
                            { text: "Thanks!", nextNode: null }
                        ]
                    },
                    'trade_mushrooms_check': {
                        text: "Mushrooms are rare! I'll give you 3 health for 30 mushrooms.",
                        choices: [
                            { text: "Trade 3 mushrooms.", nextNode: 'trade_mushrooms', action: 'trade_mushrooms' },
                            { text: "Not right now.", nextNode: null }
                        ]
                    },
                    'trade_mushrooms': {
                        text: "Excellent! These are worth a lot!",
                        choices: [
                            { text: "Great!", nextNode: null }
                        ]
                    },
                    'trade_fail': {
                        text: "You don't have enough. Come back later!",
                        choices: [
                            { text: "I'll return.", nextNode: null }
                        ]
                    }
                }
            }
        },
        {
            name: "Granny Trotter",
            role: "Healer",
            skinColor: 0xffdab9,
            outfitColor: 0xffffff,
            hatColor: 0xff69b4,
            position: { x: -18, z: -20 },
            conversationTree: {
                startNode: 'greeting',
                nodes: {
                    'greeting': {
                        text: "Oh dearie, you look tired! How can I help you?",
                        choices: [
                            { text: "Tell me about healing.", nextNode: 'health_advice' },
                            { text: "Can you heal me?", nextNode: 'healing_check' },
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
                        text: "Mix berries with mushrooms for a powerful remedy. Nature provides!",
                        choices: [
                            { text: "Thank you!", nextNode: null }
                        ]
                    },
                    'healing_check': {
                        text: "Let me see... Yes, I can help you feel better, dearie!",
                        choices: [
                            { text: "Please heal me!", nextNode: 'heal', action: 'heal_player' },
                            { text: "I'm okay for now.", nextNode: null }
                        ]
                    },
                    'heal': {
                        text: "There you go! All better now. Take care of yourself!",
                        choices: [
                            { text: "Thank you so much!", nextNode: null }
                        ]
                    },
                    'heal_fail': {
                        text: "You're already in perfect health, dearie!",
                        choices: [
                            { text: "Thanks anyway!", nextNode: null }
                        ]
                    }
                }
            }
        }
    ]
};
