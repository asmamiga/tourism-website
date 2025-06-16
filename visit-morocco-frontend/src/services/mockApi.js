import { fetchSeedData } from '../data/seedData';

// Mock API service that mimics the real API but uses local seed data
export const mockAttractionService = {
  getAll: async (params = {}) => {
    const response = await fetchSeedData('attractions', params);
    return {
      data: response.data,
      meta: response.meta
    };
  },
  
  getById: async (id) => {
    const response = await fetchSeedData('attractions');
    const attraction = response.data.find(item => item.id === parseInt(id, 10));
    return { data: attraction };
  },
  
  getCategories: async () => {
    const response = await fetchSeedData('categories');
    return { data: response.data };
  }
};

export const mockCityService = {
  getAll: async () => {
    const response = await fetchSeedData('cities');
    return { data: response.data };
  },
  
  getById: async (id) => {
    const response = await fetchSeedData('cities');
    const city = response.data.find(item => item.id === parseInt(id, 10));
    return { data: city };
  },
  
  getByRegion: async (regionId) => {
    const response = await fetchSeedData('cities', { region_id: regionId });
    return { data: response.data };
  }
};

export const mockRegionService = {
  getAll: async () => {
    const response = await fetchSeedData('regions');
    return { data: response.data };
  },
  
  getById: async (id) => {
    const response = await fetchSeedData('regions');
    const region = response.data.find(item => item.id === parseInt(id, 10));
    return { data: region };
  }
};

// Export all mock services
export default {
  attractionService: mockAttractionService,
  cityService: mockCityService,
  regionService: mockRegionService
};
