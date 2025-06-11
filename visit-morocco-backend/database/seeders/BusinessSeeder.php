<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\BusinessCategory;
use App\Models\BusinessOwner;
use App\Models\City;
use Illuminate\Database\Seeder;

class BusinessSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $businesses = [
            [
                // Owner will be assigned from available owners
                'category_name' => 'Hotels & Riads',
                'city_name' => 'Marrakesh',
                'name' => 'Riad Dar Zaman',
                'description' => 'A beautiful riad in the heart of the Marrakesh medina featuring traditional Moroccan architecture and modern amenities.',
                'address' => '123 Derb Sidi Bouloukat, Marrakesh 40000',
                'phone' => '+212524378654',
                'email' => 'contact@riaddarzaman.com',
                'website' => 'https://www.riaddarzaman.com',
                'price_range' => '$$$',
                'latitude' => 31.6309,
                'longitude' => -7.9861,
                'opening_hours' => [
                    'monday' => '09:00-22:00',
                    'tuesday' => '09:00-22:00',
                    'wednesday' => '09:00-22:00',
                    'thursday' => '09:00-22:00',
                    'friday' => '09:00-22:00',
                    'saturday' => '09:00-22:00',
                    'sunday' => '09:00-22:00',
                ],
                'features' => ['wifi', 'pool', 'restaurant', 'spa', 'terrace'],
                'is_verified' => true,
                'is_featured' => true,
                'avg_rating' => 4.8,
            ],
            [
                // Owner will be assigned from available owners
                'category_name' => 'Restaurants & Cafés',
                'city_name' => 'Marrakesh',
                'name' => 'Le Jardin Secret',
                'description' => 'A beautiful restaurant set in a lush garden, serving traditional Moroccan cuisine with a modern twist.',
                'address' => '121 Rue Mouassine, Marrakesh 40000',
                'phone' => '+212524391953',
                'email' => 'contact@lejardinsecretmarrakech.com',
                'website' => 'https://www.lejardinsecretmarrakech.com',
                'price_range' => '$$',
                'latitude' => 31.6317,
                'longitude' => -7.9893,
                'opening_hours' => [
                    'monday' => '09:30-23:00',
                    'tuesday' => '09:30-23:00',
                    'wednesday' => '09:30-23:00',
                    'thursday' => '09:30-23:00',
                    'friday' => '09:30-23:00',
                    'saturday' => '09:30-23:00',
                    'sunday' => '09:30-23:00',
                ],
                'features' => ['vegetarian', 'outdoor_seating', 'wifi', 'credit_cards'],
                'is_verified' => true,
                'is_featured' => true,
                'avg_rating' => 4.7,
            ],
            [
                // Owner will be assigned from available owners
                'category_name' => 'Tour Operators',
                'city_name' => 'Ouarzazate',
                'name' => 'Atlas Mountain Tours',
                'description' => 'Specializing in guided tours through the stunning Atlas Mountains, offering trekking, cultural experiences, and desert adventures.',
                'address' => 'Avenue Mohammed V, Ouarzazate 45000',
                'phone' => '+212524885678',
                'email' => 'info@atlasmountaintours.com',
                'website' => 'https://www.atlasmountaintours.com',
                'price_range' => '$$$',
                'latitude' => 30.9202,
                'longitude' => -6.9107,
                'opening_hours' => [
                    'monday' => '08:00-20:00',
                    'tuesday' => '08:00-20:00',
                    'wednesday' => '08:00-20:00',
                    'thursday' => '08:00-20:00',
                    'friday' => '08:00-20:00',
                    'saturday' => '09:00-18:00',
                    'sunday' => 'Closed',
                ],
                'features' => ['multi_day_tours', 'private_tours', 'group_tours'],
                'is_verified' => true,
                'is_featured' => true,
                'avg_rating' => 4.9,
            ],
            [
                'category_name' => 'Spa & Wellness',
                'city_name' => 'Fes',
                'name' => 'Spa Laaroussa',
                'description' => 'Luxurious hammam and spa offering traditional Moroccan treatments in a restored riad in the heart of Fes medina.',
                'address' => '3 Derb Bechara, Fes 30110',
                'phone' => '+212535741060',
                'email' => 'info@spalaaroussa.com',
                'website' => 'https://www.spalaaroussa.com',
                'price_range' => '$$$',
                'latitude' => 34.0638,
                'longitude' => -4.9734,
                'opening_hours' => [
                    'monday' => '09:00-21:00',
                    'tuesday' => '09:00-21:00',
                    'wednesday' => '09:00-21:00',
                    'thursday' => '09:00-21:00',
                    'friday' => '09:00-21:00',
                    'saturday' => '10:00-20:00',
                    'sunday' => '10:00-20:00',
                ],
                'features' => ['hammam', 'massage', 'beauty_treatments', 'private_rooms'],
                'is_verified' => true,
                'is_featured' => true,
                'avg_rating' => 4.9,
            ],
            [
                'category_name' => 'Desert Camps',
                'city_name' => 'Merzouga',
                'name' => 'Luxury Desert Camp',
                'description' => 'Experience the magic of the Sahara with luxury tented accommodation, camel treks, and traditional Berber entertainment.',
                'address' => 'Merzouga Dunes, Merzouga 52202',
                'phone' => '+212666123456',
                'email' => 'stay@luxurydesertcamp.com',
                'website' => 'https://www.luxurydesertcamp.com',
                'price_range' => '$$$',
                'latitude' => 31.1000,
                'longitude' => -4.0100,
                'opening_hours' => [
                    'monday' => 'Open 24/7',
                    'tuesday' => 'Open 24/7',
                    'wednesday' => 'Open 24/7',
                    'thursday' => 'Open 24/7',
                    'friday' => 'Open 24/7',
                    'saturday' => 'Open 24/7',
                    'sunday' => 'Open 24/7',
                ],
                'features' => ['luxury_tents', 'private_bathrooms', 'restaurant', 'sunset_view'],
                'is_verified' => true,
                'is_featured' => true,
                'avg_rating' => 4.8,
            ],
            [
                'category_name' => 'Cooking Classes',
                'city_name' => 'Chefchaouen',
                'name' => 'Blue Pearl Cooking',
                'description' => 'Learn to cook authentic Moroccan dishes in a beautiful blue-washed riad with local chefs.',
                'address' => 'Rue El Kharrazin, Chefchaouen 91000',
                'phone' => '+212661234567',
                'email' => 'cooking@bluepearl.ma',
                'website' => 'https://www.bluepearlcooking.com',
                'price_range' => '$$',
                'latitude' => 35.1714,
                'longitude' => -5.2696,
                'opening_hours' => [
                    'monday' => '10:00-18:00',
                    'tuesday' => '10:00-18:00',
                    'wednesday' => '10:00-18:00',
                    'thursday' => '10:00-18:00',
                    'friday' => '10:00-18:00',
                    'saturday' => '10:00-15:00',
                    'sunday' => 'Closed',
                ],
                'features' => ['group_classes', 'private_classes', 'market_tour', 'vegetarian_options'],
                'is_verified' => true,
                'is_featured' => false,
                'avg_rating' => 4.7,
            ],
            [
                'category_name' => 'Adventure Sports',
                'city_name' => 'Agadir',
                'name' => 'Atlas Mountain Adventures',
                'description' => 'Professional guides for hiking, mountain biking, and paragliding in the stunning Anti-Atlas mountains.',
                'address' => 'Avenue Hassan II, Agadir 80000',
                'phone' => '+212528821234',
                'email' => 'info@atlasadventures.ma',
                'website' => 'https://www.atlasadventures.ma',
                'price_range' => '$$',
                'latitude' => 30.4278,
                'longitude' => -9.5981,
                'opening_hours' => [
                    'monday' => '08:00-19:00',
                    'tuesday' => '08:00-19:00',
                    'wednesday' => '08:00-19:00',
                    'thursday' => '08:00-19:00',
                    'friday' => '08:00-19:00',
                    'saturday' => '08:00-19:00',
                    'sunday' => '08:00-19:00',
                ],
                'features' => ['equipment_rental', 'certified_guides', 'group_discounts', 'transport_included'],
                'is_verified' => true,
                'is_featured' => false,
                'avg_rating' => 4.9,
            ],
            [
                'category_name' => 'Souks & Markets',
                'city_name' => 'Essaouira',
                'name' => 'Argana Cooperative',
                'description' => 'Women\'s cooperative producing high-quality argan oil and beauty products, offering tours and workshops.',
                'address' => 'Route d\'Agadir, Essaouira 44000',
                'phone' => '+212524784321',
                'email' => 'contact@arganacooperative.ma',
                'website' => 'https://www.arganacooperative.ma',
                'price_range' => '$$',
                'latitude' => 31.5125,
                'longitude' => -9.7706,
                'opening_hours' => [
                    'monday' => '09:00-18:00',
                    'tuesday' => '09:00-18:00',
                    'wednesday' => '09:00-18:00',
                    'thursday' => '09:00-18:00',
                    'friday' => '09:00-18:00',
                    'saturday' => '10:00-16:00',
                    'sunday' => 'Closed',
                ],
                'features' => ['workshops', 'fair_trade', 'organic_products', 'local_artisans'],
                'is_verified' => true,
                'is_featured' => true,
                'avg_rating' => 4.8,
            ],
        ];

        // Get all available business owners
        $availableOwners = BusinessOwner::all();
        $ownerIndex = 0;
        $ownerCount = count($availableOwners);

        if ($ownerCount === 0) {
            $this->command->error('No business owners found. Please run BusinessOwnerSeeder first.');
            return;
        }

        foreach ($businesses as $businessData) {
            $this->command->info("\n=== Processing business: " . $businessData['name'] . " ===");

            // Cycle through available owners
            $owner = $availableOwners[$ownerIndex % $ownerCount];
            $ownerIndex++;

            $category = BusinessCategory::where('name', $businessData['category_name'])->first();
            $city = City::where('name', $businessData['city_name'])->first();

            $this->command->info('Owner: ' . ($owner ? 'ID ' . $owner->business_owner_id . ' - ' . $owner->business_name : 'Not found'));
            $this->command->info('Category: ' . ($category ? 'ID ' . $category->category_id . ' - ' . $category->name : 'Not found: ' . $businessData['category_name']));
            $this->command->info('City: ' . ($city ? 'ID ' . $city->city_id . ' - ' . $city->name : 'Not found: ' . $businessData['city_name']));

            if ($category && $city) {
                $this->command->info('All required data found. Creating/updating business...');
                $business = [
                    'business_owner_id' => $owner->business_owner_id,
                    'category_id' => $category->category_id,
                    'city_id' => $city->city_id,
                    'name' => $businessData['name'],
                    'description' => $businessData['description'],
                    'address' => $businessData['address'],
                    'phone' => $businessData['phone'],
                    'email' => $businessData['email'],
                    'website' => $businessData['website'],
                    'price_range' => $businessData['price_range'],
                    'latitude' => $businessData['latitude'],
                    'longitude' => $businessData['longitude'],
                    'opening_hours' => $businessData['opening_hours'],
                    'features' => $businessData['features'],
                    'is_verified' => $businessData['is_verified'],
                    'is_featured' => $businessData['is_featured'],
                    'avg_rating' => $businessData['avg_rating'],
                ];

                // Remove the lookup fields
                unset($businessData['owner_email'], $businessData['category_name'], $businessData['city_name']);

                try {
                    $created = Business::updateOrCreate(
                        ['name' => $business['name']],
                        $business
                    );
                    
                    $this->command->info('Business ' . ($created->wasRecentlyCreated ? 'created' : 'updated') . ': ' . $created->name . ' (ID: ' . $created->business_id . ')');
                } catch (\Exception $e) {
                    $this->command->error('Error creating/updating business: ' . $e->getMessage());
                    $this->command->error('Business data: ' . json_encode($business, JSON_PRETTY_PRINT));
                }
            }
        }
    }
}
