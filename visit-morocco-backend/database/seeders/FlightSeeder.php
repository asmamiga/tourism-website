<?php

namespace Database\Seeders;

use App\Models\Airline;
use App\Models\Airport;
use App\Models\Facility;
use App\Models\Flight;
use App\Models\FlightClass;
use App\Models\FlightSeat;
use App\Models\FlightSegment;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class FlightSeeder extends Seeder
{
    public function run(): void
    {
        // Get all airlines and airports
        $airlines = Airline::all();
        $allAirports = Airport::all();
        $facilities = Facility::all();
        
        // Get Moroccan airports
        $moroccanAirports = $allAirports->where('country', 'Morocco');
        // Get international airports (non-Moroccan)
        $internationalAirports = $allAirports->where('country', '!=', 'Morocco');

        // Define flight classes with their details
        $classTypes = [
            ['name' => 'economy', 'price_multiplier' => 1, 'facilities' => [0, 1]], // Basic facilities
            ['name' => 'business', 'price_multiplier' => 2.5, 'facilities' => [0, 1, 2, 3, 5]], // More facilities
            ['name' => 'first', 'price_multiplier' => 4, 'facilities' => [0, 1, 2, 3, 4, 5, 6, 7]] // All facilities
        ];
        
        // Moroccan airlines (first 3 in the list)
        $moroccanAirlines = $airlines->take(3);
        $foreignAirlines = $airlines->slice(3);

        // Create domestic flights (between Moroccan cities)
        $this->createDomesticFlights($moroccanAirports, $moroccanAirlines, $classTypes, $facilities);
        
        // Create international flights (from Morocco to other countries)
        $this->createInternationalFlights($moroccanAirports, $internationalAirports, $airlines, $classTypes, $facilities);
    }
    
    private function createDomesticFlights($moroccanAirports, $airlines, $classTypes, $facilities)
    {
        // Major city pairs for domestic flights
        $domesticRoutes = [
            ['CMN', 'RAK'], // Casablanca to Marrakesh
            ['CMN', 'FEZ'], // Casablanca to Fes
            ['CMN', 'TNG'], // Casablanca to Tangier
            ['RAK', 'AGA'], // Marrakesh to Agadir
            ['FEZ', 'TNG'], // Fes to Tangier
            ['CMN', 'OUD'], // Casablanca to Oujda
            ['CMN', 'NDR'], // Casablanca to Nador
            ['RAK', 'FEZ'], // Marrakesh to Fes
            ['AGA', 'TNG'], // Agadir to Tangier
            ['FEZ', 'RBA'], // Fes to Rabat
        ];
        
        foreach ($domesticRoutes as $route) {
            $origin = $moroccanAirports->where('iata_code', $route[0])->first();
            $destination = $moroccanAirports->where('iata_code', $route[1])->first();
            
            if (!$origin || !$destination) continue;
            
            $this->createFlight($origin, $destination, $airlines->random(), $classTypes, $facilities, 1.0);
        }
    }
    
    private function createInternationalFlights($moroccanAirports, $internationalAirports, $airlines, $classTypes, $facilities)
    {
        // Major international routes from Morocco
        $internationalRoutes = [
            ['CMN', 'CDG'], // Casablanca to Paris
            ['RAK', 'CDG'], // Marrakesh to Paris
            ['CMN', 'MAD'], // Casablanca to Madrid
            ['TNG', 'MAD'], // Tangier to Madrid
            ['CMN', 'FCO'], // Casablanca to Rome
            ['RAK', 'FCO'], // Marrakesh to Rome
            ['CMN', 'LHR'], // Casablanca to London
            ['RAK', 'LHR'], // Marrakesh to London
            ['CMN', 'DXB'], // Casablanca to Dubai
            ['CMN', 'JFK'], // Casablanca to New York
        ];
        
        foreach ($internationalRoutes as $route) {
            $origin = $moroccanAirports->where('iata_code', $route[0])->first();
            $destination = $internationalAirports->where('iata_code', $route[1])->first();
            
            if (!$origin || !$destination) continue;
            
            // For international flights, use a random airline (including foreign ones)
            $airline = $airlines->random();
            // International flights are more expensive (2x base price)
            $this->createFlight($origin, $destination, $airline, $classTypes, $facilities, 2.0);
        }
    }
    
    private function createFlight($origin, $destination, $airline, $classTypes, $facilities, $priceMultiplier = 1.0)
    {
        $departureTime = Carbon::now()->addDays(rand(1, 30))->addHours(rand(0, 12));
        
        // Create flight
        $flight = Flight::create([
            'flight_number' => $airline->code . str_pad(rand(100, 999), 3, '0', STR_PAD_LEFT),
            'airline_id' => $airline->id,
        ]);

        // 30% chance of being a multi-segment flight
        $isMultiSegment = (rand(1, 10) <= 3);
        
        if ($isMultiSegment) {
            // Get other Moroccan airports for transit
            $transitAirports = Airport::where('country', 'Morocco')
                ->whereNotIn('id', [$origin->id, $destination->id])
                ->inRandomOrder()
                ->take(2)
                ->get();
                
            if (count($transitAirports) >= 2) {
                // Create 4-segment flight with 2 transit stops
                $segments = [
                    ['airport' => $origin, 'time' => $departureTime, 'sequence' => 1],
                    ['airport' => $transitAirports[0], 'time' => (clone $departureTime)->addHours(1), 'sequence' => 2],
                    ['airport' => $transitAirports[1], 'time' => (clone $departureTime)->addHours(3), 'sequence' => 3],
                    ['airport' => $destination, 'time' => (clone $departureTime)->addHours(5), 'sequence' => 4],
                ];
            } else {
                // Fallback to direct flight if not enough transit airports
                $segments = [
                    ['airport' => $origin, 'time' => $departureTime, 'sequence' => 1],
                    ['airport' => $destination, 'time' => (clone $departureTime)->addHours(2), 'sequence' => 2],
                ];
            }
        } else {
            // Create direct flight (2 segments)
            $segments = [
                ['airport' => $origin, 'time' => $departureTime, 'sequence' => 1],
                ['airport' => $destination, 'time' => (clone $departureTime)->addHours(2), 'sequence' => 2],
            ];
        }
        
        // Create flight segments
        foreach ($segments as $segment) {
            FlightSegment::create([
                'flight_id' => $flight->id,
                'airport_id' => $segment['airport']->id,
                'time' => $segment['time'],
                'sequence' => $segment['sequence']
            ]);
        }
        
        // Base price calculation (distance-based with multiplier for international flights)
        $basePrice = rand(50, 200) * $priceMultiplier; // Base price in USD
        
        // Create flight classes
        foreach ($classTypes as $classType) {
            $totalSeats = $classType['name'] === 'economy' ? 150 : ($classType['name'] === 'business' ? 24 : 12);
        
            $flightClass = FlightClass::create([
                'flight_id' => $flight->id,
                'class_type' => ucfirst($classType['name']),
                'price' => $basePrice * $classType['price_multiplier'],
                'total_seats' => $totalSeats,
            ]);
            
            // Create individual seats for this class
            $this->createSeatsForClass($flight->id, $flightClass->id, $classType['name'], $totalSeats);
            
            // Attach facilities to this class
            if (isset($classType['facilities']) && is_array($classType['facilities'])) {
                $facilityIds = [];
                foreach ($classType['facilities'] as $facilityIndex) {
                    if (isset($facilities[$facilityIndex])) {
                        $facilityIds[] = $facilities[$facilityIndex]->id;
                    }
                }
                if (!empty($facilityIds)) {
                    $flightClass->facilities()->attach($facilityIds);
                }
            }
        }
    }
    
    /**
     * Create individual seats for a flight class
     */
    private function createSeatsForClass($flightId, $flightClassId, $classType, $totalSeats)
    {
        // Convert classType to proper case for database (first letter uppercase)
        $formattedClassType = ucfirst($classType); // 'economy' -> 'Economy'

        // We need to create different seat layouts for each class
        switch ($classType) {
            case 'first':
                $rows = 3;
                $columns = ['A', 'B', 'C', 'D']; // 3 rows x 4 seats = 12 seats
                break;
            case 'business':
                $rows = 6;
                $columns = ['A', 'B', 'C', 'D']; // 6 rows x 4 seats = 24 seats
                break;
            case 'economy':
            default:
                $rows = 25;
                $columns = ['A', 'B', 'C', 'D', 'E', 'F']; // 25 rows x 6 seats = 150 seats
                break;
        }
        
        // Debug information to verify seats are being created
        echo "Creating {$rows} rows × " . count($columns) . " columns = " . ($rows * count($columns)) . " {$formattedClassType} seats\n";
        
        // Create individual seat records
        for ($row = 1; $row <= $rows; $row++) {
            foreach ($columns as $column) {
                FlightSeat::create([
                    'flight_id' => $flightId,
                    'row' => (string)$row, // Cast to string to match the column type
                    'column' => $column,
                    'class_type' => $formattedClassType, // Properly formatted class type
                    'is_available' => true,
                ]);
            }
        }
    }
}
