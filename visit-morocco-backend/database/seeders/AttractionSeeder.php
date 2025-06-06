<?php

namespace Database\Seeders;

use App\Models\Attraction;
use App\Models\City;
use App\Models\Region;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AttractionSeeder extends Seeder
{
    public function run(): void
    {
        // First create all regions
        $regions = [
            'Marrakech-Safi' => [],
            'Fes-Meknes' => [],
            'Tanger-Tetouan-Al Hoceima' => [],
            'Drâa-Tafilalet' => [],
            'Rabat-Salé-Kénitra' => [],
            'Casablanca-Settat' => []
        ];

        foreach ($regions as $regionName => $data) {
            $regions[$regionName] = Region::firstOrCreate(
                ['name' => $regionName],
                ['description' => 'Region description for ' . $regionName]
            );
        }

        // Then create all cities with their regions and coordinates
        $cities = [
            'Marrakech' => [
                'region_id' => $regions['Marrakech-Safi']->region_id,
                'latitude' => 31.6295,
                'longitude' => -7.9811
            ],
            'Fes' => [
                'region_id' => $regions['Fes-Meknes']->region_id,
                'latitude' => 34.0181,
                'longitude' => -5.0078
            ],
            'Chefchaouen' => [
                'region_id' => $regions['Tanger-Tetouan-Al Hoceima']->region_id,
                'latitude' => 35.1714,
                'longitude' => -5.2699
            ],
            'Essaouira' => [
                'region_id' => $regions['Marrakech-Safi']->region_id,
                'latitude' => 31.5131,
                'longitude' => -9.7699
            ],
            'Merzouga' => [
                'region_id' => $regions['Drâa-Tafilalet']->region_id,
                'latitude' => 31.0795,
                'longitude' => -4.0109
            ],
            'Ouarzazate' => [
                'region_id' => $regions['Drâa-Tafilalet']->region_id,
                'latitude' => 30.9205,
                'longitude' => -6.8936
            ],
            'Rabat' => [
                'region_id' => $regions['Rabat-Salé-Kénitra']->region_id,
                'latitude' => 34.0150,
                'longitude' => -6.8326
            ],
            'Casablanca' => [
                'region_id' => $regions['Casablanca-Settat']->region_id,
                'latitude' => 33.5731,
                'longitude' => -7.5898
            ],
            'Meknes' => [
                'region_id' => $regions['Fes-Meknes']->region_id,
                'latitude' => 33.8833,
                'longitude' => -5.5000
            ],
            'Tangier' => [
                'region_id' => $regions['Tanger-Tetouan-Al Hoceima']->region_id,
                'latitude' => 35.7595,
                'longitude' => -5.8340
            ],
            'Ifrane' => [
                'region_id' => $regions['Fes-Meknes']->region_id,
                'latitude' => 33.5228,
                'longitude' => -5.1100
            ]
        ];

        // Store city models with proper IDs
        $cityIds = [];
        foreach ($cities as $cityName => $data) {
            $city = City::firstOrCreate(
                ['name' => $cityName],
                [
                    'region_id' => $data['region_id'],
                    'latitude' => $data['latitude'],
                    'longitude' => $data['longitude'],
                    'description' => 'Beautiful city of ' . $cityName
                ]
            );
            $cityIds[$cityName] = $city->city_id;
        }

        $attractions = [
            // Marrakech attractions
            [
                'name' => 'Jemaa el-Fnaa',
                'description' => 'The heart of Marrakech, a vibrant square with street performers, food stalls, and markets.',
                'city_id' => $cityIds['Marrakech'],
                'address' => 'Jemaa el-Fnaa, Marrakech 40000',
                'category' => 'cultural',
                'latitude' => 31.6258,
                'longitude' => -7.9892,
                'opening_hours' => json_encode(['sunday' => '00:00-23:59']),
                'entrance_fee' => 0,
                'visit_duration' => 120,
            ],
            [
                'name' => 'Bahia Palace',
                'description' => 'A stunning 19th-century palace with beautiful gardens and intricate architecture.',
                'city_id' => $cityIds['Marrakech'],
                'address' => '5 Rue Riad Zitoun el Jdid, Marrakech 40000',
                'category' => 'historical',
                'latitude' => 31.6186,
                'longitude' => -7.9786,
                'opening_hours' => json_encode(['sunday' => '09:00-16:30']),
                'entrance_fee' => 70,
                'visit_duration' => 90,
            ],
            [
                'name' => 'Majorelle Garden',
                'description' => 'A beautiful botanical garden with a vibrant blue villa, designed by French painter Jacques Majorelle.',
                'city_id' => $cityIds['Marrakech'],
                'address' => 'Rue Yves Saint Laurent, Marrakech 40090',
                'category' => 'garden',
                'latitude' => 31.6412,
                'longitude' => -8.0101,
                'opening_hours' => json_encode(['sunday' => '08:00-17:30']),
                'entrance_fee' => 70,
                'visit_duration' => 60,
            ],
            
            // Fes attractions
            [
                'name' => 'Fes el Bali',
                'description' => 'The world\'s largest car-free urban zone and a UNESCO World Heritage Site.',
                'city_id' => $cityIds['Fes'],
                'address' => 'Fes el Bali, Fes 30000',
                'category' => 'cultural',
                'latitude' => 34.0654,
                'longitude' => -4.9731,
                'opening_hours' => json_encode(['sunday' => '08:00-18:00']),
                'entrance_fee' => 0,
                'visit_duration' => 180,
            ],
            [
                'name' => 'Al Quaraouiyine University',
                'description' => 'The oldest existing, continually operating educational institution in the world, founded in 859 CE.',
                'city_id' => $cityIds['Fes'],
                'address' => 'Derb Boutouil, Fes 30000',
                'category' => 'historical',
                'latitude' => 34.0646,
                'longitude' => -4.9735,
                'opening_hours' => json_encode(['sunday' => '09:00-17:00']),
                'entrance_fee' => 20,
                'visit_duration' => 90,
            ],
            
            // Chefchaouen attractions
            [
                'name' => 'Chefchaouen Medina',
                'description' => 'The famous blue-painted old town, known for its striking blue-washed buildings.',
                'city_id' => $cityIds['Chefchaouen'],
                'address' => 'Chefchaouen Medina, Chefchaouen',
                'category' => 'cultural',
                'latitude' => 35.1714,
                'longitude' => -5.2699,
                'opening_hours' => json_encode(['sunday' => '00:00-23:59']),
                'entrance_fee' => 0,
                'visit_duration' => 120,
            ],
            [
                'name' => 'Ras El Maa Waterfall',
                'description' => 'A beautiful waterfall on the outskirts of Chefchaouen, perfect for a short hike.',
                'city_id' => $cityIds['Chefchaouen'],
                'address' => 'Chefchaouen',
                'category' => 'natural',
                'latitude' => 35.1714,
                'longitude' => -5.2699,
                'opening_hours' => json_encode(['sunday' => '06:00-20:00']),
                'entrance_fee' => 0,
                'visit_duration' => 90,
            ],
            
            // Casablanca attractions
            [
                'name' => 'Hassan II Mosque',
                'description' => 'One of the largest mosques in the world, with a 210-meter minaret.',
                'city_id' => $cityIds['Casablanca'],
                'address' => 'Boulevard de la Corniche, Casablanca 20000',
                'category' => 'religious',
                'latitude' => 33.6089,
                'longitude' => -7.6328,
                'opening_hours' => json_encode(['sunday' => '09:00-17:00']),
                'entrance_fee' => 130,
                'visit_duration' => 90,
            ],
            
            // Volubilis (near Meknes)
            [
                'name' => 'Volubilis',
                'description' => 'A partly excavated Berber and Roman city, a UNESCO World Heritage Site.',
                'city_id' => $cityIds['Meknes'],
                'address' => 'Volubilis, Meknes 50000',
                'category' => 'archaeological',
                'latitude' => 34.0744,
                'longitude' => -5.5553,
                'opening_hours' => json_encode(['sunday' => '08:30-17:30']),
                'entrance_fee' => 70,
                'visit_duration' => 120,
            ],
            
            // Merzouga attractions
            [
                'name' => 'Erg Chebbi Dunes',
                'description' => 'Stunning golden sand dunes, some reaching up to 150 meters high.',
                'city_id' => $cityIds['Merzouga'],
                'address' => 'Erg Chebbi, Merzouga',
                'category' => 'natural',
                'latitude' => 31.0986,
                'longitude' => -4.0117,
                'opening_hours' => json_encode(['sunday' => '00:00-23:59']),
                'entrance_fee' => 0,
                'visit_duration' => 240,
            ],
            
            // Ouarzazate attractions
            [
                'name' => 'Ait Ben Haddou',
                'description' => 'A UNESCO World Heritage Site and famous ksar (fortified village) used in many films.',
                'city_id' => $cityIds['Ouarzazate'],
                'address' => 'Ait Ben Haddou 45000',
                'category' => 'historical',
                'latitude' => 31.0467,
                'longitude' => -7.1328,
                'opening_hours' => json_encode(['sunday' => '08:00-19:00']),
                'entrance_fee' => 20,
                'visit_duration' => 120,
            ],
            
            // Rabat attractions
            [
                'name' => 'Hassan Tower',
                'description' => 'The minaret of an incomplete mosque, a famous landmark of Rabat.',
                'city_id' => $cityIds['Rabat'],
                'address' => 'Boulevard Mohamed Lyazidi, Rabat',
                'category' => 'historical',
                'latitude' => 34.0246,
                'longitude' => -6.8226,
                'opening_hours' => json_encode(['sunday' => '08:00-18:00']),
                'entrance_fee' => 10,
                'visit_duration' => 60,
            ],
            
            // Tangier attractions
            [
                'name' => 'Hercules Caves',
                'description' => 'A complex of caves with an opening to the sea, associated with the legend of Hercules.',
                'city_id' => $cityIds['Tangier'],
                'address' => 'Cap Spartel, Tangier',
                'category' => 'natural',
                'latitude' => 35.9174,
                'longitude' => -5.9214,
                'opening_hours' => json_encode(['sunday' => '09:00-18:00']),
                'entrance_fee' => 10,
                'visit_duration' => 60,
            ],
            
            // Ifrane attractions
            [
                'name' => 'Ifrane National Park',
                'description' => 'A beautiful national park known for its cedar forests and the famous Atlas cedar tree.',
                'city_id' => $cityIds['Ifrane'],
                'address' => 'Ifrane National Park',
                'category' => 'natural',
                'latitude' => 33.5333,
                'longitude' => -5.1167,
                'opening_hours' => json_encode(['sunday' => '08:00-18:00']),
                'entrance_fee' => 20,
                'visit_duration' => 180,
            ]
        ];

        foreach ($attractions as $attractionData) {
            Attraction::firstOrCreate(
                ['name' => $attractionData['name']],
                $attractionData
            );
        }
    }
}
