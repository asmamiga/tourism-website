<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use App\Models\BlogCategory;
use App\Models\AppUser;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogPostSeeder extends Seeder
{
    public function run(): void
    {
        $categories = BlogCategory::pluck('id');
        $users = AppUser::pluck('user_id');
        
        if ($users->isEmpty()) {
            $users = collect([1]); // Fallback user ID if no users exist
        }

        $posts = [
            [
                'title' => 'Top 10 Must-Visit Places in Marrakech',
                'slug' => 'top-10-marrakech',
                'excerpt' => 'Discover the most enchanting places in the Red City',
                'content' => 'Marrakech, known as the Red City, is a feast for the senses. From the bustling Jemaa el-Fnaa square to the serene Majorelle Garden, this city offers an unforgettable experience. Don\'t miss the Bahia Palace, Saadian Tombs, and the vibrant souks where you can find everything from spices to handmade crafts.',
                'status' => 'published',
                'featured_image' => 'blog-images/marrakech.jpg',
            ],
            [
                'title' => 'A Food Lover\'s Guide to Moroccan Cuisine',
                'slug' => 'moroccan-cuisine-guide',
                'excerpt' => 'Savor the flavors of Morocco with our ultimate food guide',
                'content' => 'Moroccan cuisine is a delightful blend of Berber, Arabic, Mediterranean, and African influences. Must-try dishes include tagine, couscous, pastilla, and harira soup. Don\'t forget to try the mint tea and msemen for breakfast!',
                'status' => 'published',
                'featured_image' => 'blog-images/moroccan-food.jpg',
            ],
            // Add more sample posts as needed
        ];

        // Generate additional posts if needed
        for ($i = 3; $i <= 13; $i++) {
            $posts[] = [
                'title' => 'Amazing Moroccan Destination ' . $i,
                'slug' => 'moroccan-destination-' . $i,
                'excerpt' => 'Discover this amazing destination in Morocco',
                'content' => 'This is a sample blog post about an amazing destination in Morocco. ' . 
                            'The rich culture, beautiful landscapes, and warm hospitality make it a must-visit location. ' .
                            'Stay tuned for more details about this incredible place!',
                'status' => collect(['draft', 'published', 'archived'])->random(),
                'featured_image' => 'blog-images/destination-' . ($i % 5 + 1) . '.jpg',
            ];
        }

        foreach ($posts as $postData) {
            $post = BlogPost::create([
                'title' => $postData['title'],
                'slug' => $postData['slug'],
                'excerpt' => $postData['excerpt'],
                'content' => $postData['content'],
                'status' => $postData['status'],
                'featured_image' => $postData['featured_image'],
                'author_id' => $users->random(),
                'publish_date' => now()->subDays(rand(0, 365)),
                'view_count' => rand(10, 1000),
            ]);

            // Attach 1-3 random categories to each post
            $post->categories()->attach(
                $categories->random(rand(1, 3))->toArray()
            );
        }
    }
}
