// Collage Asset Generator Application

// Track selected tags for filtering
let selectedTags = [];

// Track selected blend mode
let selectedBlendMode = 'normal';

// Track custom image URL
let customImageUrl = '';

// Track text overlay
let textOverlayContent = '';
let textFontFamily = 'Arial, sans-serif';
let textFontSize = 24;
let textFontColor = '#212529';
let textFontBold = false;
let textFontItalic = false;
let textFontUnderline = false;

// Track overlay settings
let selectedOverlay = '';
let overlayOpacity = 100;
let overlayBlendMode = 'multiply';

// Track paint overlay settings
let paintColor = '#000000';
let paintOpacity = 100;
let paintEnabled = false;

// Layout patterns with grid positions
const layoutPatterns = [
    // Pattern 1: One half + two quarters
    {
        name: 'half-and-quarters',
        positions: [
            { colspan: 2, rowspan: 2 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 }
        ]
    },
    // Pattern 2: One half + three sixths
    {
        name: 'half-and-thirds',
        positions: [
            { colspan: 2, rowspan: 2 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 }
        ]
    },
    // Pattern 3: Two halves top, two quarters bottom
    {
        name: 'balanced-split',
        positions: [
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 }
        ]
    },
    // Pattern 4: Large + two small on side
    {
        name: 'large-with-side',
        positions: [
            { colspan: 2, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 }
        ]
    },
    // Pattern 5: One large, four small grid
    {
        name: 'large-with-grid',
        positions: [
            { colspan: 2, rowspan: 2 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 }
        ]
    },
    // Pattern 6: Two columns, varied heights
    {
        name: 'varied-columns',
        positions: [
            { colspan: 1, rowspan: 2 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 }
        ]
    },
    // Pattern 7: Full height on left, smaller images on right
    {
        name: 'full-height-left',
        positions: [
            { colspan: 1, rowspan: 2 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 }
        ]
    },
    // Pattern 8: Full height on right, smaller images on left
    {
        name: 'full-height-right',
        positions: [
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 2 }
        ]
    },
    // Pattern 9: One large centered, smaller around
    {
        name: 'center-focus',
        positions: [
            { colspan: 1, rowspan: 1 },
            { colspan: 2, rowspan: 2 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 }
        ]
    },
    // Pattern 10: Horizontal strip top, grid bottom
    {
        name: 'strip-and-grid',
        positions: [
            { colspan: 2, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 }
        ]
    },
    // Pattern 11: Diagonal emphasis
    {
        name: 'diagonal-focus',
        positions: [
            { colspan: 1, rowspan: 1 },
            { colspan: 2, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 }
        ]
    },
    // Pattern 12: Two tall columns
    {
        name: 'twin-towers',
        positions: [
            { colspan: 1, rowspan: 2 },
            { colspan: 1, rowspan: 2 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 }
        ]
    },
    // Pattern 13: Three rows, varied widths
    {
        name: 'stepped-pattern',
        positions: [
            { colspan: 2, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 }
        ]
    },
    // Pattern 14: One dominant, rest small
    {
        name: 'dominant-hero',
        positions: [
            { colspan: 2, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 }
        ]
    },
    // Pattern 15: Checkerboard asymmetric
    {
        name: 'checkerboard',
        positions: [
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 2 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 }
        ]
    }
];

