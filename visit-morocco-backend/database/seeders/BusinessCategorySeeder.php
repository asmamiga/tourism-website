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
            // Accommodation
            ['name' => 'Hotels & Riads', 'description' => 'Accommodation options including luxury hotels and traditional riads'],
            ['name' => 'Desert Camps', 'description' => 'Luxury and traditional camping experiences in the desert'],
            
            // Food & Dining
            ['name' => 'Restaurants & Cafés', 'description' => 'Dining establishments serving Moroccan and international cuisine'],
            ['name' => 'Cooking Classes', 'description' => 'Learn to cook traditional Moroccan dishes with local chefs'],
            
            // Tours & Activities
            ['name' => 'Tour Operators', 'description' => 'Companies offering organized tours and travel services'],
            ['name' => 'Adventure Sports', 'description' => 'Outdoor adventure activities and extreme sports'],
            
            // Shopping
            ['name' => 'Souvenirs & Handicrafts', 'description' => 'Shops selling traditional Moroccan crafts and souvenirs'],
            ['name' => 'Souks & Markets', 'description' => 'Traditional markets selling local products and goods'],
            ['name' => 'Shopping Malls', 'description' => 'Modern shopping centers and markets'],
            
            // Services
            ['name' => 'Transportation', 'description' => 'Car rentals, taxis, and other transport services'],
            
            // Wellness & Leisure
            ['name' => 'Spa & Wellness', 'description' => 'Luxury spas and wellness centers for relaxation and rejuvenation'],
            ['name' => 'Hammams & Spas', 'description' => 'Traditional bathhouses and wellness centers'],
            
            // Culture & Entertainment
            ['name' => 'Cultural Sites', 'description' => 'Museums, historical sites, and cultural attractions'],
            ['name' => 'Nightlife', 'description' => 'Bars, clubs, and entertainment venues']
        ];

        foreach ($categories as $category) {
            BusinessCategory::updateOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}
