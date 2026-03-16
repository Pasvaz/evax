/**
 * ============================================================================
 * WORLD MAP
 * ============================================================================
 *
 * Full-screen hand-drawn style SVG map showing all biomes,
 * landmarks, and player position. Toggle with M key.
 *
 * ============================================================================
 */

window.WorldMap = (function() {
    'use strict';

    var isOpen = false;

    // Map layout — pixel positions for each biome region on the SVG canvas (800x600)
    // Arboreal = center-bottom, Savannah = center-top, Snowy = right-top, Coastal = center-bottom-bottom
    var BIOME_LAYOUT = {
        arboreal:        { x: 200, y: 250, w: 280, h: 180 },
        savannah:        { x: 200, y: 50,  w: 280, h: 180 },
        snowy_mountains: { x: 500, y: 50,  w: 250, h: 180 },
        coastal:         { x: 200, y: 450, w: 280, h: 130 }
    };

    // Connection lines between biomes (from center of one to center of another)
    var CONNECTIONS = [
        { from: 'arboreal', to: 'savannah',        label: 'N' },
        { from: 'arboreal', to: 'coastal',          label: 'S' },
        { from: 'savannah', to: 'snowy_mountains',  label: 'W' }
    ];

    /**
     * Build the SVG string for the full world map.
     */
    function buildMapSVG() {
        var svg = '';
        svg += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" class="world-map-svg">';

        // --- Defs: filters, patterns, markers ---
        svg += '<defs>';
        // Parchment texture filter
        svg += '<filter id="parchment-noise" x="0%" y="0%" width="100%" height="100%">';
        svg += '<feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>';
        svg += '<feColorMatrix type="saturate" values="0" in="noise" result="grayNoise"/>';
        svg += '<feBlend in="SourceGraphic" in2="grayNoise" mode="multiply"/>';
        svg += '</filter>';
        // Fog overlay for locked biomes
        svg += '<filter id="fog-filter">';
        svg += '<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="fog"/>';
        svg += '<feColorMatrix type="saturate" values="0" in="fog" result="grayFog"/>';
        svg += '<feComponentTransfer in="grayFog" result="thickFog">';
        svg += '<feFuncA type="linear" slope="0.7" intercept="0.1"/>';
        svg += '</feComponentTransfer>';
        svg += '<feBlend in="SourceGraphic" in2="thickFog" mode="normal"/>';
        svg += '</filter>';
        // Hand-drawn wobble
        svg += '<filter id="sketchy">';
        svg += '<feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="2" result="warp"/>';
        svg += '<feDisplacementMap in="SourceGraphic" in2="warp" scale="2" xChannelSelector="R" yChannelSelector="G"/>';
        svg += '</filter>';
        svg += '</defs>';

        // --- Background: parchment ---
        svg += '<rect width="800" height="600" fill="#f4e4c1" rx="12" ry="12"/>';
        svg += '<rect width="800" height="600" fill="#e8d5a3" rx="12" ry="12" opacity="0.3" filter="url(#parchment-noise)"/>';

        // --- Border frame (hand-drawn double line) ---
        svg += '<rect x="12" y="12" width="776" height="576" fill="none" stroke="#8b7355" stroke-width="3" rx="8" ry="8" filter="url(#sketchy)"/>';
        svg += '<rect x="18" y="18" width="764" height="564" fill="none" stroke="#8b7355" stroke-width="1" rx="6" ry="6" opacity="0.5" filter="url(#sketchy)"/>';

        // --- Title ---
        svg += '<text x="400" y="42" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#5a3e28" font-style="italic" letter-spacing="3">The World of Evax</text>';

        // --- Compass rose (bottom-right) ---
        svg += drawCompass(720, 530, 30);

        // --- Connection paths (drawn before biomes so they go behind) ---
        CONNECTIONS.forEach(function(conn) {
            svg += drawConnection(conn);
        });

        // --- Biome regions ---
        svg += drawArboreal();
        svg += drawSavannah();
        svg += drawSnowyMountains();
        svg += drawCoastal();

        // --- Fog overlays for locked biomes ---
        svg += '<g id="map-fog-savannah" class="map-fog">' + drawLockedOverlay('savannah', 'Score 500') + '</g>';
        svg += '<g id="map-fog-snowy" class="map-fog">' + drawLockedOverlay('snowy_mountains', 'Skull Required') + '</g>';
        svg += '<g id="map-fog-coastal" class="map-fog">' + drawLockedOverlay('coastal', 'Seal Tooth Required') + '</g>';

        // --- Player icon (peccary) ---
        svg += '<g id="map-player-icon" transform="translate(340, 340)">';
        svg += drawPeccaryIcon(0, 0, 1);
        svg += '</g>';

        // --- Legend ---
        svg += drawLegend();

        svg += '</svg>';
        return svg;
    }

    // ========================================================================
    // BIOME DRAWINGS
    // ========================================================================

    function drawArboreal() {
        var b = BIOME_LAYOUT.arboreal;
        var svg = '<g id="map-biome-arboreal">';

        // Region fill — forest green with wobble
        svg += '<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" fill="#7db87d" stroke="#4a6b4a" stroke-width="2" rx="6" filter="url(#sketchy)"/>';

        // Trees (scattered small triangles)
        var treePositions = [
            [30, 30], [60, 50], [90, 25], [130, 60], [160, 35],
            [200, 45], [230, 70], [50, 100], [100, 120], [140, 95],
            [180, 130], [220, 110], [250, 85], [70, 150], [160, 155]
        ];
        treePositions.forEach(function(pos) {
            svg += drawTree(b.x + pos[0], b.y + pos[1], 0.6 + Math.random() * 0.4);
        });

        // River — wavy line from bottom-left to upper-middle
        svg += '<path d="M' + (b.x + 20) + ',' + (b.y + b.h - 10) +
            ' C' + (b.x + 60) + ',' + (b.y + b.h - 40) +
            ' ' + (b.x + 100) + ',' + (b.y + 80) +
            ' ' + (b.x + 140) + ',' + (b.y + 30) + '"' +
            ' fill="none" stroke="#5b8fa8" stroke-width="4" stroke-linecap="round" opacity="0.8" filter="url(#sketchy)"/>';
        // Second thin line for river effect
        svg += '<path d="M' + (b.x + 22) + ',' + (b.y + b.h - 12) +
            ' C' + (b.x + 62) + ',' + (b.y + b.h - 42) +
            ' ' + (b.x + 102) + ',' + (b.y + 78) +
            ' ' + (b.x + 142) + ',' + (b.y + 28) + '"' +
            ' fill="none" stroke="#7cb8d4" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>';

        // Village — cluster of small houses
        svg += drawVillage(b.x + 35, b.y + 30);

        // Label
        svg += '<text x="' + (b.x + b.w / 2) + '" y="' + (b.y + b.h - 8) + '" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#2a4a2a" font-weight="bold">Arboreal Biome</text>';

        // "YOU START HERE" small text for first-timers
        svg += '<text x="' + (b.x + 45) + '" y="' + (b.y + 50) + '" text-anchor="middle" font-family="Georgia, serif" font-size="8" fill="#5a3e28" font-style="italic" opacity="0.7">Village</text>';

        svg += '</g>';
        return svg;
    }

    function drawSavannah() {
        var b = BIOME_LAYOUT.savannah;
        var svg = '<g id="map-biome-savannah">';

        // Region fill — golden
        svg += '<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" fill="#d4b84a" stroke="#9a8530" stroke-width="2" rx="6" filter="url(#sketchy)"/>';

        // Acacia trees (flat-top style)
        var acaciaPositions = [[50, 40], [140, 30], [230, 50], [80, 120], [190, 140], [260, 100]];
        acaciaPositions.forEach(function(pos) {
            svg += drawAcacia(b.x + pos[0], b.y + pos[1], 0.7 + Math.random() * 0.3);
        });

        // Watering hole — circle in center
        svg += '<ellipse cx="' + (b.x + b.w / 2) + '" cy="' + (b.y + b.h / 2 + 5) + '" rx="22" ry="14" fill="#6b9eb8" stroke="#4a7a8a" stroke-width="1.5" opacity="0.8" filter="url(#sketchy)"/>';
        svg += '<text x="' + (b.x + b.w / 2) + '" y="' + (b.y + b.h / 2 + 22) + '" text-anchor="middle" font-family="Georgia, serif" font-size="7" fill="#4a6a3a" font-style="italic">Watering Hole</text>';

        // Research hut icon (small hut with magnifying glass)
        svg += drawResearchHut(b.x + 235, b.y + 75);

        // Grass tufts (small v-shapes)
        for (var i = 0; i < 12; i++) {
            var gx = b.x + 30 + Math.random() * (b.w - 60);
            var gy = b.y + 20 + Math.random() * (b.h - 40);
            svg += '<path d="M' + gx + ',' + gy + ' l-2,-5 l2,2 l2,-2 z" fill="#a89830" opacity="0.6"/>';
        }

        // Label
        svg += '<text x="' + (b.x + b.w / 2) + '" y="' + (b.y + b.h - 8) + '" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#5a4a1a" font-weight="bold">New World Savannah</text>';

        svg += '</g>';
        return svg;
    }

    function drawSnowyMountains() {
        var b = BIOME_LAYOUT.snowy_mountains;
        var svg = '<g id="map-biome-snowy">';

        // Region fill — icy white/grey
        svg += '<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" fill="#d8dce8" stroke="#8899aa" stroke-width="2" rx="6" filter="url(#sketchy)"/>';

        // Mountain peaks (large triangles)
        var peaks = [[50, 140], [120, 130], [180, 145], [80, 110], [155, 100]];
        peaks.forEach(function(pos) {
            var size = 20 + Math.random() * 15;
            svg += '<polygon points="' +
                (b.x + pos[0]) + ',' + (b.y + pos[1]) + ' ' +
                (b.x + pos[0] - size * 0.6) + ',' + (b.y + pos[1] + size * 0.7) + ' ' +
                (b.x + pos[0] + size * 0.6) + ',' + (b.y + pos[1] + size * 0.7) + '"' +
                ' fill="#eef2f8" stroke="#8899aa" stroke-width="1.5" filter="url(#sketchy)"/>';
            // Snow cap
            svg += '<polygon points="' +
                (b.x + pos[0]) + ',' + (b.y + pos[1]) + ' ' +
                (b.x + pos[0] - size * 0.25) + ',' + (b.y + pos[1] + size * 0.3) + ' ' +
                (b.x + pos[0] + size * 0.25) + ',' + (b.y + pos[1] + size * 0.3) + '"' +
                ' fill="white" stroke="none" opacity="0.9"/>';
        });

        // Snowflake dots
        for (var i = 0; i < 20; i++) {
            var sx = b.x + 15 + Math.random() * (b.w - 30);
            var sy = b.y + 15 + Math.random() * (b.h - 50);
            svg += '<circle cx="' + sx + '" cy="' + sy + '" r="1.2" fill="white" opacity="' + (0.4 + Math.random() * 0.4) + '"/>';
        }

        // Temple icon
        svg += drawTemple(b.x + 200, b.y + 55);

        // Label
        svg += '<text x="' + (b.x + b.w / 2) + '" y="' + (b.y + b.h - 8) + '" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#4a5a6a" font-weight="bold">Snowy Mountains</text>';

        svg += '</g>';
        return svg;
    }

    function drawCoastal() {
        var b = BIOME_LAYOUT.coastal;
        var svg = '<g id="map-biome-coastal">';

        // Region — split into forest (top) and beach/ocean (bottom)
        svg += '<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + (b.h * 0.5) + '" fill="#6b8b6b" stroke="#4a6b4a" stroke-width="2" rx="6" ry="0" filter="url(#sketchy)"/>';
        // Beach strip
        svg += '<rect x="' + b.x + '" y="' + (b.y + b.h * 0.5) + '" width="' + b.w + '" height="' + (b.h * 0.2) + '" fill="#e8d5a0" stroke="none"/>';
        // Ocean
        svg += '<rect x="' + b.x + '" y="' + (b.y + b.h * 0.7) + '" width="' + b.w + '" height="' + (b.h * 0.3) + '" fill="#4a8aaa" stroke="#4a6b4a" stroke-width="2" rx="0" ry="6" filter="url(#sketchy)"/>';

        // Birch trees (thin white trunks)
        var birchPositions = [[30, 15], [70, 25], [120, 10], [170, 20], [220, 15], [250, 28]];
        birchPositions.forEach(function(pos) {
            svg += drawBirchTree(b.x + pos[0], b.y + pos[1], 0.5);
        });

        // Wave lines in ocean
        for (var w = 0; w < 3; w++) {
            var wy = b.y + b.h * 0.75 + w * 10;
            svg += '<path d="M' + b.x + ',' + wy +
                ' q20,-4 40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0"' +
                ' fill="none" stroke="#6baaca" stroke-width="1" opacity="' + (0.5 - w * 0.12) + '"/>';
        }

        // Shells on beach
        for (var s = 0; s < 5; s++) {
            var shx = b.x + 40 + Math.random() * (b.w - 80);
            var shy = b.y + b.h * 0.52 + Math.random() * (b.h * 0.15);
            svg += '<circle cx="' + shx + '" cy="' + shy + '" r="2" fill="#d4a070" stroke="#b8845a" stroke-width="0.5" opacity="0.7"/>';
        }

        // Label
        svg += '<text x="' + (b.x + b.w / 2) + '" y="' + (b.y + b.h - 5) + '" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="white" font-weight="bold">Coastal Biome</text>';

        svg += '</g>';
        return svg;
    }

    // ========================================================================
    // LANDMARK DRAWINGS
    // ========================================================================

    function drawTree(x, y, scale) {
        var s = scale || 1;
        return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
            '<line x1="0" y1="0" x2="0" y2="10" stroke="#6b4a28" stroke-width="2"/>' +
            '<polygon points="0,-8 -6,4 6,4" fill="#3a7a3a" stroke="#2a5a2a" stroke-width="0.5"/>' +
            '<polygon points="0,-14 -5,0 5,0" fill="#4a8a4a" stroke="none" opacity="0.8"/>' +
            '</g>';
    }

    function drawAcacia(x, y, scale) {
        var s = scale || 1;
        return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
            '<line x1="0" y1="5" x2="0" y2="15" stroke="#8a6a3a" stroke-width="1.5"/>' +
            '<ellipse cx="0" cy="2" rx="10" ry="5" fill="#7a9a3a" stroke="#5a7a2a" stroke-width="0.5"/>' +
            '</g>';
    }

    function drawBirchTree(x, y, scale) {
        var s = scale || 1;
        return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
            '<line x1="0" y1="0" x2="0" y2="18" stroke="#e8e0d0" stroke-width="2"/>' +
            '<circle cx="0" cy="-4" r="7" fill="#5a8a5a" stroke="#3a6a3a" stroke-width="0.5" opacity="0.8"/>' +
            '</g>';
    }

    function drawVillage(x, y) {
        var svg = '<g transform="translate(' + x + ',' + y + ')">';
        // Three small huts
        svg += drawHutIcon(-10, 0, 0.8);
        svg += drawHutIcon(5, -5, 1);
        svg += drawHutIcon(12, 5, 0.7);
        // Fence/path dots
        svg += '<circle cx="-2" cy="10" r="1" fill="#8b7355" opacity="0.5"/>';
        svg += '<circle cx="3" cy="12" r="1" fill="#8b7355" opacity="0.5"/>';
        svg += '<circle cx="8" cy="11" r="1" fill="#8b7355" opacity="0.5"/>';
        svg += '</g>';
        return svg;
    }

    function drawHutIcon(x, y, scale) {
        var s = scale || 1;
        return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
            '<rect x="-4" y="0" width="8" height="6" fill="#d4b880" stroke="#8b7355" stroke-width="0.8"/>' +
            '<polygon points="0,-5 -6,0 6,0" fill="#a05a3a" stroke="#8b4a2a" stroke-width="0.5"/>' +
            '<rect x="-1" y="2" width="2" height="4" fill="#6b4a28"/>' +
            '</g>';
    }

    function drawResearchHut(x, y) {
        return '<g transform="translate(' + x + ',' + y + ')">' +
            '<circle cx="0" cy="2" r="7" fill="#c4a870" stroke="#8b7355" stroke-width="1"/>' +
            '<polygon points="0,-8 -9,2 9,2" fill="#8a5a3a" stroke="#6b4a2a" stroke-width="0.5"/>' +
            // Magnifying glass icon
            '<circle cx="5" cy="-3" r="3" fill="none" stroke="#4a3a2a" stroke-width="1"/>' +
            '<line x1="7" y1="-1" x2="10" y2="2" stroke="#4a3a2a" stroke-width="1"/>' +
            '<text x="0" y="16" text-anchor="middle" font-family="Georgia, serif" font-size="7" fill="#5a3e28" font-style="italic">Research Hut</text>' +
            '</g>';
    }

    function drawTemple(x, y) {
        return '<g transform="translate(' + x + ',' + y + ')">' +
            // Base platform
            '<rect x="-12" y="5" width="24" height="4" fill="#a0a0b0" stroke="#707080" stroke-width="0.8" rx="1"/>' +
            // Pillars
            '<rect x="-10" y="-8" width="3" height="13" fill="#b0b0c0" stroke="#808090" stroke-width="0.5"/>' +
            '<rect x="7" y="-8" width="3" height="13" fill="#b0b0c0" stroke="#808090" stroke-width="0.5"/>' +
            // Roof/pediment
            '<polygon points="0,-15 -14,-8 14,-8" fill="#c0c0d0" stroke="#808090" stroke-width="0.8"/>' +
            // Star/artifact glow
            '<circle cx="0" cy="-2" r="2" fill="#ffd700" opacity="0.7"/>' +
            '<circle cx="0" cy="-2" r="4" fill="#ffd700" opacity="0.2"/>' +
            '<text x="0" y="16" text-anchor="middle" font-family="Georgia, serif" font-size="7" fill="#5a5a6a" font-style="italic">Snow Temple</text>' +
            '</g>';
    }

    // ========================================================================
    // LOCKED OVERLAY
    // ========================================================================

    function drawLockedOverlay(biomeId, requirementText) {
        var b = BIOME_LAYOUT[biomeId];
        if (!b) return '';

        var svg = '';
        // Fog rectangle
        // Padlock icon (no fog — biome stays visible)
        var cx = b.x + b.w / 2;
        var cy = b.y + b.h / 2 - 10;
        svg += '<g transform="translate(' + cx + ',' + cy + ')">';
        // Lock body
        svg += '<rect x="-8" y="0" width="16" height="12" fill="#5a4a3a" stroke="#3a2a1a" stroke-width="1" rx="2"/>';
        // Lock shackle
        svg += '<path d="M-5,0 C-5,-10 5,-10 5,0" fill="none" stroke="#3a2a1a" stroke-width="2"/>';
        // Keyhole
        svg += '<circle cx="0" cy="5" r="2" fill="#2a1a0a"/>';
        svg += '<rect x="-1" y="5" width="2" height="4" fill="#2a1a0a"/>';
        svg += '</g>';

        // Requirement text
        svg += '<text x="' + cx + '" y="' + (cy + 25) + '" text-anchor="middle" font-family="Georgia, serif" font-size="9" fill="#3a2a1a" font-style="italic">' + requirementText + '</text>';

        return svg;
    }

    // ========================================================================
    // CONNECTION PATHS
    // ========================================================================

    function drawConnection(conn) {
        var from = BIOME_LAYOUT[conn.from];
        var to = BIOME_LAYOUT[conn.to];
        if (!from || !to) return '';

        var fromCx = from.x + from.w / 2;
        var fromCy = from.y + from.h / 2;
        var toCx = to.x + to.w / 2;
        var toCy = to.y + to.h / 2;

        // Clip to edges of biome rects
        var pts = clipLineToRects(fromCx, fromCy, toCx, toCy, from, to);

        // Dashed path
        var svg = '<line x1="' + pts.x1 + '" y1="' + pts.y1 + '" x2="' + pts.x2 + '" y2="' + pts.y2 + '"' +
            ' stroke="#8b7355" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.6"/>';

        return svg;
    }

    function clipLineToRects(x1, y1, x2, y2, r1, r2) {
        // Simple: just use the edge midpoints based on direction
        var dx = x2 - x1;
        var dy = y2 - y1;

        var startX = x1, startY = y1, endX = x2, endY = y2;

        if (Math.abs(dy) > Math.abs(dx)) {
            // Mostly vertical
            if (dy < 0) { startY = r1.y; endY = r2.y + r2.h; }
            else { startY = r1.y + r1.h; endY = r2.y; }
        } else {
            // Mostly horizontal
            if (dx < 0) { startX = r1.x; endX = r2.x + r2.w; }
            else { startX = r1.x + r1.w; endX = r2.x; }
        }

        return { x1: startX, y1: startY, x2: endX, y2: endY };
    }

    // ========================================================================
    // COMPASS ROSE
    // ========================================================================

    function drawCompass(cx, cy, size) {
        var s = size;
        var svg = '<g transform="translate(' + cx + ',' + cy + ')" opacity="0.6">';
        // Circle
        svg += '<circle cx="0" cy="0" r="' + s + '" fill="none" stroke="#8b7355" stroke-width="1"/>';
        // N arrow
        svg += '<polygon points="0,' + (-s + 3) + ' -4,' + (-s + 14) + ' 4,' + (-s + 14) + '" fill="#8b7355"/>';
        // Labels
        svg += '<text x="0" y="' + (-s - 3) + '" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="#5a3e28" font-weight="bold">N</text>';
        svg += '<text x="0" y="' + (s + 10) + '" text-anchor="middle" font-family="Georgia, serif" font-size="8" fill="#8b7355">S</text>';
        svg += '<text x="' + (s + 7) + '" y="4" text-anchor="middle" font-family="Georgia, serif" font-size="8" fill="#8b7355">E</text>';
        svg += '<text x="' + (-s - 7) + '" y="4" text-anchor="middle" font-family="Georgia, serif" font-size="8" fill="#8b7355">W</text>';
        svg += '</g>';
        return svg;
    }

    // ========================================================================
    // PECCARY ICON
    // ========================================================================

    function drawPeccaryIcon(x, y, scale) {
        var s = scale || 1;
        return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
            // Body
            '<ellipse cx="0" cy="0" rx="7" ry="5" fill="#5a5a5a" stroke="#3a3a3a" stroke-width="1"/>' +
            // Head
            '<ellipse cx="8" cy="-1" rx="4" ry="3" fill="#4a4a4a" stroke="#3a3a3a" stroke-width="0.8"/>' +
            // Snout
            '<ellipse cx="12" cy="0" rx="2.5" ry="2" fill="#6a5a4a" stroke="#4a3a2a" stroke-width="0.5"/>' +
            // Eye
            '<circle cx="9" cy="-2" r="1" fill="white"/>' +
            '<circle cx="9.3" cy="-2" r="0.5" fill="black"/>' +
            // Ear
            '<ellipse cx="6" cy="-4" rx="1.5" ry="2" fill="#5a5a5a" stroke="#3a3a3a" stroke-width="0.5"/>' +
            // Legs
            '<line x1="-3" y1="5" x2="-3" y2="9" stroke="#3a3a3a" stroke-width="1.5"/>' +
            '<line x1="3" y1="5" x2="3" y2="9" stroke="#3a3a3a" stroke-width="1.5"/>' +
            // Tail
            '<path d="M-7,0 C-10,-2 -11,1 -9,2" fill="none" stroke="#4a4a4a" stroke-width="1"/>' +
            // Glow ring
            '<circle cx="0" cy="0" r="12" fill="none" stroke="#ffd700" stroke-width="1.5" opacity="0.5">' +
            '<animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite"/>' +
            '</circle>' +
            '</g>';
    }

    // ========================================================================
    // LEGEND
    // ========================================================================

    function drawLegend() {
        var svg = '<g transform="translate(30, 490)" opacity="0.7">';
        svg += '<text x="0" y="0" font-family="Georgia, serif" font-size="9" fill="#5a3e28" font-weight="bold">Legend</text>';

        // Village
        svg += drawHutIcon(8, 12, 0.6);
        svg += '<text x="18" y="16" font-family="Georgia, serif" font-size="8" fill="#5a3e28">Village</text>';

        // Water
        svg += '<line x1="2" y1="26" x2="14" y2="26" stroke="#5b8fa8" stroke-width="2"/>';
        svg += '<text x="18" y="29" font-family="Georgia, serif" font-size="8" fill="#5a3e28">Water</text>';

        // Temple
        svg += '<polygon points="8,36 4,42 12,42" fill="#b0b0c0" stroke="#808090" stroke-width="0.5"/>';
        svg += '<text x="18" y="42" font-family="Georgia, serif" font-size="8" fill="#5a3e28">Temple</text>';

        // Player
        svg += '<ellipse cx="8" cy="52" rx="4" ry="3" fill="#5a5a5a" stroke="#ffd700" stroke-width="1"/>';
        svg += '<text x="18" y="55" font-family="Georgia, serif" font-size="8" fill="#5a3e28">You</text>';

        svg += '</g>';
        return svg;
    }

    // ========================================================================
    // PLAYER POSITION MAPPING
    // ========================================================================

    /**
     * Map the player's world position to a pixel position on the SVG map.
     */
    function getPlayerMapPosition() {
        if (!GameState.peccary) return { x: 340, y: 340 };

        var biomeId = GameState.currentBiome || 'arboreal';
        var b = BIOME_LAYOUT[biomeId];
        if (!b) return { x: 340, y: 340 };

        var worldSize = CONFIG.WORLD_SIZE;
        // Player position in world: x is -worldSize to +worldSize, z is -worldSize to +worldSize
        var px = GameState.peccary.position.x;
        var pz = GameState.peccary.position.z;

        // Normalize to 0-1 within the biome
        var nx = (px + worldSize) / (worldSize * 2);
        var nz = (pz + worldSize) / (worldSize * 2);

        // Map to biome rect on SVG
        var mapX = b.x + nx * b.w;
        var mapY = b.y + nz * b.h;

        return { x: mapX, y: mapY };
    }

    // ========================================================================
    // UPDATE FOG / LOCKED STATE
    // ========================================================================

    function updateLockState() {
        var score = GameState.score || 0;
        var artifacts = GameState.artifacts || [];
        var given = GameState.artifactsGiven || [];
        var allArtifacts = artifacts.concat(given);

        // Savannah: score >= 500
        var savannahFog = document.getElementById('map-fog-savannah');
        if (savannahFog) {
            savannahFog.style.display = (score >= 500 || GameState.isTestingMode) ? 'none' : '';
        }

        // Snowy: need skull
        var snowyFog = document.getElementById('map-fog-snowy');
        if (snowyFog) {
            var hasSkull = allArtifacts.indexOf('felis_dronglaticus_skull') !== -1;
            snowyFog.style.display = (hasSkull || GameState.isTestingMode) ? 'none' : '';
        }

        // Coastal: need seal tooth
        var coastalFog = document.getElementById('map-fog-coastal');
        if (coastalFog) {
            var hasTooth = allArtifacts.indexOf('uronal_seal_tooth') !== -1;
            coastalFog.style.display = (hasTooth || GameState.isTestingMode) ? 'none' : '';
        }
    }

    /**
     * Update player icon position on the map.
     */
    function updatePlayerPosition() {
        var icon = document.getElementById('map-player-icon');
        if (!icon) return;
        var pos = getPlayerMapPosition();
        icon.setAttribute('transform', 'translate(' + pos.x + ',' + pos.y + ')');
    }

    // ========================================================================
    // OPEN / CLOSE
    // ========================================================================

    function open() {
        if (isOpen) return;
        if (!GameState.gameRunning) return;

        isOpen = true;

        var container = document.getElementById('world-map-container');
        if (!container) return;

        // Build SVG fresh each time (to randomize small decorative elements)
        container.innerHTML = buildMapSVG();
        container.classList.remove('hidden');

        // Click backdrop to close
        container.onclick = function(e) {
            if (e.target === container) close();
        };

        // Update lock states and player position
        updateLockState();
        updatePlayerPosition();
    }

    function close() {
        if (!isOpen) return;
        isOpen = false;

        var container = document.getElementById('world-map-container');
        if (container) {
            container.classList.add('hidden');
        }
    }

    function toggle() {
        if (isOpen) close();
        else open();
    }

    // ========================================================================
    // PUBLIC API
    // ========================================================================

    return {
        open: open,
        close: close,
        toggle: toggle,
        isOpen: function() { return isOpen; },
        updatePlayerPosition: updatePlayerPosition
    };

})();
