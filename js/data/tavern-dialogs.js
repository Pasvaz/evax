/**
 * ============================================================================
 * TAVERN DIALOGS - Pure Data File
 * ============================================================================
 *
 * All dialog trees for tavern NPCs. Uses the same node system as villagers.
 * Each NPC has a conversation with nodes and choices.
 *
 * Effect types available:
 *   { type: 'open_game', game: 'board_game' }  — opens a tavern game
 *   { type: 'open_game', game: 'pigon_game' }  — opens Pigon's game
 *   { type: 'open_game', game: 'card_game' }   — opens Pigias' card game
 *   { type: 'open_shop', vendor: 'pigierre' }  — opens Pigierre's shop
 *
 * ============================================================================
 */

window.TAVERN_DIALOGS = {

    // ========================================================================
    // PIGSTON — Board game enthusiast
    // ========================================================================
    pigston: {
        name: 'Pigston',
        role: 'Board Game Enthusiast',
        startNode: 'greeting',
        nodes: {
            'greeting': {
                text: "Hey there! Fancy a game of tiles? I've been practicing all week. Think you can beat me?",
                choices: [
                    { text: "I see you have a game there, may I challenge you?", nextNode: null, effectData: { type: 'open_game', game: 'board_game' } },
                    { text: " Wait, what kind of game is it?", nextNode: 'explain' },
                    { text: "Not right now, thanks.", nextNode: null }
                ]
            },
            'explain': {
                text: "It's a tile-placing game! We take turns placing coloured tiles on a board. Whoever has the most territory at the end wins! I'll give you some tavern tokens if you beat me.",
                choices: [
                    { text: "Sounds fun, let's play!", nextNode: null, effectData: { type: 'open_game', game: 'board_game' } },
                    { text: "Maybe later.", nextNode: null }
                ]
            }
        }
    },

    // ========================================================================
    // PIGON — Survival game host
    // ========================================================================
    pigon: {
        name: 'Pigon',
        role: 'Survival Game Master',
        startNode: 'greeting',
        nodes: {
            'greeting': {
                text: "Ah, another challenger approaches! My survival game is not for the faint of heart. Choose your meeple wisely...",
                choices: [
                    { text: "I see you have a game there, may I challenge you?", nextNode: null, effectData: { type: 'open_game', game: 'pigon_game' } },
                    { text: "What's this game about?", nextNode: 'explain' },
                    { text: "I'll pass for now.", nextNode: null }
                ]
            },
            'explain': {
                text: "You pick a meeple — every one is special at something - with unique abilities — and try to survive on a board. Eat, drink, fight! Last one standing wins. I won't go easy on you.",
                choices: [
                    { text: "LETS GO!", nextNode: null, effectData: { type: 'open_game', game: 'pigon_game' } },
                    { text: "Sound bloody... maybe later?", nextNode: null }
                ]
            }
        }
    },

    // ========================================================================
    // PIGIAS — Card game host
    // ========================================================================
    pigias: {
        name: 'Pigias',
        role: 'Card Game Host',
        startNode: 'greeting',
        nodes: {
            'greeting': {
                text: "Hey there!My name is pigias, I have a knack for collecting creature cards and battling with them. It's all about strategy — attach energy, power up attacks, and knock out your opponent's cards!A bit like pokemon, but also very different!",
                choices: [
                    { text: "I see you have a game there, may I challenge you?", nextNode: 'challenge_check' },
                    { text: "How does the card game work?", nextNode: 'rules' },
                    { text: "See you later.", nextNode: null }
                ]
            },
            'challenge_check': {
                text: "DYNAMIC_PIGIAS_CHALLENGE",
                choices: []
            },
            'rules': {
                text: "It's real simple! Pick 3 or 4 creature cards for your deck. Each card has a type — forest, fire, water, earth, or shadow. On your turn, you can attach energy of that type to power up your creature's attacks. Energy stays on the card once attached, knock out all my cards and I might give you a few tavern tokens. How does that land with you?",
                choices: [
                    { text: "Let's play!", nextNode: 'challenge_check' },
                    { text: "Where do I get cards?", nextNode: 'get_cards' },
                    { text: "Got it, thanks!", nextNode: null }
                ]
            },
            'get_cards': {
                text: "Pigierre might sell a few card packs in that shop of his! Buy some, then open them up from your inventory, and come back here when you have at least 3 creature cards. You can check your collection in the Cards tab of your inventory. I hope you dont get a legendary, because then I'm toast!",
                choices: [
                    { text: "I'll go buy some!", nextNode: null },
                    { text: "Back.", nextNode: 'greeting' }
                ]
            }
        }
    },

    // ========================================================================
    // PIGIERRE — Tavern Merchant
    // ========================================================================
    pigierre: {
        name: 'Pigierre',
        role: 'Tavern Merchant',
        startNode: 'greeting',
        nodes: {
            'greeting': {
                text: "Bonjour, mon ami! Welcome to my humble establishment. What can I do for you today, are you looking for some meeples for pigons little game, or some card packs for pigias's card game.",
         
                choices: [
                    { text: "Can I see what you have for sale?", nextNode: null, effectData: { type: 'open_shop', vendor: 'pigierre' } },
                    { text: "Do you need help with anything in particular?", nextNode: 'quest_check' },
                    { text: "Have you, by any chance, seen anyone in a labcoat?", nextNode: 'emilia' },
                    { text: "Do you have any rumors to share?", nextNode: 'gossip' },
                    { text: "Au revoir!", nextNode: null }
                ]
            },
            'quest_check': {
                text: "DYNAMIC_PIGIERRE_QUEST",
                choices: []
            },
            'emilia': {
                text: "DYNAMIC_PIGIERRE_EMILIA",
                choices: []
            },
            'gossip': {
                text: "DYNAMIC_PIGIERRE_GOSSIP",
                choices: []
            }
        }
    },

    // ========================================================================
    // GRUNTON — Grizzled old boar, gossip NPC
    // ========================================================================
    grunton: {
        name: 'Grunton',
        role: 'Retired Explorer',
        startNode: 'greeting',
        nodes: {
            'greeting': {
                text: "DYNAMIC_GRUNTON_GREETING",
                choices: []
            }
        }
    },

    // ========================================================================
    // TRUFFLE — Rosy pink baker, gossip NPC
    // ========================================================================
    truffle: {
        name: 'Truffle',
        role: 'Village Baker',
        startNode: 'greeting',
        nodes: {
            'greeting': {
                text: "DYNAMIC_TRUFFLE_GREETING",
                choices: []
            }
        }
    },

    // ========================================================================
    // SNICKERS — Young piglet, gossip NPC
    // ========================================================================
    snickers: {
        name: 'Snickers',
        role: 'Curious Piglet',
        startNode: 'greeting',
        nodes: {
            'greeting': {
                text: "DYNAMIC_SNICKERS_GREETING",
                choices: []
            },
            'snickers_answer': {
                text: "DYNAMIC_SNICKERS_ANSWER",
                choices: []
            }
        }
    }
};
