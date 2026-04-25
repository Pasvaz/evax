/**
 * ============================================================================
 * SHOP ITEMS - Pure Data File
 * ============================================================================
 *
 * This file contains all items available in Patches' Trading Post.
 * Players buy these with pig coins (earned by collecting resources).
 *
 * ============================================================================
 * HOW TO ADD A NEW SHOP ITEM
 * ============================================================================
 *
 * 1. Copy an existing item (everything between { and })
 * 2. Paste it at the end of the SHOP_ITEMS array
 * 3. Change the id, name, description, price, icon, and effect
 * 4. Save and refresh!
 *
 * ============================================================================
 * ITEM STRUCTURE
 * ============================================================================
 *
 * Each item needs:
 *   - id: Unique identifier (no spaces, use underscores)
 *   - name: Display name in the shop
 *   - description: What the item does
 *   - price: Cost in pig coins
 *   - icon: An emoji to display (copy from here: ❤️ 💊 ⚡ ✨ 🍀 💰 🎁 🌟 💎 🔮)
 *   - effect: What happens when purchased
 *
 * ============================================================================
 * EFFECT TYPES (same as recipes!)
 * ============================================================================
 *
 * HEAL - Restore some health
 *   effect: { type: 'heal', amount: 30 }
 *
 * FULL HEAL - Restore health to maximum
 *   effect: { type: 'full_heal' }
 *
 * GIVE SCORE - Add points
 *   effect: { type: 'give_score', amount: 200 }
 *
 * GIVE COINS - Add pig coins (yes, buy coins with coins - for future features!)
 *   effect: { type: 'give_coins', amount: 100 }
 *
 * COMBO - Multiple effects at once
 *   effect: {
 *       type: 'combo',
 *       effects: [
 *           { type: 'heal', amount: 50 },
 *           { type: 'give_score', amount: 100 }
 *       ]
 *   }
 *
 * ============================================================================
 * EMOJI LIST FOR ICONS
 * ============================================================================
 *
 * Health:  ❤️ 💊 💉 🩹 🏥 💗 💖
 * Magic:   ✨ 🌟 ⭐ 💫 🔮 🪄
 * Speed:   ⚡ 🏃 💨 🚀
 * Luck:    🍀 🎰 🎲 🌈
 * Money:   💰 🪙 💎 💵 🤑
 * Food:    🍎 🍇 🥜 🍄 🫐 🍯
 * Other:   🎁 📦 🎯 🛡️ ⚔️ 🗝️
 *
 * ============================================================================
 */

