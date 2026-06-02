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
        type: 'Apex Predator',
        icon: '🐱',
        biome: 'Snowy Mountains',
        variants: [
            { id: 'male', name: 'Male', gender: 'male' },
            { id: 'female', name: 'Female', gender: 'female' },
            { id: 'baby_male', name: 'Kitten (Male)', gender: 'male', isBaby: true },
            { id: 'baby_female', name: 'Kitten (Female)', gender: 'female', isBaby: true }
        ],
        animations: ['idle', 'walk', 'run'],
        stats: {
            health: '25 (male) / 20 (female)',
            speed: 'Fast',
            damage: '15 (male) / 12 (female)',
            diet: 'Carnivore'
        },
        description: 'The Drongulinat Cat is a powerful snow predator and a living descendant of the ancient Felis Dronglaticus. Unlike its savannah cousin the Dronglous Cat (a tree-dwelling ambush hunter), the Drongulinat evolved for life in the frozen mountains. Its most striking adaptation is its massive, oversized paws — natural snowshoes that let it walk on deep snow without sinking. Males have a grey-white coat that blends with rocky outcrops, while females are pure white like fresh snow. Both share the signature golden eyes of the Dronglaticus lineage.',
        behavior: 'Drongulinat Cats are apex predators of the snowy mountains. They hunt Deericus Iricus in dramatic chases across the snow, though the deer are often fast enough to escape. When a cat does catch its prey, it performs a violent takedown — throwing the deer around before delivering a killing bite. Despite their ferocity as hunters, Drongulinat Cats are not aggressive toward peccaries unless provoked. Attack one, however, and it will retaliate with terrifying speed and power.',
        habitat: 'Found exclusively in the Snowy Mountains biome. They roam the open snow fields in mated pairs, establishing loose territories near deer grazing areas.',
        tips: 'These cats are neutral — they won\'t bother you unless you hit them first! Watch them from a safe distance to see their hunting behavior. If you see a pregnant female, stick around — she\'ll give birth to 3 adorable kittens. Baby males are reddish-purple and baby females are pumpkin-seed green.',
        special: {
            predator: true,
            huntsPrey: 'Deericus Iricus',
            babyColors: 'Males reddish-purple (#8B3A62), females pumpkin-seed green (#7A9A4A)'
        }
    },

    // ========================================================================
    // SNOW CANINON LARTUS (Pack Dog)
    // ========================================================================
    {
        id: 'snow_caninon',
        name: 'Snow Caninons Lartus',
        type: 'Pack Predator',
        icon: '🐕',
        biome: 'Snowy Mountains',
        variants: [
            { id: 'male', name: 'Male', gender: 'male' },
            { id: 'female', name: 'Female', gender: 'female' },
            { id: 'leader', name: 'Pack Leader', gender: 'male' },
            { id: 'baby_male', name: 'Pup (Male)', gender: 'male', isBaby: true },
            { id: 'baby_female', name: 'Pup (Female)', gender: 'female', isBaby: true }
        ],
        animations: ['idle', 'walk', 'run', 'dig'],
        stats: {
            health: '40 (male) / 35 (female) / 50 (leader)',
            speed: 'Fast',
            damage: '22 (male) / 18 (female) / 27 (leader)',
            diet: 'Carnivore'
        },
        description: 'The Snow Caninons Lartus is a powerful pack dog with the general morphology of an XL bully — wide chest, muscular build, short snout, and massive paws adapted for walking on snow. Males are jet black while females are dark grey. The pack leader is 10% larger than regular males. Pups are lighter versions of their parents: male pups are dark grey and female pups are light grey, darkening to adult colours as they mature.',
        behavior: 'Snow Caninons live in packs of 4, always led by a dominant male. The pack roams the snowy mountains together, staying close to their leader. When prey is abundant, males will choose a mate and the female becomes pregnant for 3 minutes. When it is time to give birth, the ENTIRE pack cooperates to dig a den — a large hole in the ground where the mother and pups will shelter. After birth, pups play outside the den but will flee inside if a Drongulinat Cat approaches. The mother will charge out to defend her pups, but sometimes she is too late and a cat drags a pup away. The pack hunts Deericus Iricus together — the leader chases and kills the prey, then drops it for the whole pack to feast.',
        habitat: 'Found in the Snowy Mountains biome. Packs establish territories spread across the snow fields, with dens dug near their home territory.',
        tips: 'Snow Caninons are friendly to the peccary UNLESS you enter their den — the mother will attack to protect her pups! Watch a pack hunt deer for a spectacular chase. If you see the whole pack digging, a den is being built and pups will arrive soon. Drongulinat Cats and Snow Caninons are natural enemies — cats hunt the pups while mothers fight back fiercely.',
        special: {
            predator: true,
            packAnimal: true,
            huntsPrey: 'Deericus Iricus',
            naturalEnemy: 'Drongulinat Cat',
            pupColors: 'Males dark grey (#3a3a3a), females light grey (#6a6a6a)'
        }
    },
    {
        id: 'baluban_oxen',
        name: 'Snow Baluban Oxen',
        type: 'Herd Herbivore',
        icon: '🐂',
        biome: 'Snowy Mountains',
        variants: [
            { id: 'male', name: 'Male', gender: 'male' },
            { id: 'female', name: 'Female', gender: 'female' },
            { id: 'leader', name: 'Herd Leader', gender: 'male' },
            { id: 'baby_male', name: 'Calf (Male)', gender: 'male', isBaby: true },
            { id: 'baby_female', name: 'Calf (Female)', gender: 'female', isBaby: true }
        ],
        animations: ['idle', 'walk', 'graze', 'rut'],
        stats: {
            health: '60 (male) / 50 (female) / 66 (leader)',
            speed: 'Slow',
            damage: '25 (male) / 15 (female) / 28 (leader)',
            diet: 'Herbivore'
        },
        description: 'The Snow Baluban Oxen is a massive beast built upon the body of a musk ox, making it the largest animal in the game. Males are blue-grey (#6B7B8B) while females are jet black (#1A1A1A). Both genders have curved musk ox horns, but male horns are significantly larger with a thick boss plate. The herd leader is 10% larger with enormous horns. They have a distinctive shaggy fur "skirt" that hangs below their body. Calves are slimmer with proportionally longer legs — male calves are mud brown (#8B6914) while female calves are potato coloured (#C4A76C).',
        behavior: 'Baluban Oxen live in enormous herds of 18 individuals (6 males, 12 females) led by a dominant male. Every 10 minutes, mating season arrives and males rut — two males approach each other and lock horns in a dramatic pushing contest. The winner claims the contested female. Pregnant females carry for 7 minutes before giving birth to a single calf. Calves mature after 6 minutes. If the herd leader has a male calf, when it matures, the young bull takes 1 male and 2 females to form a brand new herd!',
        habitat: 'Found in the southern regions of the Snowy Mountains biome, where they graze on the same grass tufts as deer. They prefer open snow fields away from the more dangerous predators of the north.',
        tips: 'Watch out for the dramatic hunts! Snow Caninon dog packs will try to hunt these massive beasts using coordinated tactics — surrounding, nipping, and leg-biting. During the standoff, the oxen may headbutt and kill attacking dogs, or the pack may overwhelm the oxen with a neck bite. A flawless kill by the dogs is extremely rare!',
        special: {
            herbivore: true,
            herdAnimal: true,
            grazesOn: 'Grass tufts',
            huntedBy: 'Snow Caninons Lartus',
            calfColors: 'Males mud brown (#8B6914), females potato (#C4A76C)'
        }
    },

    // ========================================================================
    // URONIN SEAL
    // ========================================================================
    {
        id: 'uronin_seal',
        name: 'Uronin Seal',
        type: 'Colony Marine Mammal',
        icon: '\uD83E\uDDAD',
        biome: 'Coastal',
        variants: [
            { id: 'male', name: 'Male', gender: 'male' },
            { id: 'female', name: 'Female', gender: 'female' },
            { id: 'baby_male', name: 'Pup (Male)', gender: 'male', isBaby: true },
            { id: 'baby_female', name: 'Pup (Female)', gender: 'female', isBaby: true }
        ],
        animations: ['rest', 'waddle', 'swim', 'fight', 'bark', 'mate'],
        stats: {
            health: '40 (male) / 35 (female)',
            speed: 'Very Slow on land, Moderate in water',
            damage: '12 (male fighting)',
            diet: 'Piscivore (fish)'
        },
        description: 'Uronin Seals are descendants of the extinct Uronal Seal. They live in colonies on ocean islands, with the largest male ruling as colony leader. Males are grey with blue-grey patches, while females are lighter grey with white patches. Baby males are adorable white pups with huge black eyes, while baby females are jet black.',
        behavior: 'Seals rest on islands in colonies led by the biggest male. Every 5 minutes, mating season begins. The leader mates with females, but other males sneak in too! Males can challenge the leader for dominance, though challengers usually lose. Pregnant females swim to a different island to raise their pup in safety, returning with their grown offspring.',
        habitat: 'Found on the medium and large ocean islands in the Coastal biome. They waddle slowly on land but swim gracefully between islands.',
        tips: 'Seals are friendly! Watch for mating season to see the leader fighting challengers. If you see a female swimming alone, she might be heading to raise her pup on another island!',
        special: {
            colonyAnimal: true,
            leaderFights: 'Largest male becomes leader through size or combat',
            matingStyle: 'Leader mates with all females; others sneak-mate',
            pupRaising: 'Mothers swim to different island to raise pups',
            pupColors: 'Males are white, females are black'
        }
    },

    // ========================================================================
    // SLITTED SARDINE
    // ========================================================================
    // PILFERA COASTALIS
    // ========================================================================
    {
        id: 'pilfera_coastalis',
        name: 'Pilfera Coastalis',
        type: 'Coastal Bird',
        icon: '\uD83E\uDD86',
        biome: 'Coastal',
        variants: [
            { id: 'male', name: 'Male', gender: 'male' },
            { id: 'female', name: 'Female', gender: 'female' }
        ],
        animations: ['walk', 'peck', 'flee'],
        stats: {
            health: '7-8',
            speed: 'Fast',
            damage: '3 (peck)',
            diet: 'Omnivore — fish, scraps, YOUR food'
        },
        description: 'The Pilfera Coastalis is a cunning coastal seagull known for its thieving nature. Males are white with bright yellow bills and a distinctive red bill tip spot. Females are smaller and grey with black bills. They roam the beach in small flocks, always watching for an easy meal.',
        behavior: 'Seagulls walk along the beach looking for food. When the player eats nearby, they have a chance to swoop in and steal the food right out of your hooves! They will peck if provoked, then flee.',
        habitat: 'Found walking on the sandy beach of the Coastal Biome. They rarely venture into the birch forest or ocean.',
        tips: 'Be careful eating food near seagulls — they might steal it! Hit them to scare them off before eating. They are not dangerous, just annoying.',
        special: {
            flockSize: '6-8 birds',
            stealChance: '40% when eating near one',
            funFact: 'Their scientific name "Pilfera" comes from "pilfer" — to steal!'
        }
    },

    // ========================================================================
    {
        id: 'slitted_sardine',
        name: 'Slitted Sardine',
        type: 'Shoaling Fish',
        icon: '\uD83D\uDC1F',
        biome: 'Coastal',
        variants: [
            { id: 'male', name: 'Male', gender: 'male' },
            { id: 'female', name: 'Female', gender: 'female' }
        ],
        animations: ['swim', 'shoal'],
        stats: {
            health: '1',
            speed: 'Moderate',
            damage: '0',
            diet: 'Plankton'
        },
        description: 'Slitted Sardines are tiny fish that swim in massive shoals of 20. Males are silver with a distinctive blue slit along their dorsal line, while females are pure silver. They are a key food source for seals.',
        behavior: 'Sardines stay in tight shoals, using boids-like cohesion to move together. They change direction as a group and rarely stray far from their shoal center.',
        habitat: 'Found swimming in the coastal ocean waters. Multiple shoals can be seen throughout the sea.',
        tips: 'Bakka seals love hunting sardines! Watch for seals diving into shoals. You can catch them with a fishing spear.',
        special: {
            shoalSize: '20 fish per shoal',
            huntedBy: 'Both uronin and bakka seals'
        }
    },

    // ========================================================================
    // ORCLETON
    // ========================================================================
    {
        id: 'orcleton',
        name: 'Orcleton',
        type: 'Solitary Fish',
        icon: '\uD83D\uDC20',
        biome: 'Coastal',
        variants: [
            { id: 'male', name: 'Male', gender: 'male' },
            { id: 'female', name: 'Female', gender: 'female' }
        ],
        animations: ['swim', 'drift'],
        stats: {
            health: '3',
            speed: 'Slow',
            damage: '0',
            diet: 'Algae'
        },
        description: 'Orcletons are large, solitary ocean fish. Males are a striking blue color, while females are orange. They drift lazily through the ocean, changing direction occasionally.',
        behavior: 'Unlike sardines, orcletons swim alone. They meander through the ocean with slow, random direction changes. They are larger and tougher than sardines.',
        habitat: 'Scattered individually throughout the coastal ocean waters.',
        tips: 'Uronin seals prefer hunting orcletons over sardines! They are worth catching with a fishing spear because of their larger size.',
        special: {
            preferredBy: 'Uronin seals (70% preference)',
            solitary: true
        }
    },

    // ========================================================================
    // BAKKA SEAL
    // ========================================================================
    {
        id: 'bakka_seal',
        name: 'Bakka Seal',
        type: 'Solitary Marine Mammal',
        icon: '\uD83E\uDDAD',
        biome: 'Coastal',
        variants: [
            { id: 'male', name: 'Male', gender: 'male' },
            { id: 'female', name: 'Female', gender: 'female' },
            { id: 'baby_male', name: 'Pup (Male)', gender: 'male', isBaby: true },
            { id: 'baby_female', name: 'Pup (Female)', gender: 'female', isBaby: true }
        ],
        animations: ['swim', 'warn', 'attack', 'fight', 'mate'],
        stats: {
            health: '50 (male) / 40 (female)',
            speed: 'Fast in water',
            damage: '15 (attack)',
            diet: 'Piscivore (prefers sardines)'
        },
        description: 'Bakka Seals are solitary, territorial marine mammals. Males are beige, females are grey, baby males are burgundy, and baby females are maroon. Unlike the colony-dwelling uronin seals, bakka seals patrol the open ocean alone.',
        behavior: 'Bakka seals swim through the open ocean and are fiercely territorial. If Pedro gets too close, they raise their head and growl a warning. Stay too long and they attack! Males fight rivals for mating rights — the loser swims away, but fights lasting too long can be deadly. Females give birth to 4 pups.',
        habitat: 'Scattered throughout the deep coastal ocean, away from islands. They prefer open water.',
        tips: 'Be careful near bakka seals — they WILL attack if you ignore their warning! Killing one drops a Bakka Seal Tooth, needed to craft a Fishing Spear.',
        special: {
            territorial: 'Warns then attacks if Pedro stays within 12 units',
            drops: 'Bakka Seal Tooth (crafting material)',
            mating: 'Males fight rivals; winner mates with female',
            babies: '4 pups per mating (2 male, 2 female)'
        }
    },

    // ========================================================================
    {
        id: 'jet_crab',
        name: 'Jet Crab',
        type: 'Beach Crustacean',
        icon: '🦀',
        biome: 'Coastal',
        variants: [
            { id: 'male', name: 'Male', gender: 'male' },
            { id: 'female', name: 'Female (larger)', gender: 'female' }
        ],
        animations: ['scuttle', 'claw_click'],
        stats: {
            health: '1',
            speed: 'Fast',
            damage: 'None',
            diet: 'Scavenger'
        },
        description: 'Tiny jet-black ghost crabs that scuttle sideways across the beach at surprising speed. Females are slightly larger than males. They are prey for seagulls, seals, and orcletons.',
        behavior: 'Jet crabs scuttle sideways across the sand. When Pedro approaches, they flee in a rapid sideways dash. Males click their claws during mating season to attract females.',
        habitat: 'Found all over the sandy beach. Sometimes venture into shallow water.',
        tips: 'Walk over them to squish and eat! They restore a small amount of food. They are at the bottom of the coastal food chain.',
        special: {
            mating: 'Males click claws → females approach → 60% approval → 15 eggs in sand hole',
            hatchTime: '2 minutes',
            foodValue: '+5 food when stomped'
        }
    },

    // ========================================================================
    {
        id: 'slackpinch_crab',
        name: 'Slackpinch Crab',
        type: 'Beach Crustacean',
        icon: '🦀',
        biome: 'Coastal',
        variants: [
            { id: 'male', name: 'Male (yellow, blue pincers)', gender: 'male' },
            { id: 'female', name: 'Female (white)', gender: 'female' }
        ],
        animations: ['scuttle', 'claw_clack'],
        stats: {
            health: '3',
            speed: 'Medium',
            damage: '1 (pinch)',
            diet: 'Scavenger'
        },
        description: 'A larger, colourful crab species. Males are yellow with striking blue pincers and orange moving claw parts. Females are white with smaller claws. Tougher than jet crabs but still stompable.',
        behavior: 'Slackpinch crabs are slower but hardier than jet crabs. Males clack their oversized pincers to attract white females. They take a few stomps to squish.',
        habitat: 'Found on the sandy beach alongside jet crabs.',
        tips: 'Takes more stomps than a jet crab. Watch out for the pinch! Worth more food than jet crabs.',
        special: {
            mating: 'Males clack pincers → females approach → 60% approval → 15 eggs',
            hatchTime: '2 minutes',
            foodValue: '+8 food when stomped'
        }
    },

    // ========================================================================
    {
        id: 'basicuslin_amphipod',
        name: 'Basicuslin Amphipod',
        type: 'Sand Crustacean',
        icon: '🦐',
        biome: 'Coastal',
        variants: [],
        animations: ['buried', 'wander'],
        stats: {
            health: '1',
            speed: 'Very Slow',
            damage: 'None',
            diet: 'Detritivore — decaying wood and debris'
        },
        description: 'A tiny white amphipod that lives half-buried in the sand with only its antennae sticking out. No gender differences — they reproduce asexually by laying eggs.',
        behavior: 'Amphipods spend most of their time buried in the sand. Occasionally they emerge and wander slowly, eating decaying wood and organic debris. They re-bury themselves after a while.',
        habitat: 'Buried in the sandy beach of the Coastal Biome. Look for antennae poking out of the sand!',
        tips: 'Easy to miss! Walk over the antennae to squish and eat. Worth a tiny amount of food.',
        special: {
            reproduction: 'Lays eggs solo (no mating needed)',
            hatchTime: '3 minutes',
            foodValue: '+3 food when stomped'
        }
    },

    // ========================================================================
    {
        id: 'beach_weasel',
        name: 'Beach Weasel',
        type: 'Coastal Predator',
        icon: '🦦',
        biome: 'Coastal',
        variants: [
            { id: 'male', name: 'Male (slightly larger)', gender: 'male' },
            { id: 'female', name: 'Female', gender: 'female' }
        ],
        animations: ['gallop', 'paw_swipe', 'sleep_curl'],
        stats: {
            health: '10-12',
            speed: 'Fast (galloping)',
            damage: '6 (vicious paw swipe)',
            diet: 'Carnivore'
        },
        description: 'An annoying little coastal predator with sandy fur. Beach weasels flee from Pedro with a distinctive galloping run, bending their body and bouncing. But if attacked, they turn and fight back with devastating paw swipes!',
        behavior: 'Runs away from Pedro with a unique galloping animation. If you hit one, it turns aggressive and chases you, swiping with its paws for 6 damage. Males fight viciously over mated females. Females dig burrows and raise 4 pups.',
        habitat: 'Found near the edge of the beach where sand meets grass. Females dig burrows away from the shoreline.',
        tips: 'DO NOT attack these unless you are well equipped! 6 damage per swipe is brutal. Leave them alone and they will leave you alone.',
        special: {
            mating: 'Males find females every 5 min. If female is mated, males fight (loser flees hurt)',
            burrow: 'Females dig burrows with 4 pups. Press E to peek inside!',
            funFact: 'They sleep curled up with their tail wrapped around them and head resting on it'
        }
    },

    // ========================================================================
    {
        id: 'beach_murgaya',
        name: 'Beach Murgaya',
        type: 'Coastal Pack Predator',
        icon: '🐕',
        biome: 'Coastal',
        variants: [
            { id: 'male', name: 'Male (grey, larger)', gender: 'male' },
            { id: 'female', name: 'Female (brown, smaller)', gender: 'female' }
        ],
        animations: ['jaw_snap', 'stalk', 'gallop', 'swim', 'lie_down'],
        stats: {
            health: '20-25',
            speed: 'Fast (pack hunter)',
            damage: '10 (jaw bite!)',
            diet: 'Carnivore — seals, weasels, seagulls, crabs, fish, Pedro!'
        },
        description: 'The apex predator of the coast. Beach Murgayas are pack-hunting canines with powerful jaws that snap open and closed to deliver devastating 10-damage bites. Males are grey and larger; females are brown and slightly faster. They hunt in coordinated packs of 2-4, stalking prey before launching a group chase.',
        behavior: 'Packs stalk prey from 40 units, then burst into a full-speed chase. They can swim (doggy paddle) and will follow Pedro into the water or rest on islands. Each pack has a complex lifecycle: females build surface dens in the forest and raise young through 6 growth stages over 17 minutes.',
        habitat: 'Pack territories range from the coastal forest to the beach. Dens are built in the middle of the forest. Adolescents can be found swimming to islands.',
        tips: 'EXTREMELY DANGEROUS. A pack of 4 can deal 40 damage per attack cycle. Do not approach without thunder armour or strong weapons. Even water is not safe — they swim! Run to the village or fight with the electric crossbow from range.',
        special: {
            packSize: '2-4 members',
            lifecycle: 'Infant (2m) → Snifflet (3m) → Pup (7m with beach excursion) → Adolescent (5m) → Adult',
            hunting: 'Special tactics per prey: stalking, hit-and-run, pack coordination',
            swimming: 'Can doggy paddle, rest on islands, hunt in water',
            funFact: 'Inspired by the wolves of Vancouver Island who swim between islands to hunt!'
        }
    },
    // ========================================================================
    // GCF DEER (Lesser Costantine Flangert Deer)
    // ========================================================================
    {
        id: 'gcf_deer',
        name: 'Lesser Costantine Flangert Deer',
        type: 'Coastal Herbivore',
        icon: '🦌',
        biome: 'Coastal',
        variants: [
            { id: 'male', name: 'Male (horned)', gender: 'male' },
            { id: 'female', name: 'Female', gender: 'female' },
            { id: 'fawn_male', name: 'Fawn (Male)', gender: 'male', isBaby: true },
            { id: 'fawn_female', name: 'Fawn (Female)', gender: 'female', isBaby: true },
            { id: 'hipperlet_male', name: 'Hipperlet (Male)', gender: 'male' },
            { id: 'hipperlet_female', name: 'Hipperlet (Female)', gender: 'female' },
            { id: 'stfumbler_male', name: 'Stfumbler (Male)', gender: 'male' },
            { id: 'stfumbler_female', name: 'Stfumbler (Female)', gender: 'female' }
        ],
        animations: ['idle', 'walk', 'run', 'graze', 'flee'],
        stats: {
            health: '14 (male) / 12 (female)',
            speed: 'Fast (fleeSpeed: 12)',
            damage: 'None (herbivore)',
            diet: 'Herbivore — Flangert Berries'
        },
        description: 'The Lesser Costantine Flangert Deer (GCF Deer) is a solitary coastal herbivore that feeds exclusively on Flangert Berry Bushes. Males have small branching horns, white spots on brown fur, and shiny reflective eyes. Females are slightly smaller without horns. They go through 4 growth stages: Fawn → Hipperlet → Stfumbler → Adult.',
        behavior: 'GCF Deer are solitary and skittish. They wander the coastal forest seeking berry bushes, pausing to eat berries one at a time. They have excellent awareness (detectionRange: 18) and flee at high speed when Pedro approaches. However, while eating from a bush, they become distracted — their detection range drops dramatically, making them vulnerable to sneak attacks. Fawns hide inside berry bushes for safety.',
        habitat: 'Found in the coastal birch forest, always near Flangert Berry Bushes. They never venture onto the beach or into the ocean.',
        tips: 'Sneak up while they are eating from a bush — their guard is down! Killing one drops hide and meat. Meat is a very filling food (+15 health, +35 hunger). Beach Murgayas also hunt GCF Deer and bring scraps back to their pups.',
        special: {
            growthStages: 'Fawn (2 min) → Hipperlet (3 min) → Stfumbler (3 min) → Adult',
            sneakAttack: 'Detection drops to 4 while eating (normally 18)',
            drops: '2 Hide',
            predator: 'Beach Murgaya',
            diet: 'Flangert Berries only'
        }
    },
    // ========================================================================
    // LANGARTS BLITTING BIRD (LB Bird)
    // ========================================================================
    {
        id: 'lb_bird',
        name: 'Langarts Blitting Bird',
        type: 'Coastal Omnivore',
        icon: '🐦',
        biome: 'Coastal',
        variants: [
            { id: 'male', name: 'Male (yellow + emerald collar)', gender: 'male' },
            { id: 'female', name: 'Female (starling-dark)', gender: 'female' },
            { id: 'chick', name: 'Chick (grey)', isBaby: true },
            { id: 'fledgling', name: 'Fledgling (grey, hopping)', isBaby: true }
        ],
        animations: ['idle', 'walk', 'fly', 'peck', 'display', 'hop'],
        stats: {
            health: '8 (male) / 7 (female)',
            speed: 'Medium-Fast (fleeSpeed: 9-10)',
            damage: '3 (male) / 2 (female) — males peck when provoked',
            diet: 'Omnivore — Flangert Berries, Amphipods, Debris'
        },
        description: 'A magnificent bird of paradise found throughout the coastal biome. ' +
            'Females resemble starlings with dark iridescent plumage — subtle and practical. ' +
            'Males, however, are dazzling: sunflower yellow bodies crowned with a collar of deep emerald feathers. ' +
            'These birds have long legs built for running and zygodactyl feet (two toes forward, two back) ' +
            'that let them cling to tree trunks — yes, the TRUNK, not the branches! ' +
            'They forage on the forest floor, peck berries from bushes, hunt amphipods on the beach, ' +
            'and even fly out to rest on ocean islands. They sleep perched on bushes at night.',
        behavior: {
            foraging: 'Pecks forest floor, eats berries from bushes, hunts amphipods on beach',
            perching: 'Rests on tree trunks (zygodactyl grip) and on top of bushes',
            islands: 'Flies out to ocean islands to rest, then returns to the forest',
            territory: 'Roams freely across forest, beach, and islands',
            combat: 'Males peck attackers briefly then flee. Females and young just flee.',
            mating: 'Males perch on tree trunk and call. When a female approaches, the male raises his ' +
                'emerald collar to cover his face, head almost disappearing into his body with just the beak ' +
                'poking out. He then sways side-to-side with jittering movements. 70% success rate — ' +
                'if he fails, the female flies away unimpressed!',
            nesting: 'After successful display, female dives into a bush to collect twigs, ' +
                'flies to the trunk, and pecks a nest into the tree over 6 seconds.',
            lifecycle: 'Eggs hatch after 1 minute into grey chicks that wander near the nest. ' +
                'After 3 minutes they become fledglings that hop around. After 4 more minutes ' +
                'they mature into adults (50/50 male or female).',
            funFact: 'Named after Professor Langarts who first documented their extraordinary mating displays. ' +
                'The "blitting" refers to the rapid jittering motion of their dance!'
        }
    },
    // ========================================================================
    // COASTAL WHISPERING TREE SNAKE
    // ========================================================================
    {
        id: 'whispering_snake',
        name: 'Coastal Whispering Tree Snake',
        type: 'Coastal Predator',
        icon: '🐍',
        biome: 'Coastal',
        variants: [
            { id: 'mini', name: 'Mini (hatchling)' },
            { id: 'small', name: 'Small' },
            { id: 'decent', name: 'Decent' },
            { id: 'large', name: 'Large' },
            { id: 'monstrous', name: 'Monstrous' }
        ],
        animations: ['coil', 'slither', 'strike', 'constrict', 'shush', 'tongue_flick'],
        stats: {
            health: '5 (mini) to 35 (monstrous)',
            speed: 'Slow-Medium (3-5)',
            damage: '1 (mini) to 8 (monstrous) — constriction damage',
            diet: 'Carnivore — amphipods, eggs, chicks, weasels, deer, even Pedro!'
        },
        description: 'A ghostly predator that matches the white bark of the coastal birch trees perfectly. ' +
            'The Whispering Tree Snake coils around branches, nearly invisible, watching with piercing yellow-green eyes. ' +
            'It gets its name from a chilling behavior: before striking, it raises its forked tongue to its lips ' +
            'in a "shushing" gesture, as if whispering "shhh" to its prey before ending their life. ' +
            'These snakes grow through 5 size stages by eating — the more they consume, the larger and more ' +
            'dangerous they become. The largest specimens can constrict adult deer and even ambush Pedro!',
        behavior: {
            camouflage: 'Black and white colouring matches birch bark — nearly invisible on tree trunks',
            hunting: 'Coils on branches watching for prey below. Shushes, then drops from the tree to strike.',
            constriction: 'Wraps around prey and crushes. Smaller prey has no chance. ' +
                'Adult deer have a 50% survival rate. Pedro must mash SPACE to fill a strength bar and break free!',
            growth: 'Grows by eating: Mini (3 meals) → Small (4) → Decent (5) → Large (6) → Monstrous (max). ' +
                'Each stage unlocks larger prey. Large+ can attack Pedro!',
            preyList: 'Mini: amphipods. Small: + chicks. Decent: + fledglings, pups. ' +
                'Large: + weasels, murgayas, deer fawns. Monstrous: + adult deer, Pedro.',
            shushing: 'The tongue-to-lips "whisper" is a 2-second warning before a strike. ' +
                'If you see a snake shush, RUN!',
            funFact: 'The birch-bark camouflage is so effective that researchers counted zero snakes on their first ' +
                'survey of the coastal forest — despite there being four in the very trees they were standing under.'
        }
    },
    // ========================================================================
    // COASTAL DREADMAW
    // ========================================================================
    {
        id: 'dreadmaw',
        name: 'Coastal Dreadmaw',
        type: 'Apex Crocodilian',
        icon: '🐊',
        biome: 'Coastal',
        variants: [
            { id: 'hatchling', name: 'Hatchling' },
            { id: 'juvenile', name: 'Juvenile' },
            { id: 'adolescent', name: 'Adolescent' },
            { id: 'subadult', name: 'Sub-adult' },
            { id: 'adult', name: 'Adult Male', gender: 'male' },
            { id: 'adult_female', name: 'Adult Female', gender: 'female' },
            { id: 'elder', name: 'Elder' },
            { id: 'ocean_king', name: 'Ocean King' }
        ],
        animations: ['swim', 'gallop', 'ambush', 'strike', 'death_roll', 'bask', 'carry'],
        stats: {
            health: '5 (hatchling) to 175 (Ocean King)',
            speed: 'Slow on land, FAST in water (up to 16!)',
            damage: '20 (adult+) — devastating jaw bite',
            diet: 'Carnivore — EVERYTHING'
        },
        description: 'The Coastal Dreadmaw is the undisputed apex predator of the coastal biome. Inspired by the ancient Deinosuchus, this massive crocodilian has a broad V-shaped skull, rows of armoured back plates, and a powerful paddle tail. Its sandy-brown colouring darkens with age. Males are larger with a distinctive bony head ridge.',
        behavior: 'Goes semi-transparent to ambush from shallows or sand. Grabs prey and drags it to the ocean for a devastating death roll. Pedro must mash SPACE to escape. Adults are nearly impossible to break free from. The legendary Ocean King holds the key to a prehistoric secret.',
        habitat: 'Patrols the ocean, basks on beaches and islands. Females nest on islands with 10 eggs.',
        tips: 'EXTREMELY DANGEROUS. The jawbone sword dropped by adults lets you dive and breathe underwater. The Ocean King is connected to the deep lore — the age of DINOSAURS.',
        special: {
            drops: 'Jawbone Sword — 20 dmg, snap attack, underwater breathing',
            oceanKing: 'Gateway to the prehistoric era'
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
