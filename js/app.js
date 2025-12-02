// js/app.js
import { initMap, zoomToCountry, setCountryHighlight, loadAdminLevel, clearAdminLevels } from './map.js';
import { populateCountryDropdown, createAdminButtons, showFeaturePanel, hideFeaturePanel } from './ui.js';

// Global state
const state = {
    currentCountry: null,
    currentLevel: 0,
    countriesConfig: null
};

// Initialize application
async function init() {
    // Load countries configuration
    const response = await fetch('data/countries_config.json');
    state.countriesConfig = await response.json();

    // Initialize map
    const map = await initMap();

    // Populate country dropdown
    populateCountryDropdown(state.countriesConfig);

    // Event: Country selection
    document.getElementById('country-select').addEventListener('change', async (e) => {
        const countryId = e.target.value;

        if (!countryId) {
            clearAdminLevels(map);
            hideAdminButtons();
            return;
        }

        const countryConfig = state.countriesConfig[countryId];
        state.currentCountry = countryConfig;
        state.currentLevel = 0;

        // Zoom to country bounds
        zoomToCountry(map, countryConfig.bounds);

        // Highlight country outline (Level 0)
        setCountryHighlight(map, countryConfig.display_name);

        // Show admin level buttons
        createAdminButtons(countryConfig.max_admin_level, handleLevelClick);

        // Update country info
        updateCountryInfo(countryConfig);
    });

    // Event: Map click for feature info
    map.on('click', 'admin-boundaries-fill', (e) => {
        if (e.features.length > 0) {
            const feature = e.features[0];
            showFeaturePanel(feature.properties, state.currentLevel);
        }
    });

    // Cursor change on hover
    map.on('mouseenter', 'admin-boundaries-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'admin-boundaries-fill', () => {
        map.getCanvas().style.cursor = '';
    });
}

// Handle admin level button clicks
async function handleLevelClick(level) {
    if (!state.currentCountry) return;

    state.currentLevel = level;

    // Update button states
    updateButtonStates(level);

    // Load admin boundaries for selected level
    await loadAdminLevel(
        state.currentCountry.feature_class,
        level
    );
}

// Update country info display
function updateCountryInfo(config) {
    document.getElementById('country-info').style.display = 'block';
    document.getElementById('country-name').textContent = config.display_name;
    document.getElementById('country-stats').textContent =
        `${config.feature_count.toLocaleString()} administrative units | ` +
        `${config.max_admin_level} admin levels`;
}

// Update active button state
function updateButtonStates(activeLevel) {
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.level) === activeLevel);
    });
}

function hideAdminButtons() {
    document.getElementById('admin-level-buttons').style.display = 'none';
    document.getElementById('country-info').style.display = 'none';
}

// Start application
init();