function getRandomImages(count) {
    const shuffled = [...images].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function getRandomLayout() {
    return layoutPatterns[Math.floor(Math.random() * layoutPatterns.length)];
}

function renderCollage() {
    const container = document.getElementById('collage-container');
    container.innerHTML = '';

    // Get filtered images based on selected tags
    const filteredImages = filterImagesByTags(selectedTags);
    
    if (filteredImages.length === 0) {
        container.innerHTML = '<p class="no-images">No images match the selected filters</p>';
        return;
    }

    // Select random number of images between 3 and 6
    const imageCount = Math.floor(Math.random() * 4) + 3; // 3-6
    let selectedImagesData = filteredImages
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(imageCount, filteredImages.length));
    
    // Add custom image URL if provided and mix it randomly into the layout
    if (customImageUrl) {
        selectedImagesData.push({ path: customImageUrl, tags: ['custom'] });
        // Shuffle to randomize position
        for (let i = selectedImagesData.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [selectedImagesData[i], selectedImagesData[j]] = [selectedImagesData[j], selectedImagesData[i]];
        }
    }
    
    // Select a random layout pattern
    const layout = getRandomLayout();
    
    // If layout doesn't have enough positions, adjust
    let positions = layout.positions;
    if (positions.length > selectedImagesData.length) {
        positions = positions.slice(0, selectedImagesData.length);
    } else if (positions.length < selectedImagesData.length) {
        // Use default 1x1 for extra images
        while (positions.length < selectedImagesData.length) {
            positions.push({ colspan: 1, rowspan: 1 });
        }
    }

    // Set grid class based on layout
    container.className = `collage-container active layout-${layout.name}`;

    // Render each image with its grid positioning
    selectedImagesData.forEach((imageData, index) => {
        const item = document.createElement('div');
        const pos = positions[index];
        item.className = `collage-item col-span-${pos.colspan} row-span-${pos.rowspan}`;
        item.innerHTML = `
            <img src="${imageData.path}" alt="Collage image ${index + 1}" loading="lazy">
        `;
        // Apply blend mode to the image
        if (selectedBlendMode !== 'normal') {
            const img = item.querySelector('img');
            img.style.mixBlendMode = selectedBlendMode;
        }
        container.appendChild(item);
    });
    
    // Apply overlay if selected
    applyOverlay();
}

function applyOverlay() {
    const letterPage = document.querySelector('.letter-page');
    let overlayElement = document.getElementById('overlay-layer');
    
    if (selectedOverlay && selectedOverlay !== '') {
        if (!overlayElement) {
            overlayElement = document.createElement('div');
            overlayElement.id = 'overlay-layer';
            overlayElement.style.position = 'absolute';
            overlayElement.style.top = '0';
            overlayElement.style.left = '0';
            overlayElement.style.width = '100%';
            overlayElement.style.height = '100%';
            overlayElement.style.zIndex = '110';
            letterPage.appendChild(overlayElement);
        }
        
        overlayElement.style.backgroundImage = `url('${selectedOverlay}')`;
        overlayElement.style.backgroundSize = 'cover';
        overlayElement.style.opacity = (overlayOpacity / 100);
        overlayElement.style.pointerEvents = 'none';
        overlayElement.style.mixBlendMode = overlayBlendMode;
    } else {
        if (overlayElement) {
            overlayElement.remove();
        }
    }
}

function applyPaintOverlay() {
    const letterPage = document.querySelector('.letter-page');
    let paintElement = document.getElementById('paint-layer');
    
    if (paintEnabled && paintOpacity > 0) {
        if (!paintElement) {
            paintElement = document.createElement('div');
            paintElement.id = 'paint-layer';
            paintElement.style.position = 'absolute';
            paintElement.style.top = '0';
            paintElement.style.left = '0';
            paintElement.style.width = '100%';
            paintElement.style.height = '100%';
            paintElement.style.zIndex = '120';
            paintElement.style.pointerEvents = 'none';
            letterPage.appendChild(paintElement);
        }
        
        paintElement.style.backgroundColor = paintColor;
        paintElement.style.opacity = (paintOpacity / 100);
        paintElement.style.mixBlendMode = 'color';
    } else {
        if (paintElement) {
            paintElement.remove();
        }
    }
}

function applyBlendModes() {
    const container = document.getElementById('collage-container');
    const images = container.querySelectorAll('img');
    
    images.forEach(img => {
        if (selectedBlendMode !== 'normal') {
            img.style.mixBlendMode = selectedBlendMode;
        } else {
            img.style.mixBlendMode = 'normal';
        }
    });
}

function shuffleLayout() {
    renderCollage();
}

function printCollage() {
    window.print();
}

function initializeTagFilters() {
    const tags = getAllTags();
    const filterContainer = document.getElementById('tag-filters');
    
    tags.forEach(tag => {
        const label = document.createElement('label');
        label.className = 'tag-filter-label';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'tag-filter-checkbox';
        checkbox.value = tag;
        checkbox.dataset.tag = tag;
        
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                if (!selectedTags.includes(tag)) {
                    selectedTags.push(tag);
                }
            } else {
                selectedTags = selectedTags.filter(t => t !== tag);
            }
            renderCollage();
        });
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(tag));
        filterContainer.appendChild(label);
    });
}

