<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\BusinessPhoto;
use Illuminate\Database\Seeder;

class BusinessPhotoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $photos = [
            // Riad Dar Zaman
            'Riad Dar Zaman' => [
                [
                    'photo_url' => 'storage/businesses/riaddarzaman/riad1.jpg',
                    'caption' => 'Beautiful courtyard with traditional zellige tiles',
                    'is_primary' => true,
                ],
                [
                    'photo_url' => 'storage/businesses/riaddarzaman/riad2.jpg',
                    'caption' => 'Luxurious bedroom with Moroccan decor',
                    'is_primary' => false,
                ],
                [
                    'photo_url' => 'storage/businesses/riaddarzaman/riad3.jpg',
                    'caption' => 'Rooftop terrace with panoramic views',
                    'is_primary' => false,
                ],
            ],
            // Le Jardin Secret
            'Le Jardin Secret' => [
                [
                    'photo_url' => 'storage/businesses/lejardinsecret/restaurant1.jpg',
                    'caption' => 'Lush garden dining area',
                    'is_primary' => true,
                ],
                [
                    'photo_url' => 'storage/businesses/lejardinsecret/restaurant2.jpg',
                    'caption' => 'Traditional Moroccan tagine',
                    'is_primary' => false,
                ],
            ],
            // Atlas Mountain Tours
            'Atlas Mountain Tours' => [
                [
                    'photo_url' => 'storage/businesses/atlastours/tour1.jpg',
                    'caption' => 'Group trekking in the Atlas Mountains',
                    'is_primary' => true,
                ],
                [
                    'photo_url' => 'storage/businesses/atlastours/tour2.jpg',
                    'caption' => 'Visiting a traditional Berber village',
                    'is_primary' => false,
                ],
                [
                    'photo_url' => 'storage/businesses/atlastours/tour3.jpg',
                    'caption' => 'Sunset over the desert',
                    'is_primary' => false,
                ],
            ],
        ];

        foreach ($photos as $businessName => $photoData) {
            $business = Business::where('name', $businessName)->first();
            
            if ($business) {
                foreach ($photoData as $photo) {
                    BusinessPhoto::updateOrCreate(
                        [
                            'business_id' => $business->business_id,
                            'photo_url' => $photo['photo_url']
                        ],
                        $photo
                    );
                }
            }
        }
    }
}
