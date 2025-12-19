// Collage Asset Generator Application

// Alert Helper Function
// ============================================================

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    const alertId = 'alert-' + Date.now();
    const alertHtml = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert" style="margin-bottom: 10px;">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    alertContainer.insertAdjacentHTML('beforeend', alertHtml);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const alert = document.getElementById(alertId);
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}

function showConfirmation(message, onConfirm, onCancel) {
    const alertContainer = document.getElementById('alert-container');
    const confirmId = 'confirm-' + Date.now();
    const confirmHtml = `
        <div id="${confirmId}" class="alert alert-warning alert-dismissible fade show" role="alert" style="margin-bottom: 10px;">
            <div style="margin-bottom: 10px;">${message}</div>
            <div style="display: flex; gap: 10px;">
                <button type="button" class="btn btn-sm btn-danger confirm-yes">Yes, Delete</button>
                <button type="button" class="btn btn-sm btn-secondary confirm-no">Cancel</button>
            </div>
        </div>
    `;
    alertContainer.insertAdjacentHTML('beforeend', confirmHtml);
    
    const confirmElement = document.getElementById(confirmId);
    const yesBtn = confirmElement.querySelector('.confirm-yes');
    const noBtn = confirmElement.querySelector('.confirm-no');
    
    function cleanup() {
        const bsAlert = new bootstrap.Alert(confirmElement);
        bsAlert.close();
    }
    
    yesBtn.addEventListener('click', () => {
        onConfirm();
        cleanup();
    });
    
    noBtn.addEventListener('click', () => {
        if (onCancel) onCancel();
        cleanup();
    });
}

// Track selected tags for filtering
let selectedTags = [];

// Track selected SVG effects
let selectedEffects = [];

// Track effect intensities
let effectIntensity = {
    blur: 3,
    glitch: 10
};

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
let textZIndex = 110; // Default below paint overlay (120)

// Track overlay settings
let selectedOverlay = '';
let overlayOpacity = 100;

// Track paint overlay settings
let paintColor = '#FFFF00';
let paintOpacity = 50;
let paintEnabled = false;

// Track if collage has been generated
let assetsGenerated = false;

// Track the current collage composition (images and layout used)
let currentCollageLayout = null;
let currentCollageImages = [];

// Track the user-selected layout (null means random)
let selectedLayout = null;

// Track images for the currently selected layout
let layoutSelectedImages = null;

// Track the image count for the currently selected layout
let layoutImageCount = null;

// Track favorite layouts
let favoriteLayouts = [];

// Flag to prevent re-rendering when loading from URL
let loadingFromURL = false;

// Layout patterns with grid positions
const layoutPatterns = [
    // Pattern 1: One tall on left + three stacked on right
    {
        name: 'half-and-quarters',
        positions: [
            { colspan: 1, rowspan: 3 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 }
        ]
    },
    // Pattern 2: Two halves top, two quarters bottom
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
    // Pattern 15: Checkerboard - 6 equal images (2x3)
    {
        name: 'checkerboard',
        positions: [
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 },
            { colspan: 1, rowspan: 1 }
        ]
    }
];

function setToolbarButtonsEnabled(enabled) {
    filterBtn.disabled = !enabled;
    layoutBtn.disabled = !enabled;
    effectsBtn.disabled = !enabled;
    imageBtn.disabled = !enabled;
    overlayBtn.disabled = !enabled;
    paintBtn.disabled = !enabled;
    textBtn.disabled = !enabled;
    printBtn.disabled = !enabled;
    saveBtn.disabled = !enabled;
}

function saveFavoriteLayouts() {
    localStorage.setItem('favorite-layouts', JSON.stringify(favoriteLayouts));
}

function loadFavoriteLayouts() {
    const saved = localStorage.getItem('favorite-layouts');
    if (saved) {
        try {
            favoriteLayouts = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading favorite layouts:', e);
            favoriteLayouts = [];
        }
    }
}

function toggleLayoutFavorite(layoutName, e) {
    e.stopPropagation();
    
    if (favoriteLayouts.includes(layoutName)) {
        favoriteLayouts = favoriteLayouts.filter(name => name !== layoutName);
    } else {
        favoriteLayouts.push(layoutName);
    }
    
    saveFavoriteLayouts();
    updateLayoutStarButtons();
}

function updateLayoutStarButtons() {
    document.querySelectorAll('.layout-star').forEach(star => {
        const layoutName = star.dataset.layoutName;
        if (favoriteLayouts.includes(layoutName)) {
            star.classList.remove('bi-star');
            star.classList.add('bi-star-fill');
            star.style.color = '#FFD700';
        } else {
            star.classList.remove('bi-star-fill');
            star.classList.add('bi-star');
            star.style.color = '#6c757d';
        }
    });
}

function getRandomImages(count) {
    const shuffled = [...images].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function getRandomLayout() {
    return layoutPatterns[Math.floor(Math.random() * layoutPatterns.length)];
}

function renderCollage(forceImages = null, forceLayout = null) {
    const container = document.getElementById('collage-container');
    container.innerHTML = '';
    console.log('RENDER: renderCollage called with forceImages:', forceImages?.map(i => i.path), 'forceLayout:', forceLayout?.name);

    let selectedImagesData;
    let layout;
    let positions;

    // If specific images/layout are provided, use those
    if (forceImages && forceLayout) {
        selectedImagesData = forceImages;
        layout = forceLayout;
        positions = layout.positions.slice(0);
        console.log('RENDER: Using forced images:', selectedImagesData.map(i => i.path));
    } else {
        // Get filtered images based on selected tags
        const filteredImages = filterImagesByTags(selectedTags);
        
        if (filteredImages.length === 0) {
            container.innerHTML = '<p class="no-images">No images match the selected filters</p>';
            return;
        }

        // Determine layout: use selectedLayout if available, otherwise random
        if (selectedLayout) {
            layout = selectedLayout;
            // If we have previously selected images for this layout, reuse them
            if (layoutSelectedImages && layoutSelectedImages.length > 0) {
                selectedImagesData = layoutSelectedImages;
            } else {
                // First time selecting this layout - pick images
                const requiredImageCount = layout.positions.length;
                const imageCount = layoutImageCount || Math.max(requiredImageCount, Math.floor(Math.random() * 4) + 3);
                selectedImagesData = filteredImages
                    .sort(() => 0.5 - Math.random())
                    .slice(0, Math.min(imageCount, filteredImages.length));
                
                if (customImageUrl) {
                    selectedImagesData.push({ path: customImageUrl, tags: ['custom'] });
                }
                
                // Store these images and count for this layout
                layoutSelectedImages = selectedImagesData;
                layoutImageCount = imageCount;
            }
        } else {
            // No layout selected - random behavior
            layout = getRandomLayout();
            layoutSelectedImages = null; // Clear stored images
            layoutImageCount = null; // Clear stored image count
            
            const requiredImageCount = layout.positions.length;
            const imageCount = Math.max(requiredImageCount, Math.floor(Math.random() * 4) + 3);
            selectedImagesData = filteredImages
                .sort(() => 0.5 - Math.random())
                .slice(0, Math.min(imageCount, filteredImages.length));
            
            if (customImageUrl) {
                selectedImagesData.push({ path: customImageUrl, tags: ['custom'] });
                // Shuffle to randomize position only when no layout is selected
                for (let i = selectedImagesData.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [selectedImagesData[i], selectedImagesData[j]] = [selectedImagesData[j], selectedImagesData[i]];
                }
            }
        }
        
        positions = layout.positions.slice(0);
        console.log('RENDER: Random render - selected images:', selectedImagesData.map(i => i.path), 'layout:', layout.name);
    }
    
    // Store the current composition for later restoration
    currentCollageLayout = layout;
    currentCollageImages = selectedImagesData;
    console.log('RENDER: Updated currentCollageImages to:', currentCollageImages.map(i => i.path));

    // If layout doesn't have enough positions, adjust
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
            <button class="replace-icon" title="Replace this image" data-index="${index}">
                <i class="bi bi-arrow-repeat"></i>
            </button>
        `;
        // Apply SVG filters to the image
        const img = item.querySelector('img');
        let filterParts = [];
        
        selectedEffects.forEach(effect => {
            if (effect === 'blur') {
                const blurAmount = effectIntensity.blur;
                filterParts.push(`blur(${blurAmount}px)`);
            } else {
                filterParts.push(`url(#svg-${effect})`);
            }
        });
        
        if (paintEnabled && paintOpacity > 0) {
            filterParts.push('grayscale(100%)');
        }
        
        if (filterParts.length > 0) {
            img.style.filter = filterParts.join(' ');
        }
        
        // Add click handler to replace button
        const replaceBtn = item.querySelector('.replace-icon');
        replaceBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            replaceImageAtIndex(index);
        });
        
        container.appendChild(item);
    });
    
    // Apply overlay if selected
    applyOverlay();
}

