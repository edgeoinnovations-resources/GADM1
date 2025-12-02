// js/ui.js

export function populateCountryDropdown(countriesConfig) {
    const select = document.getElementById('country-select');

    // Sort countries alphabetically by display name
    const sorted = Object.entries(countriesConfig)
        .sort((a, b) => a[1].display_name.localeCompare(b[1].display_name));

    sorted.forEach(([id, config]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = `${config.display_name} (${config.max_admin_level} levels)`;
        select.appendChild(option);
    });
}

export function createAdminButtons(maxLevel, clickHandler) {
    const container = document.getElementById('level-buttons');
    const wrapper = document.getElementById('admin-level-buttons');

    // Clear existing buttons
    container.innerHTML = '';

    // Level labels
    const levelLabels = {
        0: 'Country',
        1: 'Region/State',
        2: 'District/County',
        3: 'Sub-district',
        4: 'Municipality',
        5: 'Village/Ward'
    };

    // Create button for each available level
    for (let level = 0; level <= maxLevel; level++) {
        const btn = document.createElement('button');
        btn.className = 'level-btn' + (level === 0 ? ' active' : '');
        btn.dataset.level = level;
        btn.textContent = `Level ${level}: ${levelLabels[level] || 'Admin ' + level}`;
        btn.addEventListener('click', () => clickHandler(level));
        container.appendChild(btn);
    }

    // Show the button container
    wrapper.style.display = 'flex';
}

export function showFeaturePanel(properties, currentLevel) {
    const panel = document.getElementById('feature-panel');
    const title = document.getElementById('feature-title');
    const content = document.getElementById('feature-content');

    // Determine the name field based on current level
    const nameField = currentLevel > 0 ? `NAME_${currentLevel}` : 'NAME_0';
    const typeField = currentLevel > 0 ? `ENGTYPE_${currentLevel}` : null;

    title.textContent = properties[nameField] || 'Unknown';

    // Build content HTML
    let html = '<table class="feature-table">';

    // Priority fields to show first
    const priorityFields = [
        'NAME_0', 'COUNTRY', 'CONTINENT',
        'NAME_1', 'TYPE_1', 'ENGTYPE_1',
        'NAME_2', 'TYPE_2', 'ENGTYPE_2',
        'NAME_3', 'TYPE_3', 'ENGTYPE_3',
        'NAME_4', 'TYPE_4', 'ENGTYPE_4',
        'NAME_5', 'TYPE_5', 'ENGTYPE_5'
    ];

    // Show relevant fields based on level
    const fieldsToShow = priorityFields.filter(f =>
        properties[f] &&
            properties[f] !== '' &&
            f.match(/[0-5]$/) ? parseInt(f.slice(-1)) <= currentLevel : true
    );

    fieldsToShow.forEach(field => {
        const label = formatFieldLabel(field);
        const value = properties[field];
        html += `<tr><th>${label}</th><td>${value}</td></tr>`;
    });

    html += '</table>';
    content.innerHTML = html;

    panel.style.display = 'block';
}

export function hideFeaturePanel() {
    document.getElementById('feature-panel').style.display = 'none';
}

function formatFieldLabel(field) {
    const labels = {
        'NAME_0': 'Country',
        'NAME_1': 'Admin Level 1',
        'NAME_2': 'Admin Level 2',
        'NAME_3': 'Admin Level 3',
        'NAME_4': 'Admin Level 4',
        'NAME_5': 'Admin Level 5',
        'TYPE_1': 'Type (Local)',
        'TYPE_2': 'Type (Local)',
        'TYPE_3': 'Type (Local)',
        'TYPE_4': 'Type (Local)',
        'TYPE_5': 'Type (Local)',
        'ENGTYPE_1': 'Type (English)',
        'ENGTYPE_2': 'Type (English)',
        'ENGTYPE_3': 'Type (English)',
        'ENGTYPE_4': 'Type (English)',
        'ENGTYPE_5': 'Type (English)',
        'COUNTRY': 'Country',
        'CONTINENT': 'Continent',
        'SOVEREIGN': 'Sovereign State',
        'HASC_1': 'HASC Code',
        'HASC_2': 'HASC Code',
        'ISO_1': 'ISO Code'
    };
    return labels[field] || field.replace(/_/g, ' ');
}

// Close panel button
document.getElementById('close-panel')?.addEventListener('click', hideFeaturePanel);
