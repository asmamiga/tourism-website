// Sample seed data for attractions
const seedAttractions = [
  {
    id: 1,
    name: 'Hassan II Mosque',
    description: 'The largest mosque in Morocco and the 7th largest in the world, located in Casablanca with a stunning minaret that stands 210 meters tall.',
    city_id: 1,
    region_id: 1,
    category: 'historical',
    rating: 4.8,
    photos: [
      { id: 1, url: '/images/attractions/hassan-ii-1.jpg', is_primary: true },
      { id: 2, url: '/images/attractions/hassan-ii-2.jpg', is_primary: false }
    ]
  },
  {
    id: 2,
    name: 'Jemaa el-Fnaa',
    description: 'The main square and market place in Marrakesh, known for its vibrant atmosphere, street performers, and food stalls.',
    city_id: 2,
    region_id: 2,
    category: 'cultural',
    rating: 4.7,
    photos: [
      { id: 3, url: '/images/attractions/jemaa-1.jpg', is_primary: true },
      { id: 4, url: '/images/attractions/jemaa-2.jpg', is_primary: false }
    ]
  },
  {
    id: 3,
    name: 'Chefchaouen',
    description: 'The famous blue city in the Rif Mountains, known for its striking blue-painted buildings and relaxed atmosphere.',
    city_id: 3,
    region_id: 3,
    category: 'scenic',
    rating: 4.9,
    photos: [
      { id: 5, url: '/images/attractions/chefchaouen-1.jpg', is_primary: true },
      { id: 6, url: '/images/attractions/chefchaouen-2.jpg', is_primary: false }
    ]
  }
];

const seedCities = [
  { id: 1, name: 'Casablanca', region_id: 1 },
  { id: 2, name: 'Marrakesh', region_id: 2 },
  { id: 3, name: 'Chefchaouen', region_id: 3 },
  { id: 4, name: 'Fes', region_id: 4 },
  { id: 5, name: 'Tangier', region_id: 5 }
];

const seedRegions = [
  { id: 1, name: 'Casablanca-Settat' },
  { id: 2, name: 'Marrakesh-Safi' },
  { id: 3, name: 'Tanger-Tetouan-Al Hoceima' },
  { id: 4, name: 'Fes-Meknes' },
  { id: 5, name: 'Rabat-Sale-Kenitra' }
];

const seedCategories = [
  { id: 1, name: 'Historical', slug: 'historical', icon: 'landmark' },
  { id: 2, name: 'Natural', slug: 'natural', icon: 'mountain' },
  { id: 3, name: 'Beach', slug: 'beach', icon: 'umbrella-beach' },
  { id: 4, name: 'Cultural', slug: 'cultural', icon: 'city' },
  { id: 5, name: 'Adventure', slug: 'adventure', icon: 'hiking' }
];

export const fetchSeedData = (resource, params = {}) => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      let data;
      
      switch(resource) {
        case 'attractions':
          data = applyFilters(seedAttractions, params);
          break;
        case 'cities':
          data = applyFilters(seedCities, params);
          break;
        case 'regions':
          data = applyFilters(seedRegions, params);
          break;
        case 'categories':
          data = applyFilters(seedCategories, params);
          break;
        default:
          data = [];
      }
      
      resolve({
        data,
        meta: {
          total: data.length,
          current_page: 1,
          last_page: 1,
          per_page: 12
        }
      });
    }, 300);
  });
};

const applyFilters = (data, filters = {}) => {
  if (!filters || Object.keys(filters).length === 0) {
    return [...data];
  }
  
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === '') return true;
      
      // Handle special cases
      if (key === 'search' && item.name) {
        return item.name.toLowerCase().includes(value.toLowerCase());
      }
      
      // Handle numeric comparisons
      if (['id', 'city_id', 'region_id'].includes(key)) {
        return item[key] === parseInt(value, 10);
      }
      
      // Default comparison
      return item[key] === value;
    });
  });
};

export default {
  fetchSeedData,
  seedAttractions,
  seedCities,
  seedRegions,
  seedCategories
};