function replaceImageAtIndex(index) {
    const filteredImages = filterImagesByTags(selectedTags);
    
    if (filteredImages.length === 0) {
        alert('No images available to replace with');
        return;
    }
    
    // Get list of images already in the collage (excluding custom images)
    const usedPaths = currentCollageImages
        .filter(img => !img.tags || !img.tags.includes('custom'))
        .map(img => img.path);
    
    // Find available images not currently in the collage
    const availableImages = filteredImages.filter(img => !usedPaths.includes(img.path));
    
    // If no unique images available, allow repeats
    const imagesToChooseFrom = availableImages.length > 0 ? availableImages : filteredImages;
    
    // Select a random image
    const randomImage = imagesToChooseFrom[Math.floor(Math.random() * imagesToChooseFrom.length)];
    
    // Replace the image at the specified index
    currentCollageImages[index] = randomImage;
    
    // Update just the image in the DOM without re-rendering everything
    const container = document.getElementById('collage-container');
    const collageItems = container.querySelectorAll('.collage-item');
    const targetItem = collageItems[index];
    
    if (targetItem) {
        const img = targetItem.querySelector('img');
        if (img) {
            img.src = randomImage.path;
            
            // Re-apply filters to the updated image
            let filterParts = [];
            selectedEffects.forEach(effect => {
                if (effect === 'blur') {
                    const blurAmount = effectIntensity.blur;
                    filterParts.push(`blur(${blurAmount}px)`);
                } else {
                    filterParts.push(`url(#svg-${effect})`);
                }
            });
            
            if (paintEnabled && paintOpacity > 0) {
                filterParts.push('grayscale(100%)');
            }
            
            if (filterParts.length > 0) {
                img.style.filter = filterParts.join(' ');
            } else {
                img.style.filter = '';
            }
        }
    }
    
    // Update URL and heart button
    const settings = getCollageSettings();
    encodeSettingsToURL(settings);
    resetHeartButton();
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
        resetHeartButton();
    } else {
        if (overlayElement) {
            overlayElement.remove();
        }
    }
}

function applyPaintOverlay() {
    const letterPage = document.querySelector('.letter-page');
    let paintElement = document.getElementById('paint-layer');
    
    console.log('applyPaintOverlay called:', { paintEnabled, paintOpacity });
    
    if (paintEnabled && paintOpacity > 0) {
        if (!paintElement) {
            // Create SVG with proper filters for print compatibility
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.id = 'paint-layer';
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.setAttribute('viewBox', '0 0 816 1056');
            svg.style.position = 'absolute';
            svg.style.top = '0';
            svg.style.left = '0';
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.style.zIndex = '120';
            svg.style.pointerEvents = 'none';
            
            // Create defs with color blend filter
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            
            // Color mode filter using feColorMatrix
            const colorFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
            colorFilter.setAttribute('id', 'colorBlend');
            colorFilter.setAttribute('x', '-50%');
            colorFilter.setAttribute('y', '-50%');
            colorFilter.setAttribute('width', '200%');
            colorFilter.setAttribute('height', '200%');
            
            // Get RGB values from paint color
            const rgb = hexToRgb(paintColor);
            const hue = rgbToHue(rgb.r, rgb.g, rgb.b);
            const saturation = rgbToSaturation(rgb.r, rgb.g, rgb.b);
            
            // Use feColorMatrix to shift hue while preserving luminosity
            const colorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
            colorMatrix.setAttribute('type', 'saturate');
            colorMatrix.setAttribute('values', '0');
            colorMatrix.setAttribute('result', 'desaturated');
            colorFilter.appendChild(colorMatrix);
            
            // Apply hue rotation based on paint color
            const hueRotate = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
            hueRotate.setAttribute('type', 'hueRotate');
            hueRotate.setAttribute('values', hue);
            hueRotate.setAttribute('in', 'desaturated');
            colorFilter.appendChild(hueRotate);
            
            defs.appendChild(colorFilter);
            svg.appendChild(defs);
            
            // Create rectangle for color overlay
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('width', '816');
            rect.setAttribute('height', '1056');
            rect.setAttribute('fill', paintColor);
            rect.setAttribute('class', 'color-overlay-rect');
            rect.style.mixBlendMode = 'color';
            svg.appendChild(rect);
            
            paintElement = svg;
            letterPage.appendChild(paintElement);
        }
        
        // Update color and opacity
        const rect = paintElement.querySelector('.color-overlay-rect');
        if (rect) {
            rect.setAttribute('fill', paintColor);
            const opacityValue = (paintOpacity / 100).toString();
            rect.style.opacity = opacityValue;
            console.log('Paint rect opacity set to:', opacityValue);
        }
    } else {
        if (paintElement) {
            paintElement.remove();
        }
    }
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function rgbToHue(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    if (max !== min) {
        const d = max - min;
        switch(max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return Math.round(h * 360);
}

function rgbToSaturation(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let s = 0;
    if (max !== min) {
        s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
    }
    return Math.round(s * 100);
}

function applySVGEffects() {
    const container = document.getElementById('collage-container');
    const images = container.querySelectorAll('img');
    
    images.forEach(img => {
        let filterParts = [];
        
        // Add SVG filters (these handle complex effects reliably in print)
        selectedEffects.forEach(effect => {
            if (effect === 'blur') {
                const blurAmount = (effectIntensity.blur);
                filterParts.push(`blur(${blurAmount}px)`);
            } else {
                // All other effects use SVG filters
                filterParts.push(`url(#svg-${effect})`);
            }
        });
        
        if (paintEnabled && paintOpacity > 0) {
            filterParts.push('grayscale(100%)');
        }
        
        img.style.filter = filterParts.join(' ') || 'none';
    });
}

function shuffleLayout() {
    // If a layout is selected, shuffle only the images in that layout
    // If no layout is selected, shuffle everything (current behavior)
    renderCollage();
    resetHeartButton();
}

function resetHeartButton() {
    const heartBtn = document.getElementById('saveHeartBtn');
    if (heartBtn && heartBtn.classList.contains('filled')) {
        heartBtn.classList.remove('filled');
        heartBtn.innerHTML = '<i class="bi bi-heart"></i>';
    }
}

function printCollage() {
    window.print();
}

function initializeLayoutOptions() {
    const layoutContainer = document.getElementById('layout-list');
    layoutContainer.innerHTML = ''; // Clear existing layouts
    
    layoutPatterns.forEach((layout, index) => {
        const layoutWrapper = document.createElement('div');
        layoutWrapper.className = 'layout-option-wrapper';
        layoutWrapper.style.display = 'flex';
        layoutWrapper.style.gap = '0.5rem';
        layoutWrapper.style.alignItems = 'center';
        layoutWrapper.style.marginBottom = '0.5rem';
        
        const layoutButton = document.createElement('button');
        layoutButton.className = 'layout-option btn btn-sm btn-outline-secondary';
        layoutButton.style.flex = '1';
        layoutButton.textContent = layout.name.replace(/-/g, ' ').charAt(0).toUpperCase() + layout.name.replace(/-/g, ' ').slice(1);
        layoutButton.dataset.layoutIndex = index;
        
        // Mark as active if this is the selected layout
        if (selectedLayout && selectedLayout.name === layout.name) {
            layoutButton.classList.remove('btn-outline-secondary');
            layoutButton.classList.add('btn-primary');
        }
        
        layoutButton.addEventListener('click', function(e) {
            e.stopPropagation();
            selectedLayout = layout;
            // Preserve current images when selecting a layout
            if (currentCollageImages && currentCollageImages.length > 0) {
                layoutSelectedImages = currentCollageImages;
                layoutImageCount = currentCollageImages.length;
            }
            
            // Update all layout buttons
            document.querySelectorAll('.layout-option').forEach(btn => {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline-secondary');
            });
            layoutButton.classList.remove('btn-outline-secondary');
            layoutButton.classList.add('btn-primary');
            
            // Re-render with selected layout
            renderCollage();
            resetHeartButton();
            
            // Update URL
            setTimeout(() => {
                const settings = getCollageSettings();
                encodeSettingsToURL(settings);
            }, 100);
        });
        
        // Create star button for favorites
        const starButton = document.createElement('button');
        starButton.className = 'layout-star-btn btn btn-sm';
        starButton.style.padding = '0.25rem 0.5rem';
        starButton.title = 'Add to favorites';
        starButton.dataset.layoutName = layout.name;
        
        const starIcon = document.createElement('i');
        starIcon.className = favoriteLayouts.includes(layout.name) ? 'bi bi-star-fill layout-star' : 'bi bi-star layout-star';
        starIcon.dataset.layoutName = layout.name;
        starIcon.style.cursor = 'pointer';
        starIcon.style.color = favoriteLayouts.includes(layout.name) ? '#FFD700' : '#6c757d';
        
        starButton.appendChild(starIcon);
        starButton.addEventListener('click', (e) => toggleLayoutFavorite(layout.name, e));
        
        layoutWrapper.appendChild(layoutButton);
        layoutWrapper.appendChild(starButton);
        layoutContainer.appendChild(layoutWrapper);
    });
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
            // Only render if we're not loading from URL and have images locked in
            if (!loadingFromURL && (!currentCollageImages.length)) {
                console.log('Tag filter changed, re-rendering with random images');
                renderCollage();
            }
            resetHeartButton();
        });
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(tag));
        filterContainer.appendChild(label);
    });
}

