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
        let hungerAmount = 0;

        // Get healing amounts from config (or use defaults if not set)
        const foodHealing = CONFIG.FOOD_HEALING || { berries: 5, nuts: 8, mushrooms: 12 };
        // Hunger restoration amounts (food fills your belly!)
        const foodHunger = CONFIG.FOOD_HUNGER || { berries: 10, nuts: 15, mushrooms: 20, seaweed: 12, eggs: 25 };

        switch(type) {
            case 'berry':
                if (GameState.resourceCounts.berries > 0) {
                    GameState.resourceCounts.berries--;
                    hasResource = true;
                    healAmount = foodHealing.berries;
                    hungerAmount = foodHunger.berries;
                }
                break;
            case 'nut':
                if (GameState.resourceCounts.nuts > 0) {
                    GameState.resourceCounts.nuts--;
                    hasResource = true;
                    healAmount = foodHealing.nuts;
                    hungerAmount = foodHunger.nuts;
                }
                break;
            case 'mushroom':
                if (GameState.resourceCounts.mushrooms > 0) {
                    GameState.resourceCounts.mushrooms--;
                    hasResource = true;
                    healAmount = foodHealing.mushrooms;
                    hungerAmount = foodHunger.mushrooms;
                }
                break;
            case 'seaweed':
                if (GameState.resourceCounts.seaweed > 0) {
                    GameState.resourceCounts.seaweed--;
                    hasResource = true;
                    healAmount = foodHealing.seaweed;
                    hungerAmount = foodHunger.seaweed;
                }
                break;
            case 'egg':
                if (GameState.resourceCounts.eggs > 0) {
                    GameState.resourceCounts.eggs--;
                    hasResource = true;
                    healAmount = foodHealing.eggs;
                    hungerAmount = foodHunger.eggs;
                }
                break;
        }

        if (hasResource) {
            // Restore health if not full
            if (GameState.health < 100) {
                GameState.health = Math.min(100, GameState.health + healAmount);
            }
            // Always restore hunger when eating
            GameState.hunger = Math.min(100, GameState.hunger + hungerAmount);

            // Schedule a poop in 2 minutes!
            GameState.poopQueue.push({
                time: GameState.timeElapsed + 120  // 2 minutes from now
            });

            Game.playSound('collect');
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

            case 'seaweed':
                // Green seaweed that grows on riverbanks
                color = 0x2e8b57; // Sea green
                healAmount = 20;
                value = 25;
                const seaweedMat = new THREE.MeshStandardMaterial({
                    color: color,
                    side: THREE.DoubleSide
                });
                // Create wavy seaweed strands
                for (let i = 0; i < 4; i++) {
                    const strandGeo = new THREE.PlaneGeometry(0.15, 0.6 + Math.random() * 0.3);
                    const strand = new THREE.Mesh(strandGeo, seaweedMat);
                    strand.position.set(
                        (Math.random() - 0.5) * 0.3,
                        0.3,
                        (Math.random() - 0.5) * 0.3
                    );
                    strand.rotation.y = Math.random() * Math.PI;
                    strand.rotation.x = (Math.random() - 0.5) * 0.3;
                    resource.add(strand);
                }
                // Add some bubbles for effect
                const bubbleMat = new THREE.MeshStandardMaterial({
                    color: 0xaaffff,
                    transparent: true,
                    opacity: 0.6
                });
                for (let i = 0; i < 3; i++) {
                    const bubble = new THREE.Mesh(
                        new THREE.SphereGeometry(0.05, 8, 8),
                        bubbleMat
                    );
                    bubble.position.set(
                        (Math.random() - 0.5) * 0.3,
                        0.4 + Math.random() * 0.3,
                        (Math.random() - 0.5) * 0.3
                    );
                    resource.add(bubble);
                }
                break;

            case 'egg':
                // Beige goose egg with brown speckles
                color = 0xf5f5dc; // Beige
                healAmount = 40;
                value = 60;
                // Create egg body (oval sphere)
                const eggBody = new THREE.Mesh(
                    new THREE.SphereGeometry(0.25, 16, 16),
                    new THREE.MeshStandardMaterial({ color: color })
                );
                eggBody.scale.set(1, 1.3, 1);
                eggBody.position.y = 0.3;
                resource.add(eggBody);
                // Add brown speckles around the egg
                const speckleMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
                for (let i = 0; i < 8; i++) {
                    const speckle = new THREE.Mesh(
                        new THREE.SphereGeometry(0.03, 8, 8),
                        speckleMat
                    );
                    const angle = (i / 8) * Math.PI * 2;
                    const height = (Math.random() - 0.5) * 0.4;
                    speckle.position.set(
                        Math.cos(angle) * 0.22,
                        0.3 + height,
                        Math.sin(angle) * 0.22
                    );
                    resource.add(speckle);
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
        if (type === 'seaweed') {
            // Seaweed spawns on riverbanks - position is set by spawnResource
            rx = 0;
            rz = 0;
        } else {
            do {
                rx = (Math.random() - 0.5) * CONFIG.WORLD_SIZE;
                rz = (Math.random() - 0.5) * CONFIG.WORLD_SIZE;
            } while (Math.sqrt(rx * rx + rz * rz) < 10);
        }

        resource.position.set(rx, 0, rz);

        return resource;
    }

    /**
     * Find a random position on the riverbank.
     */
    function findRiverbankPosition() {
        // Try to find a valid riverbank position
        for (let attempts = 0; attempts < 50; attempts++) {
            const rx = (Math.random() - 0.5) * CONFIG.WORLD_SIZE;
            const rz = (Math.random() - 0.5) * CONFIG.WORLD_SIZE;
            if (Environment.isOnRiverbank(rx, rz) && !Environment.isInVillage(rx, rz)) {
                return { x: rx, z: rz };
            }
        }
        return null;
    }

    /**
     * Spawn a new resource.
     */
    function spawnResource() {
        if (GameState.resources.length >= CONFIG.MAX_RESOURCES) return;

        // 20% chance to spawn seaweed on riverbank
        if (Math.random() < 0.2) {
            const pos = findRiverbankPosition();
            if (pos) {
                const resource = createResource('seaweed');
                resource.position.set(pos.x, 0, pos.z);
                GameState.resources.push(resource);
                GameState.scene.add(resource);
                return;
            }
        }

        // Otherwise spawn regular resources
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
        } else if (type === 'seaweed') {
            GameState.resourceCounts.seaweed++;
            GameState.pigCoins += CONFIG.RESOURCE_PRICES.seaweed;
        } else if (type === 'egg') {
            GameState.resourceCounts.eggs++;
            GameState.pigCoins += CONFIG.RESOURCE_PRICES.eggs;

            // Check if this egg came from a nest and trigger parent goose defense
            if (resource.userData.nestId && GameState.nests) {
                const nest = GameState.nests.find(n => n.id === resource.userData.nestId);
                if (nest && nest.ownerId) {
                    // Find the parent goose
                    const parentGoose = GameState.enemies.find(e => e.userData.entityId === nest.ownerId);
                    if (parentGoose && parentGoose.userData.id === 'goose') {
                        // Make goose hostile and chase player
                        parentGoose.userData.lifecycleState = 'defending';
                        parentGoose.userData.chasingPlayer = true;
                        parentGoose.userData.friendly = false;
                        if (!GameState.chasingGeese) GameState.chasingGeese = [];
                        if (!GameState.chasingGeese.includes(parentGoose)) {
                            GameState.chasingGeese.push(parentGoose);
                        }
                    }
                }
            }
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
                GameState.resourceCounts.berries >= (recipe.cost.berries || 0) &&
                GameState.resourceCounts.nuts >= (recipe.cost.nuts || 0) &&
                GameState.resourceCounts.mushrooms >= (recipe.cost.mushrooms || 0) &&
                GameState.resourceCounts.seaweed >= (recipe.cost.seaweed || 0);

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

            if (recipe.cost.seaweed > 0) {
                const seaweedCost = document.createElement('div');
                seaweedCost.className = 'craft-cost-item';
                if (GameState.resourceCounts.seaweed < recipe.cost.seaweed) {
                    seaweedCost.classList.add('insufficient');
                }
                seaweedCost.innerHTML = `<span>🌿</span><span>${recipe.cost.seaweed}</span>`;
                costDiv.appendChild(seaweedCost);
            }

            recipeDiv.appendChild(costDiv);

            const craftBtn = document.createElement('button');
            craftBtn.className = 'craft-btn';
            craftBtn.textContent = 'Craft (to Inventory)';
            craftBtn.disabled = !canCraft;
            craftBtn.onclick = () => craftItem(recipe);
            recipeDiv.appendChild(craftBtn);

            recipesContainer.appendChild(recipeDiv);
        });
    }

    /**
     * Craft an item from a recipe.
     * Items go into inventory - use them from there!
     */
    function craftItem(recipe) {
        if (GameState.resourceCounts.berries < (recipe.cost.berries || 0) ||
            GameState.resourceCounts.nuts < (recipe.cost.nuts || 0) ||
            GameState.resourceCounts.mushrooms < (recipe.cost.mushrooms || 0) ||
            GameState.resourceCounts.seaweed < (recipe.cost.seaweed || 0)) {
            return;
        }

        GameState.resourceCounts.berries -= (recipe.cost.berries || 0);
        GameState.resourceCounts.nuts -= (recipe.cost.nuts || 0);
        GameState.resourceCounts.mushrooms -= (recipe.cost.mushrooms || 0);
        GameState.resourceCounts.seaweed -= (recipe.cost.seaweed || 0);

        // Add to inventory instead of using immediately
        recipe.craft();

        UI.updateUI();
        renderCraftMenu();
    }

    // ========================================================================
    // ARTIFACT SPAWNING SYSTEM
    // ========================================================================

    // Track spawned artifacts in the world
    let artifactsInWorld = [];

    /**
     * Create an artifact pickup object.
     * @param {string} artifactId - The artifact ID
     * @returns {THREE.Group} - The artifact mesh
     */
    function createArtifact(artifactId) {
        const artifactData = getArtifactData(artifactId);
        if (!artifactData) return null;

        const group = new THREE.Group();

        // Create a glowing orb to hold the artifact
        const orbGeometry = new THREE.SphereGeometry(0.4, 16, 16);

        // Color based on rarity
        const rarityColors = {
            common: 0x888888,
            uncommon: 0x44aa99,
            rare: 0x7777ff,
            legendary: 0xffaa00
        };
        const color = rarityColors[artifactData.rarity] || 0x888888;

        const orbMaterial = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.6
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        group.add(orb);

        // Inner glow
        const innerGeometry = new THREE.SphereGeometry(0.25, 12, 12);
        const innerMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        const inner = new THREE.Mesh(innerGeometry, innerMaterial);
        group.add(inner);

        // Point light for glow effect
        const light = new THREE.PointLight(color, 1, 5);
        light.position.set(0, 0, 0);
        group.add(light);

        group.userData = {
            type: 'artifact',
            artifactId: artifactId,
            radius: 1.0,
            bobOffset: Math.random() * Math.PI * 2,
            pulseOffset: Math.random() * Math.PI * 2
        };

        return group;
    }

    /**
     * Spawn a random artifact in the world.
     * Only spawns artifacts the player hasn't already collected or given away.
     * @param {string} spawnType - 'random', 'hidden', or 'event'
     */
    function spawnArtifact(spawnType) {
        spawnType = spawnType || 'random';

        // Get artifacts that can spawn
        const available = getArtifactsForBiome(GameState.currentBiome, spawnType).filter(a => {
            // Don't spawn if player already has it
            if (GameState.artifacts && GameState.artifacts.includes(a.id)) return false;
            // Don't spawn if already given away
            if (GameState.artifactsGiven && GameState.artifactsGiven.includes(a.id)) return false;
            // Don't spawn if already in world
            if (artifactsInWorld.find(aw => aw.userData.artifactId === a.id)) return false;
            return true;
        });

        if (available.length === 0) return null;

        // Weight by rarity (common more likely than rare)
        const weights = { common: 50, uncommon: 30, rare: 15, legendary: 5 };
        let totalWeight = 0;
        const weighted = available.map(a => {
            const w = weights[a.rarity] || 10;
            totalWeight += w;
            return { artifact: a, weight: totalWeight };
        });

        const roll = Math.random() * totalWeight;
        const selected = weighted.find(w => roll <= w.weight);
        if (!selected) return null;

        const artifact = createArtifact(selected.artifact.id);
        if (!artifact) return null;

        // Position based on spawn type
        if (spawnType === 'hidden') {
            // Hidden artifacts spawn in corners or edges of the map
            const edge = Math.random() < 0.5 ? -1 : 1;
            const x = (Math.random() * 20 + 30) * edge;
            const z = (Math.random() * 20 + 30) * (Math.random() < 0.5 ? -1 : 1);
            artifact.position.set(x, 0.5, z);
        } else {
            // Random spawn anywhere
            const range = CONFIG.WORLD_SIZE * 0.6;
            const x = (Math.random() - 0.5) * 2 * range;
            const z = (Math.random() - 0.5) * 2 * range;
            artifact.position.set(x, 0.5, z);
        }

        artifactsInWorld.push(artifact);
        GameState.scene.add(artifact);

        console.log('An artifact appeared: ' + selected.artifact.name);
        return artifact;
    }

    /**
     * Update artifacts - animations and collection.
     */
    function updateArtifacts(delta) {
        const time = GameState.clock ? GameState.clock.elapsedTime : 0;

        for (let i = artifactsInWorld.length - 1; i >= 0; i--) {
            const artifact = artifactsInWorld[i];

            // Floating bob animation
            artifact.position.y = 0.5 + Math.sin(time * 2 + artifact.userData.bobOffset) * 0.15;

            // Rotation
            artifact.rotation.y += delta * 0.8;

            // Pulsing glow
            const pulse = 0.4 + Math.sin(time * 3 + artifact.userData.pulseOffset) * 0.2;
            if (artifact.children[0] && artifact.children[0].material) {
                artifact.children[0].material.emissiveIntensity = pulse;
            }
            if (artifact.children[2] && artifact.children[2].intensity !== undefined) {
                artifact.children[2].intensity = pulse * 2;
            }

            // Collection check
            const distance = GameState.peccary.position.distanceTo(artifact.position);
            if (distance < artifact.userData.radius + GameState.peccary.userData.radius) {
                // Try to add to inventory
                if (Inventory.addArtifact(artifact.userData.artifactId)) {
                    GameState.scene.remove(artifact);
                    artifactsInWorld.splice(i, 1);
                }
            }
        }
    }

    /**
     * Clear all artifacts from the world (used on biome transition).
     */
    function clearArtifacts() {
        artifactsInWorld.forEach(a => GameState.scene.remove(a));
        artifactsInWorld = [];
    }

    /**
     * Get artifacts currently in the world.
     */
    function getArtifactsInWorld() {
        return artifactsInWorld;
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
        useStoredResource: useStoredResource,
        // Artifact system
        createArtifact: createArtifact,
        spawnArtifact: spawnArtifact,
        updateArtifacts: updateArtifacts,
        clearArtifacts: clearArtifacts,
        getArtifactsInWorld: getArtifactsInWorld
    };
})();
