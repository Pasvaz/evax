/**
 * ITEMS
 * Contains resources, crafting system, and inventory management.
 */

window.Items = (function() {
    'use strict';

    /**
     * Use a stored resource from inventory to heal.
     *
     * Healing amounts come from CONFIG.FOOD_HEALING (set in js/data/settings.js)
     * This lets you change healing values without editing this file!
     */
    function useStoredResource(type) {
        let hasResource = false;
        let healAmount = 0;

        // Get healing amounts from config (or use defaults if not set)
        const foodHealing = CONFIG.FOOD_HEALING || { berries: 5, nuts: 8, mushrooms: 12 };

        switch(type) {
            case 'berry':
                if (GameState.resourceCounts.berries > 0) {
                    GameState.resourceCounts.berries--;
                    hasResource = true;
                    healAmount = foodHealing.berries;
                }
                break;
            case 'nut':
                if (GameState.resourceCounts.nuts > 0) {
                    GameState.resourceCounts.nuts--;
                    hasResource = true;
                    healAmount = foodHealing.nuts;
                }
                break;
            case 'mushroom':
                if (GameState.resourceCounts.mushrooms > 0) {
                    GameState.resourceCounts.mushrooms--;
                    hasResource = true;
                    healAmount = foodHealing.mushrooms;
                }
                break;
        }

        if (hasResource) {
            if (GameState.health < 100) {
                GameState.health = Math.min(100, GameState.health + healAmount);
                Game.playSound('collect');
            }
            UI.updateUI();
            return true;
        }

        return false;
    }

    /**
     * Create a resource (berry, nut, or mushroom).
     */
    function createResource(type) {
        const resource = new THREE.Group();
        let color, value, healAmount;

        switch(type) {
            case 'berry':
                color = 0x4169e1;
                healAmount = 5;
                value = 10;
                for (let i = 0; i < 5; i++) {
                    const berry = new THREE.Mesh(
                        new THREE.SphereGeometry(0.15, 8, 8),
                        new THREE.MeshStandardMaterial({ color: color })
                    );
                    berry.position.set(
                        (Math.random() - 0.5) * 0.3,
                        0.2 + Math.random() * 0.2,
                        (Math.random() - 0.5) * 0.3
                    );
                    resource.add(berry);
                }
                const leafMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
                const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), leafMat);
                leaf.scale.set(1, 0.3, 1);
                leaf.position.y = 0.5;
                resource.add(leaf);
                break;

            case 'nut':
                color = 0x8b4513;
                healAmount = 8;
                value = 15;
                const nutBody = new THREE.Mesh(
                    new THREE.SphereGeometry(0.2, 8, 8),
                    new THREE.MeshStandardMaterial({ color: color })
                );
                nutBody.position.y = 0.2;
                nutBody.scale.y = 1.3;
                resource.add(nutBody);
                const cap = new THREE.Mesh(
                    new THREE.SphereGeometry(0.18, 8, 8),
                    new THREE.MeshStandardMaterial({ color: 0x5c3317 })
                );
                cap.position.y = 0.35;
                cap.scale.y = 0.4;
                resource.add(cap);
                const stem = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.03, 0.03, 0.1, 8),
                    new THREE.MeshStandardMaterial({ color: 0x3d2314 })
                );
                stem.position.y = 0.45;
                resource.add(stem);
                break;

            case 'mushroom':
                color = 0xff6347;
                healAmount = 12;
                value = 20;
                const mushroomStem = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.1, 0.12, 0.3, 8),
                    new THREE.MeshStandardMaterial({ color: 0xf5f5dc })
                );
                mushroomStem.position.y = 0.15;
                resource.add(mushroomStem);
                const mushroomCap = new THREE.Mesh(
                    new THREE.SphereGeometry(0.25, 16, 16),
                    new THREE.MeshStandardMaterial({ color: color })
                );
                mushroomCap.scale.y = 0.5;
                mushroomCap.position.y = 0.35;
                resource.add(mushroomCap);
                const spotMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
                for (let i = 0; i < 5; i++) {
                    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), spotMat);
                    const angle = (i / 5) * Math.PI * 2;
                    spot.position.set(
                        Math.cos(angle) * 0.15,
                        0.4,
                        Math.sin(angle) * 0.15
                    );
                    resource.add(spot);
                }
                break;
        }

        resource.userData = {
            type: type,
            value: value,
            healAmount: healAmount,
            radius: 0.5,
            bobOffset: Math.random() * Math.PI * 2
        };

        let rx, rz;
        do {
            rx = (Math.random() - 0.5) * CONFIG.WORLD_SIZE;
            rz = (Math.random() - 0.5) * CONFIG.WORLD_SIZE;
        } while (Math.sqrt(rx * rx + rz * rz) < 10);

        resource.position.set(rx, 0, rz);

        return resource;
    }

    /**
     * Spawn a new resource.
     */
    function spawnResource() {
        if (GameState.resources.length >= CONFIG.MAX_RESOURCES) return;

        const types = ['berry', 'nut', 'mushroom'];
        const type = types[Math.floor(Math.random() * types.length)];
        const resource = createResource(type);
        GameState.resources.push(resource);
        GameState.scene.add(resource);
    }

    /**
     * Update resources - animations and collection.
     */
    function updateResources(delta) {
        for (let i = GameState.resources.length - 1; i >= 0; i--) {
            const resource = GameState.resources[i];

            resource.position.y = 0.1 + Math.sin(GameState.clock.elapsedTime * 2 + resource.userData.bobOffset) * 0.1;
            resource.rotation.y += delta * 0.5;

            const distance = GameState.peccary.position.distanceTo(resource.position);
            if (distance < resource.userData.radius + GameState.peccary.userData.radius) {
                collectResource(resource);
                GameState.scene.remove(resource);
                GameState.resources.splice(i, 1);
            }
        }
    }

    /**
     * Handle resource collection.
     */
    function collectResource(resource) {
        const type = resource.userData.type;
        const value = resource.userData.value;

        Game.playSound('collect');

        if (type === 'berry') {
            GameState.resourceCounts.berries++;
            GameState.pigCoins += CONFIG.RESOURCE_PRICES.berries;
        } else if (type === 'nut') {
            GameState.resourceCounts.nuts++;
            GameState.pigCoins += CONFIG.RESOURCE_PRICES.nuts;
        } else if (type === 'mushroom') {
            GameState.resourceCounts.mushrooms++;
            GameState.pigCoins += CONFIG.RESOURCE_PRICES.mushrooms;
        }

        GameState.score += value;

        UI.updateUI();
    }

    /**
     * Toggle the craft menu open/closed.
     */
    function toggleCraftMenu() {
        GameState.isCraftMenuOpen = !GameState.isCraftMenuOpen;
        const craftMenu = document.getElementById('craft-menu');

        if (GameState.isCraftMenuOpen) {
            renderCraftMenu();
            craftMenu.classList.remove('hidden');
        } else {
            craftMenu.classList.add('hidden');
        }
    }

    /**
     * Render the craft menu with all recipes.
     */
    function renderCraftMenu() {
        const recipesContainer = document.getElementById('craft-recipes');
        recipesContainer.innerHTML = '';

        CONFIG.CRAFT_RECIPES.forEach(recipe => {
            const recipeDiv = document.createElement('div');
            recipeDiv.className = 'craft-recipe';

            const canCraft =
                GameState.resourceCounts.berries >= recipe.cost.berries &&
                GameState.resourceCounts.nuts >= recipe.cost.nuts &&
                GameState.resourceCounts.mushrooms >= recipe.cost.mushrooms;

            if (!canCraft) {
                recipeDiv.classList.add('disabled');
            }

            const nameDiv = document.createElement('div');
            nameDiv.className = 'craft-recipe-name';
            nameDiv.textContent = recipe.name;
            recipeDiv.appendChild(nameDiv);

            const descDiv = document.createElement('div');
            descDiv.className = 'craft-recipe-desc';
            descDiv.textContent = recipe.description;
            recipeDiv.appendChild(descDiv);

            const costDiv = document.createElement('div');
            costDiv.className = 'craft-recipe-cost';

            if (recipe.cost.berries > 0) {
                const berryCost = document.createElement('div');
                berryCost.className = 'craft-cost-item';
                if (GameState.resourceCounts.berries < recipe.cost.berries) {
                    berryCost.classList.add('insufficient');
                }
                berryCost.innerHTML = `<span>🫐</span><span>${recipe.cost.berries}</span>`;
                costDiv.appendChild(berryCost);
            }

            if (recipe.cost.nuts > 0) {
                const nutCost = document.createElement('div');
                nutCost.className = 'craft-cost-item';
                if (GameState.resourceCounts.nuts < recipe.cost.nuts) {
                    nutCost.classList.add('insufficient');
                }
                nutCost.innerHTML = `<span>🥜</span><span>${recipe.cost.nuts}</span>`;
                costDiv.appendChild(nutCost);
            }

            if (recipe.cost.mushrooms > 0) {
                const mushroomCost = document.createElement('div');
                mushroomCost.className = 'craft-cost-item';
                if (GameState.resourceCounts.mushrooms < recipe.cost.mushrooms) {
                    mushroomCost.classList.add('insufficient');
                }
                mushroomCost.innerHTML = `<span>🍄</span><span>${recipe.cost.mushrooms}</span>`;
                costDiv.appendChild(mushroomCost);
            }

            recipeDiv.appendChild(costDiv);

            const craftBtn = document.createElement('button');
            craftBtn.className = 'craft-btn';
            craftBtn.textContent = 'Craft';
            craftBtn.disabled = !canCraft;
            craftBtn.onclick = () => craftItem(recipe);
            recipeDiv.appendChild(craftBtn);

            recipesContainer.appendChild(recipeDiv);
        });
    }

    /**
     * Craft an item from a recipe.
     */
    function craftItem(recipe) {
        if (GameState.resourceCounts.berries < recipe.cost.berries ||
            GameState.resourceCounts.nuts < recipe.cost.nuts ||
            GameState.resourceCounts.mushrooms < recipe.cost.mushrooms) {
            return;
        }

        GameState.resourceCounts.berries -= recipe.cost.berries;
        GameState.resourceCounts.nuts -= recipe.cost.nuts;
        GameState.resourceCounts.mushrooms -= recipe.cost.mushrooms;

        recipe.effect();

        UI.updateUI();
        renderCraftMenu();
    }

    // Public API
    return {
        createResource: createResource,
        spawnResource: spawnResource,
        updateResources: updateResources,
        collectResource: collectResource,
        toggleCraftMenu: toggleCraftMenu,
        renderCraftMenu: renderCraftMenu,
        craftItem: craftItem,
        useStoredResource: useStoredResource
    };
})();
