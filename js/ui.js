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

        ctx.fillStyle = '#1a3d1a';
        ctx.fillRect(0, 0, size, size);

        const vx = (CONFIG.VILLAGE_CENTER.x + CONFIG.WORLD_SIZE * 0.7) * scale;
        const vy = (CONFIG.VILLAGE_CENTER.z + CONFIG.WORLD_SIZE * 0.7) * scale;
        ctx.fillStyle = '#8b7355';
        ctx.beginPath();
        ctx.arc(vx, vy, CONFIG.VILLAGE_RADIUS * scale * 0.8, 0, Math.PI * 2);
        ctx.fill();

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
            }
            ctx.fillStyle = color;
            const rx = (res.position.x + CONFIG.WORLD_SIZE * 0.7) * scale;
            const ry = (res.position.z + CONFIG.WORLD_SIZE * 0.7) * scale;
            ctx.beginPath();
            ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
            ctx.fill();
        });

        GameState.enemies.forEach(enemy => {
            ctx.fillStyle = enemy.userData.type === 'badger' ? '#ff4444' : '#ff8800';
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
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#88ff88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(
            px + Math.sin(GameState.peccary.rotation.y) * 10,
            py + Math.cos(GameState.peccary.rotation.y) * 10
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
        document.getElementById('coins-display').textContent = '🪙 ' + GameState.pigCoins;

        const minutes = Math.floor(GameState.timeElapsed / 60);
        const seconds = Math.floor(GameState.timeElapsed % 60);
        document.getElementById('time-display').textContent =
            minutes + ':' + seconds.toString().padStart(2, '0');
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
            mushrooms: { name: 'Mushrooms', icon: '🍄' }
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
    return {
        setupMinimap: setupMinimap,
        updateMinimap: updateMinimap,
        updateUI: updateUI,
        openShop: openShop,
        closeShop: closeShop,
        renderShop: renderShop,
        switchShopTab: switchShopTab,
        buyItem: buyItem,
        sellResource: sellResource
    };
})();
