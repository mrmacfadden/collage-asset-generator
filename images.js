// Array of all images in the img folder with tags for filtering
const images = [
    { path: 'img/advertisement.jpg', tags: ['tag1', 'tag2', 'advertisement'] },
    { path: 'img/crane-2.jpg', tags: ['tag1', 'tag3', 'bird'] },
    { path: 'img/crane.jpg', tags: ['tag2', 'tag3', 'bird'] },
    { path: 'img/heron.png', tags: ['tag1', 'tag2', 'bird'] },
    { path: 'img/soda-ad.jpg', tags: ['tag2', 'tag3', 'advertisement'] },
    { path: 'img/vintage-cat-poster.png', tags: ['tag1', 'tag3', 'advertisement'] },
    { path: 'img/vintage-model-1.png', tags: ['tag1', 'tag2', 'tag3'] }
];

// Get all unique tags
function getAllTags() {
    const tagSet = new Set();
    images.forEach(img => {
        img.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
}

// Filter images by selected tags (returns images that have at least one of the selected tags)
function filterImagesByTags(selectedTags) {
    if (!selectedTags || selectedTags.length === 0) {
        return images;
    }
    return images.filter(img => 
        img.tags.some(tag => selectedTags.includes(tag))
    );
}