function initializeSVGEffects() {
    const svgEffects = [
        { name: 'Blur', value: 'blur', hasSlider: true, min: 0, max: 10, label: 'Amount' },
        { name: 'Sharpen', value: 'sharpen', hasSlider: false },
        { name: 'Sepia', value: 'sepia', hasSlider: false },
        { name: 'High Contrast', value: 'highcontrast', hasSlider: false },
        { name: 'Vintage', value: 'vintage', hasSlider: false },
        { name: 'Posterize', value: 'posterize', hasSlider: false },
        { name: 'Emboss', value: 'emboss', hasSlider: false },
        { name: 'Glitch', value: 'glitch', hasSlider: true, min: 0, max: 20, label: 'Amount' },
        { name: 'Invert', value: 'invert', hasSlider: false }
    ];
    
    const effectsContainer = document.getElementById('blend-modes');
    if (!effectsContainer) {
        console.error('Effects container not found!');
        return;
    }
    
    effectsContainer.innerHTML = ''; // Clear existing content
    
    svgEffects.forEach(effect => {
        const effectWrapper = document.createElement('div');
        effectWrapper.style.marginBottom = '10px';
        
        const label = document.createElement('label');
        label.className = 'blend-mode-label';
        label.style.display = 'block';
        label.style.cursor = 'pointer';
        label.style.marginBottom = '3px';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'blend-mode-radio';
        checkbox.name = 'svg-effect';
        checkbox.value = effect.value;
        checkbox.style.marginRight = '5px';
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(effect.name));
        effectWrapper.appendChild(label);
        
        // Create slider container if needed
        let sliderContainer = null;
        if (effect.hasSlider) {
            sliderContainer = document.createElement('div');
            sliderContainer.style.marginLeft = '20px';
            sliderContainer.style.marginTop = '5px';
            sliderContainer.style.fontSize = '12px';
            sliderContainer.style.display = 'none';
            sliderContainer.style.alignItems = 'center';
            sliderContainer.style.gap = '8px';
            
            const sliderLabel = document.createElement('label');
            sliderLabel.textContent = effect.label;
            sliderLabel.style.minWidth = '50px';
            sliderLabel.style.whiteSpace = 'nowrap';
            
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.id = `${effect.value}-slider`;
            slider.min = effect.min;
            slider.max = effect.max;
            slider.value = effectIntensity[effect.value] || effect.min;
            slider.style.flex = '1';
            slider.style.cursor = 'pointer';
            
            const valueDisplay = document.createElement('span');
            valueDisplay.textContent = slider.value + (effect.value === 'blur' ? 'px' : '');
            valueDisplay.style.minWidth = '35px';
            valueDisplay.style.textAlign = 'right';
            
            slider.addEventListener('input', function() {
                if (effect.value === 'blur') {
                    effectIntensity.blur = parseInt(this.value);
                } else if (effect.value === 'glitch') {
                    effectIntensity.glitch = parseInt(this.value);
                    // Update glitch filter scale
                    const glitchDisplacementMap = document.querySelector('#svg-glitch feDisplacementMap');
                    if (glitchDisplacementMap) {
                        glitchDisplacementMap.setAttribute('scale', this.value);
                    }
                }
                valueDisplay.textContent = this.value + (effect.value === 'blur' ? 'px' : '');
                // Update SVG filter blur value
                if (effect.value === 'blur') {
                    const blurFilter = document.getElementById('blur-filter');
                    if (blurFilter) {
                        blurFilter.setAttribute('stdDeviation', this.value);
                    }
                }
                applySVGEffects();
                resetHeartButton();
                // Update URL with new effects
                const settings = getCollageSettings();
                encodeSettingsToURL(settings);
            });
            
            sliderContainer.appendChild(sliderLabel);
            sliderContainer.appendChild(slider);
            sliderContainer.appendChild(valueDisplay);
            effectWrapper.appendChild(sliderContainer);
        }
        
        // Attach checkbox event listener
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                if (!selectedEffects.includes(this.value)) {
                    selectedEffects.push(this.value);
                }
                if (sliderContainer) {
                    sliderContainer.style.display = 'flex';
                    sliderContainer.style.alignItems = 'center';
                    sliderContainer.style.gap = '8px';
                }
            } else {
                selectedEffects = selectedEffects.filter(e => e !== this.value);
                if (sliderContainer) {
                    sliderContainer.style.display = 'none';
                }
            }
            applySVGEffects();
            resetHeartButton();
            // Update URL with new effects
            const settings = getCollageSettings();
            encodeSettingsToURL(settings);
        });
        
        effectsContainer.appendChild(effectWrapper);
    });
}

// Event listeners
document.getElementById('printBtn').addEventListener('click', printCollage);
const printBtn = document.getElementById('printBtn');

