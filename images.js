// Array of all images in the img folder with tags for filtering
const images = [
    { id: 0, path: 'img/advertisement.jpg', tags: ['antique', 'advertisement'], attribution: 'ArtsyBee', link: 'pixabay.com/illustrations/advertisement-collage-paper-5840579/' },
    { id: 1, path: 'img/crane-2.jpg', tags: ['vector', 'bird'], attribution: 'Agzam', link: 'pixabay.com/illustrations/crane-bird-on-a-branch-nature-7459018/' },
    { id: 2, path: 'img/crane.jpg', tags: ['vintage', 'bird'], attribution: 'CDD20', link: 'pixabay.com/illustrations/crane-red-crowned-crane-chinese-art-6839511/' },
    { id: 3, path: 'img/heron.png', tags: ['vintage', 'bird'], attribution: 'GDJ', link: 'pixabay.com/vectors/herons-birds-animals-poster-7881512/' },
    { id: 4, path: 'img/soda-ad.jpg', tags: ['vintage', 'advertisement'], attribution: 'VintageBlue', link: 'pixabay.com/illustrations/soda-bottle-old-ads-vintage-model-983293/#:~:text=Download%20Soda%2C%20Bottle%2C%20Old%20Ads,206' },
    { id: 5, path: 'img/vintage-cat-poster.png', tags: ['vintage', 'advertisement'], attribution: 'No-longer-here', link: 'https://pixabay.com/illustrations/vintage-poster-ad-retro-design-923009/' },
    { id: 6, path: 'img/vintage-model-1.png', tags: ['comic', 'vector'], attribution: '爪丨丂ㄒ乇尺_卩丨ㄒㄒ丨几Ꮆ乇尺', link: 'pixabay.com/illustrations/ai-generated-woman-retro-vintage-8606435/' },
    { id: 7, path: 'img/reindeer.jpg', tags: ['christmas', 'vintage', 'purple'], attribution: 'freeillustrated', link: 'pixabay.com/illustrations/reindeer-antlers-christmas-2990790/' }
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
