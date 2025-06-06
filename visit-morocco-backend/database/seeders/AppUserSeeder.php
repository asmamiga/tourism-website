<?php

namespace Database\Seeders;

use App\Models\AppUser;
use App\Models\Guide;
use App\Models\BusinessOwner;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AppUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Business Owners (13)
        $businessOwners = [
            [
                'email' => 'riad.owner@example.com',
                'first_name' => 'Karim',
                'last_name' => 'Alaoui',
                'phone' => '+212612345678',
            ],
            [
                'email' => 'hotel.manager@example.com',
                'first_name' => 'Fatima',
                'last_name' => 'Zahra',
                'phone' => '+212612345679',
            ],
            [
                'email' => 'resto.owner@example.com',
                'first_name' => 'Mehdi',
                'last_name' => 'Benjelloun',
                'phone' => '+212612345680',
            ],
            [
                'email' => 'souvenir.shop@example.com',
                'first_name' => 'Youssef',
                'last_name' => 'El Mansouri',
                'phone' => '+212612345681',
            ],
            [
                'email' => 'tour.agency@example.com',
                'first_name' => 'Amina',
                'last_name' => 'El Fassi',
                'phone' => '+212612345682',
            ],
            [
                'email' => 'spa.manager@example.com',
                'first_name' => 'Leila',
                'last_name' => 'Bennani',
                'phone' => '+212612345683',
            ],
            [
                'email' => 'desert.camp@example.com',
                'first_name' => 'Hassan',
                'last_name' => 'El Berberi',
                'phone' => '+212612345684',
            ],
            [
                'email' => 'cooking.class@example.com',
                'first_name' => 'Samira',
                'last_name' => 'Belkadi',
                'phone' => '+212612345685',
            ],
            [
                'email' => 'adventure.tours@example.com',
                'first_name' => 'Omar',
                'last_name' => 'El Fahsi',
                'phone' => '+212612345686',
            ],
            [
                'email' => 'argan.coop@example.com',
                'first_name' => 'Zahra',
                'last_name' => 'Amazigh',
                'phone' => '+212612345687',
            ],
            [
                'email' => 'mountain.lodge@example.com',
                'first_name' => 'Rachid',
                'last_name' => 'Ait Benhaddou',
                'phone' => '+212612345688',
            ],
            [
                'email' => 'beach.resort@example.com',
                'first_name' => 'Nadia',
                'last_name' => 'El Oufir',
                'phone' => '+212612345689',
            ],
            [
                'email' => 'art.gallery@example.com',
                'first_name' => 'Karim',
                'last_name' => 'El Fenn',
                'phone' => '+212612345690',
            ],
            [
                'email' => 'cultural.tours@example.com',
                'first_name' => 'Sofia',
                'last_name' => 'El Moutawakil',
                'phone' => '+212612345691',
            ],
        ];

        // Guides (4)
        $guides = [
            [
                'email' => 'guide.ahmed@example.com',
                'first_name' => 'Ahmed',
                'last_name' => 'Benali',
                'phone' => '+212612345683',
            ],
            [
                'email' => 'guide.layla@example.com',
                'first_name' => 'Layla',
                'last_name' => 'Amrani',
                'phone' => '+212612345684',
            ],
            [
                'email' => 'guide.youssef@example.com',
                'first_name' => 'Youssef',
                'last_name' => 'El Fassi',
                'phone' => '+212612345685',
            ],
            [
                'email' => 'guide.nadia@example.com',
                'first_name' => 'Nadia',
                'last_name' => 'Mourad',
                'phone' => '+212612345686',
            ],
        ];

        // Tourists (10)
        $tourists = [
            [
                'email' => 'tourist.john@example.com',
                'first_name' => 'John',
                'last_name' => 'Smith',
                'phone' => '+14155552671',
            ],
            [
                'email' => 'tourist.marie@example.com',
                'first_name' => 'Marie',
                'last_name' => 'Dubois',
                'phone' => '+33612345678',
            ],
            [
                'email' => 'tourist.carlos@example.com',
                'first_name' => 'Carlos',
                'last_name' => 'Rodriguez',
                'phone' => '+34123456789',
            ],
            [
                'email' => 'tourist.anna@example.com',
                'first_name' => 'Anna',
                'last_name' => 'Müller',
                'phone' => '+4915123456789',
            ],
            [
                'email' => 'tourist.luigi@example.com',
                'first_name' => 'Luigi',
                'last_name' => 'Rossi',
                'phone' => '+393331234567',
            ],
            [
                'email' => 'tourist.sophie@example.com',
                'first_name' => 'Sophie',
                'last_name' => 'Martin',
                'phone' => '+33698765432',
            ],
            [
                'email' => 'tourist.david@example.com',
                'first_name' => 'David',
                'last_name' => 'Wilson',
                'phone' => '+447911123456',
            ],
            [
                'email' => 'tourist.olga@example.com',
                'first_name' => 'Olga',
                'last_name' => 'Ivanova',
                'phone' => '+79131234567',

            ],
            [
                'email' => 'tourist.ahmed@example.com',
                'first_name' => 'Ahmed',
                'last_name' => 'Khan',
                'phone' => '+918123456789',

            ],
            [
                'email' => 'tourist.li@example.com',
                'first_name' => 'Wei',
                'last_name' => 'Li',
                'phone' => '+8613812345678',

            ],
        ];

        // Create business owners
        foreach ($businessOwners as $owner) {
            $user = AppUser::updateOrCreate(
                ['email' => $owner['email']],
                array_merge($owner, [
                    'password_hash' => Hash::make('password123'),
                    'role' => 'business_owner',
                    'is_verified' => true,
                ])
            );

            // Create business owner profile if not exists
            BusinessOwner::firstOrCreate(
                ['user_id' => $user->user_id],
                [
                    'business_name' => $owner['first_name'] . ' ' . $owner['last_name'] . ' Business',
                    'is_approved' => true,
                ]
            );
        }

        // Create guides
        foreach ($guides as $guide) {
            $user = AppUser::updateOrCreate(
                ['email' => $guide['email']],
                array_merge($guide, [
                    'password_hash' => Hash::make('password123'),
                    'role' => 'guide',
                    'is_verified' => true,
                ])
            );

            // Create guide profile if not exists
            Guide::firstOrCreate(
                ['user_id' => $user->user_id],
                [
                    'bio' => 'Professional tour guide with extensive knowledge of Moroccan culture and history.',
                    'languages' => ['Arabic', 'French', 'English', 'Spanish'],
                    'is_available' => true,
                    'is_approved' => true,
                    'daily_rate' => rand(800, 2000), // Daily rate in local currency
                ]
            );
        }

        // Create tourists
        foreach ($tourists as $tourist) {
            AppUser::updateOrCreate(
                ['email' => $tourist['email']],
                array_merge($tourist, [
                    'password_hash' => Hash::make('password123'),
                    'role' => 'tourist',
                    'is_verified' => true,
                ])
            );
        }

        $this->command->info('Successfully seeded 5 business owners, 4 guides, and 10 tourists.');
        $this->command->info('All users have the password: password123');
    }
}