function saveAsJPG() {
    const collageContainer = document.querySelector('.collage-container.active');
    
    if (!collageContainer) {
        showAlert('No collage to save', 'warning');
        return;
    }
    
    // Letter page dimensions: 8.5" x 11" at 96 DPI = 816x1056 pixels
    const canvasWidth = 816;
    const canvasHeight = 1056;
    
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Get all images and their computed styles
    const images = collageContainer.querySelectorAll('.collage-item img');
    let imagesLoaded = 0;
    let totalImages = images.length;
    
    if (totalImages === 0) {
        showAlert('No images in collage', 'warning');
        return;
    }
    
    function drawAllImages() {
        // Build filter string from selected effects
        let filterString = '';
        selectedEffects.forEach(effect => {
            switch (effect) {
                case 'blur':
                    const blurAmount = effectIntensity.blur;
                    filterString += `blur(${blurAmount}px) `;
                    break;
                case 'sharpen':
                    filterString += 'contrast(1.5) brightness(1.1) ';
                    break;
                case 'sepia':
                    filterString += 'sepia(1) ';
                    break;
                case 'highcontrast':
                    filterString += 'contrast(2) saturate(2) ';
                    break;
                case 'vintage':
                    filterString += 'sepia(0.6) contrast(0.8) brightness(0.9) ';
                    break;
                case 'posterize':
                    filterString += 'contrast(1.5) saturate(1.5) ';
                    break;
                case 'emboss':
                    filterString += 'contrast(2) grayscale(0.3) ';
                    break;
                case 'glitch':
                    filterString += 'hue-rotate(45deg) saturate(1.5) ';
                    break;
                case 'invert':
                    filterString += 'invert(1) ';
                    break;
            }
        });
        
        // Apply the filter to canvas context
        if (filterString) {
            ctx.filter = filterString.trim();
        }
        
        // Render each image onto the canvas
        images.forEach((imgElement) => {
            try {
                const item = imgElement.parentElement;
                const rect = item.getBoundingClientRect();
                const containerRect = collageContainer.getBoundingClientRect();
                
                // Calculate position relative to container in canvas coordinates
                const x = (rect.left - containerRect.left) / containerRect.width * canvasWidth;
                const y = (rect.top - containerRect.top) / containerRect.height * canvasHeight;
                const width = rect.width / containerRect.width * canvasWidth;
                const height = rect.height / containerRect.height * canvasHeight;
                
                if (imgElement.complete && imgElement.naturalWidth > 0) {
                    // Implement object-fit: cover manually
                    const imgAspect = imgElement.naturalWidth / imgElement.naturalHeight;
                    const containerAspect = width / height;
                    
                    let sourceX = 0;
                    let sourceY = 0;
                    let sourceWidth = imgElement.naturalWidth;
                    let sourceHeight = imgElement.naturalHeight;
                    
                    if (imgAspect > containerAspect) {
                        // Image is wider - crop left/right
                        sourceWidth = imgElement.naturalHeight * containerAspect;
                        sourceX = (imgElement.naturalWidth - sourceWidth) / 2;
                    } else {
                        // Image is taller - crop top/bottom
                        sourceHeight = imgElement.naturalWidth / containerAspect;
                        sourceY = (imgElement.naturalHeight - sourceHeight) / 2;
                    }
                    
                    // Draw the cropped image
                    ctx.drawImage(
                        imgElement,
                        sourceX,
                        sourceY,
                        sourceWidth,
                        sourceHeight,
                        x,
                        y,
                        width,
                        height
                    );
                }
            } catch (e) {
                console.warn('Error drawing image:', e);
            }
        });
        
        // Render text overlay if present
        if (textOverlayContent) {
            ctx.filter = 'none'; // Reset filter for text
            const textOverlay = document.getElementById('text-overlay');
            const textRect = textOverlay.getBoundingClientRect();
            const containerRect = collageContainer.getBoundingClientRect();
            
            // Calculate scale factor from screen to canvas
            const scaleY = canvasHeight / containerRect.height;
            
            // Calculate text position on canvas
            const centerX = (textRect.left - containerRect.left) / containerRect.width * canvasWidth + (textRect.width / containerRect.width * canvasWidth) / 2;
            const centerY = (textRect.top - containerRect.top) / containerRect.height * canvasHeight + (textRect.height / containerRect.height * canvasHeight) / 2;
            
            // Scale font size to canvas
            const scaledFontSize = textFontSize * scaleY;
            
            // Set text properties
            const fontStyle = `${textFontItalic ? 'italic ' : ''}${textFontBold ? 'bold ' : ''}${Math.round(scaledFontSize)}px ${textFontFamily}`;
            ctx.font = fontStyle;
            ctx.fillStyle = textFontColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw text
            ctx.fillText(textOverlayContent, centerX, centerY);
        }
        
        // Convert to JPG and download
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg', 0.98);
        link.download = 'collage_' + new Date().getTime() + '.jpg';
        link.click();
    }
    
    // Ensure all images are loaded
    images.forEach((img) => {
        if (img.complete && img.naturalWidth > 0) {
            imagesLoaded++;
        } else {
            img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded === totalImages) {
                    drawAllImages();
                }
            };
            img.onerror = () => {
                imagesLoaded++;
                if (imagesLoaded === totalImages) {
                    drawAllImages();
                }
            };
        }
    });
    
    if (imagesLoaded === totalImages) {
        drawAllImages();
    }
}

document.getElementById('downloadJpgBtn').addEventListener('click', saveAsJPG);
const saveBtn = document.getElementById('downloadJpgBtn');

const tryAgainBtn = document.getElementById('tryAgainBtn');
tryAgainBtn.addEventListener('click', function() {
    const generateOverlay = document.getElementById('generate-overlay');
    const collageContainer = document.getElementById('collage-container');
    
    // If overlay is still visible, act like the generate button
    if (!generateOverlay.classList.contains('hidden')) {
        generateOverlay.classList.add('hidden');
        collageContainer.classList.add('active');
        assetsGenerated = true;
        setToolbarButtonsEnabled(true);
    }
    
    // Clear stored images to force regeneration
    // If a layout is selected, it will regenerate images for that layout
    // If no layout is selected, it will regenerate both layout and images
    layoutSelectedImages = null;
    
    shuffleLayout();
    
    // Update URL with new collage layout
    setTimeout(() => {
        const settings = getCollageSettings();
        encodeSettingsToURL(settings);
    }, 100);
});

const filterBtn = document.getElementById('filterBtn');
const dropdown = document.getElementById('tag-filters');
const layoutBtn = document.getElementById('layoutBtn');
const layoutPanel = document.getElementById('layout-panel');
const layoutList = document.getElementById('layout-list');
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


const paintBtn = document.getElementById('paintBtn');
const paintPanel = document.getElementById('paint-panel');
const paintColorInput = document.getElementById('paintColor');
const paintColorValue = document.getElementById('paintColorValue');
const paintOpacitySlider = document.getElementById('paintOpacity');
const paintOpacityValue = document.getElementById('paintOpacityValue');
const paintToggle = document.getElementById('paintToggle');

function closeAllFlyouts() {
    dropdown.classList.remove('show');
    layoutPanel.classList.remove('show');
    effectsDropdown.classList.remove('show');
    imageModal.classList.remove('show');
    textModal.classList.remove('show');
    overlayPanel.classList.remove('show');
    paintPanel.classList.remove('show');
    document.getElementById('saves-panel').classList.remove('show');
}

filterBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains('show');
    closeAllFlyouts();
    if (!isOpen) {
        dropdown.classList.add('show');
    }
});

layoutBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    const isOpen = layoutPanel.classList.contains('show');
    closeAllFlyouts();
    if (!isOpen) {
        layoutPanel.classList.add('show');
        populateLayoutList();
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
    resetHeartButton();
});

clearImageBtn.addEventListener('click', function() {
    customImageUrl = '';
    imageUrlInput.value = '';
    imageModal.classList.remove('show');
    renderCollage();
    resetHeartButton();
});

// Real-time text input
textInput.addEventListener('input', function() {
    textOverlayContent = textInput.value.trim();
    updateTextOverlay();
    initializeTextInteractions();
    const settings = getCollageSettings();
    encodeSettingsToURL(settings);
});

clearTextBtn.addEventListener('click', function() {
    textOverlayContent = '';
    textInput.value = '';
    textModal.classList.remove('show');
    updateTextOverlay();
    const settings = getCollageSettings();
    encodeSettingsToURL(settings);
    resetHeartButton();
});

// Font control event listeners
fontFamily.addEventListener('change', function() {
    textFontFamily = this.value;
    updateTextOverlay();
    resetHeartButton();
    const settings = getCollageSettings();
    encodeSettingsToURL(settings);
});

fontSize.addEventListener('change', function() {
    textFontSize = parseInt(this.value) || 24;
    updateTextOverlay();
    resetHeartButton();
    const settings = getCollageSettings();
    encodeSettingsToURL(settings);
});

fontColor.addEventListener('change', function() {
    textFontColor = this.value;
    colorValue.textContent = this.value.toUpperCase();
    updateTextOverlay();
    resetHeartButton();
    const settings = getCollageSettings();
    encodeSettingsToURL(settings);
});

fontBold.addEventListener('click', function(e) {
    e.preventDefault();
    textFontBold = !textFontBold;
    this.classList.toggle('active');
    updateTextOverlay();
    const settings = getCollageSettings();
    encodeSettingsToURL(settings);
});

fontItalic.addEventListener('click', function(e) {
    e.preventDefault();
    textFontItalic = !textFontItalic;
    this.classList.toggle('active');
    updateTextOverlay();
    const settings = getCollageSettings();
    encodeSettingsToURL(settings);
});

