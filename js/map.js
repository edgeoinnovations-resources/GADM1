// js/map.js

let mapInstance = null;
const pmtilesProtocol = new pmtiles.Protocol();

export async function initMap() {
    // Register PMTiles protocol
    maplibregl.addProtocol('pmtiles', pmtilesProtocol.tile);

    mapInstance = new maplibregl.Map({
        container: 'map',
        style: {
            version: 8,
            sources: {
                'osm': {
                    type: 'raster',
                    tiles: [
                        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    ],
                    tileSize: 256,
                    attribution: '© OpenStreetMap contributors'
                }
            },
            layers: [
                {
                    id: 'osm-tiles',
                    type: 'raster',
                    source: 'osm',
                    minzoom: 0,
                    maxzoom: 19
                }
            ]
        },
        center: [0, 20],
        zoom: 2,
        maxZoom: 14
    });

    // Add navigation controls
    mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');
    mapInstance.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    // Wait for map to load
    await new Promise(resolve => mapInstance.on('load', resolve));

    // Add country outlines source (for highlighting)
    mapInstance.addSource('country-outlines', {
        type: 'vector',
        url: 'pmtiles://https://pub-6106e7f2cf224a18b071c86dd9511e90.r2.dev/country_outlines.pmtiles'
    });

    // Add highlight layer (initially hidden)
    mapInstance.addLayer({
        id: 'country-highlight',
        type: 'line',
        source: 'country-outlines',
        'source-layer': 'admin_boundaries',
        paint: {
            'line-color': '#FFD700',  // Bright yellow
            'line-width': 4,
            'line-opacity': 0
        }
    });

    return mapInstance;
}

export function zoomToCountry(map, bounds) {
    map.fitBounds(bounds, {
        padding: 50,
        duration: 1000
    });
}

export function setCountryHighlight(map, countryName) {
    // Show highlight for selected country
    map.setPaintProperty('country-highlight', 'line-opacity', 1);
    map.setFilter('country-highlight', ['==', ['get', 'NAME_0'], countryName]);
}

export async function loadAdminLevel(featureClassId, level) {
    const map = mapInstance;

    // Remove existing admin boundaries layer
    if (map.getLayer('admin-boundaries-fill')) {
        map.removeLayer('admin-boundaries-fill');
        map.removeLayer('admin-boundaries-line');
    }
    if (map.getSource('admin-boundaries')) {
        map.removeSource('admin-boundaries');
    }

    // Add new source for this country
    map.addSource('admin-boundaries', {
        type: 'vector',
        url: `pmtiles://https://pub-6106e7f2cf224a18b071c86dd9511e90.r2.dev/countries/${featureClassId}.pmtiles`
    });

    // Determine which field to use for filtering by level
    const levelField = level > 0 ? `GID_${level}` : 'GID_0';

    // Build filter: show only features that have data at this level
    let filter;
    if (level === 0) {
        // Level 0: Show all (country boundary)
        filter = ['has', 'GID_0'];
    } else {
        // Higher levels: Filter to features that have this level defined
        filter = ['all',
            ['has', levelField],
            ['!=', ['get', levelField], ''],
            ['!=', ['get', levelField], null]
        ];
    }

    // Add fill layer
    map.addLayer({
        id: 'admin-boundaries-fill',
        type: 'fill',
        source: 'admin-boundaries',
        'source-layer': 'admin_boundaries',
        filter: filter,
        paint: {
            'fill-color': [
                'interpolate',
                ['linear'],
                ['zoom'],
                3, 'rgba(66, 135, 245, 0.2)',
                10, 'rgba(66, 135, 245, 0.4)'
            ],
            'fill-opacity': 0.6
        }
    });

    // Add line layer
    map.addLayer({
        id: 'admin-boundaries-line',
        type: 'line',
        source: 'admin-boundaries',
        'source-layer': 'admin_boundaries',
        filter: filter,
        paint: {
            'line-color': '#2563eb',
            'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                3, 0.5,
                10, 2
            ]
        }
    });
}

export function clearAdminLevels(map) {
    if (map.getLayer('admin-boundaries-fill')) {
        map.removeLayer('admin-boundaries-fill');
        map.removeLayer('admin-boundaries-line');
    }
    if (map.getSource('admin-boundaries')) {
        map.removeSource('admin-boundaries');
    }
    map.setPaintProperty('country-highlight', 'line-opacity', 0);
}
