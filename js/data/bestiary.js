/**
 * ============================================================================
 * BESTIARY DATA FILE
 * ============================================================================
 *
 * This file contains all the information about animals in the game.
 * Each animal has descriptions, stats, behaviors, and variant info.
 *
 * ⚠️  REMINDER: When adding a new animal, update ALL 5 files:
 *    1. js/data/enemies.js - stats/colors
 *    2. js/enemies.js - 3D model + registration
 *    3. THIS FILE - encyclopedia entry
 *    4. index.html - test spawn buttons
 *    5. js/enemies.js - lifecycle mapping
 *
 * ============================================================================
 */

window.BESTIARY = [
    // ========================================================================
    // PECCARY (Player)
    // ========================================================================
    {
        id: 'peccary',
        name: 'Collared Peccary',
        type: 'Player Character',
        icon: '🐗',
        biome: 'Arboreal Forest',
        variants: [
            { id: 'default', name: 'Adult', gender: null }
        ],
        animations: ['idle', 'walk', 'run', 'jump'],
        stats: {
            health: 100,
            speed: 'Medium',
            damage: 'None',
            diet: 'Omnivore'
        },
        description: 'You play as a collared peccary, a pig-like mammal native to the Americas. With your distinctive white collar marking, you must survive in the dangerous forest by collecting food and avoiding predators.',
        behavior: 'Peccaries are social animals that travel in herds. They use their strong snouts to dig for roots and tubers. When threatened, they can be surprisingly fierce defenders.',
        habitat: 'Found in forests and scrublands throughout Central and South America. They prefer areas with dense vegetation for cover.',
        tips: 'Collect berries, nuts, and mushrooms to restore health and increase your score. Avoid badgers and weasels - they are dangerous predators!'
    },

    // ========================================================================
    // GOOSE (Friendly Guardian)
    // ========================================================================
    {
        id: 'goose',
        name: 'River Goose',
        type: 'Friendly Guardian',
        icon: '🦢',
        biome: 'Arboreal Forest',
        variants: [
            { id: 'male', name: 'Male', gender: 'male' },
            { id: 'female', name: 'Female', gender: 'female' },
            { id: 'baby', name: 'Baby', gender: null, isBaby: true }
        ],
        animations: ['idle', 'walk', 'swim', 'angry'],
        stats: {
            health: 20,
            speed: 'Slow',
            damage: '5 per hit',
            diet: 'Herbivore'
        },
        description: 'River geese are protective guardians that live along the riverbanks. They are friendly to peccaries but will fiercely defend their nests from egg thieves.',
        behavior: 'Geese build nests near the river and lay eggs. If a fox steals their egg or you get too close to a nest with an egg, the parent goose will chase you! They are also hostile to foxes and will attack them on sight.',
        habitat: 'Found along the river in the Arboreal Forest biome. They swim in the river and nest on the banks.',
        tips: 'Geese are your friends! They will attack predators near the river. But be careful around their nests - stealing an egg will make them very angry!'
    },

    // ========================================================================
    // BADGER (Predator)
    // ========================================================================
    {
        id: 'badger',
        name: 'Forest Badger',
        type: 'Predator',
        icon: '🦡',
        biome: 'Arboreal Forest',
        variants: [
            { id: 'default', name: 'Adult', gender: null }
        ],
        animations: ['idle', 'walk', 'attack'],
        stats: {
            health: 30,
            speed: 'Medium',
            damage: '8 per second',
            diet: 'Carnivore'
        },
        description: 'Forest badgers are aggressive predators that roam the Arboreal Forest. With their powerful claws and fierce temperament, they pose a serious threat to peccaries.',
        behavior: 'Badgers actively hunt peccaries and will chase them when spotted. They are persistent predators that will follow you for a considerable distance.',
        habitat: 'Found throughout the Arboreal Forest, especially in areas away from the river and village.',
        tips: 'Run away from badgers! They deal significant damage. The village is a safe zone where they cannot follow.'
    },

    // ========================================================================
    // WEASEL (Predator)
    // ========================================================================
    {
        id: 'weasel',
        name: 'Forest Weasel',
        type: 'Predator',
        icon: '🦫',
        biome: 'Arboreal Forest',
        variants: [
            { id: 'default', name: 'Adult', gender: null }
        ],
        animations: ['idle', 'walk', 'attack'],
        stats: {
            health: 15,
            speed: 'Fast',
            damage: '5 per second',
            diet: 'Carnivore'
        },
        description: 'Forest weasels are quick and nimble predators. While they deal less damage than badgers, their speed makes them harder to escape.',
        behavior: 'Weasels are opportunistic hunters that target both peccaries and baby geese. They move quickly and can be difficult to shake off.',
        habitat: 'Found throughout the Arboreal Forest, often hunting near the forest edges.',
        tips: 'Weasels are fast but fragile. If you can reach the village or river, you may escape them.'
    },

    // ========================================================================
    // FOX (Egg Thief)
    // ========================================================================
    {
        id: 'fox',
        name: 'Red Fox',
        type: 'Egg Thief',
        icon: '🦊',
        biome: 'Arboreal Forest',
        variants: [
            { id: 'default', name: 'Adult', gender: null }
        ],
        animations: ['idle', 'walk', 'creep', 'flee'],
        stats: {
            health: 25,
            speed: 'Medium-Fast',
            damage: '6 per second',
            diet: 'Omnivore'
        },
        description: 'Red foxes are cunning predators known for their egg-stealing behavior. They will sneak up on goose nests and steal eggs when the parents are not looking.',
        behavior: 'Foxes creep slowly toward nests to avoid detection. If spotted by a goose, they flee. They will also hunt baby geese and attack peccaries if no eggs are available.',
        habitat: 'Found in the Arboreal Forest, often lurking near the river where goose nests are located.',
        tips: 'Watch out for foxes near goose nests. Geese will chase and attack foxes that steal their eggs.'
    },

    // ========================================================================
    // LEOPARD TOAD (Savannah)
    // ========================================================================
    {
        id: 'leopard_toad',
        name: 'Leopard Toad',
        type: 'Neutral Amphibian',
        icon: '🐸',
        biome: 'New World Savannah',
        variants: [
            { id: 'male', name: 'Male', gender: 'male' },
            { id: 'female', name: 'Female', gender: 'female' },
            { id: 'baby', name: 'Baby', gender: null, isBaby: true }
        ],
        animations: ['idle', 'hop', 'croak', 'flee'],
        stats: {
            health: '15 (male) / 12 (female)',
            speed: 'Slow',
            damage: 'None',
            diet: 'Insectivore'
        },
        description: 'Leopard toads are spotted amphibians that live near the watering hole in the savannah. Males are larger and have a distinctive croak during mating season.',
        behavior: 'Toads hop around near the watering hole. During mating season, males croak to attract females, who then lay eggs in nests. They flee from grass vipers who hunt them.',
        habitat: 'Found near the watering hole in the New World Savannah biome.',
        tips: 'Toads are harmless but will chase you if you steal their eggs! Their eggs can be collected for crafting.'
    },

    // ========================================================================
    // GRASS VIPER WEASEL (Savannah Predator)
    // ========================================================================
    {
        id: 'grass_viper',
        name: 'Grass Viper Weasel',
        type: 'Savannah Predator',
        icon: '🐍',
        biome: 'New World Savannah',
        variants: [
            { id: 'male', name: 'Male', gender: 'male' },
            { id: 'female', name: 'Female', gender: 'female' },
            { id: 'female_pregnant', name: 'Pregnant Female', gender: 'female', isPregnant: true },
            { id: 'baby_male', name: 'Male Baby', gender: 'male', isBaby: true },
            { id: 'baby_female', name: 'Female Baby', gender: 'female', isBaby: true }
        ],
        animations: ['idle', 'slither', 'creep', 'strike', 'hold'],
        stats: {
            health: '10 (male) / 8 (female)',
            speed: 'Medium',
            damage: '12 per strike',
            diet: 'Carnivore'
        },
        description: 'Grass viper weasels are sneaky savannah predators that hunt leopard toads. They creep through the tall grass before striking at their prey.',
        behavior: 'Vipers stalk toads by creeping slowly, then strike when close. They can grab toads and swallow them whole! Females become pregnant and give birth to live young.',
        habitat: 'Found in the grasslands of the New World Savannah, hunting near the watering hole.',
        tips: 'Vipers will also attack peccaries! Keep your distance. They are most dangerous when they strike.'
    },

    // ========================================================================
    // NEW WORLD RHUBARB ANTELOPE (Savannah Herd)
    // ========================================================================
    {
        id: 'antelope',
        name: 'New World Rhubarb Antelope',
        type: 'Herd Animal',
        icon: '🦌',
        biome: 'New World Savannah',
        variants: [
            { id: 'male', name: 'Male', gender: 'male' },
            { id: 'female', name: 'Female', gender: 'female' },
            { id: 'female_pregnant', name: 'Pregnant Female', gender: 'female', isPregnant: true },
            { id: 'leader', name: 'Herd Leader', gender: 'male', isLeader: true },
            { id: 'baby_male', name: 'Male Calf', gender: 'male', isBaby: true },
            { id: 'baby_female', name: 'Female Calf', gender: 'female', isBaby: true }
        ],
        animations: ['idle', 'walk', 'graze', 'run', 'flee'],
        stats: {
            health: '45 (male) / 40 (female)',
            speed: 'Fast',
            damage: '15 (kick)',
            diet: 'Herbivore'
        },
        description: 'New World Rhubarb Antelope are elegant herd animals with distinctive reddish-brown coloring. Males have magnificent curved horns, with the herd leader having the largest.',
        behavior: 'Antelope graze in herds, staying together for safety. When wild dogs hunt them, they flee. They can fight back with powerful kicks - males are more dangerous than females, and the leader is extremely dangerous!',
        habitat: 'Found on the eastern side of the New World Savannah in herds of 6 or more.',
        tips: 'Antelope are neutral and will not attack you. Watch them interact with wild dog packs - it is nature at its finest!'
    },

    // ========================================================================
    // NEW WORLD HUNTER'S WILD DOG (Pack Predator)
    // ========================================================================
    {
        id: 'wild_dog',
        name: "New World Hunter's Wild Dog",
        type: 'Pack Predator',
        icon: '🐕',
        biome: 'New World Savannah',
        variants: [
            { id: 'male', name: 'Male', gender: 'male' },
            { id: 'female', name: 'Female', gender: 'female' },
            { id: 'alpha_female', name: 'Alpha Female', gender: 'female', isAlpha: true },
            { id: 'female_pregnant', name: 'Pregnant Female', gender: 'female', isPregnant: true },
            { id: 'pup_male', name: 'Male Pup', gender: 'male', isBaby: true },
            { id: 'pup_female', name: 'Female Pup', gender: 'female', isBaby: true }
        ],
        animations: ['idle', 'walk', 'run', 'hunt', 'rest', 'howl'],
        stats: {
            health: '25 (pack member) / 35 (alpha)',
            speed: 'Very Fast',
            damage: '8 per bite',
            diet: 'Carnivore'
        },
        description: "New World Hunter's Wild Dogs are fierce pack predators with distinctive mottled coats. They hunt in coordinated packs led by an alpha female.",
        behavior: 'Wild dogs live in packs with an alpha female leader. They hunt antelope and Saltas Gazella in coordinated pack hunts. After a successful hunt, they rest and share the meal. They will also attack grass vipers that get too close!',
        habitat: 'Found on the western side of the New World Savannah, denning under trees.',
        tips: 'Wild dogs are dangerous predators. They hunt in packs and are very fast. Stay away from their hunting grounds!'
    },

    // ========================================================================
    // SALTAS GAZELLA (Fastest Animal)
    // ========================================================================
    {
        id: 'saltas_gazella',
        name: 'Saltas Gazella',
        type: 'Fastest Animal',
        icon: '🦌',
        biome: 'New World Savannah',
        variants: [
            { id: 'male', name: 'Male', gender: 'male' },
            { id: 'female', name: 'Female', gender: 'female' },
            { id: 'female_pregnant', name: 'Pregnant Female', gender: 'female', isPregnant: true },
            { id: 'baby_male', name: 'Baby Male', gender: 'male', isBaby: true },
            { id: 'baby_female', name: 'Baby Female', gender: 'female', isBaby: true }
        ],
        animations: ['idle', 'walk', 'run', 'sprint', 'graze'],
        stats: {
            health: '30 (male) / 28 (female)',
            speed: 'EXTREMELY Fast (25!)',
            damage: '12 (kick)',
            diet: 'Herbivore'
        },
        description: 'Saltas Gazella are the fastest animals in the game! Males are sleek black with white underbellies, while females are creamy yellow. Both sexes have elegant curved horns.',
        behavior: 'Gazella graze peacefully in herds but flee at incredible speed when predators approach. They have a 75% chance to escape wild dog hunts! Females choose males during mating season and give birth after 4 minutes.',
        habitat: 'Found on the southern side of the New World Savannah in herds of 8.',
        tips: 'Craft a saddle (10 seaweed) to ride a Saltas Gazella! Press E near one to mount. Hold SHIFT while riding to sprint at incredible speed!',
        special: {
            rideable: true,
            saddleCost: '10 Seaweed',
            babyColors: 'Males are grey, Females are sunflower orange'
        }
    },

    // ========================================================================
    // DRONGLOUS CAT (Tree-Dwelling Predator)
    // ========================================================================
    {
        id: 'dronglous_cat',
        name: 'Dronglous Cat',
        type: 'Tree-Dwelling Predator',
        icon: '🐱',
        biome: 'New World Savannah',
        variants: [
            { id: 'male', name: 'Male', gender: 'male' },
            { id: 'female', name: 'Female', gender: 'female' },
            { id: 'female_pregnant', name: 'Pregnant Female', gender: 'female', isPregnant: true },
            { id: 'baby_male', name: 'Baby Male', gender: 'male', isBaby: true },
            { id: 'baby_female', name: 'Baby Female', gender: 'female', isBaby: true }
        ],
        animations: ['idle', 'run', 'climb', 'pounce', 'takedown', 'eat', 'play', 'defend'],
        stats: {
            health: '20 (male) / 15 (female)',
            speed: 'Fast (cheetah-like gallop)',
            damage: '12 per strike',
            diet: 'Carnivore'
        },
        description: 'The Dronglous Cat was discovered by the legendary Professor Emilia Snoutworth. These magnificent tree-dwelling predators live exclusively in acacia trees, only descending to hunt or mate. Males are jet black, females are dull grey and smaller, baby males are dark grey, and baby females are pure white. Their detailed eyes have vertical slit pupils that glow golden, and their multi-segmented legs allow for incredible agility.',
        behavior: 'Dronglous Cats spend most of their time in their home acacia tree. When hungry, they descend and hunt with devastating precision - running with a distinctive cheetah-like gallop where their spine flexes and extends with each stride. They pounce onto prey\'s back, grabbing head and shoulder, then delivering a fatal neck bite. They prey on baby gazella, baby antelope, toads, wild dog pups, and grass vipers. Mothers fiercely defend their babies from any threat. They can fight off wild dog packs - dogs usually retreat due to the risk of injury.',
        habitat: 'Found in acacia trees throughout the New World Savannah. Each cat claims their own tree as territory.',
        tips: 'Dronglous Cats are not dangerous to peccaries unless you get too close to their babies! Watch their hunting - the takedown animation is dramatic. Babies are adorable and play around the base of their mother\'s tree.',
        special: {
            discoveredBy: 'Professor Emilia Snoutworth',
            homeTree: 'Acacia Tree',
            huntingStyle: 'Ambush pounce with neck bite',
            babyColors: 'Males are dark grey, Females are pure white',
            matingPeriod: '4 minutes pregnancy, 3 babies born',
            growUpTime: '4 minutes to adulthood'
        }
    },

    // ========================================================================
    // DEERICUS IRICUS (Mountain Deer)
    // ========================================================================
    {
        id: 'deericus_iricus',
        name: 'Deericus Iricus',
        type: 'Mountain Herbivore',
        icon: '🦌',
        biome: 'Snowy Mountains',
        variants: [
            { id: 'male', name: 'Male', gender: 'male', hasHorns: true },
            { id: 'female', name: 'Female', gender: 'female', hasHorns: false },
            { id: 'baby_male', name: 'Baby Male', gender: 'male', isBaby: true },
            { id: 'baby_female', name: 'Baby Female', gender: 'female', isBaby: true }
        ],
        animations: ['idle', 'walk', 'run', 'graze', 'fight', 'flee'],
        stats: {
            health: '20 (male) / 18 (female)',
            speed: 'Moderate (5 base speed)',
            damage: '8 (defensive kicks)',
            diet: 'Herbivore'
        },
        description: 'The Deericus Iricus is a small, elegant mountain deer that thrives in the harsh snowy environment. Males sport branching antlers and have brown coats, while females are pure white without antlers. They have distinctively large, expressive ears - a hallmark of the species - and graceful proportions with long, slender legs ending in small hooves.',
        behavior: 'Deericus Iricus are social herd animals with complex family structures. They spend most of their time grazing on mountain vegetation. Males compete for dominance through antler fights during mating season. When threatened, they flee with surprising speed and agility. They are defensive rather than aggressive - only fighting when cornered or protecting their young.',
        habitat: 'Found exclusively in the Snowy Mountains biome. They prefer areas with some vegetation where they can graze, but are well-adapted to the cold climate.',
        tips: 'These deer are friendly and won\'t attack unprovoked. Watch for their behavior - males will fight each other for dominance! Baby deer stay close to their mothers and can be spotted following the herd.',
        special: {
            herdAnimal: true,
            antlers: 'Males only - branching style with 2-3 tines',
            colorDimorphism: 'Males are brown, females are white',
            distinctiveFeature: 'Exceptionally large, leaf-shaped ears with pink inner ear',
            territoryBehavior: 'Live in herds, share grazing areas',
            matingBehavior: 'Males compete through antler fights'
        }
    },

    // =========================================================================
    // DRONGULINAT CAT - Snow Mountain Predator
    // =========================================================================
    {
        id: 'drongulinat_cat',
        name: 'Drongulinat Cat',
        icon: '🐱',
        biome: 'snowy_mountains',
        variants: {
            male: { name: 'Male', color: '#C0C8D0', size: 'Large (1.1x)' },
            female: { name: 'Female', color: '#F0F0F0', size: 'Medium (0.95x)' },
            baby_male: { name: 'Kitten (Male)', color: '#8B3A62', size: 'Small (0.5x)' },
            baby_female: { name: 'Kitten (Female)', color: '#7A9A4A', size: 'Small (0.45x)' }
        },
        description: 'The Drongulinat Cat is a powerful snow predator and a living descendant of the ancient Felis Dronglaticus. Unlike its savannah cousin the Dronglous Cat (a tree-dwelling ambush hunter), the Drongulinat evolved for life in the frozen mountains. Its most striking adaptation is its massive, oversized paws — natural snowshoes that let it walk on deep snow without sinking. Males have a grey-white coat that blends with rocky outcrops, while females are pure white like fresh snow. Both share the signature golden eyes of the Dronglaticus lineage.',
        behavior: 'Drongulinat Cats are apex predators of the snowy mountains. They hunt Deericus Iricus in dramatic chases across the snow, though the deer are often fast enough to escape. When a cat does catch its prey, it performs a violent takedown — throwing the deer around before delivering a killing bite. Despite their ferocity as hunters, Drongulinat Cats are not aggressive toward peccaries unless provoked. Attack one, however, and it will retaliate with terrifying speed and power.',
        habitat: 'Found exclusively in the Snowy Mountains biome. They roam the open snow fields in mated pairs, establishing loose territories near deer grazing areas.',
        tips: 'These cats are neutral — they won\'t bother you unless you hit them first! Watch them from a safe distance to see their hunting behavior. If you see a pregnant female, stick around — she\'ll give birth to 3 adorable kittens. Baby males are reddish-purple and baby females are pumpkin-seed green.',
        special: {
            predator: true,
            huntsPrey: 'Deericus Iricus',
            snowAdaptation: 'Oversized paws act as natural snowshoes',
            colorDimorphism: 'Males grey-white, females pure white',
            babyColors: 'Males reddish-purple (#8B3A62), females pumpkin-seed green (#7A9A4A)',
            goldenEyes: 'Inherited from Felis Dronglaticus ancestor',
            matingBehavior: 'Males seek out females, 5 minute pregnancy, 3 kittens per litter',
            evolutionaryRelative: 'Dronglous Cat (savannah cousin)',
            combatBehavior: 'Only attacks if provoked by player'
        }
    }
];

/**
 * Get bestiary data by animal ID
 * @param {string} animalId - The animal ID
 * @returns {Object} - The bestiary entry
 */
window.getBestiaryData = function(animalId) {
    return BESTIARY.find(b => b.id === animalId);
};
