// Array of all images in the img folder with tags for filtering
const images = [
    { id: 0, path: 'img/advertisement.jpg', tags: ['tag1', 'tag2', 'advertisement'] },
    { id: 1, path: 'img/crane-2.jpg', tags: ['tag1', 'tag3', 'bird'] },
    { id: 2, path: 'img/crane.jpg', tags: ['tag2', 'tag3', 'bird'] },
    { id: 3, path: 'img/heron.png', tags: ['tag1', 'tag2', 'bird'] },
    { id: 4, path: 'img/soda-ad.jpg', tags: ['tag2', 'tag3', 'advertisement'] },
    { id: 5, path: 'img/vintage-cat-poster.png', tags: ['tag1', 'tag3', 'advertisement'] },
    { id: 6, path: 'img/vintage-model-1.png', tags: ['tag1', 'tag2', 'tag3'] }
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
