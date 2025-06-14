<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\BusinessPhoto;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class BusinessPhotoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure the storage directories exist
        $directories = [
            'businesses/riads',
            'businesses/restaurants',
            'businesses/tours',
            'businesses/spas',
            'businesses/cooking',
            'businesses/markets',
            'businesses/desert-camps',
            'businesses/adventure',
        ];

        foreach ($directories as $directory) {
            if (!Storage::disk('public')->exists($directory)) {
                Storage::disk('public')->makeDirectory($directory);
            }
        }

        // Get all businesses
        $businesses = Business::all();
        
        if ($businesses->isEmpty()) {
            $this->command->info('No businesses found. Please run BusinessSeeder first.');
            return;
        }

        // Define photo sets for each business type
        $photoSets = [
            'Hotels & Riads' => [
                [
                    'path' => 'businesses/riads/riad1.jpg',
                    'caption' => 'Beautiful courtyard with traditional Moroccan architecture',
                    'is_primary' => true,
                ],
                [
                    'path' => 'businesses/riads/riad2.jpg',
                    'caption' => 'Luxurious bedroom with authentic decor',
                    'is_primary' => false,
                ],
                [
                    'path' => 'businesses/riads/riad3.jpg',
                    'caption' => 'Rooftop terrace with panoramic city views',
                    'is_primary' => false,
                ],
                [
                    'path' => 'businesses/riads/riad4.jpg',
                    'caption' => 'Refreshing swimming pool area',
                    'is_primary' => false,
                ],
            ],
            'Restaurants & Cafés' => [
                [
                    'path' => 'businesses/restaurants/restaurant1.jpg',
                    'caption' => 'Elegant dining area with traditional Moroccan decor',
                    'is_primary' => true,
                ],
                [
                    'path' => 'businesses/restaurants/restaurant2.jpg',
                    'caption' => 'Our signature Moroccan tagine dish',
                    'is_primary' => false,
                ],
                [
                    'path' => 'businesses/restaurants/restaurant3.jpg',
                    'caption' => 'Outdoor seating in a beautiful garden setting',
                    'is_primary' => false,
                ],
            ],
            'Tour Operators' => [
                [
                    'path' => 'businesses/tours/tour1.jpg',
                    'caption' => 'Guided tour through the Atlas Mountains',
                    'is_primary' => true,
                ],
                [
                    'path' => 'businesses/tours/tour2.jpg',
                    'caption' => 'Camel trekking in the desert',
                    'is_primary' => false,
                ],
                [
                    'path' => 'businesses/tours/tour3.jpg',
                    'caption' => 'Visiting traditional Berber villages',
                    'is_primary' => false,
                ],
                [
                    'path' => 'businesses/tours/tour4.jpg',
                    'caption' => 'Stunning desert sunset views',
                    'is_primary' => false,
                ],
            ],
            'Spa & Wellness' => [
                [
                    'path' => 'businesses/spas/spa1.jpg',
                    'caption' => 'Luxurious spa treatment room',
                    'is_primary' => true,
                ],
                [
                    'path' => 'businesses/spas/spa2.jpg',
                    'caption' => 'Relaxing massage therapy',
                    'is_primary' => false,
                ],
                [
                    'path' => 'businesses/spas/spa3.jpg',
                    'caption' => 'Traditional hammam experience',
                    'is_primary' => false,
                ],
            ],
            'Cooking Classes' => [
                [
                    'path' => 'businesses/cooking/cooking1.jpg',
                    'caption' => 'Learn to cook traditional Moroccan dishes',
                    'is_primary' => true,
                ],
                [
                    'path' => 'businesses/cooking/cooking2.jpg',
                    'caption' => 'Hands-on cooking experience',
                    'is_primary' => false,
                ],
                [
                    'path' => 'businesses/cooking/cooking3.jpg',
                    'caption' => 'Enjoy your prepared meal',
                    'is_primary' => false,
                ],
            ],
            'Souks & Markets' => [
                [
                    'path' => 'businesses/markets/market1.jpg',
                    'caption' => 'Vibrant market stalls',
                    'is_primary' => true,
                ],
                [
                    'path' => 'businesses/markets/market2.jpg',
                    'caption' => 'Traditional handicrafts',
                    'is_primary' => false,
                ],
                [
                    'path' => 'businesses/markets/market3.jpg',
                    'caption' => 'Spices and local products',
                    'is_primary' => false,
                ],
            ],
            'Desert Camps' => [
                [
                    'path' => 'businesses/desert-camps/camp1.jpg',
                    'caption' => 'Luxury desert camp under the stars',
                    'is_primary' => true,
                ],
                [
                    'path' => 'businesses/desert-camps/camp2.jpg',
                    'caption' => 'Comfortable tent accommodations',
                    'is_primary' => false,
                ],
                [
                    'path' => 'businesses/desert-camps/camp3.jpg',
                    'caption' => 'Sunset over the dunes',
                    'is_primary' => false,
                ],
            ],
            'Adventure Sports' => [
                [
                    'path' => 'businesses/adventure/adventure1.jpg',
                    'caption' => 'Atlas Mountain hiking',
                    'is_primary' => true,
                ],
                [
                    'path' => 'businesses/adventure/adventure2.jpg',
                    'caption' => 'Quad biking in the desert',
                    'is_primary' => false,
                ],
                [
                    'path' => 'businesses/adventure/adventure3.jpg',
                    'caption' => 'Rock climbing adventures',
                    'is_primary' => false,
                ],
            ],
        ];

        foreach ($businesses as $business) {
            $this->command->info("Processing photos for: {$business->name}");

            // Get the appropriate photo set based on business category
            $categoryName = $business->businessCategory->name;
            $photos = $photoSets[$categoryName] ?? [];

            if (empty($photos)) {
                $this->command->warn("No photo set defined for category: {$categoryName}");
                continue;
            }

            // Delete existing photos for this business
            $business->photos()->delete();

            $hasPrimary = false;
            
            foreach ($photos as $index => $photoData) {
                $fullPath = storage_path('app/public/' . $photoData['path']);
                $dir = dirname($fullPath);
                
                // Create directory if it doesn't exist
                if (!is_dir($dir)) {
                    mkdir($dir, 0755, true);
                }

                // Create placeholder image if it doesn't exist
                if (!file_exists($fullPath)) {
                    $this->createPlaceholderImage(
                        $fullPath,
                        $business->name,
                        $photoData['caption']
                    );
                }

                // Only set the first photo as primary if none is set yet
                $isPrimary = $photoData['is_primary'] && !$hasPrimary;
                if ($isPrimary) {
                    $hasPrimary = true;
                } else {
                    $photoData['is_primary'] = false;
                }

                // Create photo record
                BusinessPhoto::create([
                    'business_id' => $business->business_id,
                    'photo_url' => $photoData['path'],
                    'caption' => $photoData['caption'],
                    'is_primary' => $isPrimary,
                ]);

                $status = $isPrimary ? ' (Primary)' : '';
                $this->command->info(" - Added photo: {$photoData['path']}{$status}");
            }
        }

        $this->command->info('Business photos seeded successfully!');
    }

    /**
     * Create a placeholder image with text
     */
    private function createPlaceholderImage(string $path, string $businessName, string $caption): void
    {
        $width = 1200;
        $height = 800;
        
        // Create image
        $image = imagecreatetruecolor($width, $height);
        
        // Allocate colors
        $bgColor = imagecolorallocate($image, 
            rand(200, 240), 
            rand(200, 240), 
            rand(200, 240)
        );
        $textColor = imagecolorallocate($image, 50, 50, 50);
        $borderColor = imagecolorallocate($image, 150, 150, 200);
        
        // Fill background
        imagefilledrectangle($image, 0, 0, $width, $height, $bgColor);
        
        // Add border
        imagerectangle($image, 0, 0, $width - 1, $height - 1, $borderColor);
        
        // Add text
        $text = $businessName . "\n" . $caption;
        $font = 5; // Built-in font
        $textWidth = imagefontwidth($font) * strlen($businessName);
        $textX = ($width - $textWidth) / 2;
        $textY = $height / 3;
        
        // Split text into lines
        $lines = explode("\n", wordwrap($text, 40));
        $lineHeight = 30;
        
        foreach ($lines as $i => $line) {
            $textWidth = imagefontwidth($font) * strlen($line);
            $textX = ($width - $textWidth) / 2;
            imagestring($image, $font, $textX, $textY + ($i * $lineHeight), $line, $textColor);
        }
        
        // Save image
        imagejpeg($image, $path, 90);
        imagedestroy($image);
    }
}