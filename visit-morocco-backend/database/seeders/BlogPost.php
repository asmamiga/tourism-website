<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\AppUser;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogPostSeeder extends Seeder
{
    public function run(): void
    {
        $categories = BlogCategory::pluck('category_id');
        
        // Get the first admin user or create one if none exists
        $admin = AppUser::where('role', 'admin')->first();
        
        if (!$admin) {
            $admin = AppUser::create([
                'email' => 'admin@example.com',
                'password_hash' => bcrypt('password'),
                'first_name' => 'Admin',
                'last_name' => 'User',
                'role' => 'admin',
                'is_verified' => true,
            ]);
        }

        $posts = [
            [
                'title' => 'Top 10 Must-Visit Places in Morocco',
                'content' => 'Morocco is a land of stunning landscapes, rich history, and vibrant culture. Here are the top 10 places you must visit...',
                'excerpt' => 'Discover the most beautiful places in Morocco that you cannot miss on your next trip.',
                'author_id' => $admin->user_id,
                'publish_date' => now(),
                'status' => 'published',
                'featured_image' => 'blog/featured/morocco-top-places.jpg',
                'view_count' => 0,
            ],
            [
                'title' => 'A Guide to Moroccan Cuisine',
                'content' => 'Moroccan cuisine is a delightful mix of Berber, Arabic, Andalusian, and Mediterranean cuisines...',
                'excerpt' => 'Explore the rich and diverse flavors of Moroccan cuisine.',
                'author_id' => $admin->user_id,
                'publish_date' => now(),
                'status' => 'published',
                'featured_image' => 'blog/featured/moroccan-cuisine.jpg',
                'view_count' => 0,
            ],
        ];

        foreach ($posts as $post) {
            $blogPost = BlogPost::create($post);

            // Attach random categories if any exist
            if ($categories->isNotEmpty()) {
                $blogPost->categories()->attach(
                    $categories->random(min(3, $categories->count()))
                );
            }
        }
    }
}
