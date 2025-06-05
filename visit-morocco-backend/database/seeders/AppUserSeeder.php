<?php

namespace Database\Seeders;

use App\Models\AppUser;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AppUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            // Admin user
            [
                'email' => 'admin@visitmorocco.com',
                'password_hash' => Hash::make('admin123'),
                'first_name' => 'Admin',
                'last_name' => 'User',
                'phone' => '+212600000000',
                'role' => 'admin',
                'is_verified' => true,
            ],
            // Business owners
            [
                'email' => 'riad.owner@example.com',
                'password_hash' => Hash::make('password123'),
                'first_name' => 'Karim',
                'last_name' => 'Alaoui',
                'phone' => '+212612345678',
                'role' => 'business_owner',
                'is_verified' => true,
            ],
            // Guides
            [
                'email' => 'guide.ahmed@example.com',
                'password_hash' => Hash::make('password123'),
                'first_name' => 'Ahmed',
                'last_name' => 'Benali',
                'phone' => '+212612345679',
                'role' => 'guide',
                'is_verified' => true,
            ],
            // Tourists
            [
                'email' => 'tourist.john@example.com',
                'password_hash' => Hash::make('password123'),
                'first_name' => 'John',
                'last_name' => 'Doe',
                'phone' => '+14155552671',
                'role' => 'tourist',
                'is_verified' => true,
            ],
            // More sample users...
        ];

        foreach ($users as $userData) {
            AppUser::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
