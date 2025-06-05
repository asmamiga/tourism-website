<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create storage link if it doesn't exist
        if (!file_exists(public_path('storage'))) {
            Artisan::call('storage:link');
        }

        // Run seeders in correct order
        $this->call([
            // Core system seeders
            AdminUserSeeder::class,
            AdminSeeder::class,
            
            // Flight related seeders
            AirlineSeeder::class,
            AirportSeeder::class,
            FacilitySeeder::class,
            FlightSeeder::class,
            PromoCodeSeeder::class,
            
            // Tourism module seeders
            RegionSeeder::class,
            CitySeeder::class,
            BusinessCategorySeeder::class,
            AppUserSeeder::class,
            BusinessOwnerSeeder::class,
            GuideSeeder::class,
            BusinessSeeder::class,
            BusinessPhotoSeeder::class,
            GuideServiceSeeder::class,
            GuideServicePhotoSeeder::class,
            GuideAvailabilitySeeder::class,
            BusinessBookingSeeder::class,
            GuideBookingSeeder::class,
        ]);
    }
}
