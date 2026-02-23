/**
 * UI
 * Contains HUD, minimap, shop system, and screen management.
 */

window.UI = (function() {
    'use strict';

    /**
     * Setup the minimap canvas.
     */
    function setupMinimap() {
        GameState.minimapCanvas = document.getElementById('minimap-canvas');
        GameState.minimapCanvas.width = 150;
        GameState.minimapCanvas.height = 150;
        GameState.minimapCtx = GameState.minimapCanvas.getContext('2d');
    }

    /**
     * Update the minimap display.
     */
    function updateMinimap() {
        const ctx = GameState.minimapCtx;
        const size = 150;
        const scale = size / (CONFIG.WORLD_SIZE * 1.4);

        // Get current biome data for colors
        const biomeData = getBiomeData(GameState.currentBiome);

        // Background color based on biome
        ctx.fillStyle = biomeData.minimapBackground || '#1a3d1a';
        ctx.fillRect(0, 0, size, size);

        // Draw village if biome has one
        if (biomeData.hasVillage) {
            const vx = (CONFIG.VILLAGE_CENTER.x + CONFIG.WORLD_SIZE * 0.7) * scale;
            const vy = (CONFIG.VILLAGE_CENTER.z + CONFIG.WORLD_SIZE * 0.7) * scale;
            ctx.fillStyle = '#8b7355';
            ctx.beginPath();
            ctx.arc(vx, vy, CONFIG.VILLAGE_RADIUS * scale * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw river (for arboreal biome)
        const riverPoints = Environment.getRiverPoints();
        const riverWidth = Environment.getRiverWidth();
        if (riverPoints && riverPoints.length > 0) {
            ctx.strokeStyle = '#4a90e2';
            ctx.lineWidth = riverWidth * scale;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            riverPoints.forEach((point, i) => {
                const rx = (point.x + CONFIG.WORLD_SIZE * 0.7) * scale;
                const ry = (point.z + CONFIG.WORLD_SIZE * 0.7) * scale;
                if (i === 0) {
                    ctx.moveTo(rx, ry);
                } else {
                    ctx.lineTo(rx, ry);
                }
            });
            ctx.stroke();
        }

        // Draw watering hole (for savannah biome)
        if (biomeData.waterFeature === 'wateringHole') {
            const holePos = biomeData.wateringHolePosition;
            const holeRadius = biomeData.wateringHoleRadius;
            const hx = (holePos.x + CONFIG.WORLD_SIZE * 0.7) * scale;
            const hy = (holePos.z + CONFIG.WORLD_SIZE * 0.7) * scale;
            ctx.fillStyle = '#4a90e2';
            ctx.beginPath();
            ctx.arc(hx, hy, holeRadius * scale, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#0a2a0a';
        GameState.trees.forEach(tree => {
            const tx = (tree.position.x + CONFIG.WORLD_SIZE * 0.7) * scale;
            const ty = (tree.position.z + CONFIG.WORLD_SIZE * 0.7) * scale;
            ctx.beginPath();
            ctx.arc(tx, ty, 1.5, 0, Math.PI * 2);
            ctx.fill();
        });

        GameState.resources.forEach(res => {
            let color;
            switch(res.userData.type) {
                case 'berry': color = '#4169e1'; break;
                case 'nut': color = '#8b4513'; break;
                case 'mushroom': color = '#ff6347'; break;
                case 'seaweed': color = '#2e8b57'; break;
                case 'egg': color = '#f5f5dc'; break;
            }
            ctx.fillStyle = color;
            const rx = (res.position.x + CONFIG.WORLD_SIZE * 0.7) * scale;
            const ry = (res.position.z + CONFIG.WORLD_SIZE * 0.7) * scale;
            ctx.beginPath();
            ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw goose nests on minimap (arboreal biome)
        if (GameState.nests) {
            GameState.nests.forEach(nest => {
                const nestColor = nest.egg && nest.egg.exists ? '#ffeb3b' : '#8b7355';
                ctx.fillStyle = nestColor;
                const nx = (nest.position.x + CONFIG.WORLD_SIZE * 0.7) * scale;
                const ny = (nest.position.z + CONFIG.WORLD_SIZE * 0.7) * scale;
                ctx.beginPath();
                ctx.arc(nx, ny, 2, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // Draw toad nests on minimap (savannah biome)
        if (GameState.toadNests) {
            GameState.toadNests.forEach(nest => {
                const eggsRemaining = nest.eggs.filter(e => e.exists).length;
                const nestColor = eggsRemaining > 0 ? '#d2b48c' : '#8b4513'; // Tan with eggs, brown without
                ctx.fillStyle = nestColor;
                const nx = (nest.position.x + CONFIG.WORLD_SIZE * 0.7) * scale;
                const ny = (nest.position.z + CONFIG.WORLD_SIZE * 0.7) * scale;
                ctx.beginPath();
                ctx.arc(nx, ny, 2, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        GameState.enemies.forEach(enemy => {
            // Use minimap color from enemy data (set by ANIMAL_TYPES in enemies.js)
            ctx.fillStyle = enemy.userData.minimapColor || '#ff4444';
            const ex = (enemy.position.x + CONFIG.WORLD_SIZE * 0.7) * scale;
            const ey = (enemy.position.z + CONFIG.WORLD_SIZE * 0.7) * scale;
            ctx.beginPath();
            ctx.arc(ex, ey, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.fillStyle = '#44ff44';
        const px = (GameState.peccary.position.x + CONFIG.WORLD_SIZE * 0.7) * scale;
        const py = (GameState.peccary.position.z + CONFIG.WORLD_SIZE * 0.7) * scale;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#88ff88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        // Model faces +X, rotation.y=0 means +X (right on minimap)
        // Canvas: +X = right, +Y = down (= +Z in world)
        ctx.lineTo(
            px + Math.cos(GameState.peccary.rotation.y) * 10,
            py - Math.sin(GameState.peccary.rotation.y) * 10
        );
        ctx.stroke();
    }

    /**
     * Update the UI display (health, score, resources, time).
     */
    function updateUI() {
        document.getElementById('health-bar').style.width = Math.max(0, GameState.health) + '%';
        document.getElementById('score-display').textContent = GameState.score;
        document.getElementById('berries-count').textContent = GameState.resourceCounts.berries;
        document.getElementById('nuts-count').textContent = GameState.resourceCounts.nuts;
        document.getElementById('mushrooms-count').textContent = GameState.resourceCounts.mushrooms;
        document.getElementById('seaweed-count').textContent = GameState.resourceCounts.seaweed;
        document.getElementById('eggs-count').textContent = GameState.resourceCounts.eggs;
        document.getElementById('arsenic-mushrooms-count').textContent = GameState.resourceCounts.arsenic_mushrooms;
        document.getElementById('thous-pine-wood-count').textContent = GameState.resourceCounts.thous_pine_wood;
        document.getElementById('glass-count').textContent = GameState.resourceCounts.glass;
        document.getElementById('coins-display').textContent = '🪙 ' + GameState.pigCoins;

        // Update hunger bar
        const hungerBar = document.getElementById('hunger-bar');
        hungerBar.style.width = Math.max(0, GameState.hunger) + '%';
        // Add/remove starving class for visual warning
        if (GameState.hunger <= 20) {
            hungerBar.classList.add('starving');
        } else {
            hungerBar.classList.remove('starving');
        }

        // Update thirst bar
        const thirstBar = document.getElementById('thirst-bar');
        thirstBar.style.width = Math.max(0, GameState.thirst) + '%';
        // Add/remove dehydrated class for visual warning
        if (GameState.thirst <= 20) {
            thirstBar.classList.add('dehydrated');
        } else {
            thirstBar.classList.remove('dehydrated');
        }

        const minutes = Math.floor(GameState.timeElapsed / 60);
        const seconds = Math.floor(GameState.timeElapsed % 60);
        document.getElementById('time-display').textContent =
            minutes + ':' + seconds.toString().padStart(2, '0');

        // Toggle chase warning
        const chaseWarning = document.getElementById('goose-chase-warning');
        if (GameState.chasingGeese && GameState.chasingGeese.length > 0) {
            chaseWarning.style.display = 'block';
        } else {
            chaseWarning.style.display = 'none';
        }

        // Check for progression unlocks
        checkProgressionUnlocks();
    }

    /**
     * Open the shop menu.
     */
    function openShop() {
        GameState.isShopOpen = true;
        const shopMenu = document.getElementById('shop-menu');

        CONFIG.SHOP_ITEMS.forEach(item => {
            GameState.shopQuantities[item.id] = 1;
        });
        Object.keys(CONFIG.RESOURCE_PRICES).forEach(resource => {
            GameState.shopQuantities['sell_' + resource] = 1;
        });

        renderShop();
        shopMenu.classList.remove('hidden');
        Game.playSound('collect');
    }

    /**
     * Close the shop menu.
     */
    function closeShop() {
        GameState.isShopOpen = false;
        document.getElementById('shop-menu').classList.add('hidden');
    }

    /**
     * Render the shop with all items and resources.
     */
    function renderShop() {
        document.getElementById('shop-coins-display').textContent = GameState.pigCoins;

        renderShopBuyTab();
        renderShopSellTab();

        document.querySelectorAll('.shop-tab').forEach(tab => {
            tab.onclick = () => switchShopTab(tab.dataset.tab);
        });
    }

    /**
     * Switch between buy and sell tabs.
     */
    function switchShopTab(tabName) {
        document.querySelectorAll('.shop-tab').forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        document.querySelectorAll('.shop-panel').forEach(panel => {
            if (panel.id === 'shop-' + tabName) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
    }

    /**
     * Render the buy tab with items.
     */
    function renderShopBuyTab() {
        const buyPanel = document.getElementById('shop-buy');
        buyPanel.innerHTML = '';

        CONFIG.SHOP_ITEMS.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'shop-item';

            const headerDiv = document.createElement('div');
            headerDiv.className = 'shop-item-header';
            headerDiv.innerHTML = `
                <div class="shop-item-name">${item.icon} ${item.name}</div>
                <div class="shop-item-price">${item.price} 🪙</div>
            `;
            itemDiv.appendChild(headerDiv);

            const descDiv = document.createElement('div');
            descDiv.className = 'shop-item-stock';
            descDiv.textContent = item.description;
            itemDiv.appendChild(descDiv);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'shop-item-actions';

            const qtyDiv = document.createElement('div');
            qtyDiv.className = 'shop-quantity';

            const minusBtn = document.createElement('button');
            minusBtn.className = 'shop-quantity-btn';
            minusBtn.textContent = '-';
            minusBtn.onclick = () => {
                if (GameState.shopQuantities[item.id] > 1) {
                    GameState.shopQuantities[item.id]--;
                    renderShop();
                }
            };
            qtyDiv.appendChild(minusBtn);

            const qtyValue = document.createElement('span');
            qtyValue.className = 'shop-quantity-value';
            qtyValue.textContent = GameState.shopQuantities[item.id];
            qtyDiv.appendChild(qtyValue);

            const plusBtn = document.createElement('button');
            plusBtn.className = 'shop-quantity-btn';
            plusBtn.textContent = '+';
            plusBtn.onclick = () => {
                GameState.shopQuantities[item.id]++;
                renderShop();
            };
            qtyDiv.appendChild(plusBtn);

            actionsDiv.appendChild(qtyDiv);

            const buyBtn = document.createElement('button');
            buyBtn.className = 'shop-buy-btn';
            const totalPrice = item.price * GameState.shopQuantities[item.id];
            buyBtn.textContent = `Buy (${totalPrice} 🪙)`;
            buyBtn.disabled = GameState.pigCoins < totalPrice;
            buyBtn.onclick = () => buyItem(item);
            actionsDiv.appendChild(buyBtn);

            itemDiv.appendChild(actionsDiv);
            buyPanel.appendChild(itemDiv);
        });
    }

    /**
     * Render the sell tab with resources.
     */
    function renderShopSellTab() {
        const sellPanel = document.getElementById('shop-sell');
        sellPanel.innerHTML = '';

        const resourceInfo = {
            berries: { name: 'Berries', icon: '🫐' },
            nuts: { name: 'Nuts', icon: '🥜' },
            mushrooms: { name: 'Mushrooms', icon: '🍄' },
            seaweed: { name: 'Seaweed', icon: '🌿' },
            eggs: { name: 'Eggs', icon: '🥚' },
            arsenic_mushrooms: { name: 'Arsenic Mushrooms', icon: '☠️' },
            thous_pine_wood: { name: 'Thous Pine Wood', icon: '🪵' },
            glass: { name: 'Glass', icon: '🔮' }
        };

        Object.keys(CONFIG.RESOURCE_PRICES).forEach(resourceType => {
            const info = resourceInfo[resourceType];
            const price = CONFIG.RESOURCE_PRICES[resourceType];
            const available = GameState.resourceCounts[resourceType];
            const qtyKey = 'sell_' + resourceType;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'shop-item';

            const headerDiv = document.createElement('div');
            headerDiv.className = 'shop-item-header';
            headerDiv.innerHTML = `
                <div class="shop-item-name">${info.icon} ${info.name}</div>
                <div class="shop-item-price">${price} 🪙 each</div>
            `;
            itemDiv.appendChild(headerDiv);

            const stockDiv = document.createElement('div');
            stockDiv.className = 'shop-item-stock';
            stockDiv.textContent = `You have: ${available}`;
            itemDiv.appendChild(stockDiv);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'shop-item-actions';

            const qtyDiv = document.createElement('div');
            qtyDiv.className = 'shop-quantity';

            const minusBtn = document.createElement('button');
            minusBtn.className = 'shop-quantity-btn';
            minusBtn.textContent = '-';
            minusBtn.onclick = () => {
                if (GameState.shopQuantities[qtyKey] > 1) {
                    GameState.shopQuantities[qtyKey]--;
                    renderShop();
                }
            };
            qtyDiv.appendChild(minusBtn);

            const qtyValue = document.createElement('span');
            qtyValue.className = 'shop-quantity-value';
            qtyValue.textContent = GameState.shopQuantities[qtyKey];
            qtyDiv.appendChild(qtyValue);

            const plusBtn = document.createElement('button');
            plusBtn.className = 'shop-quantity-btn';
            plusBtn.textContent = '+';
            plusBtn.onclick = () => {
                if (GameState.shopQuantities[qtyKey] < available) {
                    GameState.shopQuantities[qtyKey]++;
                    renderShop();
                }
            };
            qtyDiv.appendChild(plusBtn);

            actionsDiv.appendChild(qtyDiv);

            const sellBtn = document.createElement('button');
            sellBtn.className = 'shop-sell-btn';
            const totalPrice = price * GameState.shopQuantities[qtyKey];
            sellBtn.textContent = `Sell (${totalPrice} 🪙)`;
            sellBtn.disabled = available < GameState.shopQuantities[qtyKey];
            sellBtn.onclick = () => sellResource(resourceType);
            actionsDiv.appendChild(sellBtn);

            itemDiv.appendChild(actionsDiv);
            sellPanel.appendChild(itemDiv);
        });
    }

    /**
     * Buy an item from the shop.
     */
    function buyItem(item) {
        const quantity = GameState.shopQuantities[item.id];
        const totalPrice = item.price * quantity;

        if (GameState.pigCoins < totalPrice) {
            Game.playSound('hurt');
            return;
        }

        GameState.pigCoins -= totalPrice;

        for (let i = 0; i < quantity; i++) {
            item.effect();
        }

        Game.playSound('collect');
        updateUI();
        renderShop();
    }

    /**
     * Sell a resource to the shop.
     */
    function sellResource(resourceType) {
        const qtyKey = 'sell_' + resourceType;
        const quantity = GameState.shopQuantities[qtyKey];
        const price = CONFIG.RESOURCE_PRICES[resourceType];

        if (GameState.resourceCounts[resourceType] < quantity) {
            Game.playSound('hurt');
            return;
        }

        GameState.resourceCounts[resourceType] -= quantity;
        GameState.pigCoins += price * quantity;

        Game.playSound('collect');
        updateUI();
        renderShop();
    }

    // Public API
    // ========================================================================
    // PROGRESSION SYSTEM
    // ========================================================================

    /**
     * Check if the player has reached any new progression milestones.
     * Called every time the UI updates.
     */
    function checkProgressionUnlocks() {
        if (!CONFIG.PROGRESSION_MILESTONES) return;

        CONFIG.PROGRESSION_MILESTONES.forEach(function(milestone) {
            if (milestone.villager && GameState.score >= milestone.score) {
                // Check if we already announced this unlock
                if (!GameState.unlockedVillagers.includes(milestone.villager)) {
                    GameState.unlockedVillagers.push(milestone.villager);
                    GameState.currentLevel = milestone.title;
                    showUnlockNotification(milestone);
                }
            }

            // Update current level title (even without new unlock)
            if (GameState.score >= milestone.score) {
                GameState.currentLevel = milestone.title;
            }
        });

        // Update the level display in HUD
        var levelDisplay = document.getElementById('level-display');
        if (levelDisplay) {
            levelDisplay.textContent = GameState.currentLevel;
        }

        // Update progress bar toward next milestone
        updateProgressBar();
    }

    /**
     * Show a notification when the player unlocks a new villager.
     */
    function showUnlockNotification(milestone) {
        var notification = document.getElementById('unlock-notification');
        if (!notification) return;

        var notifTitle = document.getElementById('unlock-title');
        var notifText = document.getElementById('unlock-text');

        notifTitle.textContent = 'NEW LEVEL: ' + milestone.title + '!';
        notifText.textContent = milestone.unlockMessage || (milestone.villager + ' is now available!');

        notification.classList.remove('hidden');
        notification.classList.add('unlock-animate');

        // Hide after 4 seconds
        setTimeout(function() {
            notification.classList.add('hidden');
            notification.classList.remove('unlock-animate');
        }, 4000);

        Game.playSound('collect');
    }

    /**
     * Update the progress bar showing distance to next milestone.
     */
    function updateProgressBar() {
        var progressBar = document.getElementById('progress-bar');
        var progressText = document.getElementById('progress-text');
        if (!progressBar || !progressText) return;

        var milestones = CONFIG.PROGRESSION_MILESTONES;
        var currentMilestone = milestones[0];
        var nextMilestone = null;

        for (var i = 0; i < milestones.length; i++) {
            if (GameState.score >= milestones[i].score) {
                currentMilestone = milestones[i];
                nextMilestone = milestones[i + 1] || null;
            }
        }

        if (nextMilestone) {
            var scoreInRange = GameState.score - currentMilestone.score;
            var rangeSize = nextMilestone.score - currentMilestone.score;
            var percent = Math.min(100, (scoreInRange / rangeSize) * 100);

            progressBar.style.width = percent + '%';
            progressText.textContent = 'Next: ' + nextMilestone.title + ' (' + nextMilestone.score + ')';
        } else {
            progressBar.style.width = '100%';
            progressText.textContent = 'MAX LEVEL!';
        }
    }

    // ========================================================================
    // HOTBAR SYSTEM
    // ========================================================================

    var hotbarIcons = {
        wood_sword: '🗡️',
        wood_axe: '🪓',
        arsen_bomb: '💣'
    };

    /**
     * Update the hotbar display.
     * Shows equipped items in their slots and highlights the selected slot.
     */
    function updateHotbar() {
        var slots = document.querySelectorAll('.hotbar-slot');
        slots.forEach(function(slot, index) {
            // Update selected highlight
            if (index === GameState.selectedHotbarSlot) {
                slot.classList.add('selected');
            } else {
                slot.classList.remove('selected');
            }

            // Update slot content
            var iconEl = slot.querySelector('.hotbar-icon');
            var countEl = slot.querySelector('.hotbar-count');
            var item = GameState.hotbarSlots[index];

            if (item) {
                iconEl.textContent = hotbarIcons[item.id] || '📦';
                // Show count if more than 1
                if (item.count > 1) {
                    if (!countEl) {
                        countEl = document.createElement('span');
                        countEl.className = 'hotbar-count';
                        slot.appendChild(countEl);
                    }
                    countEl.textContent = item.count;
                } else {
                    if (countEl) countEl.remove();
                }
            } else {
                iconEl.textContent = '';
                if (countEl) countEl.remove();
            }
        });
    }

    /**
     * Get the currently selected hotbar item.
     * @returns {Object|null} The item in the selected slot, or null
     */
    function getSelectedHotbarItem() {
        return GameState.hotbarSlots[GameState.selectedHotbarSlot] || null;
    }

    return {
        setupMinimap: setupMinimap,
        updateMinimap: updateMinimap,
        updateUI: updateUI,
        openShop: openShop,
        closeShop: closeShop,
        renderShop: renderShop,
        switchShopTab: switchShopTab,
        buyItem: buyItem,
        sellResource: sellResource,
        checkProgressionUnlocks: checkProgressionUnlocks,
        showUnlockNotification: showUnlockNotification,
        updateHotbar: updateHotbar,
        getSelectedHotbarItem: getSelectedHotbarItem
    };
})();
