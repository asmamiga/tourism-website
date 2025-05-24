<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Main Admin',
            'email' => 'admin@morocco-tourism.com',
            'password' => Hash::make('Admin@123'),
            'email_verified_at' => now(),
        ]);

        $this->command->info('Admin user created successfully.');
        $this->command->info('Email: admin@morocco-tourism.com');
        $this->command->info('Password: Admin@123');
    }
}
