<?php

namespace App\Http\Controllers;

use App\Models\FlightSeat;
use App\Models\Flight;
use App\Models\FlightClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class FlightSeatController extends Controller
{
    /**
     * Format seat data consistently
     */
    private function formatSeatData($seat)
    {
        return [
            'id' => $seat->id,
            'flight_id' => $seat->flight_id,
            'row' => $seat->row,
            'column' => $seat->column,
            'seat_name' => $seat->getSeatName(),
            'class_type' => $seat->class_type,
            'is_available' => (bool) $seat->is_available
        ];
    }

    public function index(Request $request)
    {
        try {
            Log::info('Fetching seats with params:', $request->all());
            
            $query = FlightSeat::query();

            if ($request->has('flight_id')) {
                $query->where('flight_id', $request->flight_id);
            }

            if ($request->has('class_type')) {
                $query->where('class_type', $request->class_type);
            }

            $seats = $query->orderBy('row')
                ->orderBy('column')
                ->get()
                ->map(function($seat) {
                    return $this->formatSeatData($seat);
                });

            return response()->json([
                'status' => 'success',
                'data' => $seats
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching seats', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch seats'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'flight_id' => 'required|exists:flights,id',
                'row' => 'required|integer',
                'column' => 'required|integer',
                'class_type' => 'required|string',
                'is_available' => 'required|boolean',
            ]);

            $flightSeat = FlightSeat::create([
                'flight_id' => $validated['flight_id'],
                'row' => $validated['row'],
                'column' => $validated['column'],
                'class_type' => $validated['class_type'],
                'is_available' => $validated['is_available']
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Flight seat created successfully!',
                'seat' => $this->formatSeatData($flightSeat)
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create seat', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create seat: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $seat = FlightSeat::findOrFail($id);
            return response()->json([
                'status' => 'success',
                'seat' => $this->formatSeatData($seat)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Seat not found'
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $seat = FlightSeat::findOrFail($id);
            
            $validated = $request->validate([
                'is_available' => 'sometimes|boolean',
            ]);

            $seat->update($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Seat updated successfully',
                'seat' => $this->formatSeatData($seat)
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update seat', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update seat: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $flightSeat = FlightSeat::findOrFail($id);
            $flightSeat->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Flight seat deleted successfully!'
            ]);
        } catch (\Exception $e) {
            Log::error('Delete failed', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete seat: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getFlightSeats($flightId)
    {
        try {
            Log::info('Fetching seats for flight', [
                'flight_id' => $flightId
            ]);
            
            // First check if the flight exists
            $flight = Flight::findOrFail($flightId);
            
            // Get seats directly without the join which might be causing issues
            $seats = FlightSeat::where('flight_id', $flightId)
                ->orderBy('row')
                ->orderBy('column')
                ->get();
                
            Log::info('Found seats', [
                'flight_id' => $flightId,
                'count' => $seats->count(),
                'sample' => $seats->take(5)->toArray()
            ]);
            
            if ($seats->isEmpty()) {
                // If no seats found, check if they need to be created
                $flightClasses = FlightClass::where('flight_id', $flightId)->get();
                
                if ($flightClasses->isNotEmpty()) {
                    Log::info('No seats found but flight classes exist, creating seats', [
                        'flight_id' => $flightId,
                        'classes' => $flightClasses->toArray()
                    ]);
                    
                    foreach ($flightClasses as $class) {
                        $this->createSeatsForClass($flightId, $class);
                    }
                    
                    // Fetch newly created seats
                    $seats = FlightSeat::where('flight_id', $flightId)
                        ->orderBy('row')
                        ->orderBy('column')
                        ->get();
                }
            }
            
            $formattedSeats = $seats->map(function($seat) {
                return $this->formatSeatData($seat);
            });

            // Debug logging for formatted seats
            Log::info('Returning formatted seats', [
                'count' => $formattedSeats->count(),
                'sample' => $formattedSeats->take(3)->toArray()
            ]);

            return response()->json([
                'status' => 'success',
                'data' => $formattedSeats
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching seats for flight', [
                'flight_id' => $flightId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch seats: ' . $e->getMessage()
            ], 500);
        }
    }

    private function createSeatsForClass($flightId, $flightClass)
    {
        // Calculate how many rows we need based on total_seats
        $seatsPerRow = 6; // A-F columns
        $totalRows = ceil($flightClass->total_seats / $seatsPerRow);
        $columns = ['A', 'B', 'C', 'D', 'E', 'F'];
        $seatsCreated = 0;

        for ($row = 1; $row <= $totalRows && $seatsCreated < $flightClass->total_seats; $row++) {
            foreach ($columns as $column) {
                // Stop if we've created enough seats
                if ($seatsCreated >= $flightClass->total_seats) {
                    break;
                }

                FlightSeat::create([
                    'flight_id' => $flightId,
                    'row' => $row,
                    'column' => $column,
                    'class_type' => $flightClass->class_type,
                    'is_available' => true  // Ensure all created seats are available by default
                ]);

                $seatsCreated++;
                
                // Log seat creation for debugging
                Log::info('Created seat', [
                    'flight_id' => $flightId, 
                    'row' => $row, 
                    'column' => $column,
                    'class_type' => $flightClass->class_type,
                    'is_available' => true
                ]);
            }
        }
        
        // Log total seats created
        Log::info('Created seats for class', [
            'flight_id' => $flightId,
            'class_type' => $flightClass->class_type,
            'seats_created' => $seatsCreated
        ]);
    }

        public function updateSeatAvailability(Request $request)
        {
            try {
                $validated = $request->validate([
                    'seat_ids' => 'required|array',
                    'seat_ids.*' => 'integer|exists:flight_seats,id',
                    'is_available' => 'required|boolean'
                ]);

                FlightSeat::whereIn('id', $validated['seat_ids'])
                    ->update(['is_available' => $validated['is_available']]);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Seat availability updated successfully'
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to update seat availability', [
                    'error' => $e->getMessage()
                ]);

                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to update seat availability: ' . $e->getMessage()
                ], 500);
            }
        }

    /**
     * Get available seats for a flight
     */
    public function getAvailableSeats($flightId)
    {
        try {
            // Get all available seats for the flight
            $seats = FlightSeat::where('flight_id', $flightId)
                ->where('is_available', true)
                ->orderBy('row')
                ->orderBy('column')
                ->get()
                ->map(function($seat) {
                    return $this->formatSeatData($seat);
                })
                ->values()
                ->all();

            return response()->json([
                'status' => 'success',
                'data' => $seats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch available seats'
            ], 500);
        }
    }
}