<?php

namespace Database\Seeders;

use App\Models\BusinessCategory;
use Illuminate\Database\Seeder;

class BusinessCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Hotels & Riads', 'description' => 'Accommodation options including luxury hotels and traditional riads'],
            ['name' => 'Restaurants & Cafés', 'description' => 'Dining establishments serving Moroccan and international cuisine'],
            ['name' => 'Tour Operators', 'description' => 'Companies offering organized tours and travel services'],
            ['name' => 'Souvenirs & Handicrafts', 'description' => 'Shops selling traditional Moroccan crafts and souvenirs'],
            ['name' => 'Transportation', 'description' => 'Car rentals, taxis, and other transport services'],
            ['name' => 'Adventure & Sports', 'description' => 'Outdoor activities and sports facilities'],
            ['name' => 'Hammams & Spas', 'description' => 'Traditional bathhouses and wellness centers'],
            ['name' => 'Cultural Sites', 'description' => 'Museums, historical sites, and cultural attractions'],
            ['name' => 'Shopping Malls', 'description' => 'Modern shopping centers and markets'],
            ['name' => 'Nightlife', 'description' => 'Bars, clubs, and entertainment venues'],
        ];

        foreach ($categories as $category) {
            BusinessCategory::updateOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}
