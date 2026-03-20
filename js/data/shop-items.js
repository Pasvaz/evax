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
    // ITEM 2: Speed Boost
    // ========================================================================
    // Currently gives score (speed boost not implemented yet)
    {
        id: 'speed_boost',
        name: 'Speed Boost',
        description: 'Gain 50 bonus score points',
        price: 25,
        icon: '⚡',
        vendor: 'patches',

        effect: {
            type: 'give_score',
            amount: 50
        }
    },

    // ========================================================================
    // ITEM 3: Super Healing Elixir
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
    // ITEM 4: Lucky Charm
    // ========================================================================
    // Buy points with coins!
    {
        id: 'lucky_charm',
        name: 'Lucky Charm',
        description: 'Gain 200 score points',
        price: 30,
        icon: '🍀',
        vendor: 'patches',

        effect: {
            type: 'give_score',
            amount: 200
        }
    },

    // ========================================================================
    // ITEM 5: Mega Bundle (COMBO EXAMPLE)
    // ========================================================================
    // Shows how to give multiple rewards!
    {
        id: 'mega_bundle',
        name: 'Mega Bundle',
        description: 'Heal 50 health AND gain 100 score!',
        price: 50,
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
    // ADD MORE SHOP ITEMS HERE!
    // ========================================================================
    //
    // Each item needs a 'vendor' field: 'patches' or 'bruno'
    // This determines which NPC's shop shows the item.
    //
    // Remember to add a comma after the last item if you add more!

];
