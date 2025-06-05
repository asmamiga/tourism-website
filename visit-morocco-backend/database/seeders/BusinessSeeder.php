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
                'owner_email' => 'riad.owner@example.com',
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
                'owner_email' => 'restaurant.owner@example.com',
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
                'owner_email' => 'tour.operator@example.com',
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
        ];

        foreach ($businesses as $businessData) {
            $owner = BusinessOwner::whereHas('user', function($query) use ($businessData) {
                $query->where('email', $businessData['owner_email']);
            })->first();

            $category = BusinessCategory::where('name', $businessData['category_name'])->first();
            $city = City::where('name', $businessData['city_name'])->first();

            if ($owner && $category && $city) {
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

                Business::updateOrCreate(
                    ['name' => $business['name']],
                    $business
                );
            }
        }
    }
}
