<?php

namespace Database\Seeders;

use App\Models\Region;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RegionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $regions = [
            ['name' => 'Tanger-Tetouan-Al Hoceima', 'description' => 'Northern region with Mediterranean coastline and the Rif Mountains'],
            ['name' => 'Oriental', 'description' => 'Eastern region bordering Algeria and the Mediterranean'],
            ['name' => 'Fès-Meknès', 'description' => 'Historic region with imperial cities and cultural heritage'],
            ['name' => 'Rabat-Salé-Kénitra', 'description' => 'Capital region with administrative and political significance'],
            ['name' => 'Béni Mellal-Khénifra', 'description' => 'Central region with Atlas Mountains and agricultural areas'],
            ['name' => 'Casablanca-Settat', 'description' => 'Economic capital and surrounding industrial areas'],
            ['name' => 'Marrakesh-Safi', 'description' => 'Popular tourist destination with historic sites and landscapes'],
            ['name' => 'Drâa-Tafilalet', 'description' => 'Saharan region with desert landscapes and oases'],
            ['name' => 'Souss-Massa', 'description' => 'Southern region with Atlantic coastline and Argan trees'],
            ['name' => 'Guelmim-Oued Noun', 'description' => 'Gateway to the Sahara desert'],
            ['name' => 'Laâyoune-Sakia El Hamra', 'description' => 'Southern provinces with Saharan landscapes'],
            ['name' => 'Dakhla-Oued Ed-Dahab', 'description' => 'Southernmost region with Atlantic coastline and desert'],
        ];

        foreach ($regions as $region) {
            Region::updateOrCreate(
                ['name' => $region['name']],
                $region
            );
        }
    }
}
