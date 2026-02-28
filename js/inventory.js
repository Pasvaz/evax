/**
 * ============================================================================
 * INVENTORY & BESTIARY MODULE
 * ============================================================================
 *
 * Handles the inventory screen (I key) with two tabs:
 * - Inventory: Shows special items the player has (saddle, etc.)
 * - Bestiary: Shows all animals with detailed information
 *
 * ============================================================================
 */

window.Inventory = (function() {
    'use strict';

    // Drag-and-drop state
    var dragItem = null;         // The item being dragged
    var dragGhost = null;        // Ghost DOM element following cursor
    var dragSourceSlot = null;   // The inventory slot element being dragged from
    var isDragging = false;      // Whether a drag is in progress

    // Bestiary model viewer state
    let bestiaryScene = null;
    let bestiaryCamera = null;
    let bestiaryRenderer = null;
    let bestiaryModel = null;
    let bestiaryAnimationId = null;
    let currentAnimal = null;
    let currentVariant = null;
    let currentAnimation = 'idle';
    let animationPhase = 0;

    /**
     * Initialize the inventory system.
     */
    function init() {
        // Tab switching
        const tabs = document.querySelectorAll('.inventory-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        });

        // Back button in bestiary detail
        document.getElementById('bestiary-back-btn').addEventListener('click', showBestiaryGrid);

        // Populate bestiary grid
        populateBestiaryGrid();
    }

    /**
     * Toggle the inventory screen.
     */
    function toggle() {
        const screen = document.getElementById('inventory-screen');
        if (screen.classList.contains('hidden')) {
            open();
        } else {
            close();
        }
    }

    /**
     * Open the inventory screen.
     */
    function open() {
        const screen = document.getElementById('inventory-screen');
        screen.classList.remove('hidden');
        GameState.isInventoryOpen = true;

        // Refresh inventory contents
        refreshInventory();

        // Show bestiary grid (not detail view)
        showBestiaryGrid();
    }

    /**
     * Close the inventory screen.
     */
    function close() {
        const screen = document.getElementById('inventory-screen');
        screen.classList.add('hidden');
        GameState.isInventoryOpen = false;

        // Cancel any in-progress drag
        cleanupDrag();

        // Clean up bestiary viewer
        cleanupBestiaryViewer();
    }

    /**
     * Switch between inventory, artifacts, and bestiary tabs.
     * @param {string} tabId - 'inventory', 'artifacts', or 'bestiary'
     */
    function switchTab(tabId) {
        // Update tab buttons
        document.querySelectorAll('.inventory-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });

        // Update panels
        document.getElementById('inventory-panel').classList.toggle('active', tabId === 'inventory');
        document.getElementById('artifacts-panel').classList.toggle('active', tabId === 'artifacts');
        document.getElementById('bestiary-panel').classList.toggle('active', tabId === 'bestiary');
        document.getElementById('quest-panel').classList.toggle('active', tabId === 'quest');
        document.getElementById('bestiary-detail').classList.remove('active');

        // Refresh content
        if (tabId === 'inventory') {
            refreshInventory();
        } else if (tabId === 'artifacts') {
            refreshArtifacts();
        } else if (tabId === 'quest') {
            refreshQuestLog();
        } else {
            showBestiaryGrid();
        }
    }

    /**
     * Get the icon for an item based on its ID.
     * @param {string} itemId - The item ID
     * @returns {string} - The emoji icon
     */
    // Items that can be equipped to the hotbar
    const EQUIPPABLE_ITEMS = ['wood_sword', 'wood_axe', 'barbanit_axe', 'manglecacia_axe', 'seaspray_birch_axe', 'manglecacia_sword', 'seaspray_birch_sword', 'arsen_bomb'];

    function isEquippable(itemId) {
        return EQUIPPABLE_ITEMS.includes(itemId);
    }

    function getItemIcon(itemId) {
        const icons = {
            health_potion: '🧪',
            energy_boost: '⚡',
            super_heal: '💖',
            fortune_charm: '🍀',
            survival_kit: '🎒',
            gazella_saddle: '🪑',
            wood_sword: '🗡️',
            wood_axe: '🪓',
            barbanit_axe: '🪓',
            manglecacia_axe: '🪓',
            seaspray_birch_axe: '🪓',
            manglecacia_sword: '🗡️',
            seaspray_birch_sword: '🗡️',
            arsen_bomb: '💣'
        };
        return icons[itemId] || '📦';
    }

    /**
     * Refresh the inventory grid with current items.
     * Shows all crafted items from GameState.inventoryItems.
     */
    function refreshInventory() {
        const grid = document.getElementById('inventory-grid');
        const emptyMsg = document.getElementById('inventory-empty');
        grid.innerHTML = '';

        // Get items from GameState.inventoryItems
        const items = GameState.inventoryItems || [];

        if (items.length === 0) {
            emptyMsg.classList.remove('hidden');
            // Still show empty slots
            for (let i = 0; i < 32; i++) {
                const slot = document.createElement('div');
                slot.className = 'inventory-slot';
                grid.appendChild(slot);
            }
        } else {
            emptyMsg.classList.add('hidden');

            // Add items to grid
            items.forEach(item => {
                const slot = document.createElement('div');
                slot.className = 'inventory-slot has-item';

                const icon = getItemIcon(item.id);
                slot.innerHTML = `
                    <span class="inventory-slot-icon">${icon}</span>
                    <span class="inventory-slot-name">${item.name}</span>
                    ${item.count > 1 ? `<span class="inventory-slot-count">${item.count}</span>` : ''}
                `;
                if (isEquippable(item.id)) {
                    slot.title = `${item.description}\n\nDrag to a hotbar slot, or click to equip!`;

                    // Mousedown: detect click vs drag
                    slot.addEventListener('mousedown', function(e) {
                        if (e.button !== 0) return; // Left click only
                        e.stopPropagation(); // Prevent camera orbit

                        var startX = e.clientX;
                        var startY = e.clientY;
                        var dragStarted = false;
                        var thisSlot = slot;
                        var thisItem = item;

                        function onMouseMove(moveEvent) {
                            var dx = moveEvent.clientX - startX;
                            var dy = moveEvent.clientY - startY;

                            // Start drag after 5px movement
                            if (!dragStarted && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
                                dragStarted = true;
                                startDrag(thisItem, thisSlot, moveEvent);
                            }
                            if (dragStarted) {
                                moveDrag(moveEvent);
                            }
                        }

                        function onMouseUp(upEvent) {
                            if (dragStarted) {
                                endDrag(upEvent);
                            } else {
                                // Was a click — equip to selected slot (old behavior)
                                equipToHotbar(thisItem);
                            }
                            window.removeEventListener('mousemove', onMouseMove);
                            window.removeEventListener('mouseup', onMouseUp);
                        }

                        window.addEventListener('mousemove', onMouseMove);
                        window.addEventListener('mouseup', onMouseUp);
                    });
                } else {
                    slot.title = `${item.description}\n\nClick to use!`;
                    slot.addEventListener('click', () => useItem(item));
                }
                slot.style.cursor = 'pointer';

                grid.appendChild(slot);
            });

            // Fill remaining slots
            for (let i = items.length; i < 32; i++) {
                const slot = document.createElement('div');
                slot.className = 'inventory-slot';
                grid.appendChild(slot);
            }
        }
    }

    /**
     * Use an inventory item.
     * Executes the item's effect and removes it from inventory.
     * @param {Object} item - The item to use
     */
    function useItem(item) {
        if (!item || item.count <= 0) return;

        // Special case: saddle doesn't get "used" - it's permanent equipment
        if (item.id === 'gazella_saddle') {
            // Equip the saddle (permanent)
            if (!GameState.hasSaddle) {
                GameState.hasSaddle = true;
                Game.playSound('collect');
                console.log('Saddle equipped! Press E near a Saltas Gazella to ride.');
                // Remove from inventory (it's now "equipped")
                removeItemFromInventory(item.id);
            } else {
                console.log('Saddle already equipped!');
            }
            refreshInventory();
            UI.updateUI();
            return;
        }

        // Execute the item's effect
        const success = Effects.execute(item.effect);

        if (success) {
            // Remove one from inventory
            removeItemFromInventory(item.id);
            Game.playSound('collect');
        }

        refreshInventory();
        UI.updateUI();
    }

    /**
     * Remove one item from inventory.
     * @param {string} itemId - The item ID to remove
     */
    function removeItemFromInventory(itemId) {
        const itemIndex = GameState.inventoryItems.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return;

        const item = GameState.inventoryItems[itemIndex];
        item.count--;

        if (item.count <= 0) {
            GameState.inventoryItems.splice(itemIndex, 1);
        }
    }

    // ========================================================================
    // DRAG AND DROP — Drag items from inventory to hotbar slots
    // ========================================================================

    /**
     * Start dragging an item from inventory.
     * Creates a ghost element and highlights hotbar slots.
     */
    function startDrag(item, slotElement, event) {
        if (!isEquippable(item.id)) return;

        isDragging = true;
        dragItem = item;
        dragSourceSlot = slotElement;

        // Dim the source slot
        slotElement.classList.add('dragging');

        // Create ghost element that follows cursor
        dragGhost = document.createElement('div');
        dragGhost.className = 'drag-ghost';
        dragGhost.textContent = getItemIcon(item.id);
        document.body.appendChild(dragGhost);
        dragGhost.style.left = event.clientX + 'px';
        dragGhost.style.top = event.clientY + 'px';

        // Highlight all hotbar slots as valid drop targets
        document.querySelectorAll('.hotbar-slot').forEach(function(slot) {
            slot.classList.add('drag-over');
        });

        event.preventDefault();
    }

    /**
     * Move the ghost element to follow the cursor.
     */
    function moveDrag(event) {
        if (!isDragging || !dragGhost) return;
        dragGhost.style.left = event.clientX + 'px';
        dragGhost.style.top = event.clientY + 'px';
    }

    /**
     * End a drag — check if cursor is over a hotbar slot and equip there.
     */
    function endDrag(event) {
        if (!isDragging) return;

        var targetSlotIndex = getHotbarSlotAtPosition(event.clientX, event.clientY);

        if (targetSlotIndex !== null && dragItem) {
            equipToHotbar(dragItem, targetSlotIndex);
        }
        // If dropped outside hotbar, item stays in inventory

        cleanupDrag();
    }

    /**
     * Find which hotbar slot (0-8) the mouse is over, using bounding rects.
     * Returns null if the mouse isn't over any hotbar slot.
     */
    function getHotbarSlotAtPosition(x, y) {
        var slots = document.querySelectorAll('.hotbar-slot');
        for (var i = 0; i < slots.length; i++) {
            var rect = slots[i].getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                return parseInt(slots[i].dataset.slot);
            }
        }
        return null;
    }

    /**
     * Clean up all drag state — remove ghost, highlights, reset variables.
     */
    function cleanupDrag() {
        if (dragGhost && dragGhost.parentNode) {
            dragGhost.parentNode.removeChild(dragGhost);
        }
        if (dragSourceSlot) {
            dragSourceSlot.classList.remove('dragging');
        }
        document.querySelectorAll('.hotbar-slot').forEach(function(slot) {
            slot.classList.remove('drag-over');
        });
        dragItem = null;
        dragGhost = null;
        dragSourceSlot = null;
        isDragging = false;
    }

    /**
     * Equip an item to the currently selected hotbar slot.
     * Moves item from inventory to hotbar.
     */
    function equipToHotbar(item, targetSlot) {
        if (!item || item.count <= 0) return;

        const slot = (targetSlot !== undefined) ? targetSlot : GameState.selectedHotbarSlot;

        // If something is already in this slot, put it back in inventory
        const existing = GameState.hotbarSlots[slot];
        if (existing) {
            addItemToInventory(existing.id, existing.name, existing.description, existing.effect, existing.count);
        }

        // Put the item in the hotbar slot
        GameState.hotbarSlots[slot] = {
            id: item.id,
            name: item.name,
            description: item.description,
            effect: item.effect,
            count: item.count
        };

        // Remove ALL of this item from inventory (moved to hotbar)
        const itemIndex = GameState.inventoryItems.findIndex(i => i.id === item.id);
        if (itemIndex !== -1) {
            GameState.inventoryItems.splice(itemIndex, 1);
        }

        Game.playSound('collect');
        refreshInventory();
        UI.updateHotbar();
    }

    /**
     * Add an item to inventory (used when unequipping from hotbar).
     */
    function addItemToInventory(id, name, description, effect, count) {
        const existing = GameState.inventoryItems.find(i => i.id === id);
        if (existing) {
            existing.count += count;
        } else {
            GameState.inventoryItems.push({ id: id, name: name, description: description, effect: effect, count: count });
        }
    }

    /**
     * Populate the bestiary grid with animal cards.
     */
    function populateBestiaryGrid() {
        const grid = document.getElementById('bestiary-grid');
        grid.innerHTML = '';

        BESTIARY.forEach(animal => {
            const card = document.createElement('div');
            card.className = 'bestiary-card';
            card.innerHTML = `
                <div class="bestiary-card-preview" id="preview-${animal.id}">
                    <span style="font-size: 48px;">${animal.icon}</span>
                </div>
                <div class="bestiary-card-name">${animal.name}</div>
                <div class="bestiary-card-type">${animal.type}</div>
            `;
            card.addEventListener('click', () => showAnimalDetail(animal.id));
            grid.appendChild(card);
        });
    }

    /**
     * Show the bestiary grid (hide detail view).
     */
    function showBestiaryGrid() {
        document.getElementById('bestiary-panel').classList.add('active');
        document.getElementById('bestiary-detail').classList.remove('active');
        cleanupBestiaryViewer();
    }

    /**
     * Show detailed view for an animal.
     * @param {string} animalId - The animal ID
     */
    function showAnimalDetail(animalId) {
        const animal = getBestiaryData(animalId);
        if (!animal) return;

        currentAnimal = animal;
        currentVariant = animal.variants[0];
        currentAnimation = 'idle';

        // Hide grid, show detail
        document.getElementById('bestiary-panel').classList.remove('active');
        document.getElementById('bestiary-detail').classList.add('active');

        // Update header
        document.getElementById('bestiary-detail-name').textContent = animal.name;

        // Build info sections
        const infoDiv = document.getElementById('bestiary-detail-info');
        infoDiv.innerHTML = `
            <div class="bestiary-section">
                <h3>Overview</h3>
                <p>${animal.description}</p>
            </div>
            <div class="bestiary-section">
                <h3>Behavior</h3>
                <p>${animal.behavior}</p>
            </div>
            <div class="bestiary-section">
                <h3>Habitat</h3>
                <p>${animal.habitat}</p>
            </div>
            <div class="bestiary-section">
                <h3>Stats</h3>
                <div class="bestiary-stats">
                    <div class="bestiary-stat">
                        <span class="bestiary-stat-label">Health</span>
                        <span class="bestiary-stat-value">${animal.stats.health}</span>
                    </div>
                    <div class="bestiary-stat">
                        <span class="bestiary-stat-label">Speed</span>
                        <span class="bestiary-stat-value">${animal.stats.speed}</span>
                    </div>
                    <div class="bestiary-stat">
                        <span class="bestiary-stat-label">Damage</span>
                        <span class="bestiary-stat-value">${animal.stats.damage}</span>
                    </div>
                    <div class="bestiary-stat">
                        <span class="bestiary-stat-label">Diet</span>
                        <span class="bestiary-stat-value">${animal.stats.diet}</span>
                    </div>
                </div>
            </div>
            ${animal.special ? `
            <div class="bestiary-section">
                <h3>Special</h3>
                <p>${animal.special.rideable ? 'This animal can be ridden with a ' + animal.special.saddleCost + ' saddle!' : ''}</p>
                ${animal.special.babyColors ? `<p>Baby colors: ${animal.special.babyColors}</p>` : ''}
            </div>
            ` : ''}
            <div class="bestiary-section">
                <h3>Tips</h3>
                <p>${animal.tips}</p>
            </div>
        `;

        // Build variant buttons
        const variantDiv = document.getElementById('bestiary-variant-btns');
        variantDiv.innerHTML = '';
        animal.variants.forEach((variant, idx) => {
            const btn = document.createElement('button');
            btn.className = 'variant-btn' + (idx === 0 ? ' active' : '');
            btn.textContent = variant.name;
            btn.addEventListener('click', () => selectVariant(variant, btn));
            variantDiv.appendChild(btn);
        });

        // Build animation buttons
        const animDiv = document.getElementById('bestiary-anim-btns');
        animDiv.innerHTML = '';
        animal.animations.forEach((anim, idx) => {
            const btn = document.createElement('button');
            btn.className = 'anim-btn' + (idx === 0 ? ' active' : '');
            btn.textContent = anim.charAt(0).toUpperCase() + anim.slice(1);
            btn.addEventListener('click', () => selectAnimation(anim, btn));
            animDiv.appendChild(btn);
        });

        // Setup model viewer
        setupBestiaryViewer(animal, animal.variants[0]);
    }

    /**
     * Select a variant to display.
     * @param {Object} variant - The variant data
     * @param {HTMLElement} btn - The clicked button
     */
    function selectVariant(variant, btn) {
        currentVariant = variant;

        // Update button states
        document.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Rebuild model
        if (currentAnimal) {
            buildBestiaryModel(currentAnimal, variant);
        }
    }

    /**
     * Select an animation to play.
     * @param {string} anim - The animation name
     * @param {HTMLElement} btn - The clicked button
     */
    function selectAnimation(anim, btn) {
        currentAnimation = anim;
        animationPhase = 0;

        // Update button states
        document.querySelectorAll('.anim-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    /**
     * Setup the bestiary 3D viewer.
     * @param {Object} animal - The animal data
     * @param {Object} variant - The variant to display
     */
    function setupBestiaryViewer(animal, variant) {
        const container = document.getElementById('bestiary-model-viewer');
        container.innerHTML = '';

        // Create scene
        bestiaryScene = new THREE.Scene();
        bestiaryScene.background = new THREE.Color(0x1a1510);

        // Create camera
        bestiaryCamera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
        bestiaryCamera.position.set(3, 2, 3);
        bestiaryCamera.lookAt(0, 0.5, 0);

        // Create renderer
        bestiaryRenderer = new THREE.WebGLRenderer({ antialias: true });
        bestiaryRenderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(bestiaryRenderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        bestiaryScene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        bestiaryScene.add(directionalLight);

        // Ground plane
        const groundGeo = new THREE.PlaneGeometry(10, 10);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x2a2520 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.01;
        bestiaryScene.add(ground);

        // Build the model
        buildBestiaryModel(animal, variant);

        // Start animation loop
        animateBestiaryViewer();
    }

    /**
     * Build a 3D model for the bestiary viewer.
     * @param {Object} animal - The animal data
     * @param {Object} variant - The variant to display
     */
    function buildBestiaryModel(animal, variant) {
        // Remove existing model
        if (bestiaryModel) {
            bestiaryScene.remove(bestiaryModel);
        }

        // Create a simple placeholder model based on animal type
        // In a full implementation, this would use the actual model builders
        bestiaryModel = new THREE.Group();

        // Try to use actual model builder if available
        const modelBuilder = Enemies.modelBuilders ? Enemies.modelBuilders[animal.id] : null;

        if (modelBuilder && animal.id !== 'peccary') {
            // Get enemy data for colors based on animal type and variant
            let enemyData = findEnemyDataForVariant(animal, variant);

            if (enemyData && enemyData.colors) {
                try {
                    const isPregnant = variant.isPregnant || false;
                    const isBaby = variant.isBaby || false;
                    let model = null;

                    // Different model builders have different signatures
                    switch (animal.id) {
                        case 'saltas_gazella': {
                            const hasHorns = !isBaby && enemyData.hasHorns !== false;
                            const babyGender = isBaby ? variant.gender : null;
                            model = modelBuilder(enemyData.colors, hasHorns, isPregnant, isBaby, babyGender);
                            break;
                        }
                        case 'antelope': {
                            const hasHorns = !isBaby && enemyData.hasHorns !== false;
                            const hornScale = variant.isLeader ? 1.5 : 1;
                            model = modelBuilder(enemyData.colors, hasHorns, hornScale, isPregnant);
                            break;
                        }
                        case 'wild_dog': {
                            const isAlpha = variant.isAlpha || false;
                            model = modelBuilder(enemyData.colors, isAlpha, isPregnant);
                            break;
                        }
                        case 'grass_viper': {
                            model = modelBuilder(enemyData.colors, isPregnant);
                            break;
                        }
                        case 'dronglous_cat':
                        case 'drongulinat_cat': {
                            model = modelBuilder(enemyData.colors, isBaby);
                            break;
                        }
                        case 'snow_caninon': {
                            const isLeader = variant.id === 'leader';
                            model = modelBuilder(enemyData.colors, isBaby, isLeader, isPregnant);
                            break;
                        }
                        case 'baluban_oxen': {
                            const hasHorns = enemyData.hasHorns !== false;
                            const hornScale = variant.id === 'leader' ? 1.5 : (enemyData.hornSize || 1);
                            model = modelBuilder(enemyData.colors, hasHorns, hornScale, isBaby, isPregnant);
                            break;
                        }
                        case 'deericus_iricus': {
                            const hasHorns = !isBaby && enemyData.hasHorns !== false;
                            model = modelBuilder(enemyData.colors, hasHorns, isBaby);
                            break;
                        }
                        default: {
                            // Simple model builders: badger, weasel, goose, fox, leopard_toad
                            model = modelBuilder(enemyData.colors);
                            break;
                        }
                    }

                    if (model) {
                        // Scale babies to be smaller — but only for builders
                        // that DON'T handle baby size internally
                        // Builders with internal baby scaling: saltas_gazella, dronglous_cat, deericus_iricus
                        const builderHandlesBabySize = ['saltas_gazella', 'dronglous_cat', 'drongulinat_cat', 'deericus_iricus', 'snow_caninon', 'baluban_oxen'];
                        if (isBaby && !builderHandlesBabySize.includes(animal.id)) {
                            model.scale.set(0.5, 0.5, 0.5);
                        }
                        bestiaryModel.add(model);
                    } else {
                        createPlaceholderModel(animal);
                    }
                } catch (e) {
                    console.log('Could not build model for', animal.id, e);
                    createPlaceholderModel(animal);
                }
            } else {
                createPlaceholderModel(animal);
            }
        } else {
            createPlaceholderModel(animal);
        }

        // Scale for viewing
        const scaleFactor = animal.id === 'peccary' ? 0.8 : 0.6;
        bestiaryModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

        bestiaryScene.add(bestiaryModel);
    }

    /**
     * Find the correct ENEMIES data for a given animal and variant.
     * Handles different ID patterns (with/without gender suffixes).
     * @param {Object} animal - The bestiary animal data
     * @param {Object} variant - The variant to display
     * @returns {Object|null} - The ENEMIES entry or null
     */
    function findEnemyDataForVariant(animal, variant) {
        const animalId = animal.id;
        const gender = variant.gender;
        const isAlpha = variant.isAlpha;
        const isBaby = variant.isBaby;

        // Special case: wild dog alpha
        if (animalId === 'wild_dog' && isAlpha) {
            return ENEMIES.find(e => e.id === 'wild_dog_alpha');
        }

        // Special case: leopard toad baby - they are magenta (genderless until adulthood)
        if (animalId === 'leopard_toad' && isBaby) {
            // Return a fake enemy data with magenta baby colors
            const femaleData = ENEMIES.find(e => e.id === 'leopard_toad_female');
            return {
                ...femaleData,
                colors: {
                    body: 0xFF00FF,       // Magenta
                    spots: 0xCC00CC,      // Darker magenta spots
                    belly: 0xFFAAFF,      // Light magenta belly
                    eyes: 0x1a1a1a,
                    eyeBulge: 0xFF55FF,   // Light magenta eye bulge
                    mouth: 0xFF66FF
                }
            };
        }

        // Animals with gender suffixes in their IDs
        const genderedAnimals = ['leopard_toad', 'grass_viper', 'antelope', 'wild_dog', 'saltas_gazella', 'dronglous_cat', 'drongulinat_cat', 'snow_caninon', 'baluban_oxen'];

        if (genderedAnimals.includes(animalId)) {
            // For babies, use the parent gender's colors (or male if unspecified)
            const genderSuffix = gender ? '_' + gender : '_male';

            // Try gendered ID first
            let enemyData = ENEMIES.find(e => e.id === animalId + genderSuffix);

            // Fallback to just the type
            if (!enemyData) {
                enemyData = ENEMIES.find(e => e.type === animalId);
            }

            return enemyData;
        }

        // Animals without gender suffixes (badger, weasel, goose, fox)
        // These just use the animal.id directly
        let enemyData = ENEMIES.find(e => e.id === animalId);
        if (!enemyData) {
            enemyData = ENEMIES.find(e => e.type === animalId);
        }
        return enemyData;
    }

    /**
     * Create a simple placeholder model.
     * @param {Object} animal - The animal data
     */
    function createPlaceholderModel(animal) {
        // Simple colored box as placeholder
        const colors = {
            peccary: 0x4a4a4a,
            goose: 0xffffff,
            badger: 0x333333,
            weasel: 0x8b4513,
            fox: 0xd35400,
            leopard_toad: 0x228b22,
            grass_viper: 0x556b2f,
            antelope: 0x8b4513,
            wild_dog: 0xb8860b,
            saltas_gazella: 0x1a1a1a
        };

        const color = colors[animal.id] || 0x888888;
        const geometry = new THREE.CapsuleGeometry(0.3, 0.6, 8, 16);
        const material = new THREE.MeshStandardMaterial({ color: color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.5;
        mesh.rotation.z = Math.PI / 2;
        bestiaryModel.add(mesh);

        // Head
        const headGeo = new THREE.SphereGeometry(0.2, 12, 8);
        const head = new THREE.Mesh(headGeo, material);
        head.position.set(0.5, 0.6, 0);
        bestiaryModel.add(head);
    }

    /**
     * Animate the bestiary viewer.
     */
    function animateBestiaryViewer() {
        if (!bestiaryRenderer) return;

        bestiaryAnimationId = requestAnimationFrame(animateBestiaryViewer);

        // Slowly rotate the model
        if (bestiaryModel) {
            bestiaryModel.rotation.y += 0.005;

            // Apply animation based on current selection
            animationPhase += 0.05;
            applyBestiaryAnimation();
        }

        bestiaryRenderer.render(bestiaryScene, bestiaryCamera);
    }

    /**
     * Apply animation to the bestiary model.
     * Handles both articulated models (with userData.legs) and simple models.
     */
    function applyBestiaryAnimation() {
        if (!bestiaryModel || !bestiaryModel.children[0]) return;

        const model = bestiaryModel.children[0];
        const legs = model.userData && model.userData.legs ? model.userData.legs : null;
        const parts = model.userData && model.userData.parts ? model.userData.parts : null;
        const hasArticulatedLegs = legs && legs.length > 0;

        // For simple models, we animate the whole model
        switch (currentAnimation) {
            case 'idle':
                // Gentle breathing for all models
                if (parts && parts.bodyGroup) {
                    parts.bodyGroup.scale.y = 1 + Math.sin(animationPhase * 0.5) * 0.02;
                } else {
                    // Simple models: subtle body sway
                    model.scale.y = 1 + Math.sin(animationPhase * 0.5) * 0.01;
                }
                // Reset legs
                if (hasArticulatedLegs) {
                    legs.forEach(leg => {
                        leg.group.rotation.z *= 0.9;
                        if (leg.lowerLegGroup) leg.lowerLegGroup.rotation.z *= 0.9;
                    });
                }
                bestiaryModel.position.y = 0;
                break;

            case 'walk':
                if (hasArticulatedLegs) {
                    legs.forEach((leg, idx) => {
                        const phase = idx % 2 === 0 ? animationPhase : animationPhase + Math.PI;
                        leg.group.rotation.z = Math.sin(phase) * 0.4;
                        if (leg.lowerLegGroup) {
                            const bend = Math.sin(phase) > 0 ? -Math.sin(phase) * 0.5 : Math.sin(phase) * 0.15;
                            leg.lowerLegGroup.rotation.z = bend;
                        }
                    });
                } else {
                    // Simple models: bob up and down
                    bestiaryModel.position.y = Math.abs(Math.sin(animationPhase * 2)) * 0.05;
                    model.rotation.z = Math.sin(animationPhase * 2) * 0.05;
                }
                break;

            case 'run':
            case 'sprint':
            case 'flee':
                if (hasArticulatedLegs) {
                    const speedMult = currentAnimation === 'flee' ? 3 : 2;
                    legs.forEach((leg, idx) => {
                        const phase = idx % 2 === 0 ? animationPhase * speedMult : animationPhase * speedMult + Math.PI;
                        leg.group.rotation.z = Math.sin(phase) * (currentAnimation === 'flee' ? 1.0 : 0.8);
                        if (leg.lowerLegGroup) {
                            const bend = Math.sin(phase) > 0 ? -Math.sin(phase) * 0.9 : Math.sin(phase) * 0.2;
                            leg.lowerLegGroup.rotation.z = bend;
                        }
                    });
                }
                // Bounce for all models
                bestiaryModel.position.y = Math.abs(Math.sin(animationPhase * 2.5)) * 0.12;
                break;

            case 'graze':
                // Lower head/neck
                if (parts && parts.neckGroup) {
                    parts.neckGroup.rotation.z = 0.5 + Math.sin(animationPhase * 0.3) * 0.1;
                } else {
                    // Simple models: tilt forward
                    model.rotation.z = 0.2 + Math.sin(animationPhase * 0.3) * 0.05;
                }
                bestiaryModel.position.y = 0;
                break;

            case 'hop':
                // Toad/frog hopping animation
                const hopPhase = Math.sin(animationPhase * 1.5);
                bestiaryModel.position.y = Math.max(0, hopPhase) * 0.25;
                model.rotation.z = hopPhase * 0.15;
                break;

            case 'croak':
                // Toad croaking - throat expansion
                model.scale.x = 1 + Math.sin(animationPhase * 3) * 0.1;
                model.scale.z = 1 + Math.sin(animationPhase * 3) * 0.1;
                bestiaryModel.position.y = 0;
                break;

            case 'slither':
                // Snake-like slithering
                model.rotation.y = Math.sin(animationPhase * 2) * 0.3;
                model.position.x = Math.sin(animationPhase * 2) * 0.1;
                bestiaryModel.position.y = 0;
                break;

            case 'creep':
                // Slow stalking movement
                bestiaryModel.position.y = Math.sin(animationPhase * 0.5) * 0.02;
                model.rotation.z = Math.sin(animationPhase * 0.8) * 0.03;
                break;

            case 'strike':
                // Quick striking motion
                const strikePhase = Math.sin(animationPhase * 4);
                model.position.x = strikePhase > 0 ? strikePhase * 0.3 : 0;
                model.rotation.z = strikePhase > 0 ? -strikePhase * 0.2 : 0;
                break;

            case 'hold':
                // Holding prey - slight movement
                model.scale.y = 1 + Math.sin(animationPhase * 2) * 0.03;
                bestiaryModel.position.y = 0;
                break;

            case 'swim':
                // Swimming motion
                model.rotation.z = Math.sin(animationPhase * 1.5) * 0.1;
                model.position.y = Math.sin(animationPhase * 1.2) * 0.05;
                bestiaryModel.position.y = 0;
                break;

            case 'angry':
                // Aggressive stance - shaking
                model.rotation.z = Math.sin(animationPhase * 8) * 0.08;
                model.scale.y = 1.05 + Math.sin(animationPhase * 4) * 0.03;
                bestiaryModel.position.y = 0;
                break;

            case 'attack':
                // Attack animation - lunge forward
                const attackPhase = Math.sin(animationPhase * 3);
                model.position.x = attackPhase > 0 ? attackPhase * 0.2 : 0;
                model.rotation.z = attackPhase > 0 ? -0.15 : 0;
                bestiaryModel.position.y = 0;
                break;

            case 'hunt':
                // Hunting stance - crouched and moving
                if (hasArticulatedLegs) {
                    legs.forEach((leg, idx) => {
                        const phase = idx % 2 === 0 ? animationPhase * 1.5 : animationPhase * 1.5 + Math.PI;
                        leg.group.rotation.z = Math.sin(phase) * 0.5;
                        if (leg.lowerLegGroup) leg.lowerLegGroup.rotation.z = -0.2;
                    });
                }
                model.scale.y = 0.95; // Slightly crouched
                bestiaryModel.position.y = Math.sin(animationPhase * 1.5) * 0.03;
                break;

            case 'rest':
                // Resting - lying down effect
                model.scale.y = 0.7;
                model.position.y = -0.15;
                bestiaryModel.position.y = 0;
                break;

            case 'howl':
                // Howling - head up, body straight
                if (parts && parts.neckGroup) {
                    parts.neckGroup.rotation.z = -0.3 + Math.sin(animationPhase * 2) * 0.05;
                }
                model.scale.y = 1.05;
                bestiaryModel.position.y = 0;
                break;

            case 'jump':
                // Jumping animation
                const jumpPhase = Math.sin(animationPhase * 2);
                bestiaryModel.position.y = Math.max(0, jumpPhase) * 0.4;
                if (hasArticulatedLegs) {
                    legs.forEach(leg => {
                        leg.group.rotation.z = jumpPhase > 0 ? -0.5 : 0.3;
                        if (leg.lowerLegGroup) leg.lowerLegGroup.rotation.z = jumpPhase > 0 ? 0.4 : -0.2;
                    });
                }
                break;

            default:
                // Reset all transforms
                bestiaryModel.position.y = 0;
                model.position.x = 0;
                model.position.y = 0;
                model.rotation.z = 0;
                model.scale.set(1, 1, 1);
                break;
        }
    }

    /**
     * Cleanup the bestiary viewer.
     */
    function cleanupBestiaryViewer() {
        if (bestiaryAnimationId) {
            cancelAnimationFrame(bestiaryAnimationId);
            bestiaryAnimationId = null;
        }

        if (bestiaryRenderer) {
            bestiaryRenderer.dispose();
            bestiaryRenderer = null;
        }

        bestiaryScene = null;
        bestiaryCamera = null;
        bestiaryModel = null;
    }

    // ========================================================================
    // ARTIFACTS SYSTEM
    // ========================================================================

    /**
     * Refresh the artifacts grid with current artifacts.
     */
    function refreshArtifacts() {
        const grid = document.getElementById('artifacts-grid');
        const emptyMsg = document.getElementById('artifacts-empty');
        const countSpan = document.getElementById('artifact-slot-count');
        grid.innerHTML = '';

        const artifacts = GameState.artifacts || [];
        countSpan.textContent = artifacts.length;

        if (artifacts.length === 0) {
            emptyMsg.classList.remove('hidden');
        } else {
            emptyMsg.classList.add('hidden');
        }

        // Create 8 slots (max capacity)
        for (let i = 0; i < 8; i++) {
            const slot = document.createElement('div');
            slot.className = 'artifact-slot';

            if (i < artifacts.length) {
                const artifactId = artifacts[i];
                const artifactData = getArtifactData(artifactId);

                if (artifactData) {
                    slot.classList.add('has-artifact');
                    slot.classList.add('rarity-' + artifactData.rarity);
                    slot.innerHTML = `
                        <span class="artifact-slot-icon">${artifactData.icon}</span>
                        <span class="artifact-slot-name">${artifactData.name}</span>
                        <span class="artifact-slot-rarity ${artifactData.rarity}">${artifactData.rarity}</span>
                    `;
                    slot.title = artifactData.description + '\n\nVisit Ningle at the Research Hut to learn more!';
                    slot.addEventListener('click', () => showArtifactDetail(artifactData));
                }
            } else {
                // Empty slot
                slot.innerHTML = `<span class="artifact-slot-empty">Empty</span>`;
            }

            grid.appendChild(slot);
        }
    }

    /**
     * Show artifact detail popup.
     * @param {Object} artifact - The artifact data
     */
    function showArtifactDetail(artifact) {
        // For now, just show a simple alert with the description
        // Later this could be a fancy modal
        alert(artifact.name + '\n\n' + artifact.description + '\n\nRarity: ' + artifact.rarity.toUpperCase() + '\n\nGive this to Ningle at the Research Hut in the savannah to learn its secrets!');
    }

    /**
     * Add an artifact to the player's collection.
     * @param {string} artifactId - The artifact ID
     * @returns {boolean} - True if added successfully, false if inventory full
     */
    function addArtifact(artifactId) {
        if (!GameState.artifacts) {
            GameState.artifacts = [];
        }

        // Check if already have this artifact
        if (GameState.artifacts.includes(artifactId)) {
            console.log('You already have this artifact!');
            return false;
        }

        // Check if inventory is full (8 slots)
        if (GameState.artifacts.length >= 8) {
            console.log('Artifact inventory is full! Give some to Ningle first.');
            return false;
        }

        GameState.artifacts.push(artifactId);
        Game.playSound('collect');

        const artifactData = getArtifactData(artifactId);
        if (artifactData) {
            console.log('Found artifact: ' + artifactData.name + '!');
        }

        return true;
    }

    /**
     * Remove an artifact from the player's collection.
     * @param {string} artifactId - The artifact ID
     * @returns {boolean} - True if removed successfully
     */
    function removeArtifact(artifactId) {
        if (!GameState.artifacts) return false;

        const index = GameState.artifacts.indexOf(artifactId);
        if (index === -1) return false;

        GameState.artifacts.splice(index, 1);

        // Track that this artifact has been given away
        if (!GameState.artifactsGiven) {
            GameState.artifactsGiven = [];
        }
        if (!GameState.artifactsGiven.includes(artifactId)) {
            GameState.artifactsGiven.push(artifactId);
        }

        return true;
    }

    /**
     * Check if player has a specific artifact.
     * @param {string} artifactId - The artifact ID
     * @returns {boolean}
     */
    function hasArtifact(artifactId) {
        return GameState.artifacts && GameState.artifacts.includes(artifactId);
    }

    /**
     * Refresh the quest log panel showing Pedro's cookie recipe quest.
     */
    function refreshQuestLog() {
        var container = document.getElementById('quest-log');
        if (!container) return;

        var clues = GameState.questClues || [];
        var clueCount = clues.length;

        // The chain of clues in order
        var questSteps = [
            {
                id: 'granny_trotter',
                name: 'Granny Trotter',
                requiredScore: 25,
                clueText: '"You need flour and sugar as a base. Ask Farmer Rosie about the fresh ingredients!"',
                ingredient: 'Flour & Sugar'
            },
            {
                id: 'rosie',
                name: 'Farmer Rosie',
                requiredScore: 50,
                clueText: '"Any good cookie needs fresh butter and eggs! But the secret spice... ask Bruno."',
                ingredient: 'Fresh Butter & Eggs'
            },
            {
                id: 'bruno',
                name: 'Bruno the Blacksmith',
                requiredScore: 100,
                clueText: '"Cinnamon was my grandmother\'s secret. Real cinnamon! Patches the merchant might know more."',
                ingredient: 'Real Cinnamon'
            },
            {
                id: 'patches',
                name: 'Patches the Merchant',
                requiredScore: 200,
                clueText: '"The legendary World\'s Best Cookie... only Elder Hamsworth knows the full truth."',
                ingredient: null
            },
            {
                id: 'elder_hamsworth',
                name: 'Elder Hamsworth',
                requiredScore: 500,
                clueText: '"The recipe is revealed! But it needs sea salt from the coast and a moonberry from lands yet undiscovered..."',
                ingredient: 'Sea Salt & Moonberry'
            }
        ];

        var html = '<div class="quest-title">The World\'s Best Cookie</div>';
        html += '<div class="quest-subtitle">Pedro got lost searching for the legendary cookie recipe. Talk to the villagers to piece it together!</div>';

        // Show each step
        for (var i = 0; i < questSteps.length; i++) {
            var step = questSteps[i];
            var found = clues.includes(step.id);
            var scoreMet = GameState.score >= step.requiredScore || GameState.isTestingMode;
            var locked = !scoreMet && !found;

            var clueClass = found ? 'quest-clue discovered' : (locked ? 'quest-clue locked' : 'quest-clue');
            var statusClass, statusText;
            if (found) {
                statusClass = 'quest-clue-status found';
                statusText = 'Discovered';
            } else if (locked) {
                statusClass = 'quest-clue-status locked-status';
                statusText = 'Need ' + step.requiredScore + ' score';
            } else {
                statusClass = 'quest-clue-status not-found';
                statusText = 'Not yet asked';
            }

            html += '<div class="' + clueClass + '">';
            html += '<div class="quest-clue-header">';
            html += '<span class="quest-clue-name">' + (i + 1) + '. ' + step.name + '</span>';
            html += '<span class="' + statusClass + '">' + statusText + '</span>';
            html += '</div>';
            if (found) {
                html += '<div class="quest-clue-text">' + step.clueText + '</div>';
            } else if (!locked) {
                html += '<div class="quest-clue-text" style="color:#888;">Ask about the cookie recipe...</div>';
            } else {
                html += '<div class="quest-clue-text" style="color:#555;">???</div>';
            }
            html += '</div>';
        }

        // Ingredient checklist
        html += '<div class="quest-ingredient-list">';
        html += '<h3>Recipe Ingredients (' + getFoundIngredientCount(clues) + '/6)</h3>';
        var ingredients = [
            { name: 'Flour', clue: 'granny_trotter' },
            { name: 'Sugar', clue: 'granny_trotter' },
            { name: 'Fresh Butter', clue: 'rosie' },
            { name: 'Eggs (not goose!)', clue: 'rosie' },
            { name: 'Real Cinnamon', clue: 'bruno' },
            { name: 'Sea Salt from the Coast', clue: 'elder_hamsworth' },
            { name: 'Moonberry (undiscovered lands)', clue: 'elder_hamsworth' }
        ];
        for (var j = 0; j < ingredients.length; j++) {
            var ing = ingredients[j];
            var ingFound = clues.includes(ing.clue);
            html += '<div class="quest-ingredient ' + (ingFound ? 'found' : '') + '">';
            html += (ingFound ? '[ x ] ' : '[ _ ] ') + (ingFound ? ing.name : '???');
            html += '</div>';
        }
        html += '</div>';

        container.innerHTML = html;
    }

    function getFoundIngredientCount(clues) {
        var count = 0;
        if (clues.includes('granny_trotter')) count += 2; // flour + sugar
        if (clues.includes('rosie')) count += 2; // butter + eggs
        if (clues.includes('bruno')) count += 1; // cinnamon
        if (clues.includes('elder_hamsworth')) count += 2; // sea salt + moonberry
        return count;
    }

    // Public API
    return {
        init: init,
        toggle: toggle,
        open: open,
        close: close,
        refreshInventory: refreshInventory,
        refreshArtifacts: refreshArtifacts,
        refreshQuestLog: refreshQuestLog,
        addArtifact: addArtifact,
        removeArtifact: removeArtifact,
        hasArtifact: hasArtifact,
        equipToHotbar: equipToHotbar,
        addItemToInventory: addItemToInventory,
        isEquippable: isEquippable
    };
})();