fontUnderline.addEventListener('click', function(e) {
    e.preventDefault();
    textFontUnderline = !textFontUnderline;
    this.classList.toggle('active');
    updateTextOverlay();
    const settings = getCollageSettings();
    encodeSettingsToURL(settings);
});

// Helper function to update text z-index button states
function updateTextZIndexButtonStates() {
    const bringForwardBtn = document.getElementById('textBringForward');
    const sendBackwardBtn = document.getElementById('textSendBackward');
    
    // Paint overlay z-index is 120
    const PAINT_ZINDEX = 120;
    const TEXT_ABOVE = 130;
    const TEXT_BELOW = 110;
    
    // Disable buttons if paint is not enabled
    if (!paintEnabled) {
        bringForwardBtn.disabled = true;
        sendBackwardBtn.disabled = true;
        return;
    }
    
    // Enable/disable based on current text z-index
    bringForwardBtn.disabled = textZIndex >= TEXT_ABOVE; // Already above paint
    sendBackwardBtn.disabled = textZIndex <= TEXT_BELOW; // Already below paint
}

// Text z-index controls
document.getElementById('textBringForward').addEventListener('click', function(e) {
    e.preventDefault();
    if (!paintEnabled) return;
    
    textZIndex = 130; // Above paint overlay (120)
    document.getElementById('text-overlay').style.zIndex = textZIndex;
    console.log('Text z-index brought forward (above paint):', textZIndex);
    updateTextZIndexButtonStates();
    const settings = getCollageSettings();
    encodeSettingsToURL(settings);
});

document.getElementById('textSendBackward').addEventListener('click', function(e) {
    e.preventDefault();
    if (!paintEnabled) return;
    
    textZIndex = 110; // Below paint overlay (120)
    document.getElementById('text-overlay').style.zIndex = textZIndex;
    console.log('Text z-index sent backward (below paint):', textZIndex);
    updateTextZIndexButtonStates();
    const settings = getCollageSettings();
    encodeSettingsToURL(settings);
});

overlayOpacitySlider.addEventListener('input', function() {
    overlayOpacity = parseInt(this.value);
    opacityValue.textContent = overlayOpacity + '%';
    applyOverlay();
    resetHeartButton();
    const settings = getCollageSettings();
    encodeSettingsToURL(settings);
});

paintColorInput.addEventListener('change', function() {
    paintColor = this.value;
    paintColorValue.textContent = this.value.toUpperCase();
    applyPaintOverlay();
    resetHeartButton();
    const settings = getCollageSettings();
    encodeSettingsToURL(settings);
});

paintOpacitySlider.addEventListener('input', function() {
    paintOpacity = parseInt(this.value);
    paintOpacityValue.textContent = paintOpacity + '%';
    console.log('Paint opacity changed:', paintOpacity);
    console.log('About to call applyPaintOverlay...');
    try {
        applyPaintOverlay();
        console.log('applyPaintOverlay completed successfully');
    } catch (e) {
        console.error('Error in applyPaintOverlay:', e);
    }
    resetHeartButton();
    const settings = getCollageSettings();
    encodeSettingsToURL(settings);
});

paintToggle.addEventListener('change', function() {
    paintEnabled = this.checked;
    renderCollage(currentCollageImages, currentCollageLayout);
    applyPaintOverlay();
    updateTextZIndexButtonStates();
    const settings = getCollageSettings();
    encodeSettingsToURL(settings);
    resetHeartButton();
});

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const savesBtn = document.getElementById('savesBtn');
    const savesPanel = document.getElementById('saves-panel');
    
    if (!filterBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
    }
    if (!layoutBtn.contains(e.target) && !layoutPanel.contains(e.target)) {
        layoutPanel.classList.remove('show');
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
    if (!savesBtn.contains(e.target) && !savesPanel.contains(e.target)) {
        savesPanel.classList.remove('show');
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadFavoriteLayouts();
    initializeTagFilters();
    initializeLayoutOptions();
    initializeSVGEffects();
    initializeOverlays();
    
    // Set up the generate button
    const generateBtn = document.getElementById('generateBtn');
    const generateOverlay = document.getElementById('generate-overlay');
    const collageContainer = document.getElementById('collage-container');
    
    generateBtn.addEventListener('click', function() {
        console.log('===== GENERATE BUTTON CLICKED =====');
        generateOverlay.classList.add('hidden');
        collageContainer.classList.add('active');
        renderCollage();
        console.log('After renderCollage - currentCollageImages:', currentCollageImages.map(i => i.path));
        assetsGenerated = true;
        setToolbarButtonsEnabled(true);
        
        // Update URL with current collage settings
        setTimeout(() => {
            console.log('Before getCollageSettings - currentCollageImages:', currentCollageImages.map(i => i.path));
            const settings = getCollageSettings();
            console.log('After getCollageSettings - settings.collageImages:', settings.collageImages.map(i => i.path));
            encodeSettingsToURL(settings);
            console.log('After encodeSettingsToURL - URL:', window.location.href);
            console.log('===== GENERATE COMPLETE =====');
        }, 100);
    });
    
    // Disable toolbar buttons on page load
    setToolbarButtonsEnabled(false);
    
    // Disable text depth buttons until paint overlay is enabled
    updateTextZIndexButtonStates();
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
            resetHeartButton();
            // Update URL with new overlay selection
            const settings = getCollageSettings();
            encodeSettingsToURL(settings);
        });
        
        label.appendChild(radio);
        const labelText = document.createElement('span');
        labelText.textContent = overlay.name;
        label.appendChild(labelText);
        
        overlayList.appendChild(label);
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
                    
                    // Save position to URL
                    const settings = getCollageSettings();
                    encodeSettingsToURL(settings);
                }
            }
        });
}
// ============================================================
// URL Parameters & Settings Management
// ============================================================

function getCollageSettings() {
    const textOverlay = document.getElementById('text-overlay');
    return {
        selectedTags: selectedTags,
        selectedEffects: selectedEffects,
        effectIntensity: effectIntensity,
        customImageUrl: customImageUrl,
        textOverlayContent: textOverlayContent,
        textFontFamily: textFontFamily,
        textFontSize: textFontSize,
        textFontColor: textFontColor,
        textFontBold: textFontBold,
        textFontItalic: textFontItalic,
        textFontUnderline: textFontUnderline,
        textX: textOverlay.dataset.x || 0,
        textY: textOverlay.dataset.y || 0,
        textZIndex: textZIndex,
        selectedOverlay: selectedOverlay,
        overlayOpacity: overlayOpacity,
        paintColor: paintColor,
        paintOpacity: paintOpacity,
        paintEnabled: paintEnabled,
        // Store the actual collage composition
        collageImages: currentCollageImages,
        collageLayout: currentCollageLayout,
        // Store the selected layout if one was chosen
        selectedLayout: selectedLayout
    };
}

