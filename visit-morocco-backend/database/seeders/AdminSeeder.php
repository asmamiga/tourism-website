<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admins = [
            [
                'name' => 'Super Admin',
                'email' => 'admin@flightapp.com',
                'password' => Hash::make('admin123'),
            ],
            [
                'name' => 'Flight Manager',
                'email' => 'manager@flightapp.com',
                'password' => Hash::make('manager123'),
            ]
        ];

        foreach ($admins as $admin) {
            Admin::updateOrCreate(
                ['email' => $admin['email']], // Find by email
                $admin // Update or create with these values
            );
        }
    }
}
