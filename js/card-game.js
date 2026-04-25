/**
 * ============================================================================
 * PIGIAS' CARD GAME
 * ============================================================================
 * A Pokémon-style card battling game hosted by Pigias in the tavern.
 *
 * Features:
 * - Buy card packs from Pigierre (different rarities)
 * - Open packs in inventory to get cards
 * - Battle Pigias with your deck (active + bench system)
 * - Attach energy to power attacks
 * - Knock out all opponent's cards to win
 *
 * ============================================================================
 */

window.CardGame = (function() {
    'use strict';

    // ============================================================
    // CARD DATA
    // ============================================================

    // Rarities: common (60%), uncommon (25%), rare (10%), legendary (5%)
    var RARITIES = {
        common: { color: '#888', label: 'Common', chance: 0.60 },
        uncommon: { color: '#4a9', label: 'Uncommon', chance: 0.25 },
        rare: { color: '#59f', label: 'Rare', chance: 0.10 },
        legendary: { color: '#f90', label: 'Legendary', chance: 0.05 }
    };

    // Energy types
    var ENERGY_TYPES = {
        forest: { color: '#4a8', icon: '🌿', name: 'Forest' },
        fire: { color: '#e54', icon: '🔥', name: 'Fire' },
        water: { color: 'rgb(16, 110, 203)', icon: '💧', name: 'Water' },
        earth: { color: 'rgb(143, 106, 31)', icon: '🪨', name: 'Earth' },
        shadow: { color: '#639', icon: '🌑', name: 'Shadow' }
    };

    // Creature cards
    var CREATURE_CARDS = [
        // === COMMON ===
        { id: 'field_mouse', name: 'Field Mouse', rarity: 'common', hp: 30, type: 'forest', art: '🐭',
          attacks: [{ name: 'Nibble', damage: 10, energyCost: 1, type: 'forest' }] },
        { id: 'mud_beetle', name: 'Mud Beetle', rarity: 'common', hp: 40, type: 'earth', art: '🪲',
          attacks: [{ name: 'Shell Bash', damage: 10, energyCost: 1, type: 'earth' }] },
        { id: 'pond_frog', name: 'Pond Frog', rarity: 'common', hp: 30, type: 'water', art: '🐸',
          attacks: [{ name: 'Splash', damage: 10, energyCost: 1, type: 'water' }] },
        { id: 'spark_fly', name: 'Spark Fly', rarity: 'common', hp: 20, type: 'fire', art: '🪰',
          attacks: [{ name: 'Ember Sting', damage: 15, energyCost: 1, type: 'fire' }] },
        { id: 'cave_bat', name: 'Cave Bat', rarity: 'common', hp: 30, type: 'shadow', art: '🦇',
          attacks: [{ name: 'Dark Bite', damage: 10, energyCost: 1, type: 'shadow' }] },
        { id: 'garden_snail', name: 'Garden Snail', rarity: 'common', hp: 50, type: 'earth', art: '🐌',
          attacks: [{ name: 'Slow Slam', damage: 10, energyCost: 1, type: 'earth' }] },
        { id: 'baby_boar', name: 'Baby Boar', rarity: 'common', hp: 40, type: 'forest', art: '🐗',
          attacks: [{ name: 'Charge', damage: 15, energyCost: 2, type: 'forest' }] },
        { id: 'river_crab', name: 'River Crab', rarity: 'common', hp: 35, type: 'water', art: '🦀',
          attacks: [{ name: 'Pinch', damage: 10, energyCost: 1, type: 'water' }] },

        // === UNCOMMON ===
        { id: 'forest_fox', name: 'Forest Fox', rarity: 'uncommon', hp: 50, type: 'forest', art: '🦊',
          attacks: [
            { name: 'Quick Bite', damage: 15, energyCost: 1, type: 'forest' },
            { name: 'Pounce', damage: 30, energyCost: 2, type: 'forest' }
          ] },
        { id: 'fire_salamander', name: 'Fire Salamander', rarity: 'uncommon', hp: 50, type: 'fire', art: '🦎',
          attacks: [
            { name: 'Flame Lick', damage: 20, energyCost: 1, type: 'fire' },
            { name: 'Blaze Rush', damage: 35, energyCost: 2, type: 'fire' }
          ] },
        { id: 'stone_tortoise', name: 'Stone Tortoise', rarity: 'uncommon', hp: 80, type: 'earth', art: '🐢',
          attacks: [
            { name: 'Headbutt', damage: 15, energyCost: 1, type: 'earth' },
            { name: 'Rock Toss', damage: 30, energyCost: 2, type: 'earth' }
          ] },
        { id: 'shadow_cat', name: 'Shadow Cat', rarity: 'uncommon', hp: 45, type: 'shadow', art: '🐈‍⬛',
          attacks: [
            { name: 'Scratch', damage: 15, energyCost: 1, type: 'shadow' },
            { name: 'Night Slash', damage: 35, energyCost: 2, type: 'shadow' }
          ] },
        { id: 'lake_otter', name: 'Lake Otter', rarity: 'uncommon', hp: 55, type: 'water', art: '🦦',
          attacks: [
            { name: 'Dive', damage: 20, energyCost: 1, type: 'water' },
            { name: 'Tidal Slam', damage: 30, energyCost: 2, type: 'water' }
          ] },
        { id: 'thorn_hedgehog', name: 'Thorn Hedgehog', rarity: 'uncommon', hp: 60, type: 'forest', art: '🦔',
          attacks: [
            { name: 'Needle Poke', damage: 10, energyCost: 1, type: 'forest' },
            { name: 'Spike Ball', damage: 25, energyCost: 2, type: 'forest', effect: 'reflect10' }
          ] },

        // === RARE ===
        { id: 'blazing_boar', name: 'Blazing Boar', rarity: 'rare', hp: 80, type: 'fire', art: '🐗',
          attacks: [
            { name: 'Flame Charge', damage: 30, energyCost: 2, type: 'fire' },
            { name: 'Inferno Rush', damage: 50, energyCost: 3, type: 'fire' }
          ] },
        { id: 'crystal_deer', name: 'Crystal Deer', rarity: 'rare', hp: 70, type: 'water', art: '🦌',
          attacks: [
            { name: 'Ice Beam', damage: 30, energyCost: 2, type: 'water' },
            { name: 'Frozen Charge', damage: 45, energyCost: 3, type: 'water', effect: 'freeze' }
          ] },
        { id: 'earth_golem', name: 'Earth Golem', rarity: 'rare', hp: 120, type: 'earth', art: '🗿',
          attacks: [
            { name: 'Boulder Smash', damage: 40, energyCost: 2, type: 'earth' },
            { name: 'Earthquake', damage: 60, energyCost: 3, type: 'earth' }
          ] },
        { id: 'phantom_wolf', name: 'Phantom Wolf', rarity: 'rare', hp: 65, type: 'shadow', art: '🐺',
          attacks: [
            { name: 'Shadow Fang', damage: 35, energyCost: 2, type: 'shadow' },
            { name: 'Howling Doom', damage: 50, energyCost: 3, type: 'shadow' }
          ] },
        { id: 'ancient_owl', name: 'Ancient Owl', rarity: 'rare', hp: 60, type: 'forest', art: '🦉',
          attacks: [
            { name: 'Wind Slash', damage: 25, energyCost: 1, type: 'forest' },
            { name: 'Wisdom Beam', damage: 45, energyCost: 2, type: 'forest', effect: 'heal20' }
          ] },

        // === LEGENDARY ===
        { id: 'inferno_dragon', name: 'Inferno Dragon', rarity: 'legendary', hp: 130, type: 'fire', art: '🐉',
          attacks: [
            { name: 'Dragon Claw', damage: 40, energyCost: 2, type: 'fire' },
            { name: 'Apocalypse Flame', damage: 80, energyCost: 3, type: 'fire' }
          ] },
        { id: 'leviathan', name: 'Leviathan', rarity: 'legendary', hp: 150, type: 'water', art: '🐋',
          attacks: [
            { name: 'Tidal Wave', damage: 50, energyCost: 2, type: 'water' },
            { name: 'Abyssal Crush', damage: 70, energyCost: 3, type: 'water' }
          ] },
        { id: 'shadow_phoenix', name: 'Shadow Phoenix', rarity: 'legendary', hp: 100, type: 'shadow', art: '🕊️',
          attacks: [
            { name: 'Dark Flame', damage: 45, energyCost: 2, type: 'shadow' },
            { name: 'Rebirth Blaze', damage: 60, energyCost: 3, type: 'shadow', effect: 'revive' }
          ] },
        { id: 'world_turtle', name: 'World Turtle', rarity: 'legendary', hp: 200, type: 'earth', art: '🐢',
          attacks: [
            { name: 'Continental Crush', damage: 60, energyCost: 2, type: 'earth' },
            { name: 'Tectonic Shift', damage: 90, energyCost: 3, type: 'earth' }
          ] }
    ];

    // Pack types sold by Pigierre
    var PACK_TYPES = {
        basic_pack: { name: 'Basic Pack', cost: 3, cards: 3, description: 'Contains 3 random cards + 2 energy.' },
        rare_pack: { name: 'Rare Pack', cost: 8, cards: 5, description: 'Contains 5 cards with better odds for rares + 3 energy.', rareBoost: true },
        legendary_pack: { name: 'Legendary Pack', cost: 15, cards: 5, description: 'Guaranteed 1 rare or legendary + 4 cards + 4 energy.', legendaryBoost: true }
    };

    // ============================================================
    // GAME STATE
    // ============================================================
    var battleState = null; // null when not in battle

    // ============================================================
    // PACK OPENING
    // ============================================================

    /**
     * Open a card pack and return the cards inside.
     * @param {string} packType - basic_pack, rare_pack, or legendary_pack
     * @returns {Array} - Array of card objects the player received
     */
    function openPack(packType) {
        var pack = PACK_TYPES[packType];
        if (!pack) return [];

        var results = [];
        var numCards = pack.cards;

        for (var i = 0; i < numCards; i++) {
            var card;
            if (pack.legendaryBoost && i === 0) {
                // Guaranteed rare or legendary
                card = rollCard(true);
            } else if (pack.rareBoost) {
                // Better odds: common 40%, uncommon 35%, rare 18%, legendary 7%
                card = rollCardBoosted();
            } else {
                card = rollCard(false);
            }
            results.push(card);
        }

        // Add energy cards
        var numEnergy = pack.legendaryBoost ? 4 : (pack.rareBoost ? 3 : 2);
        for (var e = 0; e < numEnergy; e++) {
            var types = Object.keys(ENERGY_TYPES);
            var randomType = types[Math.floor(Math.random() * types.length)];
            results.push({ isEnergy: true, type: randomType, id: 'energy_' + randomType });
        }

        // Add cards to player's collection
        results.forEach(function(card) {
            addCardToCollection(card);
        });

        return results;
    }

    function rollCard(guaranteedRareOrAbove) {
        var roll = Math.random();
        var rarity;
        if (guaranteedRareOrAbove) {
            rarity = roll < 0.7 ? 'rare' : 'legendary';
        } else {
            if (roll < 0.60) rarity = 'common';
            else if (roll < 0.85) rarity = 'uncommon';
            else if (roll < 0.95) rarity = 'rare';
            else rarity = 'legendary';
        }
        var pool = CREATURE_CARDS.filter(function(c) { return c.rarity === rarity; });
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function rollCardBoosted() {
        var roll = Math.random();
        var rarity;
        if (roll < 0.40) rarity = 'common';
        else if (roll < 0.75) rarity = 'uncommon';
        else if (roll < 0.93) rarity = 'rare';
        else rarity = 'legendary';
        var pool = CREATURE_CARDS.filter(function(c) { return c.rarity === rarity; });
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function addCardToCollection(card) {
        if (!GameState.cardCollection) GameState.cardCollection = [];
        if (card.isEnergy) {
            var existing = GameState.cardCollection.find(function(c) { return c.id === card.id; });
            if (existing) {
                existing.count = (existing.count || 1) + 1;
            } else {
                GameState.cardCollection.push({ id: card.id, isEnergy: true, type: card.type, count: 1 });
            }
        } else {
            // Creature cards are unique instances (can have duplicates)
            GameState.cardCollection.push({ id: card.id, isEnergy: false, count: 1 });
        }
    }

    // ============================================================
    // PACK OPENING UI (shown from inventory)
    // ============================================================

    function showPackOpening(packType) {
        var cards = openPack(packType);
        if (cards.length === 0) return;

        // Remove the pack from inventory
        var packItem = GameState.inventoryItems.find(function(i) { return i.id === packType; });
        if (packItem) {
            packItem.count--;
            if (packItem.count <= 0) {
                var idx = GameState.inventoryItems.indexOf(packItem);
                GameState.inventoryItems.splice(idx, 1);
            }
        }

        // Show reveal overlay
        var overlay = document.getElementById('card-game-overlay');
        overlay.classList.remove('hidden');
        var container = document.getElementById('card-game-container');
        container.innerHTML = '';

        var title = document.createElement('h2');
        title.textContent = PACK_TYPES[packType].name + ' — Opened!';
        title.style.cssText = 'color:#ffcc00;text-align:center;margin-bottom:20px;';
        container.appendChild(title);

        var grid = document.createElement('div');
        grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;padding:20px;';

        cards.forEach(function(card, i) {
            var cardEl = createCardElement(card, i);
            grid.appendChild(cardEl);
        });
        container.appendChild(grid);

        var closeBtn = document.createElement('button');
        closeBtn.textContent = 'Nice! (Close)';
        closeBtn.style.cssText = 'display:block;margin:20px auto;padding:12px 30px;font-size:16px;background:#4a8;color:white;border:none;border-radius:8px;cursor:pointer;';
        closeBtn.onclick = function() { overlay.classList.add('hidden'); };
        container.appendChild(closeBtn);
    }

    function createCardElement(card, delay) {
        var el = document.createElement('div');
        var rarityColor = card.isEnergy ? ENERGY_TYPES[card.type].color : RARITIES[card.rarity].color;
        el.style.cssText = 'width:120px;height:170px;background:#222;border:3px solid ' + rarityColor +
            ';border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
            'padding:8px;animation:cardReveal 0.4s ease ' + (delay * 0.15) + 's both;';

        if (card.isEnergy) {
            el.innerHTML = '<div style="font-size:36px;">' + ENERGY_TYPES[card.type].icon + '</div>' +
                '<div style="color:#ccc;font-size:11px;margin-top:8px;">' + ENERGY_TYPES[card.type].name + ' Energy</div>';
        } else {
            el.innerHTML = '<div style="font-size:36px;">' + card.art + '</div>' +
                '<div style="color:#fff;font-size:12px;font-weight:bold;margin-top:6px;">' + card.name + '</div>' +
                '<div style="color:' + rarityColor + ';font-size:10px;">' + RARITIES[card.rarity].label + '</div>' +
                '<div style="color:#aaa;font-size:10px;">HP ' + card.hp + '</div>';
        }
        return el;
    }

    // ============================================================
    // BATTLE SYSTEM
    // ============================================================

    /**
     * Start a battle with Pigias.
     * Player selects a deck of 4 creatures + energies, AI gets a random deck.
     */
    function open() {
        var overlay = document.getElementById('card-game-overlay');
        overlay.classList.remove('hidden');
        showDeckSelect();
    }

    function close() {
        var overlay = document.getElementById('card-game-overlay');
        overlay.classList.add('hidden');
        battleState = null;
    }

    function showDeckSelect() {
        var container = document.getElementById('card-game-container');
        container.innerHTML = '';

        var collection = GameState.cardCollection || [];
        var creatures = collection.filter(function(c) { return !c.isEnergy; });
        var energies = collection.filter(function(c) { return c.isEnergy; });

        if (creatures.length < 3) {
            container.innerHTML = '<div style="color:#fff;text-align:center;padding:40px;">' +
                '<h2 style="color:#ffcc00;">Not enough cards!</h2>' +
                '<p>You need at least 3 creature cards to battle.</p>' +
                '<p style="color:#aaa;">Buy packs from Pigierre to grow your collection.</p>' +
                '<button id="card-close-btn" style="margin-top:20px;padding:10px 24px;font-size:14px;background:#a44;color:white;border:none;border-radius:6px;cursor:pointer;">Back</button>' +
                '</div>';
            document.getElementById('card-close-btn').onclick = close;
            return;
        }

        var title = document.createElement('h2');
        title.textContent = 'Choose Your Deck (pick 3-4 creatures)';
        title.style.cssText = 'color:#ffcc00;text-align:center;margin:10px 0;';
        container.appendChild(title);

        var subtitle = document.createElement('p');
        subtitle.style.cssText = 'color:#aaa;text-align:center;font-size:12px;margin-bottom:10px;';
        subtitle.textContent = 'Energy: ' + energies.reduce(function(sum, e) { return sum + (e.count || 1); }, 0) + ' total in collection';
        container.appendChild(subtitle);

        var selectedCreatures = [];

        var grid = document.createElement('div');
        grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;padding:10px;max-height:400px;overflow-y:auto;';

        creatures.forEach(function(entry, idx) {
            var cardData = CREATURE_CARDS.find(function(c) { return c.id === entry.id; });
            if (!cardData) return;
            var el = document.createElement('div');
            var rarityColor = RARITIES[cardData.rarity].color;
            el.style.cssText = 'width:110px;height:155px;background:#1a1a1a;border:2px solid ' + rarityColor +
                ';border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
                'padding:6px;cursor:pointer;transition:transform 0.1s;';
            el.innerHTML = '<div style="font-size:28px;">' + cardData.art + '</div>' +
                '<div style="color:#fff;font-size:11px;font-weight:bold;margin-top:4px;">' + cardData.name + '</div>' +
                '<div style="color:' + rarityColor + ';font-size:9px;">' + RARITIES[cardData.rarity].label + '</div>' +
                '<div style="color:#aaa;font-size:9px;">HP ' + cardData.hp + '</div>';

            el.onclick = function() {
                var selIdx = selectedCreatures.indexOf(idx);
                if (selIdx !== -1) {
                    selectedCreatures.splice(selIdx, 1);
                    el.style.transform = 'scale(1)';
                    el.style.boxShadow = 'none';
                } else if (selectedCreatures.length < 4) {
                    selectedCreatures.push(idx);
                    el.style.transform = 'scale(1.05)';
                    el.style.boxShadow = '0 0 12px #ffcc00';
                }
                fightBtn.style.opacity = selectedCreatures.length >= 3 ? '1' : '0.4';
            };
            grid.appendChild(el);
        });
        container.appendChild(grid);

        var fightBtn = document.createElement('button');
        fightBtn.textContent = 'Battle Pigias!';
        fightBtn.style.cssText = 'display:block;margin:16px auto;padding:12px 30px;font-size:16px;background:#c44;color:white;border:none;border-radius:8px;cursor:pointer;opacity:0.4;';
        fightBtn.onclick = function() {
            if (selectedCreatures.length < 3) return;
            var deck = selectedCreatures.map(function(idx) { return creatures[idx]; });
            startBattle(deck, energies);
        };
        container.appendChild(fightBtn);

        var backBtn = document.createElement('button');
        backBtn.textContent = 'Back';
        backBtn.style.cssText = 'display:block;margin:8px auto;padding:8px 20px;font-size:13px;background:#555;color:white;border:none;border-radius:6px;cursor:pointer;';
        backBtn.onclick = close;
        container.appendChild(backBtn);
    }

    function startBattle(playerDeck, playerEnergies) {
        // Build player's hand
        var playerCards = playerDeck.map(function(entry) {
            var data = CREATURE_CARDS.find(function(c) { return c.id === entry.id; });
            return { data: data, currentHp: data.hp, energy: 0, isKO: false };
        });

        // AI deck: pick 3-4 random creatures scaled to player's average rarity
        var aiCount = Math.min(4, playerCards.length);
        var aiCards = [];
        for (var i = 0; i < aiCount; i++) {
            var card = rollCard(false);
            aiCards.push({ data: card, currentHp: card.hp, energy: 0, isKO: false });
        }

        // Count player's energy by type
        var totalEnergy = 0;
        var energyByType = {};
        playerEnergies.forEach(function(e) {
            var count = Math.min(e.count || 1, 5); // Cap per type at 5
            energyByType[e.type] = (energyByType[e.type] || 0) + count;
            totalEnergy += count;
        });

        battleState = {
            playerCards: playerCards,
            aiCards: aiCards,
            playerActive: 0,
            aiActive: 0,
            playerEnergyPool: Math.min(totalEnergy, 20),
            playerEnergyByType: energyByType,
            aiEnergyPool: 12, // AI gets a fixed amount
            turn: 'player', // 'player' or 'ai'
            log: ['Battle started! Go!'],
            gameOver: false
        };

        renderBattle();
    }

    // ============================================================
    // BATTLE RENDERING
    // ============================================================

    function renderBattle() {
        var container = document.getElementById('card-game-container');
        container.innerHTML = '';

        if (!battleState) return;

        // Top: AI side
        var aiSection = document.createElement('div');
        aiSection.style.cssText = 'display:flex;gap:8px;justify-content:center;margin-bottom:10px;';
        battleState.aiCards.forEach(function(card, i) {
            aiSection.appendChild(renderBattleCard(card, i, false));
        });
        container.appendChild(aiSection);

        // Middle: battle log
        var logDiv = document.createElement('div');
        logDiv.style.cssText = 'background:#111;border:1px solid #333;border-radius:6px;padding:8px;margin:8px 20px;height:60px;overflow-y:auto;font-size:11px;color:#ccc;';
        var lastLogs = battleState.log.slice(-4);
        logDiv.innerHTML = lastLogs.map(function(l) { return '<div>' + l + '</div>'; }).join('');
        logDiv.scrollTop = logDiv.scrollHeight;
        container.appendChild(logDiv);

        // Bottom: player side
        var playerSection = document.createElement('div');
        playerSection.style.cssText = 'display:flex;gap:8px;justify-content:center;margin-top:10px;';
        battleState.playerCards.forEach(function(card, i) {
            playerSection.appendChild(renderBattleCard(card, i, true));
        });
        container.appendChild(playerSection);

        // Actions (only on player turn)
        if (battleState.turn === 'player' && !battleState.gameOver) {
            var actions = document.createElement('div');
            actions.style.cssText = 'display:flex;gap:10px;justify-content:center;margin-top:12px;flex-wrap:wrap;';

            var active = battleState.playerCards[battleState.playerActive];
            if (active && !active.isKO) {
                // Attach energy button — shows the type needed
                var neededType = active.data.type;
                var availableOfType = battleState.playerEnergyByType[neededType] || 0;
                if (availableOfType > 0) {
                    var energyBtn = document.createElement('button');
                    energyBtn.textContent = ENERGY_TYPES[neededType].icon + ' Attach ' + ENERGY_TYPES[neededType].name + ' Energy (' + availableOfType + ' left)';
                    energyBtn.style.cssText = 'padding:8px 16px;font-size:12px;background:' + ENERGY_TYPES[neededType].color + ';color:white;border:none;border-radius:6px;cursor:pointer;';
                    energyBtn.onclick = function() { attachEnergy(); };
                    actions.appendChild(energyBtn);
                }

                // Attack buttons
                active.data.attacks.forEach(function(atk, atkIdx) {
                    var canUse = active.energy >= atk.energyCost;
                    var atkBtn = document.createElement('button');
                    atkBtn.textContent = atk.name + ' (' + atk.damage + ' dmg, ' + atk.energyCost + '⚡)';
                    atkBtn.style.cssText = 'padding:8px 16px;font-size:12px;background:' + (canUse ? '#c44' : '#444') +
                        ';color:white;border:none;border-radius:6px;cursor:' + (canUse ? 'pointer' : 'not-allowed') + ';';
                    if (canUse) {
                        atkBtn.onclick = function() { doPlayerAttack(atkIdx); };
                    }
                    actions.appendChild(atkBtn);
                });

                // Switch button (if bench available)
                var alive = battleState.playerCards.filter(function(c, i) { return !c.isKO && i !== battleState.playerActive; });
                if (alive.length > 0) {
                    var switchBtn = document.createElement('button');
                    switchBtn.textContent = '🔄 Switch';
                    switchBtn.style.cssText = 'padding:8px 16px;font-size:12px;background:#a84;color:white;border:none;border-radius:6px;cursor:pointer;';
                    switchBtn.onclick = function() { showSwitchMenu(); };
                    actions.appendChild(switchBtn);
                }
            }

            container.appendChild(actions);
        }

        // Energy display
        var energyInfo = document.createElement('div');
        energyInfo.style.cssText = 'text-align:center;color:#aaa;font-size:11px;margin-top:8px;';
        energyInfo.textContent = 'Your Energy Pool: ' + battleState.playerEnergyPool + ' | Pigias Energy: ' + battleState.aiEnergyPool;
        container.appendChild(energyInfo);

        // Game over state
        if (battleState.gameOver) {
            var resultDiv = document.createElement('div');
            resultDiv.style.cssText = 'text-align:center;margin-top:16px;';
            var won = battleState.winner === 'player';
            resultDiv.innerHTML = '<h2 style="color:' + (won ? '#4a8' : '#c44') + ';">' +
                (won ? 'You Win! 🎉' : 'Pigias Wins!') + '</h2>' +
                (won ? '<p style="color:#ffcc00;">+3 Tavern Tokens!</p>' : '<p style="color:#aaa;">Better luck next time!</p>');
            var closeBtn = document.createElement('button');
            closeBtn.textContent = 'Close';
            closeBtn.style.cssText = 'margin-top:12px;padding:10px 24px;font-size:14px;background:#555;color:white;border:none;border-radius:6px;cursor:pointer;';
            closeBtn.onclick = close;
            resultDiv.appendChild(closeBtn);
            container.appendChild(resultDiv);
        }

        // Quit button (during battle)
        if (!battleState.gameOver) {
            var quitBtn = document.createElement('button');
            quitBtn.textContent = 'Forfeit';
            quitBtn.style.cssText = 'display:block;margin:12px auto 0;padding:6px 16px;font-size:11px;background:#633;color:#ccc;border:none;border-radius:4px;cursor:pointer;';
            quitBtn.onclick = close;
            container.appendChild(quitBtn);
        }
    }

    function renderBattleCard(card, index, isPlayer) {
        var el = document.createElement('div');
        var isActive = isPlayer ? (index === battleState.playerActive) : (index === battleState.aiActive);
        var rarityColor = RARITIES[card.data.rarity].color;
        var borderColor = card.isKO ? '#444' : (isActive ? '#ffcc00' : rarityColor);
        var opacity = card.isKO ? '0.4' : '1';

        el.style.cssText = 'width:100px;height:130px;background:#1a1a1a;border:2px solid ' + borderColor +
            ';border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
            'padding:4px;opacity:' + opacity + ';' + (isActive ? 'box-shadow:0 0 10px #ffcc00;' : '');

        var hpPercent = Math.max(0, card.currentHp / card.data.hp * 100);
        var hpColor = hpPercent > 50 ? '#4a8' : (hpPercent > 25 ? '#ca4' : '#c44');

        el.innerHTML = '<div style="font-size:22px;">' + card.data.art + '</div>' +
            '<div style="color:#fff;font-size:9px;font-weight:bold;">' + card.data.name + '</div>' +
            (card.isKO ? '<div style="color:#c44;font-size:9px;">KO</div>' :
            '<div style="width:80%;height:6px;background:#333;border-radius:3px;margin:3px 0;">' +
            '<div style="width:' + hpPercent + '%;height:100%;background:' + hpColor + ';border-radius:3px;"></div></div>' +
            '<div style="color:#aaa;font-size:8px;">' + card.currentHp + '/' + card.data.hp + ' HP</div>') +
            '<div style="color:#48c;font-size:8px;">⚡' + card.energy + '</div>';

        // Click to switch (player bench cards)
        if (isPlayer && !card.isKO && !isActive && battleState.turn === 'player' && !battleState.gameOver) {
            el.style.cursor = 'pointer';
            el.onclick = function() { switchTo(index); };
        }

        return el;
    }

    // ============================================================
    // BATTLE ACTIONS
    // ============================================================

    function attachEnergy() {
        if (battleState.playerEnergyPool <= 0) return;
        var active = battleState.playerCards[battleState.playerActive];
        if (active.isKO) return;

        // Check if player has energy of this card's type
        var neededType = active.data.type;
        var available = battleState.playerEnergyByType[neededType] || 0;
        if (available <= 0) {
            battleState.log.push('No ' + ENERGY_TYPES[neededType].name + ' energy left to attach!');
            renderBattle();
            return;
        }

        active.energy++;
        battleState.playerEnergyByType[neededType]--;
        battleState.playerEnergyPool--;
        battleState.log.push('Attached ' + ENERGY_TYPES[neededType].icon + ' to ' + active.data.name + '. (⚡' + active.energy + ')');
        renderBattle();
    }

    function doPlayerAttack(atkIdx) {
        var active = battleState.playerCards[battleState.playerActive];
        var atk = active.data.attacks[atkIdx];
        // Energy stays attached — just need enough, don't subtract
        if (active.energy < atk.energyCost) return;

        var target = battleState.aiCards[battleState.aiActive];

        // Apply damage
        target.currentHp -= atk.damage;
        battleState.log.push(active.data.name + ' used ' + atk.name + '! ' + atk.damage + ' damage!');

        // Apply effects
        if (atk.effect === 'heal20') {
            active.currentHp = Math.min(active.data.hp, active.currentHp + 20);
            battleState.log.push(active.data.name + ' healed 20 HP!');
        }

        // Check KO
        if (target.currentHp <= 0) {
            target.currentHp = 0;
            target.isKO = true;
            battleState.log.push(target.data.name + ' is knocked out!');
            // Find next AI active
            var nextAI = battleState.aiCards.findIndex(function(c, i) { return !c.isKO && i !== battleState.aiActive; });
            if (nextAI === -1) {
                // Player wins!
                endBattle('player');
                return;
            }
            battleState.aiActive = nextAI;
            battleState.log.push('Pigias sends out ' + battleState.aiCards[nextAI].data.name + '!');
        }

        // End player turn
        battleState.turn = 'ai';
        renderBattle();
        setTimeout(doAITurn, 1200);
    }

    function switchTo(index) {
        battleState.playerActive = index;
        battleState.log.push('You switched to ' + battleState.playerCards[index].data.name + '!');
        battleState.turn = 'ai';
        renderBattle();
        setTimeout(doAITurn, 1200);
    }

    function showSwitchMenu() {
        // Clicking bench cards directly handles switching
        battleState.log.push('Click a bench card to switch.');
        renderBattle();
    }

    // ============================================================
    // AI TURN
    // ============================================================

    function doAITurn() {
        if (battleState.gameOver) return;

        var active = battleState.aiCards[battleState.aiActive];
        if (active.isKO) {
            var next = battleState.aiCards.findIndex(function(c) { return !c.isKO; });
            if (next === -1) { endBattle('player'); return; }
            battleState.aiActive = next;
            active = battleState.aiCards[next];
        }

        // AI strategy: attach energy if can't attack, then attack strongest available
        var bestAtk = null;
        active.data.attacks.forEach(function(atk) {
            if (active.energy >= atk.energyCost) {
                if (!bestAtk || atk.damage > bestAtk.damage) bestAtk = atk;
            }
        });

        if (!bestAtk && battleState.aiEnergyPool > 0) {
            // Attach energy
            active.energy++;
            battleState.aiEnergyPool--;
            battleState.log.push('Pigias attached energy to ' + active.data.name + '. (⚡' + active.energy + ')');
            // Try again
            active.data.attacks.forEach(function(atk) {
                if (active.energy >= atk.energyCost) {
                    if (!bestAtk || atk.damage > bestAtk.damage) bestAtk = atk;
                }
            });
        }

        if (bestAtk) {
            // Energy stays attached, not consumed
            var target = battleState.playerCards[battleState.playerActive];
            target.currentHp -= bestAtk.damage;
            battleState.log.push(active.data.name + ' used ' + bestAtk.name + '! ' + bestAtk.damage + ' damage!');

            if (target.currentHp <= 0) {
                target.currentHp = 0;
                target.isKO = true;
                battleState.log.push(target.data.name + ' is knocked out!');
                var nextPlayer = battleState.playerCards.findIndex(function(c, i) { return !c.isKO; });
                if (nextPlayer === -1) {
                    endBattle('ai');
                    return;
                }
                battleState.playerActive = nextPlayer;
                battleState.log.push('You send out ' + battleState.playerCards[nextPlayer].data.name + '!');
            }
        } else {
            // Can't do anything, just pass
            battleState.log.push('Pigias has no energy to attack!');
        }

        battleState.turn = 'player';
        renderBattle();
    }

    // ============================================================
    // END BATTLE
    // ============================================================

    function endBattle(winner) {
        battleState.gameOver = true;
        battleState.winner = winner;
        if (winner === 'player') {
            GameState.tavernTokens = (GameState.tavernTokens || 0) + 3;
            if (!GameState.tavernWins) GameState.tavernWins = {};
            GameState.tavernWins.pigias = (GameState.tavernWins.pigias || 0) + 1;
            battleState.log.push('You win! +3 Tavern Tokens!');
        } else {
            battleState.log.push('All your cards are knocked out... Pigias wins!');
        }
        renderBattle();
    }

    // ============================================================
    // COLLECTION VIEWER (for inventory tab)
    // ============================================================

    function getCollectionHTML() {
        var collection = GameState.cardCollection || [];
        if (collection.length === 0) {
            return '<div style="text-align:center;color:#888;padding:20px;">No cards yet. Buy packs from Pigierre!</div>';
        }

        // Separate energy and creatures
        var energies = collection.filter(function(c) { return c.isEnergy; });
        var creatures = collection.filter(function(c) { return !c.isEnergy; });

        var html = '';

        // Energy summary
        if (energies.length > 0) {
            html += '<div style="margin-bottom:12px;padding:8px;background:#111;border-radius:6px;"><b style="color:#aaa;font-size:11px;">ENERGY</b><div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;">';
            energies.forEach(function(entry) {
                var etype = ENERGY_TYPES[entry.type];
                html += '<div style="display:flex;align-items:center;gap:4px;background:#1a1a1a;padding:4px 10px;border-radius:4px;border:1px solid ' + etype.color + ';">' +
                    '<span style="font-size:16px;">' + etype.icon + '</span>' +
                    '<span style="color:#ccc;font-size:11px;">' + etype.name + ' x' + (entry.count || 1) + '</span></div>';
            });
            html += '</div></div>';
        }

        // Creature cards as full album entries
        html += '<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">';
        creatures.forEach(function(entry) {
            var cardData = CREATURE_CARDS.find(function(c) { return c.id === entry.id; });
            if (!cardData) return;
            var rc = RARITIES[cardData.rarity].color;
            var typeInfo = ENERGY_TYPES[cardData.type];

            html += '<div style="width:140px;background:#1a1a1a;border:2px solid ' + rc +
                ';border-radius:8px;padding:8px;display:flex;flex-direction:column;align-items:center;">';
            // Header
            html += '<div style="font-size:28px;">' + cardData.art + '</div>';
            html += '<div style="color:#fff;font-size:11px;font-weight:bold;margin-top:4px;">' + cardData.name + '</div>';
            html += '<div style="color:' + rc + ';font-size:9px;">' + RARITIES[cardData.rarity].label + '</div>';
            html += '<div style="display:flex;gap:6px;align-items:center;margin:3px 0;">';
            html += '<span style="color:#ccc;font-size:9px;">HP ' + cardData.hp + '</span>';
            html += '<span style="font-size:10px;">' + typeInfo.icon + '</span>';
            html += '</div>';
            // Attacks
            cardData.attacks.forEach(function(atk) {
                html += '<div style="width:100%;background:#222;border-radius:3px;padding:3px 5px;margin-top:3px;">';
                html += '<div style="color:#ddd;font-size:9px;">' + atk.name + '</div>';
                html += '<div style="color:#aaa;font-size:8px;">' + atk.damage + ' dmg | ' + atk.energyCost + '⚡</div>';
                html += '</div>';
            });
            html += '</div>';
        });
        html += '</div>';
        return html;
    }

    // ============================================================
    // PUBLIC API
    // ============================================================

    return {
        open: open,
        close: close,
        openPack: openPack,
        showPackOpening: showPackOpening,
        getCollectionHTML: getCollectionHTML,
        PACK_TYPES: PACK_TYPES,
        CREATURE_CARDS: CREATURE_CARDS
    };
})();