function restoreCollageSettings(settings) {
    if (!settings) return;
    console.log('RESTORE: Starting restore with settings.collageImages:', settings.collageImages?.map(i => i.path));
    
    selectedTags = settings.selectedTags || [];
    selectedEffects = settings.selectedEffects || [];
    effectIntensity = settings.effectIntensity || { blur: 3 };
    customImageUrl = settings.customImageUrl || '';
    textOverlayContent = settings.textOverlayContent || '';
    textFontFamily = settings.textFontFamily || 'Arial, sans-serif';
    textFontSize = settings.textFontSize || 24;
    textFontColor = settings.textFontColor || '#212529';
    textFontBold = settings.textFontBold || false;
    textFontItalic = settings.textFontItalic || false;
    textFontUnderline = settings.textFontUnderline || false;
    textZIndex = settings.textZIndex || 100;
    selectedOverlay = settings.selectedOverlay || '';
    overlayOpacity = settings.overlayOpacity || 100;
    paintColor = settings.paintColor || '#FFFF00';
    paintOpacity = settings.paintOpacity || 50;
    paintEnabled = settings.paintEnabled || false;
    console.log('Restored paint settings:', { paintEnabled, paintColor, paintOpacity });
    
    // Restore the collage composition if available
    currentCollageImages = settings.collageImages || [];
    currentCollageLayout = settings.collageLayout || null;
    selectedLayout = settings.selectedLayout || null;
    console.log('RESTORE: Set currentCollageImages to:', currentCollageImages.map(i => i.path));
    
    // Update layout panel to show selected layout
    if (selectedLayout) {
        layoutSelectedImages = currentCollageImages;
        document.querySelectorAll('.layout-option').forEach(btn => {
            if (btn.dataset.layoutIndex === layoutPatterns.findIndex(l => l.name === selectedLayout.name).toString()) {
                btn.classList.remove('btn-outline-secondary');
                btn.classList.add('btn-primary');
            } else {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline-secondary');
            }
        });
    }
    
    // Update UI elements
    updateUIFromSettings();
    
    // Render with specific images/layout if available, otherwise random
    if (currentCollageImages.length > 0 && currentCollageLayout) {
        console.log('RESTORE: Rendering with specific images:', currentCollageImages.map(i => i.path));
        renderCollage(currentCollageImages, currentCollageLayout);
    } else {
        console.log('RESTORE: Rendering with random images');
        renderCollage();
    }
    
    updateTextOverlay();
    
    // Restore text position and z-index
    if (settings.textX || settings.textY || settings.textZIndex) {
        const textOverlay = document.getElementById('text-overlay');
        textOverlay.dataset.x = settings.textX || 0;
        textOverlay.dataset.y = settings.textY || 0;
        textOverlay.style.zIndex = settings.textZIndex || 100;
        const angle = parseFloat(textOverlay.dataset.angle) || 0;
        textOverlay.style.transform = `translate(${settings.textX || 0}px, ${settings.textY || 0}px) rotate(${angle}deg)`;
        // Re-initialize interactions to make it still draggable
        if (textOverlayContent) {
            initializeTextInteractions();
        }
    }
    
    applyPaintOverlay();
    
    // Update text z-index button states
    updateTextZIndexButtonStates();
    
    // Fill the heart if this was a previously saved collage
    const heartBtn = document.getElementById('saveHeartBtn');
    if (heartBtn && settings.isSavedCollage) {
        heartBtn.classList.add('filled');
        heartBtn.innerHTML = '<i class="bi bi-heart-fill"></i>';
    }
}

function updateUIFromSettings() {
    // Update tag checkboxes
    document.querySelectorAll('.tag-filter-checkbox').forEach(checkbox => {
        checkbox.checked = selectedTags.includes(checkbox.value);
    });
    
    // Update effect checkboxes and slider
    document.querySelectorAll('.blend-mode-radio').forEach(checkbox => {
        checkbox.checked = selectedEffects.includes(checkbox.value);
        // Also show/hide slider if it's a blur or glitch effect
        if (checkbox.value === 'blur' || checkbox.value === 'glitch') {
            const sliderContainer = checkbox.closest('div').querySelector('div[style*="display"]');
            if (sliderContainer) {
                sliderContainer.style.display = checkbox.checked ? 'flex' : 'none';
                if (checkbox.checked) {
                    sliderContainer.style.alignItems = 'center';
                    sliderContainer.style.gap = '8px';
                }
            }
        }
    });
    
    // Update blur slider value and display
    const blurSlider = document.getElementById('blur-slider');
    if (blurSlider) {
        blurSlider.value = effectIntensity.blur;
        // Update the value display next to the slider
        const valueDisplay = blurSlider.parentElement.querySelector('span');
        if (valueDisplay) {
            valueDisplay.textContent = effectIntensity.blur + 'px';
        }
    }
    
    // Update glitch slider value and display
    const glitchSlider = document.getElementById('glitch-slider');
    if (glitchSlider) {
        glitchSlider.value = effectIntensity.glitch;
        // Update the value display next to the slider
        const valueDisplay = glitchSlider.parentElement.querySelector('span');
        if (valueDisplay) {
            valueDisplay.textContent = effectIntensity.glitch;
        }
        // Update glitch filter scale
        const glitchDisplacementMap = document.querySelector('#svg-glitch feDisplacementMap');
        if (glitchDisplacementMap) {
            glitchDisplacementMap.setAttribute('scale', effectIntensity.glitch);
        }
    }
    
    // Update SVG blur filter
    const blurFilter = document.getElementById('blur-filter');
    if (blurFilter) {
        blurFilter.setAttribute('stdDeviation', effectIntensity.blur);
    }
    
    // Update image URL
    const imageUrlInput = document.getElementById('imageUrlInput');
    if (imageUrlInput) {
        imageUrlInput.value = customImageUrl;
    }
    
    // Update text settings
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.value = textOverlayContent;
    }
    const fontFamily = document.getElementById('fontFamily');
    if (fontFamily) {
        fontFamily.value = textFontFamily;
    }
    const fontSize = document.getElementById('fontSize');
    if (fontSize) {
        fontSize.value = textFontSize;
    }
    const fontColor = document.getElementById('fontColor');
    if (fontColor) {
        fontColor.value = textFontColor;
    }
    const colorValue = document.getElementById('colorValue');
    if (colorValue) {
        colorValue.textContent = textFontColor;
    }
    const fontBold = document.getElementById('fontBold');
    if (fontBold) {
        fontBold.classList.toggle('active', textFontBold);
    }
    const fontItalic = document.getElementById('fontItalic');
    if (fontItalic) {
        fontItalic.classList.toggle('active', textFontItalic);
    }
    
    // Update overlay settings
    const overlayOpacityInput = document.getElementById('overlayOpacity');
    if (overlayOpacityInput) {
        overlayOpacityInput.value = overlayOpacity;
    }
    const opacityValueEl = document.getElementById('opacityValue');
    if (opacityValueEl) {
        opacityValueEl.textContent = overlayOpacity + '%';
    }
    
    // Update paint settings
    const paintColorEl = document.getElementById('paintColor');
    if (paintColorEl) {
        paintColorEl.value = paintColor;
    }
    const paintColorValue = document.getElementById('paintColorValue');
    if (paintColorValue) {
        paintColorValue.textContent = paintColor;
    }
    const paintOpacityEl = document.getElementById('paintOpacity');
    if (paintOpacityEl) {
        paintOpacityEl.value = paintOpacity;
    }
    const paintOpacityValue = document.getElementById('paintOpacityValue');
    if (paintOpacityValue) {
        paintOpacityValue.textContent = paintOpacity + '%';
    }
    const paintToggle = document.getElementById('paintToggle');
    if (paintToggle) {
        paintToggle.checked = paintEnabled;
    }
}

function encodeSettingsToURL(settings) {
    try {
        console.log('=== ENCODE START ===');
        console.log('Global images array:', images?.map(i => i.path));
        console.log('Settings collageImages:', settings?.collageImages?.map(i => i.path));
        const params = new URLSearchParams();
        
        // Layout - use selectedLayout if explicitly chosen
        if (settings.selectedLayout) {
            params.set('selectedLayout', settings.selectedLayout.name);
        } else if (settings.collageLayout) {
            params.set('layout', settings.collageLayout.name);
        }
        
        // Images - use stable IDs for compact URLs
        if (settings.collageImages && settings.collageImages.length > 0) {
            const imageIds = settings.collageImages.map(img => img.id).join(',');
            console.log('ENCODE: Image paths:', settings.collageImages.map(i => i.path));
            console.log('ENCODE: Image IDs:', imageIds);
            params.set('images', imageIds);
        } else {
            console.log('ENCODE: No images to encode');
        }
        
        // Tags (filters applied)
        if (settings.selectedTags && settings.selectedTags.length > 0) {
            params.set('tags', settings.selectedTags.join(','));
        }
        
        // Effects
        if (settings.selectedEffects && settings.selectedEffects.length > 0) {
            params.set('effects', settings.selectedEffects.join(','));
        }
        
        // Blur intensity - only include if blur effect is actually selected
        if (settings.selectedEffects && settings.selectedEffects.includes('blur') && settings.effectIntensity && settings.effectIntensity.blur) {
            params.set('blur', settings.effectIntensity.blur);
        }
        
        // Custom image URL
        if (settings.customImageUrl) {
            params.set('customImage', settings.customImageUrl);
        }
        
        // Text overlay
        if (settings.textOverlayContent) {
            params.set('text', settings.textOverlayContent);
            params.set('textFont', settings.textFontFamily);
            params.set('textSize', settings.textFontSize);
            // Store color without # to reduce URL encoding
            params.set('textColor', settings.textFontColor.replace('#', ''));
            params.set('textBold', settings.textFontBold ? '1' : '0');
            params.set('textItalic', settings.textFontItalic ? '1' : '0');
            params.set('textUnderline', settings.textFontUnderline ? '1' : '0');
            // Store text position
            if (settings.textX && settings.textX !== '0') {
                params.set('textX', settings.textX);
            }
            if (settings.textY && settings.textY !== '0') {
                params.set('textY', settings.textY);
            }
            // Store text z-index if not default (110)
            if (settings.textZIndex && settings.textZIndex !== 110) {
                params.set('textZIndex', settings.textZIndex);
            }
        }
        
        // Overlay
        if (settings.selectedOverlay) {
            params.set('overlay', settings.selectedOverlay);
            params.set('overlayOpacity', settings.overlayOpacity);
        }
        
        // Paint overlay - always save opacity slider value
        params.set('paintOpacity', settings.paintOpacity);
        if (settings.paintEnabled) {
            params.set('paint', '1');
            // Store color without # to reduce URL encoding
            params.set('paintColor', settings.paintColor.replace('#', ''));
        }
        
        // Update URL with human-readable parameters
        const queryString = params.toString();
        console.log('=== ENCODE END ===');
        console.log('Final URL:', window.location.origin + window.location.pathname + (queryString ? '?' + queryString : ''));
        window.history.replaceState(null, '', queryString ? '?' + queryString : '');
    } catch (e) {
        console.error('Error encoding collage to URL:', e);
    }
}

