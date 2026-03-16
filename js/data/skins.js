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
    }
};
