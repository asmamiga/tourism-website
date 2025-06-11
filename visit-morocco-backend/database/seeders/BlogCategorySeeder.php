<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use Illuminate\Database\Seeder;

class BlogCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Travel Tips',
            'Cultural Insights',
            'Food & Cuisine',
            'Adventure',
            'Historical Sites',
            'Beach Getaways',
            'Mountain Escapes',
            'Desert Experiences',
            'City Guides',
            'Shopping',
            'Festivals & Events',
            'Luxury Travel',
            'Budget Travel'
        ];

        foreach ($categories as $category) {
            BlogCategory::create([
                'name' => $category,
                'slug' => \Illuminate\Support\Str::slug($category),
                'description' => 'Discover the best of ' . $category . ' in Morocco',
                'is_active' => true
            ]);
        }
    }
}
