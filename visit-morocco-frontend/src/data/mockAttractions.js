// Centralized mock data for attractions, cities, regions, categories

export const MOCK_ATTRACTIONS = [
  {
    attraction_id: 1,
    name: 'Jardin Majorelle',
    city: { city_id: 1, name: 'Marrakech' },
    region: { region_id: 1, name: 'Marrakech-Safi' },
    category: 'Garden',
    description: 'A famous garden in Marrakech.',
    latitude: 31.6295,
    longitude: -7.9936,
    photos: [
      'https://images.unsplash.com/photo-1539020140153-e8c237425f2d?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    attraction_id: 2,
    name: 'Hassan II Mosque',
    city: { city_id: 2, name: 'Casablanca' },
    region: { region_id: 2, name: 'Casablanca-Settat' },
    category: 'Mosque',
    description: 'The largest mosque in Morocco.',
    latitude: 33.6083,
    longitude: -7.6325,
    photos: [
      'https://images.unsplash.com/photo-1548240693-c7d69e8c2583?auto=format&fit=crop&w=800&q=80'
    ]
  }
];

export const MOCK_CITIES = [
  { city_id: 1, name: 'Marrakech' },
  { city_id: 2, name: 'Casablanca' }
];

export const MOCK_REGIONS = [
  { region_id: 1, name: 'Marrakech-Safi' },
  { region_id: 2, name: 'Casablanca-Settat' }
];

export const MOCK_CATEGORIES = ['Garden', 'Mosque'];
