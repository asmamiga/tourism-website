<?php

namespace Database\Seeders;

use App\Models\Attraction;
use App\Models\AttractionPhoto;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class AttractionPhotoSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure the storage directories exist
        $directories = [
            'attractions/landmarks',
            'attractions/museums',
            'attractions/parks',
            'attractions/beaches',
            'attractions/markets',
            'attractions/historical',
            'attractions/religious',
        ];

        foreach ($directories as $directory) {
            if (!Storage::disk('public')->exists($directory)) {
                Storage::disk('public')->makeDirectory($directory);
            }
        }

        // Get all attractions
        $attractions = Attraction::all();
        
        if ($attractions->isEmpty()) {
            $this->command->info('No attractions found. Please run AttractionSeeder first.');
            return;
        }

        // Define photo sets for different attraction categories
        $photoSets = [
            'cultural' => [
                [
                    'path' => 'attractions/landmarks/cultural1.jpg',
                    'caption' => 'Vibrant cultural landmark showcasing local heritage',
                    'is_primary' => true,
                ],
                [
                    'path' => 'attractions/landmarks/cultural2.jpg',
                    'caption' => 'Traditional architecture and design elements',
                    'is_primary' => false,
                ],
                [
                    'path' => 'attractions/landmarks/cultural3.jpg',
                    'caption' => 'Local artisans at work preserving cultural traditions',
                    'is_primary' => false,
                ],
            ],
            'historical' => [
                [
                    'path' => 'attractions/historical/historical1.jpg',
                    'caption' => 'Ancient historical site with rich heritage',
                    'is_primary' => true,
                ],
                [
                    'path' => 'attractions/historical/historical2.jpg',
                    'caption' => 'Well-preserved historical artifacts',
                    'is_primary' => false,
                ],
                [
                    'path' => 'attractions/historical/historical3.jpg',
                    'caption' => 'Guided tour of the historical site',
                    'is_primary' => false,
                ],
            ],
            'garden' => [
                [
                    'path' => 'attractions/parks/garden1.jpg',
                    'caption' => 'Beautiful botanical garden with diverse plant species',
                    'is_primary' => true,
                ],
                [
                    'path' => 'attractions/parks/garden2.jpg',
                    'caption' => 'Tranquil garden pathways perfect for relaxation',
                    'is_primary' => false,
                ],
                [
                    'path' => 'attractions/parks/garden3.jpg',
                    'caption' => 'Colorful floral displays in full bloom',
                    'is_primary' => false,
                ],
            ],
            'natural' => [
                [
                    'path' => 'attractions/parks/natural1.jpg',
                    'caption' => 'Breathtaking natural landscape',
                    'is_primary' => true,
                ],
                [
                    'path' => 'attractions/parks/natural2.jpg',
                    'caption' => 'Scenic views of the natural surroundings',
                    'is_primary' => false,
                ],
                [
                    'path' => 'attractions/parks/natural3.jpg',
                    'caption' => 'Wildlife in their natural habitat',
                    'is_primary' => false,
                ],
            ],
            'beach' => [
                [
                    'path' => 'attractions/beaches/beach1.jpg',
                    'caption' => 'Pristine sandy beaches with crystal clear waters',
                    'is_primary' => true,
                ],
                [
                    'path' => 'attractions/beaches/beach2.jpg',
                    'caption' => 'Sunset views over the ocean',
                    'is_primary' => false,
                ],
                [
                    'path' => 'attractions/beaches/beach3.jpg',
                    'caption' => 'Beachside activities and water sports',
                    'is_primary' => false,
                ],
            ],
            'market' => [
                [
                    'path' => 'attractions/markets/market1.jpg',
                    'caption' => 'Bustling market with local vendors',
                    'is_primary' => true,
                ],
                [
                    'path' => 'attractions/markets/market2.jpg',
                    'caption' => 'Colorful displays of local crafts and goods',
                    'is_primary' => false,
                ],
                [
                    'path' => 'attractions/markets/market3.jpg',
                    'caption' => 'Traditional market atmosphere and culture',
                    'is_primary' => false,
                ],
            ],
            'religious' => [
                [
                    'path' => 'attractions/religious/religious1.jpg',
                    'caption' => 'Stunning religious architecture and design',
                    'is_primary' => true,
                ],
                [
                    'path' => 'attractions/religious/religious2.jpg',
                    'caption' => 'Peaceful interior spaces for reflection',
                    'is_primary' => false,
                ],
                [
                    'path' => 'attractions/religious/religious3.jpg',
                    'caption' => 'Intricate decorative elements and artwork',
                    'is_primary' => false,
                ],
            ],
        ];

        // Default photo set if category not found
        $defaultPhotoSet = [
            [
                'path' => 'attractions/landmarks/default1.jpg',
                'caption' => 'Beautiful view of the attraction',
                'is_primary' => true,
            ],
            [
                'path' => 'attractions/landmarks/default2.jpg',
                'caption' => 'Popular spot for visitors',
                'is_primary' => false,
            ],
            [
                'path' => 'attractions/landmarks/default3.jpg',
                'caption' => 'Explore the local culture and history',
                'is_primary' => false,
            ],
        ];

        foreach ($attractions as $attraction) {
            $category = $attraction->category;
            $photos = $photoSets[$category] ?? $defaultPhotoSet;
            
            $this->command->info("Processing photos for: {$attraction->name} (Category: {$category})");
            
            foreach ($photos as $index => $photoData) {
                try {
                    $photo = new AttractionPhoto([
                        'attraction_id' => $attraction->attraction_id,
                        'photo_url' => $photoData['path'],
                        'caption' => $photoData['caption'],
                        'is_primary' => $photoData['is_primary'],
                    ]);
                    
                    $photo->save();
                    
                    $primaryStatus = $photo->is_primary ? ' (Primary)' : '';
                    $this->command->info(" - Added photo: {$photo->photo_url}{$primaryStatus}");
                    
                } catch (\Exception $e) {
                    $this->command->error("Error adding photo to {$attraction->name}: " . $e->getMessage());
                }
            }
        }
        
        $this->command->info('Attraction photos seeded successfully!');
    }
}