function decodeSettingsFromURL() {
    // Get all parameters from query string
    const params = new URLSearchParams(window.location.search);
    const settings = {};
    
    // Check if there are any collage-related parameters
    if (!params.has('layout') && !params.has('selectedLayout') && !params.has('tags') && !params.has('effects') && 
        !params.has('text') && !params.has('overlay') && !params.has('paint') && !params.has('images')) {
        return null;
    }
    
    try {
        // Layout - check for explicitly selected layout first
        if (params.has('selectedLayout')) {
            const layoutName = params.get('selectedLayout');
            const layout = layoutPatterns.find(l => l.name === layoutName);
            if (layout) {
                settings.selectedLayout = layout;
                settings.collageLayout = layout;
            }
        } else if (params.has('layout')) {
            const layoutName = params.get('layout');
            const layout = layoutPatterns.find(l => l.name === layoutName);
            if (layout) {
                settings.collageLayout = layout;
            }
        }
        
        // Images - decode from stable IDs
        if (params.has('images')) {
            try {
                const rawImageParam = params.get('images');
                console.log('DECODE: Raw images param from URL:', rawImageParam);
                const imageIds = rawImageParam.split(',').map(id => parseInt(id));
                console.log('DECODE: Image IDs:', imageIds);
                console.log('DECODE: Global images array has:', images.map(i => `id:${i.id} path:${i.path}`));
                settings.collageImages = imageIds.map(id => {
                    const imgObj = images.find(img => img.id === id);
                    console.log('  Searching for id:', id, '=> found:', imgObj?.path || 'NOT FOUND');
                    return imgObj || null;
                }).filter(img => img !== null);
                console.log('DECODE: Resolved to:', settings.collageImages.map(i => i.path));
            } catch (e) {
                console.warn('Could not decode images from URL:', e);
                settings.collageImages = [];
            }
        } else {
            console.log('No images parameter in URL');
            settings.collageImages = [];
        }
        
        // Tags (filters)
        if (params.has('tags')) {
            settings.selectedTags = params.get('tags').split(',').filter(t => t);
        } else {
            settings.selectedTags = [];
        }
        
        // Effects
        if (params.has('effects')) {
            settings.selectedEffects = params.get('effects').split(',').filter(e => e);
        } else {
            settings.selectedEffects = [];
        }
        
        // Blur intensity
        settings.effectIntensity = { 
            blur: params.has('blur') ? parseInt(params.get('blur')) : 3 
        };
        
        // Custom image URL
        settings.customImageUrl = params.get('customImage') || '';
        
        // Text overlay
        settings.textOverlayContent = params.get('text') || '';
        settings.textFontFamily = params.get('textFont') || 'Arial, sans-serif';
        settings.textFontSize = params.has('textSize') ? parseInt(params.get('textSize')) : 24;
        // Restore color with # prefix (URL stores without #)
        const textColorValue = params.get('textColor') || '212529';
        settings.textFontColor = textColorValue.startsWith('#') ? textColorValue : '#' + textColorValue;
        settings.textFontBold = params.get('textBold') === '1';
        settings.textFontItalic = params.get('textItalic') === '1';
        settings.textFontUnderline = params.get('textUnderline') === '1';
        // Restore text position and z-index
        settings.textX = params.has('textX') ? parseFloat(params.get('textX')) : 0;
        settings.textY = params.has('textY') ? parseFloat(params.get('textY')) : 0;
        settings.textZIndex = params.has('textZIndex') ? parseInt(params.get('textZIndex')) : 110;
        
        // Overlay
        settings.selectedOverlay = params.get('overlay') || '';
        settings.overlayOpacity = params.has('overlayOpacity') ? parseInt(params.get('overlayOpacity')) : 100;
        
        // Paint overlay
        settings.paintEnabled = params.get('paint') === '1';
        // Restore color with # prefix (URL stores without #)
        const paintColorValue = params.get('paintColor') || 'FFFF00';
        settings.paintColor = paintColorValue.startsWith('#') ? paintColorValue : '#' + paintColorValue;
        settings.paintOpacity = params.has('paintOpacity') ? parseInt(params.get('paintOpacity')) : 50;
        
        // Only set collageLayout if we have images to render
        if (!settings.collageImages || settings.collageImages.length === 0) {
            settings.collageLayout = null;
        }
        
        console.log('Successfully decoded collage from URL parameters');
        return settings;
    } catch (e) {
        console.error('Error decoding collage from URL:', e);
        return null;
    }
}

// ============================================================
// Local Storage Management
// ============================================================

function getSavedCollages() {
    const saved = localStorage.getItem('collage-saves');
    return saved ? JSON.parse(saved) : [];
}

function saveCollageToStorage(name, settings) {
    const collages = getSavedCollages();
    collages.push({
        id: Date.now(),
        name: name,
        timestamp: new Date().toLocaleString(),
        settings: settings
    });
    localStorage.setItem('collage-saves', JSON.stringify(collages));
    return collages[collages.length - 1].id;
}

function deleteCollageFromStorage(id) {
    let collages = getSavedCollages();
    collages = collages.filter(c => c.id !== id);
    localStorage.setItem('collage-saves', JSON.stringify(collages));
}

function loadCollageFromStorage(id) {
    const collages = getSavedCollages();
    return collages.find(c => c.id === id);
}

