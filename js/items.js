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
            case 'arsenic_mushroom':
                if (GameState.resourceCounts.arsenic_mushrooms > 0) {
                    GameState.resourceCounts.arsenic_mushrooms--;
                    hasResource = true;
                    healAmount = -10; // TOXIC: damages player! (special case, not in CONFIG)
                    hungerAmount = -10; // Makes you feel sick (special case)
                }
                break;
        }

        if (hasResource) {
            // Check if this is a toxic resource
            if (healAmount < 0) {
                // Toxic! Damage the player
                GameState.health = Math.max(0, GameState.health + healAmount);
                GameState.hunger = Math.max(0, GameState.hunger + hungerAmount);
                Game.showBlockedMessage('That was poisonous! 🍄💀');
                Game.playSound('hurt');
                UI.updateUI();
                return true;
            }

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
        let color;

        // Look up score and healing from CONFIG instead of hardcoding
        const resourceScores = CONFIG.RESOURCE_SCORES || {};
        const scoreKey = type === 'berry' ? 'berries' : type === 'nut' ? 'nuts' : type === 'mushroom' ? 'mushrooms' : type === 'arsenic_mushroom' ? 'arsenic_mushrooms' : type === 'egg' ? 'eggs' : type;
        let value = resourceScores[scoreKey] || 0;
        let healAmount = (CONFIG.FOOD_HEALING || {})[scoreKey] || 0;

        switch(type) {
            case 'berry':
                color = 0x4169e1;
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

            case 'arsenic_mushroom':
                // Toxic black mushroom with orange spots — savannah only!
                color = 0x1a1a1a; // Nearly black
                healAmount = -10; // TOXIC: damages player (override CONFIG)
                const arsenicStem = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.08, 0.1, 0.25, 8),
                    new THREE.MeshStandardMaterial({ color: 0x2a2a2a })
                );
                arsenicStem.position.y = 0.12;
                resource.add(arsenicStem);
                const arsenicCap = new THREE.Mesh(
                    new THREE.SphereGeometry(0.22, 16, 16),
                    new THREE.MeshStandardMaterial({ color: color })
                );
                arsenicCap.scale.y = 0.5;
                arsenicCap.position.y = 0.3;
                resource.add(arsenicCap);
                // Orange warning spots
                const orangeSpotMat = new THREE.MeshStandardMaterial({ color: 0xff6600 });
                for (let i = 0; i < 6; i++) {
                    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), orangeSpotMat);
                    const angle = (i / 6) * Math.PI * 2;
                    spot.position.set(
                        Math.cos(angle) * 0.13,
                        0.35,
                        Math.sin(angle) * 0.13
                    );
                    resource.add(spot);
                }
                break;

            case 'egg':
                // Beige goose egg with brown speckles
                color = 0xf5f5dc; // Beige
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
                // In coastal biome, don't spawn in the ocean (south of sand end)
                var biome = getBiomeData(GameState.currentBiome);
                var inOcean = biome && biome.waterFeature === 'ocean' && rz > (biome.sandEndZ || 200);
            } while (Math.sqrt(rx * rx + rz * rz) < 10 || inOcean);
        }

        resource.position.set(rx, 0, rz);

        return resource;
    }

    /**
     * Create a decorated Easter egg mesh (colourful painted egg).
     * Used instead of a normal egg when the Easter event is active.
     */
    function createEasterEgg() {
        var eggGroup = new THREE.Group();

        // Base egg body — bright pastel colour (random from palette)
        var eggColors = [0xff69b4, 0x87ceeb, 0x98fb98, 0xffd700, 0xdda0dd, 0xff6347];
        var baseColor = eggColors[Math.floor(Math.random() * eggColors.length)];

        var eggBody = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 16, 16),
            new THREE.MeshStandardMaterial({ color: baseColor })
        );
        eggBody.scale.set(1, 1.3, 1);
        eggBody.position.y = 0.3;
        eggGroup.add(eggBody);

        // Painted stripes — 3 horizontal rings of contrasting colour
        var stripeColors = [0xffffff, 0xff4500, 0x4169e1, 0x32cd32, 0xff1493];
        var stripeColor = stripeColors[Math.floor(Math.random() * stripeColors.length)];
        var stripeMat = new THREE.MeshStandardMaterial({ color: stripeColor });

        for (var s = 0; s < 3; s++) {
            var stripe = new THREE.Mesh(
                new THREE.TorusGeometry(0.22, 0.02, 8, 24),
                stripeMat
            );
            stripe.position.y = 0.2 + s * 0.15;
            stripe.rotation.x = Math.PI / 2;
            eggGroup.add(stripe);
        }

        // Colourful dots scattered around
        var dotColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
        for (var d = 0; d < 6; d++) {
            var dot = new THREE.Mesh(
                new THREE.SphereGeometry(0.035, 8, 8),
                new THREE.MeshStandardMaterial({ color: dotColors[d % dotColors.length] })
            );
            var angle = (d / 6) * Math.PI * 2;
            var height = 0.15 + Math.random() * 0.3;
            dot.position.set(
                Math.cos(angle) * 0.21,
                height + 0.15,
                Math.sin(angle) * 0.21
            );
            eggGroup.add(dot);
        }

        eggGroup.userData = {
            type: 'egg',
            isEasterEgg: true,
            value: 5,
            healAmount: 10,
            radius: 0.5,
            bobOffset: Math.random() * Math.PI * 2
        };

        return eggGroup;
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

        // 5% chance to spawn arsenic mushroom in savannah only
        if (GameState.currentBiome === 'savannah' && Math.random() < 0.05) {
            const resource = createResource('arsenic_mushroom');
            GameState.resources.push(resource);
            GameState.scene.add(resource);
            return;
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
    // Shared sparkle pool — reusable tiny meshes for resource shimmer
    var _sparklePool = [];
    var _sparklePoolSize = 20;
    var _sparkleInited = false;

    function initSparklePool() {
        if (_sparkleInited) return;
        _sparkleInited = true;
        var geo = new THREE.SphereGeometry(0.06, 4, 4);
        var mat = new THREE.MeshBasicMaterial({
            color: 0xffffcc,
            transparent: true,
            depthWrite: false
        });
        for (var s = 0; s < _sparklePoolSize; s++) {
            var spark = new THREE.Mesh(geo, mat.clone());
            spark.visible = false;
            spark.userData.life = 0;
            spark.userData.maxLife = 0;
            spark.userData.vel = new THREE.Vector3();
            GameState.scene.add(spark);
            _sparklePool.push(spark);
        }
    }

    function spawnSparkle(worldPos) {
        // Find a free sparkle
        for (var s = 0; s < _sparklePool.length; s++) {
            if (!_sparklePool[s].visible) {
                var spark = _sparklePool[s];
                spark.position.set(
                    worldPos.x + (Math.random() - 0.5) * 0.8,
                    worldPos.y + Math.random() * 0.5,
                    worldPos.z + (Math.random() - 0.5) * 0.8
                );
                spark.userData.vel.set(
                    (Math.random() - 0.5) * 0.3,
                    0.5 + Math.random() * 0.5,
                    (Math.random() - 0.5) * 0.3
                );
                spark.userData.life = 0;
                spark.userData.maxLife = 0.6 + Math.random() * 0.4;
                spark.material.opacity = 1;
                spark.visible = true;
                return;
            }
        }
    }

    function updateResources(delta) {
        initSparklePool();

        var time = GameState.clock.elapsedTime;

        for (let i = GameState.resources.length - 1; i >= 0; i--) {
            const resource = GameState.resources[i];

            resource.position.y = 0.5 + Math.sin(time * 2 + resource.userData.bobOffset) * 0.25;
            resource.rotation.y += delta * 0.5;

            var dist = GameState.peccary.position.distanceTo(resource.position);
            if (dist < 60) {
                // More sparkles when far (30-60) to help spot them, normal rate when close (<30)
                var sparkleRate = dist > 30 ? delta * 3 : delta * 1.5;
                if (Math.random() < sparkleRate) {
                    spawnSparkle(resource.position);
                }
            }

            if (dist < resource.userData.radius + GameState.peccary.userData.radius) {
                collectResource(resource);
                GameState.scene.remove(resource);
                GameState.resources.splice(i, 1);
            }
        }

        // Update active sparkles
        for (var s = 0; s < _sparklePool.length; s++) {
            var spark = _sparklePool[s];
            if (!spark.visible) continue;
            spark.userData.life += delta;
            if (spark.userData.life >= spark.userData.maxLife) {
                spark.visible = false;
                continue;
            }
            // Float upward and fade out
            spark.position.x += spark.userData.vel.x * delta;
            spark.position.y += spark.userData.vel.y * delta;
            spark.position.z += spark.userData.vel.z * delta;
            spark.userData.vel.y -= delta * 0.5; // Gentle gravity
            var progress = spark.userData.life / spark.userData.maxLife;
            spark.material.opacity = 1 - progress;
            spark.scale.setScalar(1 - progress * 0.5);
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
        } else if (type === 'nut') {
            GameState.resourceCounts.nuts++;
        } else if (type === 'mushroom') {
            GameState.resourceCounts.mushrooms++;
        } else if (type === 'seaweed') {
            GameState.resourceCounts.seaweed++;
        } else if (type === 'arsenic_mushroom') {
            GameState.resourceCounts.arsenic_mushrooms++;
        } else if (type === 'egg') {
            GameState.resourceCounts.eggs++;

            // Track Easter egg collection for quest progress
            if (resource.userData.isEasterEgg && GameState.easterQuest && GameState.easterQuest.goal.type === 'collect_easter_eggs') {
                GameState.easterQuestEggsCollected++;
                if (GameState.easterQuestEggsCollected >= GameState.easterQuest.goal.count) {
                    UI.showToast('Quest Ready!', 'Return to Marshmallow to claim your reward!');
                }
            }

            // Check if this egg came from a nest and trigger nest owner defense
            if (resource.userData.nestId && GameState.nests) {
                const nest = GameState.nests.find(n => n.id === resource.userData.nestId);
                if (nest && nest.ownerId) {
                    // Find the nest owner (any nest-defending animal)
                    const nestOwner = GameState.enemies.find(e => e.userData.entityId === nest.ownerId);
                    if (nestOwner && nestOwner.userData.defendsNest) {
                        // Make nest owner hostile and chase player
                        nestOwner.userData.lifecycleState = 'defending';
                        nestOwner.userData.chasingPlayer = true;
                        nestOwner.userData.friendly = false;
                        if (!GameState.chasingGeese) GameState.chasingGeese = [];
                        if (!GameState.chasingGeese.includes(nestOwner)) {
                            GameState.chasingGeese.push(nestOwner);
                        }
                    }
                }
            }
        }

        // PIGLET LUCKY DROPS — 25% chance to double the resource
        if (GameState.pigletBuffs && GameState.pigletBuffs.luckyDrops && Math.random() < 0.25) {
            if (type === 'berry') GameState.resourceCounts.berries++;
            else if (type === 'nut') GameState.resourceCounts.nuts++;
            else if (type === 'mushroom') GameState.resourceCounts.mushrooms++;
            else if (type === 'seaweed') GameState.resourceCounts.seaweed++;
            else if (type === 'arsenic_mushroom') GameState.resourceCounts.arsenic_mushrooms++;
            else if (type === 'egg') GameState.resourceCounts.eggs++;
            UI.showToast('Lucky!', 'Clover found a bonus ' + type + '!');
        }

        // Flamingo score boost (2x when mounted on Gold or Blood flamingo)
        if (GameState.mountedFlamingo && GameState.mountedFlamingo.userData &&
            GameState.mountedFlamingo.userData.abilities &&
            GameState.mountedFlamingo.userData.abilities.indexOf('score_boost') !== -1) {
            value *= 2;
        }

        GameState.score += value;

        // First-time resource discovery notification
        if (!GameState.discoveredResources) GameState.discoveredResources = [];
        if (GameState.discoveredResources.indexOf(type) === -1) {
            GameState.discoveredResources.push(type);
            // Use plural resource key to look up display name from RESOURCE_META
            var pluralKey = type === 'berry' ? 'berries' : type === 'nut' ? 'nuts' : type === 'mushroom' ? 'mushrooms' : type === 'egg' ? 'eggs' : type === 'arsenic_mushroom' ? 'arsenic_mushrooms' : type;
            var meta = UI.RESOURCE_META[pluralKey];
            var displayName = meta ? meta.name : type;
            if (meta && meta.icon) displayName = meta.icon + " " + displayName
            UI.showToast('New Resource Found!', 'You discovered ' + displayName + '!','Press <b>I</b> to open your inventory.');
        }

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

            // Check if recipe is locked by score requirement
            var isLocked = recipe.requiredScore && GameState.score < recipe.requiredScore && !GameState.isTestingMode;

            // Generic affordability check — works for ALL resource types!
            let canCraft = !isLocked;
            if (!isLocked) {
                for (const resource in recipe.cost) {
                    if (recipe.cost[resource] > 0 && (GameState.resourceCounts[resource] || 0) < recipe.cost[resource]) {
                        canCraft = false;
                        break;
                    }
                }
            }

            if (!canCraft) {
                recipeDiv.classList.add('disabled');
            }
            if (isLocked) {
                recipeDiv.classList.add('locked');
            }

            const nameDiv = document.createElement('div');
            nameDiv.className = 'craft-recipe-name';
            nameDiv.textContent = recipe.name;
            if (isLocked) {
                nameDiv.innerHTML += ' <span style="color:#aa6633;font-size:12px;">🔒 ' + recipe.requiredScore + ' score</span>';
            }
            recipeDiv.appendChild(nameDiv);

            const descDiv = document.createElement('div');
            descDiv.className = 'craft-recipe-desc';
            descDiv.textContent = isLocked ? 'Reach ' + recipe.requiredScore + ' score to unlock this recipe!' : recipe.description;
            recipeDiv.appendChild(descDiv);

            const costDiv = document.createElement('div');
            costDiv.className = 'craft-recipe-cost';

            // Generic cost display — emoji lookup table for all resources
            const resourceIcons = {
                berries: '🫐',
                nuts: '🥜',
                mushrooms: '🍄',
                seaweed: '🌿',
                eggs: '🥚',
                thous_pine_wood: '🪵',
                glass: '🔮',
                manglecacia_wood: '🪵',
                seaspray_birch_wood: '🪵',
                cinnamon: '🌾',
                hide: '🦊',
                bakka_seal_tooth: '🦷'
            };

            for (const resource in recipe.cost) {
                if (recipe.cost[resource] > 0) {
                    const costEl = document.createElement('div');
                    costEl.className = 'craft-cost-item';
                    if ((GameState.resourceCounts[resource] || 0) < recipe.cost[resource]) {
                        costEl.classList.add('insufficient');
                    }
                    // Special case: arsenic mushrooms use SVG icon
                    if (resource === 'arsenic_mushrooms') {
                        costEl.innerHTML = `<span class="arsenic-icon"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><ellipse cx="12" cy="10" rx="9" ry="6" fill="#1a1a1a"/><rect x="10" y="14" width="4" height="7" rx="1" fill="#2a2a2a"/><circle cx="7" cy="9" r="1.5" fill="#ff6600"/><circle cx="12" cy="7" r="1.5" fill="#ff6600"/><circle cx="17" cy="9" r="1.5" fill="#ff6600"/><circle cx="9" cy="12" r="1.2" fill="#ff6600"/><circle cx="15" cy="12" r="1.2" fill="#ff6600"/></svg></span><span>${recipe.cost[resource]}</span>`;
                    } else {
                        const icon = resourceIcons[resource] || '❓';
                        costEl.innerHTML = `<span>${icon}</span><span>${recipe.cost[resource]}</span>`;
                    }
                    costDiv.appendChild(costEl);
                }
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
        // Generic affordability check — works for ALL resource types
        for (const resource in recipe.cost) {
            if ((GameState.resourceCounts[resource] || 0) < (recipe.cost[resource] || 0)) {
                return;
            }
        }

        // Generic resource deduction — works for ALL resource types
        for (const resource in recipe.cost) {
            if (recipe.cost[resource]) {
                GameState.resourceCounts[resource] -= recipe.cost[resource];
            }
        }

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
            epic: 0xaa44ff,
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
     * Track an externally-created artifact for collection and animation.
     * Used when placing artifacts at fixed locations (e.g. Snow Temple plinth).
     */
    function trackArtifact(artifact) {
        if (artifact && !artifactsInWorld.includes(artifact)) {
            artifactsInWorld.push(artifact);
        }
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
        createEasterEgg: createEasterEgg,
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
        getArtifactsInWorld: getArtifactsInWorld,
        trackArtifact: trackArtifact
    };
})();
