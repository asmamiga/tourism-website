<?php

namespace Database\Seeders;

use App\Models\AppUser;
use App\Models\BusinessOwner;
use Illuminate\Database\Seeder;

class BusinessOwnerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $owners = [
            [
                'email' => 'riad.owner@example.com',
                'business_name' => 'Riad Dar Zaman',
                'business_description' => 'Luxurious riad in the heart of Marrakesh medina',
                'business_license' => 'LIC12345678',
                'is_approved' => true,
            ],
            [
                'email' => 'restaurant.owner@example.com',
                'business_name' => 'Le Jardin Secret',
                'business_description' => 'Fine dining restaurant with traditional Moroccan cuisine',
                'business_license' => 'LIC87654321',
                'is_approved' => true,
            ],
            [
                'email' => 'tour.operator@example.com',
                'business_name' => 'Atlas Mountain Tours',
                'business_description' => 'Adventure tours in the Atlas Mountains',
                'business_license' => 'LIC56781234',
                'is_approved' => true,
            ],
        ];

        foreach ($owners as $ownerData) {
            $user = AppUser::where('email', $ownerData['email'])->first();
            
            if ($user) {
                BusinessOwner::updateOrCreate(
                    ['user_id' => $user->user_id],
                    [
                        'business_name' => $ownerData['business_name'],
                        'business_description' => $ownerData['business_description'],
                        'business_license' => $ownerData['business_license'],
                        'is_approved' => $ownerData['is_approved'],
                    ]
                );
            }
        }
    }
}
