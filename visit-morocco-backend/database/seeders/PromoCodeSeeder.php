<?php

namespace Database\Seeders;

use App\Models\PromoCode;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PromoCodeSeeder extends Seeder
{
    public function run(): void
    {
        $promoCodes = [
            [
                'code' => 'WELCOME10',
                'discount_type' => 'percentage',
                'discount' => 10,
                'valid_until' => Carbon::now()->addMonths(3),
                'is_used' => false
            ],
            [
                'code' => 'FLYHIGH20',
                'discount_type' => 'percentage',
                'discount' => 20,
                'valid_until' => Carbon::now()->addMonths(1),
                'is_used' => false
            ],
            [
                'code' => 'SUMMER25',
                'discount_type' => 'fixed',
                'discount' => 250000, // IDR
                'valid_until' => Carbon::now()->addMonths(2),
                'is_used' => false
            ],
            [
                'code' => 'FREEBAG',
                'discount_type' => 'percentage',
                'discount' => 15,
                'valid_until' => Carbon::now()->addWeeks(2),
                'is_used' => true // Mark as used for testing
            ],
            [
                'code' => 'NEWYEAR2025',
                'discount_type' => 'percentage',
                'discount' => 25,
                'valid_until' => Carbon::create(2025, 2, 1, 0, 0, 0), // Expired
                'is_used' => false
            ]
        ];


        foreach ($promoCodes as $promoCode) {
            PromoCode::create($promoCode);
        }
    }
}
