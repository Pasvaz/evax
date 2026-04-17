/**
 * SKIN DEFINITIONS
 * Single source of truth for all player skins.
 * Each skin defines a color palette that maps to Pedro's body parts.
 */

window.SKINS = {
    default: {
        id: 'default',
        name: 'Default',
        description: 'The classic Pedro.',
        body: 0x4a4a4a,
        detail: 0x3a3a3a,
        nose: 0x2a2a2a,
        hooves: 0x1a1a1a,
        collar: 0xeeeeee,
        eyeWhite: 0xffffff,
        pupil: 0x111111,
        tailOverride: null,
        unlocked: true,
        unlockCondition: null,
        cheatCode: null
    },
    shimmering_bomb: {
        id: 'shimmering_bomb',
        name: 'Shimmering Bomb',
        description: 'A gleaming black peccary with an ignited tail tip.',
        body: 0x111111,
        detail: 0x1a1a1a,
        nose: 0x0a0a0a,
        hooves: 0x050505,
        collar: 0x333333,
        eyeWhite: 0xffffff,
        pupil: 0xff4400,
        tailOverride: 'fuse',
        unlocked: false,
        unlockCondition: { type: 'arsenBombsUsed', count: 3 },
        cheatCode: 'arsenic EVAX'
    },
    memory_collector: {
        id: 'memory_collector',
        name: 'Memory Collector',
        description: 'Golden Pedro. Memories light the way — fog fades around you.',
        body: 0xdaa520,
        detail: 0xb8860b,
        nose: 0x996515,
        hooves: 0x8b7500,
        collar: 0xffd700,
        eyeWhite: 0xffffff,
        pupil: 0x4169e1,
        tailOverride: null,
        unlocked: false,
        unlockCondition: { type: 'memoriesFound', count: 3 },
        cheatCode: 'Memory EVAX',
        fogReduction: 0.5
    },
    egged_out: {
        id: 'egged_out',
        name: 'Egged Out',
        description: 'Mauve with maroon dots and turquoise waves.',
        body: 0x9966aa,
        detail: 0x7a4488,
        nose: 0x663377,
        hooves: 0x442255,
        collar: 0x44cccc,
        eyeWhite: 0xffffff,
        pupil: 0x662244,
        tailOverride: null,
        unlocked: false,
        unlockCondition: { type: 'easterEvent' },
        cheatCode: 'Eggy EVAX',
        eventOnly: true
    },

    // ========================================================================
    // EASTER LAMB SKINS (15 collectible colors)
    // Unlocked by catching naughty lambs during the Easter event.
    // Full lamb costume — Pedro dressed as the lamb he caught!
    // ========================================================================
    lamb_cotton_candy: {
        id: 'lamb_cotton_candy', name: 'Lamb: Cotton Candy',
        description: 'A fluffy pink lamb costume. Common rarity.',
        body: 0xFFB6C1, detail: 0xE8A0AB, nose: 0xFFDDE5, hooves: 0xCC8899,
        collar: 0xFFFFFF, eyeWhite: 0xffffff, pupil: 0x111111,
        tailOverride: 'lamb', unlocked: false, unlockCondition: { type: 'lambCaught', lambId: 'cotton_candy' },
        cheatCode: null, eventOnly: true, lambSkin: true
    },
    lamb_buttercup: {
        id: 'lamb_buttercup', name: 'Lamb: Buttercup',
        description: 'A sunny golden lamb costume. Common rarity.',
        body: 0xFFD700, detail: 0xE0BD00, nose: 0xFFE84D, hooves: 0xBBA000,
        collar: 0xFFFFFF, eyeWhite: 0xffffff, pupil: 0x111111,
        tailOverride: 'lamb', unlocked: false, unlockCondition: { type: 'lambCaught', lambId: 'buttercup' },
        cheatCode: null, eventOnly: true, lambSkin: true
    },
    lamb_mint: {
        id: 'lamb_mint', name: 'Lamb: Mint',
        description: 'A fresh minty lamb costume. Common rarity.',
        body: 0x98FB98, detail: 0x80DD80, nose: 0xC0FFC0, hooves: 0x66BB66,
        collar: 0xFFFFFF, eyeWhite: 0xffffff, pupil: 0x111111,
        tailOverride: 'lamb', unlocked: false, unlockCondition: { type: 'lambCaught', lambId: 'mint' },
        cheatCode: null, eventOnly: true, lambSkin: true
    },
    lamb_peach: {
        id: 'lamb_peach', name: 'Lamb: Peach',
        description: 'A warm peachy lamb costume. Common rarity.',
        body: 0xFFCBA4, detail: 0xE0B090, nose: 0xFFDDCC, hooves: 0xCC9977,
        collar: 0xFFFFFF, eyeWhite: 0xffffff, pupil: 0x111111,
        tailOverride: 'lamb', unlocked: false, unlockCondition: { type: 'lambCaught', lambId: 'peach' },
        cheatCode: null, eventOnly: true, lambSkin: true
    },
    lamb_snowdrop: {
        id: 'lamb_snowdrop', name: 'Lamb: Snowdrop',
        description: 'A pure white lamb costume. Common rarity.',
        body: 0xF5F5F5, detail: 0xDDDDDD, nose: 0xFFFFFF, hooves: 0xBBBBBB,
        collar: 0xFFFFFF, eyeWhite: 0xffffff, pupil: 0x111111,
        tailOverride: 'lamb', unlocked: false, unlockCondition: { type: 'lambCaught', lambId: 'snowdrop' },
        cheatCode: null, eventOnly: true, lambSkin: true
    },
    lamb_bluebell: {
        id: 'lamb_bluebell', name: 'Lamb: Bluebell',
        description: 'A breezy blue lamb costume. Uncommon rarity.',
        body: 0x7EC8E3, detail: 0x66AACC, nose: 0xAADDEE, hooves: 0x5599AA,
        collar: 0xFFFFFF, eyeWhite: 0xffffff, pupil: 0x111111,
        tailOverride: 'lamb', unlocked: false, unlockCondition: { type: 'lambCaught', lambId: 'bluebell' },
        cheatCode: null, eventOnly: true, lambSkin: true
    },
    lamb_coral: {
        id: 'lamb_coral', name: 'Lamb: Coral',
        description: 'A vibrant coral lamb costume. Uncommon rarity.',
        body: 0xFF7F7F, detail: 0xDD6666, nose: 0xFFAAAA, hooves: 0xBB5555,
        collar: 0xFFFFFF, eyeWhite: 0xffffff, pupil: 0x111111,
        tailOverride: 'lamb', unlocked: false, unlockCondition: { type: 'lambCaught', lambId: 'coral' },
        cheatCode: null, eventOnly: true, lambSkin: true
    },
    lamb_sky: {
        id: 'lamb_sky', name: 'Lamb: Sky',
        description: 'A pale sky-blue lamb costume. Uncommon rarity.',
        body: 0x87CEEB, detail: 0x70B8D5, nose: 0xAADDEE, hooves: 0x5599BB,
        collar: 0xFFFFFF, eyeWhite: 0xffffff, pupil: 0x111111,
        tailOverride: 'lamb', unlocked: false, unlockCondition: { type: 'lambCaught', lambId: 'sky' },
        cheatCode: null, eventOnly: true, lambSkin: true
    },
    lamb_lavender: {
        id: 'lamb_lavender', name: 'Lamb: Lavender',
        description: 'A dreamy purple lamb costume. Rare!',
        body: 0xC4A7E7, detail: 0xAA8ECC, nose: 0xDDCCEE, hooves: 0x8866AA,
        collar: 0xFFFFFF, eyeWhite: 0xffffff, pupil: 0x111111,
        tailOverride: 'lamb', unlocked: false, unlockCondition: { type: 'lambCaught', lambId: 'lavender' },
        cheatCode: null, eventOnly: true, lambSkin: true
    },
    lamb_honey: {
        id: 'lamb_honey', name: 'Lamb: Honey',
        description: 'An amber golden lamb costume. Rare!',
        body: 0xDAA520, detail: 0xBB8A18, nose: 0xEEBB44, hooves: 0x886610,
        collar: 0xFFFFFF, eyeWhite: 0xffffff, pupil: 0x111111,
        tailOverride: 'lamb', unlocked: false, unlockCondition: { type: 'lambCaught', lambId: 'honey' },
        cheatCode: null, eventOnly: true, lambSkin: true
    },
    lamb_strawberry: {
        id: 'lamb_strawberry', name: 'Lamb: Strawberry',
        description: 'A juicy red-pink lamb costume. Rare!',
        body: 0xFF6B81, detail: 0xDD5568, nose: 0xFF99AA, hooves: 0xBB4455,
        collar: 0xFFFFFF, eyeWhite: 0xffffff, pupil: 0x111111,
        tailOverride: 'lamb', unlocked: false, unlockCondition: { type: 'lambCaught', lambId: 'strawberry' },
        cheatCode: null, eventOnly: true, lambSkin: true
    },
    lamb_lilac: {
        id: 'lamb_lilac', name: 'Lamb: Lilac',
        description: 'A dusty violet lamb costume. Ultra Rare!',
        body: 0xB589D6, detail: 0x9970BB, nose: 0xCCAAEE, hooves: 0x775599,
        collar: 0xFFFFFF, eyeWhite: 0xffffff, pupil: 0x111111,
        tailOverride: 'lamb', unlocked: false, unlockCondition: { type: 'lambCaught', lambId: 'lilac' },
        cheatCode: null, eventOnly: true, lambSkin: true
    },
    lamb_cocoa: {
        id: 'lamb_cocoa', name: 'Lamb: Cocoa',
        description: 'A rich chocolate lamb costume. Ultra Rare!',
        body: 0x8B6914, detail: 0x735510, nose: 0xAA8833, hooves: 0x55440A,
        collar: 0xFFFFFF, eyeWhite: 0xffffff, pupil: 0x111111,
        tailOverride: 'lamb', unlocked: false, unlockCondition: { type: 'lambCaught', lambId: 'cocoa' },
        cheatCode: null, eventOnly: true, lambSkin: true
    },
    lamb_ocean: {
        id: 'lamb_ocean', name: 'Lamb: Ocean',
        description: 'A shimmering teal lamb costume. Epic!',
        body: 0x4ECDC4, detail: 0x3BB5AA, nose: 0x77DDCC, hooves: 0x2A9988,
        collar: 0xFFFFFF, eyeWhite: 0xffffff, pupil: 0x111111,
        tailOverride: 'lamb', unlocked: false, unlockCondition: { type: 'lambCaught', lambId: 'ocean' },
        cheatCode: null, eventOnly: true, lambSkin: true
    },
    lamb_moonbeam: {
        id: 'lamb_moonbeam', name: 'Lamb: Moonbeam',
        description: 'A legendary silver lamb costume. GODLY! Only 1% chance!',
        body: 0xC0C0C0, detail: 0xA8A8A8, nose: 0xDDDDDD, hooves: 0x888888,
        collar: 0xFFFFFF, eyeWhite: 0xffffff, pupil: 0xFFDD00,
        tailOverride: 'lamb', unlocked: false, unlockCondition: { type: 'lambCaught', lambId: 'moonbeam' },
        cheatCode: null, eventOnly: true, lambSkin: true
    },
    lamb_blossom: {
        id: 'lamb_blossom', name: 'Lamb: Blossom',
        description: 'The mythical Easter Symbol lamb. Leaves cherry blossom trails wherever you walk. 0.0001% chance!',
        body: 0xFF69B4, detail: 0xE0559A, nose: 0xFF88CC, hooves: 0xCC4488,
        collar: 0xFFFFFF, eyeWhite: 0xffffff, pupil: 0xFF1493,
        tailOverride: 'lamb', unlocked: false, unlockCondition: { type: 'lambCaught', lambId: 'blossom' },
        cheatCode: null, eventOnly: true, lambSkin: true, leavesPetalTrail: true
    }
};
