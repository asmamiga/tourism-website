<?php

namespace Database\Seeders;

use App\Models\Flight;
use App\Models\FlightClass;
use App\Models\PromoCode;
use App\Models\Transaction;
use App\Models\TransactionPassenger;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        // Get data needed for creating bookings
        $flights = Flight::with('flightClasses')->get();
        $promoCodes = PromoCode::all();
        
        // Generate passenger data for names
        $firstNames = ['Mohammed', 'Fatima', 'Youssef', 'Aisha', 'Omar', 'Layla', 'Hamza', 'Nora', 'Ali', 'Samira'];
        $lastNames = ['El Alami', 'Benjelloun', 'Tazi', 'Benmoussa', 'Cherkaoui', 'Lahlou', 'Fassi', 'Elbaz', 'Tahiri', 'Moussaoui'];
        
        // Create between 20-30 bookings
        $bookingCount = rand(20, 30);
        
        for ($i = 0; $i < $bookingCount; $i++) {
            // Get a random flight
            $flight = $flights->random();
            
            // Get a random class for this flight
            $flightClass = $flight->flightClasses->random();
            
            // 30% chance to use a promo code
            $promoCode = (rand(1, 100) <= 30 && $promoCodes->count() > 0) ? $promoCodes->random() : null;
            
            // Base price
            $basePrice = $flightClass->price;
            
            // Apply discount if promo code is used
            $discount = 0;
            if ($promoCode) {
                $discount = $basePrice * ($promoCode->discount_percentage / 100);
            }
            
            // Generate a booking reference
            $bookingReference = strtoupper(Str::random(6));
            
            // Random number of passengers (1-4)
            $passengerCount = rand(1, 4);
            
            // Calculate total price
            $totalPrice = ($basePrice * $passengerCount) - $discount;
            
            // Random passenger name for transaction contact
            $contactName = $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)];
            
            // Create the transaction (booking)
            $transaction = Transaction::create([
                'code' => $bookingReference,
                'flight_id' => $flight->id,
                'flight_class_id' => $flightClass->id,
                'promo_code_id' => $promoCode ? $promoCode->id : null,
                'payment_status' => rand(1, 10) <= 8 ? 'paid' : 'pending', // Use 'paid' instead of 'completed' to avoid truncation
                'subtotal' => $basePrice * $passengerCount,
                'grandtotal' => $totalPrice,
                'name' => $contactName,
                'email' => 'passenger' . rand(1, 999) . '@example.com',
                'phone' => '+212' . rand(6, 7) . rand(10000000, 99999999),
                'number_of_passengers' => $passengerCount,
                'created_at' => Carbon::now()->subDays(rand(1, 30)),
            ]);
            
            // Create passengers for this booking
            for ($p = 0; $p < $passengerCount; $p++) {
                $firstName = $firstNames[array_rand($firstNames)];
                $lastName = $lastNames[array_rand($lastNames)];
                
                // First, check if we have flight seats available for this class
                $existingSeats = DB::table('flight_seats')
                    ->where('flight_id', $flight->id)
                    ->where('class_type', $flightClass->class_type)
                    ->where('is_available', true)
                    ->count();
                
                // If we don't have seats in the database yet, create them
                if ($existingSeats == 0) {
                    // Create seats for this flight class
                    $seatCount = $flightClass->class_type === 'economy' ? 150 : 
                               ($flightClass->class_type === 'business' ? 24 : 12);
                    
                    $cols = ['A', 'B', 'C', 'D', 'E', 'F'];
                    $maxRows = ceil($seatCount / 6);
                    
                    for ($row = 1; $row <= $maxRows; $row++) {
                        foreach ($cols as $col) {
                            if ((($row - 1) * 6) + array_search($col, $cols) + 1 <= $seatCount) {
                                DB::table('flight_seats')->insert([
                                    'flight_id' => $flight->id,
                                    'row' => $row,
                                    'column' => $col,
                                    'class_type' => $flightClass->class_type,
                                    'is_available' => true,
                                    'created_at' => now(),
                                    'updated_at' => now(),
                                ]);
                            }
                        }
                    }
                }
                
                // Get an available seat for this passenger
                $availableSeat = DB::table('flight_seats')
                    ->where('flight_id', $flight->id)
                    ->where('class_type', $flightClass->class_type)
                    ->where('is_available', true)
                    ->whereNotExists(function($query) {
                        $query->select(DB::raw(1))
                              ->from('transaction_passengers')
                              ->whereRaw('transaction_passengers.flight_seat_id = flight_seats.id');
                    })
                    ->orderBy(DB::raw('RAND()'))
                    ->first();
                
                // If no available seat is found, create a new one
                if (!$availableSeat) {
                    // Create an emergency seat with a unique row/column
                    $newRow = rand(30, 99); // Use high row numbers for emergency seats
                    $newCol = chr(65 + rand(0, 5)); // A-F
                    
                    $newSeatId = DB::table('flight_seats')->insertGetId([
                        'flight_id' => $flight->id,
                        'row' => $newRow,
                        'column' => $newCol,
                        'class_type' => $flightClass->class_type,
                        'is_available' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    
                    $flightSeatId = $newSeatId;
                } else {
                    $flightSeatId = $availableSeat->id;
                    
                    // Mark the seat as not available
                    DB::table('flight_seats')
                        ->where('id', $flightSeatId)
                        ->update(['is_available' => false]);
                }
                
                TransactionPassenger::create([
                    'transaction_id' => $transaction->id,
                    'flight_seat_id' => $flightSeatId,
                    'name' => $firstName . ' ' . $lastName,
                    'date_of_birth' => Carbon::now()->subYears(rand(18, 70))->format('Y-m-d'),
                    'nationality' => 'Moroccan',
                ]);
            }
            
            // Update the available seats for this flight class (if that field exists)
            try {
                DB::table('flight_classes')
                    ->where('id', $flightClass->id)
                    ->update([
                        'seats_sold' => DB::raw("COALESCE(seats_sold, 0) + $passengerCount")
                    ]);
            } catch (\Exception $e) {
                // If the column doesn't exist, just continue
            }
        }
    }
    

}
