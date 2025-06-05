<?php

namespace Database\Seeders;

use App\Models\AppUser;
use App\Models\Guide;
use Illuminate\Database\Seeder;

class GuideSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $guides = [
            [
                'email' => 'guide.ahmed@example.com',
                'bio' => 'Certified guide with 10+ years of experience showing the beauty of Morocco',
                'experience_years' => 10,
                'languages' => ['en', 'fr', 'ar'],
                'specialties' => ['historical_tours', 'culinary_tours'],
                'daily_rate' => 500.00,
                'is_available' => true,
                'is_approved' => true,
                'identity_verification' => 'verified',
                'guide_license' => 'GUIDE12345',
            ],
            [
                'email' => 'guide.fatima@example.com',
                'bio' => 'Expert in Berber culture and desert expeditions',
                'experience_years' => 8,
                'languages' => ['en', 'fr', 'ar', 'ber'],
                'specialties' => ['desert_tours', 'cultural_experiences'],
                'daily_rate' => 450.00,
                'is_available' => true,
                'is_approved' => true,
                'identity_verification' => 'verified',
                'guide_license' => 'GUIDE12346',
            ],
        ];

        foreach ($guides as $guideData) {
            $user = AppUser::where('email', $guideData['email'])->first();
            
            if ($user) {
                // Remove email from the data as it's not in the guides table
                unset($guideData['email']);
                
                Guide::updateOrCreate(
                    ['user_id' => $user->user_id],
                    $guideData
                );
            }
        }
    }
}
