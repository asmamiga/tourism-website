<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Region;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cities = [
            // Tanger-Tetouan-Al Hoceima
            'Tanger-Tetouan-Al Hoceima' => [
                ['name' => 'Tanger', 'latitude' => 35.7595, 'longitude' => -5.8340],
                ['name' => 'Tetouan', 'latitude' => 35.5889, 'longitude' => -5.3625],
                ['name' => 'Al Hoceima', 'latitude' => 35.2484, 'longitude' => -3.9287],
                ['name' => 'Chefchaouen', 'latitude' => 35.1714, 'longitude' => -5.2696],
            ],
            // Oriental
            'Oriental' => [
                ['name' => 'Oujda', 'latitude' => 34.6819, 'longitude' => -1.9077],
                ['name' => 'Nador', 'latitude' => 35.1686, 'longitude' => -2.9276],
                ['name' => 'Berkane', 'latitude' => 34.9213, 'longitude' => -2.3199],
            ],
            // Fès-Meknès
            'Fès-Meknès' => [
                ['name' => 'Fès', 'latitude' => 34.0181, 'longitude' => -5.0078],
                ['name' => 'Meknès', 'latitude' => 33.8833, 'longitude' => -5.5136],
                ['name' => 'Ifrane', 'latitude' => 33.5229, 'longitude' => -5.1107],
            ],
            // Rabat-Salé-Kénitra
            'Rabat-Salé-Kénitra' => [
                ['name' => 'Rabat', 'latitude' => 34.0150, 'longitude' => -6.8326],
                ['name' => 'Salé', 'latitude' => 34.0375, 'longitude' => -6.7986],
                ['name' => 'Kénitra', 'latitude' => 34.2541, 'longitude' => -6.5890],
            ],
            // Casablanca-Settat
            'Casablanca-Settat' => [
                ['name' => 'Casablanca', 'latitude' => 33.5731, 'longitude' => -7.5898],
                ['name' => 'Settat', 'latitude' => 33.0037, 'longitude' => -7.6200],
                ['name' => 'El Jadida', 'latitude' => 33.2549, 'longitude' => -8.5078],
            ],
            // Marrakesh-Safi
            'Marrakesh-Safi' => [
                ['name' => 'Marrakesh', 'latitude' => 31.6295, 'longitude' => -7.9811],
                ['name' => 'Safi', 'latitude' => 32.2833, 'longitude' => -9.2333],
                ['name' => 'Essaouira', 'latitude' => 31.5131, 'longitude' => -9.7685],
            ],
            // Drâa-Tafilalet
            'Drâa-Tafilalet' => [
                ['name' => 'Errachidia', 'latitude' => 31.9311, 'longitude' => -4.4267],
                ['name' => 'Ouarzazate', 'latitude' => 30.9202, 'longitude' => -6.9107],
                ['name' => 'Zagora', 'latitude' => 30.3167, 'longitude' => -5.8333],
            ],
        ];

        foreach ($cities as $regionName => $cityData) {
            $region = Region::where('name', $regionName)->first();
            
            if ($region) {
                foreach ($cityData as $city) {
                    City::updateOrCreate(
                        ['name' => $city['name']],
                        array_merge($city, ['region_id' => $region->region_id])
                    );
                }
            }
        }
    }
}