function initializeBlendModes() {
    const blendModes = [
        { name: 'Normal', value: 'normal' },
        { name: 'Multiply', value: 'multiply' },
        { name: 'Screen', value: 'screen' },
        { name: 'Overlay', value: 'overlay' },
        { name: 'Darken', value: 'darken' },
        { name: 'Lighten', value: 'lighten' },
        { name: 'Color Dodge', value: 'color-dodge' },
        { name: 'Color Burn', value: 'color-burn' },
        { name: 'Hard Light', value: 'hard-light' },
        { name: 'Soft Light', value: 'soft-light' },
        { name: 'Difference', value: 'difference' },
        { name: 'Exclusion', value: 'exclusion' },
        { name: 'Hue', value: 'hue' },
        { name: 'Saturation', value: 'saturation' },
        { name: 'Color', value: 'color' },
        { name: 'Luminosity', value: 'luminosity' }
    ];
    
    const blendContainer = document.getElementById('blend-modes');
    
    blendModes.forEach(mode => {
        const label = document.createElement('label');
        label.className = 'blend-mode-label';
        
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.className = 'blend-mode-radio';
        radio.name = 'blend-mode';
        radio.value = mode.value;
        if (mode.value === selectedBlendMode) {
            radio.checked = true;
        }
        
        radio.addEventListener('change', function() {
            selectedBlendMode = this.value;
            applyBlendModes();
        });
        
        label.appendChild(radio);
        label.appendChild(document.createTextNode(mode.name));
        blendContainer.appendChild(label);
    });
}

// Event listeners
document.getElementById('printBtn').addEventListener('click', printCollage);

const tryAgainBtn = document.getElementById('tryAgainBtn');
tryAgainBtn.addEventListener('click', function() {
    const generateOverlay = document.getElementById('generate-overlay');
    const collageContainer = document.getElementById('collage-container');
    
    // If overlay is still visible, act like the generate button
    if (!generateOverlay.classList.contains('hidden')) {
        generateOverlay.classList.add('hidden');
        collageContainer.classList.add('active');
    }
    
    shuffleLayout();
});

const filterBtn = document.getElementById('filterBtn');
const dropdown = document.getElementById('tag-filters');
const effectsBtn = document.getElementById('effectsBtn');
const effectsDropdown = document.getElementById('blend-modes');
const imageBtn = document.getElementById('imageBtn');
const imageModal = document.getElementById('image-modal');
const imageUrlInput = document.getElementById('imageUrlInput');
const applyImageBtn = document.getElementById('applyImageBtn');
const clearImageBtn = document.getElementById('clearImageBtn');

const textBtn = document.getElementById('textBtn');
const textModal = document.getElementById('text-modal');
const textInput = document.getElementById('textInput');
const applyTextBtn = document.getElementById('applyTextBtn');
const clearTextBtn = document.getElementById('clearTextBtn');
const deleteTextBtn = document.getElementById('deleteTextBtn');
const textOverlay = document.getElementById('text-overlay');
const textContent = document.getElementById('text-content');

// Font control elements
const fontFamily = document.getElementById('fontFamily');
const fontSize = document.getElementById('fontSize');
const fontColor = document.getElementById('fontColor');
const colorValue = document.getElementById('colorValue');
const fontBold = document.getElementById('fontBold');
const fontItalic = document.getElementById('fontItalic');
const fontUnderline = document.getElementById('fontUnderline');

const overlayBtn = document.getElementById('overlayBtn');
const overlayPanel = document.getElementById('overlay-panel');
const overlayList = document.getElementById('overlay-list');
const overlayOpacitySlider = document.getElementById('overlayOpacity');
const opacityValue = document.getElementById('opacityValue');
const overlayBlendList = document.getElementById('overlay-blend-list');

const paintBtn = document.getElementById('paintBtn');
const paintPanel = document.getElementById('paint-panel');
const paintColorInput = document.getElementById('paintColor');
const paintColorValue = document.getElementById('paintColorValue');
const paintOpacitySlider = document.getElementById('paintOpacity');
const paintOpacityValue = document.getElementById('paintOpacityValue');
const paintToggle = document.getElementById('paintToggle');

function closeAllFlyouts() {
    dropdown.classList.remove('show');
    effectsDropdown.classList.remove('show');
    imageModal.classList.remove('show');
    textModal.classList.remove('show');
    overlayPanel.classList.remove('show');
    paintPanel.classList.remove('show');
}

filterBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains('show');
    closeAllFlyouts();
    if (!isOpen) {
        dropdown.classList.add('show');
    }
});

effectsBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    const isOpen = effectsDropdown.classList.contains('show');
    closeAllFlyouts();
    if (!isOpen) {
        effectsDropdown.classList.add('show');
    }
});

imageBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    const isOpen = imageModal.classList.contains('show');
    closeAllFlyouts();
    if (!isOpen) {
        imageModal.classList.add('show');
        imageUrlInput.value = customImageUrl;
    }
});

textBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    const isOpen = textModal.classList.contains('show');
    closeAllFlyouts();
    if (!isOpen) {
        textModal.classList.add('show');
        textInput.value = textOverlayContent;
        // Update font controls to current values
        fontFamily.value = textFontFamily;
        fontSize.value = textFontSize;
        fontColor.value = textFontColor;
        colorValue.textContent = textFontColor.toUpperCase();
        fontBold.classList.toggle('active', textFontBold);
        fontItalic.classList.toggle('active', textFontItalic);
        fontUnderline.classList.toggle('active', textFontUnderline);
    }
});

overlayBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    const isOpen = overlayPanel.classList.contains('show');
    closeAllFlyouts();
    if (!isOpen) {
        overlayPanel.classList.add('show');
    }
});

paintBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    const isOpen = paintPanel.classList.contains('show');
    closeAllFlyouts();
    if (!isOpen) {
        paintPanel.classList.add('show');
    }
});

applyImageBtn.addEventListener('click', function() {
    customImageUrl = imageUrlInput.value.trim();
    imageModal.classList.remove('show');
    renderCollage();
});

clearImageBtn.addEventListener('click', function() {
    customImageUrl = '';
    imageUrlInput.value = '';
    imageModal.classList.remove('show');
    renderCollage();
});

applyTextBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    textOverlayContent = textInput.value.trim();
    updateTextOverlay();
    initializeTextInteractions();
    textModal.classList.remove('show');
});

clearTextBtn.addEventListener('click', function() {
    textOverlayContent = '';
    textInput.value = '';
    textModal.classList.remove('show');
    updateTextOverlay();
});

deleteTextBtn.addEventListener('click', function() {
    textOverlayContent = '';
    textInput.value = '';
    textModal.classList.remove('show');
    updateTextOverlay();
});

// Font control event listeners
fontFamily.addEventListener('change', function() {
    textFontFamily = this.value;
    updateTextOverlay();
});

fontSize.addEventListener('change', function() {
    textFontSize = parseInt(this.value) || 24;
    updateTextOverlay();
});

fontColor.addEventListener('change', function() {
    textFontColor = this.value;
    colorValue.textContent = this.value.toUpperCase();
    updateTextOverlay();
});

fontBold.addEventListener('click', function(e) {
    e.preventDefault();
    textFontBold = !textFontBold;
    this.classList.toggle('active');
    updateTextOverlay();
});

fontItalic.addEventListener('click', function(e) {
    e.preventDefault();
    textFontItalic = !textFontItalic;
    this.classList.toggle('active');
    updateTextOverlay();
});

fontUnderline.addEventListener('click', function(e) {
    e.preventDefault();
    textFontUnderline = !textFontUnderline;
    this.classList.toggle('active');
    updateTextOverlay();
});

overlayOpacitySlider.addEventListener('input', function() {
    overlayOpacity = parseInt(this.value);
    opacityValue.textContent = overlayOpacity + '%';
    applyOverlay();
});

paintColorInput.addEventListener('change', function() {
    paintColor = this.value;
    paintColorValue.textContent = this.value.toUpperCase();
    applyPaintOverlay();
});

paintOpacitySlider.addEventListener('input', function() {
    paintOpacity = parseInt(this.value);
    paintOpacityValue.textContent = paintOpacity + '%';
    applyPaintOverlay();
});

paintToggle.addEventListener('change', function() {
    paintEnabled = this.checked;
    applyPaintOverlay();
});

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (!filterBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
    }
    if (!effectsBtn.contains(e.target) && !effectsDropdown.contains(e.target)) {
        effectsDropdown.classList.remove('show');
    }
    if (!imageBtn.contains(e.target) && !imageModal.contains(e.target)) {
        imageModal.classList.remove('show');
    }
    if (!textBtn.contains(e.target) && !textModal.contains(e.target)) {
        textModal.classList.remove('show');
    }
    if (!overlayBtn.contains(e.target) && !overlayPanel.contains(e.target)) {
        overlayPanel.classList.remove('show');
    }
    if (!paintBtn.contains(e.target) && !paintPanel.contains(e.target)) {
        paintPanel.classList.remove('show');
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeTagFilters();
    initializeBlendModes();
    initializeOverlays();
    
    // Set up the generate button
    const generateBtn = document.getElementById('generateBtn');
    const generateOverlay = document.getElementById('generate-overlay');
    const collageContainer = document.getElementById('collage-container');
    
    generateBtn.addEventListener('click', function() {
        generateOverlay.classList.add('hidden');
        collageContainer.classList.add('active');
        renderCollage();
    });
});

