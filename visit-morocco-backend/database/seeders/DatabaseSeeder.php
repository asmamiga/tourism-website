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
            AdminUserSeeder::class,
            AdminSeeder::class,
            AirlineSeeder::class,
            AirportSeeder::class,
            FacilitySeeder::class,
            PromoCodeSeeder::class,
            FlightSeeder::class,
        ]);
    }
}