function renderSavesList() {
    const list = document.getElementById('saves-list');
    const collages = getSavedCollages();
    
    if (collages.length === 0) {
        list.innerHTML = '<p style="color: #6c757d; font-size: 0.875rem; margin: 0;">No saved collages</p>';
        return;
    }
    
    list.innerHTML = collages.map(collage => `
        <div class="save-item">
            <div class="save-item-name" title="${collage.name}" data-id="${collage.id}" style="cursor: pointer;">
                <strong>${collage.name}</strong>
                <div style="font-size: 0.75rem; color: #6c757d;">${collage.timestamp}</div>
            </div>
            <button class="save-item-delete" data-id="${collage.id}" title="Delete">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `).join('');
    
    // Add event listeners
    list.querySelectorAll('.save-item-name').forEach(item => {
        item.addEventListener('click', () => {
            const collage = loadCollageFromStorage(parseInt(item.dataset.id));
            if (collage) {
                const settings = collage.settings;
                settings.isSavedCollage = true;
                restoreCollageSettings(settings);
                encodeSettingsToURL(settings);
                
                // Hide generate overlay and mark as generated
                const generateOverlay = document.getElementById('generate-overlay');
                const collageContainer = document.getElementById('collage-container');
                if (generateOverlay && !generateOverlay.classList.contains('hidden')) {
                    generateOverlay.classList.add('hidden');
                    collageContainer.classList.add('active');
                    assetsGenerated = true;
                    setToolbarButtonsEnabled(true);
                }
                
                // Close the saves panel
                document.getElementById('saves-panel').classList.remove('show');
            }
        });
    });
    
    list.querySelectorAll('.save-item-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const saveItem = btn.closest('.save-item');
            const confirmId = 'confirm-' + Date.now();
            const confirmHtml = `
                <div id="${confirmId}" class="alert alert-warning alert-dismissible fade show" role="alert" style="margin-bottom: 10px;">
                    <div style="margin-bottom: 10px;">Delete this collage?</div>
                    <div style="display: flex; gap: 10px;">
                        <button type="button" class="btn btn-sm btn-danger confirm-yes">Yes, Delete</button>
                        <button type="button" class="btn btn-sm btn-secondary confirm-no">Cancel</button>
                    </div>
                </div>
            `;
            saveItem.insertAdjacentHTML('afterend', confirmHtml);
            
            const confirmElement = document.getElementById(confirmId);
            const yesBtn = confirmElement.querySelector('.confirm-yes');
            const noBtn = confirmElement.querySelector('.confirm-no');
            
            function cleanup() {
                confirmElement.remove();
            }
            
            yesBtn.addEventListener('click', () => {
                deleteCollageFromStorage(id);
                cleanup();
                renderSavesList();
                // Keep the panel open after deletion
                setTimeout(() => {
                    document.getElementById('saves-panel').classList.add('show');
                }, 0);
            });
            
            noBtn.addEventListener('click', () => {
                cleanup();
            });
        });
    });
}

function exportSavesToJSON() {
    const collages = getSavedCollages();
    const dataStr = JSON.stringify(collages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'collage-saves_' + new Date().getTime() + '.json';
    link.click();
    URL.revokeObjectURL(url);
}

function importSavesFromJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            const existing = getSavedCollages();
            
            // Merge with existing saves, avoiding duplicates by ID
            const merged = [...existing];
            imported.forEach(item => {
                if (!merged.find(m => m.id === item.id)) {
                    merged.push(item);
                }
            });
            
            localStorage.setItem('collage-saves', JSON.stringify(merged));
            renderSavesList();
            showAlert('Saves imported successfully!', 'success');
        } catch (err) {
            showAlert('Error importing saves: ' + err.message, 'danger');
        }
    };
    reader.readAsText(file);
}

// ============================================================
// UI Event Listeners
// ============================================================

document.getElementById('savesBtn').addEventListener('click', () => {
    const panel = document.getElementById('saves-panel');
    const isShowing = panel.classList.contains('show');
    
    document.querySelectorAll('.dropdown-menu, .image-modal, .text-modal, .overlay-panel, .paint-panel').forEach(el => {
        el.classList.remove('show');
    });
    
    if (!isShowing) {
        panel.classList.add('show');
        renderSavesList();
    } else {
        panel.classList.remove('show');
    }
});

// Show save modal when clicking heart button
document.getElementById('saveHeartBtn').addEventListener('click', () => {
    document.getElementById('collageNameInput').value = '';
    const modal = new bootstrap.Modal(document.getElementById('save-modal'));
    modal.show();
});

// Share button functionality
document.getElementById('shareBtn').addEventListener('click', async () => {
    // Simply copy the current URL which already has all parameters encoded
    const shareUrl = window.location.href;
    
    console.log('Sharing URL:', shareUrl);
    
    // Check if Web Share API is available (mobile)
    if (navigator.share && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        try {
            await navigator.share({
                title: 'Collage Asset Generator',
                text: 'Check out this collage I created!',
                url: shareUrl
            });
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Share failed:', err);
            }
        }
    } else {
        // Desktop: Copy to clipboard
        try {
            await navigator.clipboard.writeText(shareUrl);
            showAlert('URL has been copied to clipboard', 'success');
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            showAlert('Failed to copy URL to clipboard', 'danger');
        }
    }
});

// Info button functionality - display image information
document.getElementById('infoBtn').addEventListener('click', () => {
    if (!currentCollageImages || currentCollageImages.length === 0) {
        showAlert('No images in collage to display info', 'info');
        return;
    }
    
    // Build the image info content
    let infoHtml = '<table class="table table-sm"><thead><tr><th>Filename</th><th>Attribution</th><th>Source</th></tr></thead><tbody>';
    
    currentCollageImages.forEach(img => {
        const fileName = img.path.split('/').pop() || 'Unknown';
        const attribution = img.attribution || 'NA';
        const link = img.link || 'NA';
        
        // Make links clickable if not "NA"
        let linkDisplay;
        if (link !== 'NA') {
            // Add protocol if missing
            const url = link.startsWith('http') ? link : 'https://' + link;
            linkDisplay = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="truncate-link" title="${link}">${link}</a>`;
        } else {
            linkDisplay = 'NA';
        }
        
        infoHtml += `<tr><td>${fileName}</td><td><div class="truncate-link" title="${attribution}">${attribution}</div></td><td>${linkDisplay}</td></tr>`;
    });
    
    infoHtml += '</tbody></table>';
    document.getElementById('imageInfoContent').innerHTML = infoHtml;
    
    const modal = new bootstrap.Modal(document.getElementById('imageInfoModal'));
    modal.show();
});

// Also allow Ctrl+S to save
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        document.getElementById('collageNameInput').value = '';
        const modal = new bootstrap.Modal(document.getElementById('save-modal'));
        modal.show();
    }
});

document.getElementById('confirmSaveBtn').addEventListener('click', () => {
    const name = document.getElementById('collageNameInput').value.trim();
    if (!name) {
        showAlert('Please enter a name for the collage', 'warning');
        return;
    }
    
    const settings = getCollageSettings();
    saveCollageToStorage(name, settings);
    
    // Close modal and reset
    bootstrap.Modal.getInstance(document.getElementById('save-modal')).hide();
    document.getElementById('collageNameInput').value = '';
    renderSavesList();
    
    // Fill the heart
    const heartBtn = document.getElementById('saveHeartBtn');
    heartBtn.classList.add('filled');
    heartBtn.innerHTML = '<i class="bi bi-heart-fill"></i>';
    
    showAlert('Collage saved successfully!', 'success');
});

document.getElementById('exportSavesBtn').addEventListener('click', exportSavesToJSON);

document.getElementById('importSavesBtn').addEventListener('click', () => {
    document.getElementById('importsavesFile').click();
});

document.getElementById('importsavesFile').addEventListener('change', (e) => {
    if (e.target.files[0]) {
        importSavesFromJSON(e.target.files[0]);
        e.target.value = '';
    }
});

// Update URL parameters when settings change
function setupURLUpdateListeners() {
    // This will be called after each significant change
    // For now, we'll update on these key events
    document.getElementById('generateBtn').addEventListener('click', () => {
        setTimeout(() => {
            const settings = getCollageSettings();
            encodeSettingsToURL(settings);
        }, 100);
    });
}

// Parse URL on page load
window.addEventListener('load', () => {
    console.log('===== PAGE LOAD START =====');
    console.log('URL:', window.location.href);
    const urlSettings = decodeSettingsFromURL();
    console.log('Decoded URL settings - images:', urlSettings?.collageImages?.map(i => i.path));
    if (urlSettings && urlSettings.collageImages && urlSettings.collageImages.length > 0) {
        console.log('Loading collage from URL with', urlSettings.collageImages.length, 'images');
        loadingFromURL = true;
        restoreCollageSettings(urlSettings);
        loadingFromURL = false;
        
        // Mark as generated and show the collage immediately
        const generateOverlay = document.getElementById('generate-overlay');
        const collageContainer = document.getElementById('collage-container');
        if (generateOverlay) {
            generateOverlay.classList.add('hidden');
        }
        if (collageContainer) {
            collageContainer.classList.add('active');
        }
        assetsGenerated = true;
        setToolbarButtonsEnabled(true);
    } else {
        console.log('No URL settings found - page loaded without collage state');
    }
    console.log('===== PAGE LOAD COMPLETE =====');
    setupURLUpdateListeners();
});