function initializeOverlays() {
    overlayList.innerHTML = '';
    
    overlays.forEach(overlay => {
        const label = document.createElement('label');
        label.className = 'overlay-item';
        if (overlay.path === selectedOverlay) {
            label.classList.add('active');
        }
        
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'overlay';
        radio.value = overlay.path;
        if (overlay.path === selectedOverlay) {
            radio.checked = true;
        }
        
        radio.addEventListener('change', function() {
            selectedOverlay = this.value;
            applyOverlay();
        });
        
        label.appendChild(radio);
        const labelText = document.createElement('span');
        labelText.textContent = overlay.name;
        label.appendChild(labelText);
        
        overlayList.appendChild(label);
    });
    
    // Initialize blend modes for overlay
    const blendModes = [
        { name: 'Normal', value: 'normal' },
        { name: 'Multiply', value: 'multiply' },
        { name: 'Screen', value: 'screen' },
        { name: 'Overlay', value: 'overlay' },
        { name: 'Darken', value: 'darken' },
        { name: 'Lighten', value: 'lighten' },
        { name: 'Color Dodge', value: 'color-dodge' },
        { name: 'Color Burn', value: 'color-burn' },
        { name: 'Hard Light', value: 'hard-light' },
        { name: 'Soft Light', value: 'soft-light' },
        { name: 'Difference', value: 'difference' },
        { name: 'Exclusion', value: 'exclusion' },
        { name: 'Hue', value: 'hue' },
        { name: 'Saturation', value: 'saturation' },
        { name: 'Color', value: 'color' },
        { name: 'Luminosity', value: 'luminosity' }
    ];
    
    overlayBlendList.innerHTML = '';
    blendModes.forEach(mode => {
        const label = document.createElement('label');
        label.className = 'overlay-blend-label';
        
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'overlay-blend';
        radio.value = mode.value;
        if (mode.value === overlayBlendMode) {
            radio.checked = true;
        }
        
        radio.addEventListener('change', function() {
            overlayBlendMode = this.value;
            applyOverlay();
        });
        
        label.appendChild(radio);
        label.appendChild(document.createTextNode(mode.name));
        overlayBlendList.appendChild(label);
    });
}

function updateTextOverlay() {
    if (textOverlayContent) {
        textContent.textContent = textOverlayContent;
        textOverlay.style.display = 'inline-block';
        // Ensure no explicit sizing
        textOverlay.style.width = 'auto';
        textOverlay.style.height = 'auto';
        
        // Apply font styles
        textOverlay.style.fontFamily = textFontFamily;
        textOverlay.style.fontSize = textFontSize + 'px';
        textOverlay.style.color = textFontColor;
        textOverlay.style.fontWeight = textFontBold ? 'bold' : 'normal';
        textOverlay.style.fontStyle = textFontItalic ? 'italic' : 'normal';
        textOverlay.style.textDecoration = textFontUnderline ? 'underline' : 'none';
    } else {
        textOverlay.style.display = 'none';
    }
}

function initializeTextInteractions() {
    if (!textOverlayContent) return;
    
    const element = document.getElementById('text-overlay');
    
    // Clear any inline width/height to let CSS handle sizing
    element.style.width = '';
    element.style.height = '';
    
    // Initialize position data if not set
    if (!element.dataset.x) {
        element.dataset.x = 0;
        element.dataset.y = 0;
        element.dataset.angle = 0;
    }
    
    // Reset any previous interact handlers
    interact(element).unset();
    
    // Make text draggable using interact.js - completely unrestricted
    interact(element)
        .draggable({
            inertia: false,
            autoScroll: false,
            listeners: {
                move(event) {
                    let { x, y } = event.target.dataset;
                    x = (parseFloat(x) || 0) + event.dx;
                    y = (parseFloat(y) || 0) + event.dy;
                    
                    event.target.style.transform = `translate(${x}px, ${y}px) rotate(${parseFloat(event.target.dataset.angle) || 0}deg)`;
                    Object.assign(event.target.dataset, { x, y });
                }
            }
        });
}