window.SHOP_ITEMS = [

    // ========================================================================
    // ITEM 1: Health Potion
    // ========================================================================
    // Basic healing item - affordable and useful
    {
        id: 'health_potion',
        name: 'Health Potion',
        description: 'Restore 30 health',
        price: 15,                     // Costs 15 pig coins
        icon: '💊',
        vendor: 'patches',

        effect: {
            type: 'heal',
            amount: 30
        }
    },

    // ========================================================================
    // ITEM 2: Super Healing Elixir
    // ========================================================================
    // Expensive but fully heals!
    {
        id: 'super_heal',
        name: 'Super Healing Elixir',
        description: 'Restore health to maximum',
        price: 40,
        icon: '✨',
        vendor: 'patches',

        effect: {
            type: 'full_heal'
        }
    },

    // ========================================================================
    // ITEM 3: Mega Bundle
    // ========================================================================
    // Shows how to give multiple rewards!
    {
        id: 'mega_bundle',
        name: 'Mega Bundle',
        description: 'Heal 50 health AND gain 100 score!',
        price: 100,
        icon: '🎁',
        vendor: 'patches',

        effect: {
            type: 'combo',
            effects: [
                { type: 'heal', amount: 50 },
                { type: 'give_score', amount: 100 }
            ]
        }
    },

    // ========================================================================
    // BRUNO'S FORGE ITEMS
    // ========================================================================
    // Weapons, tools, and materials sold by Bruno the Blacksmith

    {
        id: 'shop_wood_sword',
        name: 'Wood Sword',
        description: 'A basic wooden sword. Equip from hotbar, click enemies to attack!',
        price: 30,
        icon: '⚔️',
        vendor: 'bruno',

        effect: {
            type: 'item',
            item: 'wood_sword'
        }
    },

    {
        id: 'shop_wood_axe',
        name: 'Wood Axe',
        description: 'A basic wooden axe. Equip from hotbar, click trees to chop!',
        price: 30,
        icon: '🪓',
        vendor: 'bruno',

        effect: {
            type: 'item',
            item: 'wood_axe'
        }
    },

    {
        id: 'shop_barbanit_axe',
        name: 'Barbanit Axe',
        description: 'Chops acacia and birch trees in savannah and coastal biomes!',
        price: 50,
        icon: '🪓',
        vendor: 'bruno',

        effect: {
            type: 'item',
            item: 'barbanit_axe'
        }
    },

    {
        id: 'shop_glass',
        name: 'Glass',
        description: 'Smelted glass, useful for crafting.',
        price: 3,
        icon: '🔮',
        vendor: 'bruno',

        effect: {
            type: 'give_resource',
            resources: { glass: 1 }
        }
    },

    {
        id: 'shop_diving_mask',
        name: 'Diving Mask',
        description: 'Forged glass lens with leather straps. Swim underwater!',
        price: 400,
        icon: '🤿',
        vendor: 'bruno',

        effect: {
            type: 'item',
            item: 'diving_mask'
        }
    }

    // ========================================================================
    // PIGIERRE'S EMPORIUM — Card packs, meeples, biomes, colours
    // ========================================================================
    // Uses tavern tokens (currency: 'tokens')

    ,{
        id: 'basic_pack',
        name: 'Basic Card Pack',
        description: '3 random cards + 2 energy. Good for starting out!',
        price: 3,
        icon: '🃏',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'item', item: 'basic_pack' }
    },

    {
        id: 'rare_pack',
        name: 'Rare Card Pack',
        description: '5 cards with better odds for rares + 3 energy.',
        price: 8,
        icon: '🎴',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'item', item: 'rare_pack' }
    },

    {
        id: 'legendary_pack',
        name: 'Legendary Card Pack',
        description: 'Guaranteed 1 rare or legendary + 4 cards + 4 energy!',
        price: 15,
        icon: '✨',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'item', item: 'legendary_pack' }
    },

    {
        id: 'meeple_rabbit',
        name: 'Rabbit Meeple',
        description: "A quick little lapin! Fast on land, free hop, but fragile.",
        price: 5,
        icon: '🐇',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_meeple', meeple: 'rabbit' }
    },

    {
        id: 'meeple_green_mamba',
        name: 'Green Mamba Meeple',
        description: "Venomous snake! Paralysing bite stuns victims. Slow hunger drain.",
        price: 10,
        icon: '🐍',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_meeple', meeple: 'green_mamba' }
    },

    {
        id: 'meeple_sleepy_mouse',
        name: 'Sleepy Mouse Meeple',
        description: "Tiny granivore! Eats grain for bonus food. Sleep to conserve energy.",
        price: 4,
        icon: '🐭',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_meeple', meeple: 'sleepy_mouse' }
    },

    {
        id: 'meeple_stripy_falcon',
        name: 'Stripy Falcon Meeple',
        description: "Aerial predator! Fly to avoid attacks. Ancient Prairie biome.",
        price: 8,
        icon: '🦅',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_meeple', meeple: 'stripy_falcon' }
    },

    {
        id: 'meeple_hopping_terbal',
        name: 'Hopping Terbal Meeple',
        description: "Mountain predator! Powerful bleeder, but watch out for bone breaks!",
        price: 15,
        icon: '🐺',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_meeple', meeple: 'hopping_terbal' }
    },

    {
        id: 'meeple_squirrel',
        name: 'Squirrel Meeple',
        description: "A clever squirrel for Pigon's game! Climbs trees.",
        price: 5,
        icon: '🐿️',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_meeple', meeple: 'squirrel' }
    },

    {
        id: 'meeple_camelopin',
        name: 'Camelopin Meeple',
        description: "Desert tank! 14 HP, eats cacti safely. Needs Sandstone Valley.",
        price: 8,
        icon: '🐪',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_meeple', meeple: 'small_camelopin' }
    },

    {
        id: 'meeple_felinidon',
        name: 'Felinidon Meeple',
        description: "Lightning predator! Huge damage, can't enter water. Needs Sandstone Valley.",
        price: 10,
        icon: '🐆',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_meeple', meeple: 'desert_felinidon' }
    },

    {
        id: 'meeple_desert_fox',
        name: 'Desert Fox Meeple',
        description: "Hit and run! Free dash, attacks bleed. Needs Sandstone Valley.",
        price: 5,
        icon: '🦊',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_meeple', meeple: 'desert_fox' }
    },

    {
        id: 'meeple_chinchinol',
        name: 'Chinchinol Meeple',
        description: "Tiny dodger! 35% dodge. Needs Ancient Prairie.",
        price: 5,
        icon: '🐁',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_meeple', meeple: 'field_chinchinol' }
    },

    {
        id: 'meeple_coyoteya',
        name: 'Coyoteya Meeple',
        description: "Apex predator! Fast, powerful, bleeds prey. Needs Ancient Prairie.",
        price: 13,
        icon: '🐺',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_meeple', meeple: 'field_coyoteya' }
    },

    {
        id: 'biome_sandstone',
        name: 'Sandstone Valley Biome',
        description: "Unlock the desert biome for Pigon's game!",
        price: 10,
        icon: '🏜️',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_biome', biome: 'sandstone_valley' }
    },

    {
        id: 'biome_prairie',
        name: 'Ancient Prairie Biome',
        description: "Unlock the grassland biome for Pigon's game!",
        price: 15,
        icon: '🌾',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_biome', biome: 'ancient_prairie' }
    },

    {
        id: 'biome_mountains',
        name: 'Great Mountains Biome',
        description: "Unlock the snowy mountain biome! Rocky mounds, pine trees, bone-breaking falls!",
        price: 20,
        icon: '🏔️',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_biome', biome: 'great_mountains' }
    },

    // Board game colours
    {
        id: 'colour_beige',
        name: 'Beige Colour',
        description: "A warm, neutral tone for Pigston's board game.",
        price: 3,
        icon: '🎨',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_colour', colour: 'beige' }
    },

    {
        id: 'colour_mint',
        name: 'Menthe Colour',
        description: "Cool and fresh, like a breeze through ze Alps!",
        price: 3,
        icon: '🎨',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_colour', colour: 'mint' }
    },

    {
        id: 'colour_lemon',
        name: 'Citron Colour',
        description: "Bright and zesty! Like sunshine on ze Riviera!",
        price: 4,
        icon: '🎨',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_colour', colour: 'lemon' }
    },

    {
        id: 'colour_mauve',
        name: 'Mauve Colour',
        description: "The colour of lavender fields in Provence!",
        price: 5,
        icon: '🎨',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_colour', colour: 'mauve' }
    },

    {
        id: 'colour_pink',
        name: 'Rose Clair Colour',
        description: "A bright, soft pink. Magnifique!",
        price: 5,
        icon: '🎨',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_colour', colour: 'pink' }
    },

    {
        id: 'colour_watermelon',
        name: 'Pastèque Colour',
        description: "Green on ze outside, pink on ze inside!",
        price: 5,
        icon: '🎨',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_colour', colour: 'watermelon' }
    },

    {
        id: 'colour_zebra',
        name: 'Zebra Stripes Colour',
        description: "Bold stripes! Not for ze faint of heart.",
        price: 9,
        icon: '🎨',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_colour', colour: 'zebra' }
    },

    {
        id: 'colour_pig_face',
        name: 'Le Cochon Colour',
        description: "A pig face pattern! Ze ultimate flex, oui?",
        price: 15,
        icon: '🎨',
        vendor: 'pigierre',
        currency: 'tokens',
        effect: { type: 'unlock_colour', colour: 'pig_face' }
    }

    // ========================================================================
    // TIM'S THUNDER SHOP — Wandering merchant in the southeast forest
    // ========================================================================

    ,{
        id: 'shop_thunder_scythe',
        name: 'Super Thunder Scythe Hammer',
        description: 'Blue fizzing hammer-scythe! Spin slash + ranged thunderbolt.',
        price: TOOL_STATS.swords.thunder_scythe.price,
        icon: '⚡',
        vendor: 'tim',
        effect: { type: 'item', item: 'thunder_scythe' }
    },

    {
        id: 'shop_thunder_armour',
        name: 'Thunder Armour',
        description: 'Reduces damage (-1 flat, -15%) and shocks attackers for 2 damage!',
        price: 800,
        icon: '🛡️',
        vendor: 'tim',
        effect: { type: 'item', item: 'thunder_armour' }
    }

    // ========================================================================
    // ADD MORE SHOP ITEMS HERE!
    // ========================================================================
    //
    // Each item needs a 'vendor' field: 'patches', 'bruno', 'pigierre', or 'tim'
    // This determines which NPC's shop shows the item.
    // For pigierre items, add: currency: 'tokens'
    //
    // Remember to add a comma after the last item if you add more!

];
