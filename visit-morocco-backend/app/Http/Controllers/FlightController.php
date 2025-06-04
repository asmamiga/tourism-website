<?php

namespace App\Http\Controllers;

use App\Models\Flight;
use App\Models\FlightClass;
use App\Models\FlightSeat;
use App\Models\FlightSegment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FlightController extends Controller
{
    private function formatImagePath($path, $type = 'unknown')
    {
        if (!$path) {
            return null;
        }
        
        // Log the original path for debugging
        Log::debug("Formatting {$type} image path", ['original_path' => $path]);
        
        // If path is already a full URL, return as is
        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }
        
        // Remove any leading slashes to avoid double slashes
        $path = ltrim($path, '/');
        
        // For facility images - handle both possible paths
        if ($type === 'facility') {
            // Check if it already has the expected prefixes
            if (strpos($path, 'storage/facilities/') === 0 || 
                strpos($path, 'storage/facilities-images/') === 0) {
                return $path;
            }
            
            // Check if it has just the folder name without storage prefix
            if (strpos($path, 'facilities/') === 0 || 
                strpos($path, 'facilities-images/') === 0) {
                return 'storage/' . $path;
            }
            
            // If it has neither prefix, add the complete path
            // Use facilities-images to match what the frontend is expecting
            return 'storage/facilities-images/' . $path;
        }
        
        // For airline logos, ensure they have the storage prefix
        if ($type === 'airline') {
            if (strpos($path, 'storage/airlines-logos/') === 0) {
                return $path;
            }
            
            if (strpos($path, 'airlines-logos/') === 0) {
                return 'storage/' . $path;
            }
            
            return 'storage/airlines-logos/' . $path;
        }
        
        // General case - add storage prefix if needed
        if (strpos($path, 'storage/') !== 0) {
            return 'storage/' . $path;
        }
        
        return $path;
    }
    
    // Apply image path formatting to model data
    private function formatModelImages($model)
    {
        if (!$model) return $model;
        
        // Format airline logo if present
        if (isset($model->airline) && isset($model->airline->logo)) {
            $model->airline->logo = $this->formatImagePath($model->airline->logo, 'airline');
        }
        
        // Enhanced facilities image formatting with more checks
        if (isset($model->flight_classes)) {
            foreach ($model->flight_classes as $class) {
                if (isset($class->facilities)) {
                    foreach ($class->facilities as $facility) {
                        if (isset($facility->image)) {
                            // Use a specific type for facility images
                            $facility->image = $this->formatImagePath($facility->image, 'facility');
                            
                            // Log the final formatted path
                            Log::debug("Final facility image path", [
                                'facility_id' => $facility->id ?? 'unknown',
                                'facility_name' => $facility->name ?? 'unknown',
                                'formatted_path' => $facility->image
                            ]);
                        }
                    }
                }
            }
        }
        
        return $model;
    }


    public function index()
    {
        $flights = Flight::with([
            'airline', 
            'flightSegments.originAirport',
            'flightSegments.destinationAirport'
        ])->get();
        
        // Format all flights
        $flights->transform(function ($flight) {
            return $this->formatModelImages($flight);
        });
        
        return $flights;
    }

    public function store(Request $request)
    {
         DB::beginTransaction();
        try {
            // Validate flight data
            $validated = $request->validate([
                'flight_number' => 'required|unique:flights,flight_number',
                'airline_id' => 'required|exists:airlines,id',
                'segments' => 'array',
                'segments.*.sequence' => 'required_with:segments|integer|min:1',
                'segments.*.airportId' => 'required_with:segments|exists:airports,id', // Changed from airport_id
                'segments.*.time' => 'required_with:segments|date_format:Y-m-d\TH:i',
                'classes' => 'array',
                'classes.*.classType' => 'required_with:classes|in:Economy,Business,First', // Changed from class_type
                'classes.*.price' => 'required_with:classes|numeric|min:0',
                'classes.*.totalSeats' => 'required_with:classes|integer|min:1', // Changed from total_seats
                'classes.*.facilities' => 'array'
            ]);

            // Create flight
            $flight = Flight::create([
                'flight_number' => $validated['flight_number'],
                'airline_id' => $validated['airline_id'],
            ]);

            // Create flight segments
            foreach ($validated['segments'] as $segment) {
                FlightSegment::create([
                    'flight_id' => $flight->id,
                    'sequence' => $segment['sequence'],
                    'airport_id' => $segment['airportId'], // Match camelCase
                    'time' => $segment['time'],
                ]);
            }

            // Create flight classes and their facilities
            foreach ($validated['classes'] as $class) {
                $flightClass = FlightClass::create([
                    'flight_id' => $flight->id,
                    'class_type' => $class['classType'], // Match camelCase
                    'price' => $class['price'],
                    'total_seats' => $class['totalSeats'], // Match camelCase
                ]);

                // Attach facilities if any
                if (!empty($class['facilities'])) {
                    $flightClass->facilities()->attach($class['facilities']);
                }

                // Create seats for this flight class
                $this->createSeatsForClass($flight->id, $flightClass);
            }

                DB::commit();

                $flight = $flight->load('flightSegments', 'flightClasses.facilities');
                $flight = $this->formatModelImages($flight);

                return response()->json([
                    'message' => 'Flight created successfully!',
                    'flight' => $flight
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Flight creation failed', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'request_data' => $request->all() // Log the request data for debugging
                ]);

                return response()->json([
                    'message' => 'Failed to create flight',
                    'error' => $e->getMessage()
                ], 500);
            }
        }

    public function show($id)
    {
        $flight = Flight::with([
            'airline',
            'flightSegments',
            'flightClasses.facilities',
            'flightSeats'
        ])->findOrFail($id);
        
        $flight = $this->formatModelImages($flight);
        
        return $flight;
    }

    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $flight = Flight::findOrFail($id);

            // Validate the input with more flexible rules
            $validated = $request->validate([
                'flight_number' => 'required|unique:flights,flight_number,' . $id,
                'airline_id' => 'required|exists:airlines,id',
                'segments' => 'sometimes|array',
                'segments.*.id' => 'nullable|exists:flight_segments,id',
                'segments.*.sequence' => 'required_with:segments|integer|min:1',
                'segments.*.airportId' => 'required_with:segments|exists:airports,id', // Changed from airport_id
                'segments.*.time' => 'required_with:segments|date_format:Y-m-d\TH:i', // Adjusted to match frontend format
                'classes' => 'sometimes|array',
                'classes.*.id' => 'nullable|exists:flight_classes,id',
                'classes.*.classType' => 'required_with:classes|in:Economy,Business,First', // Changed from class_type
                'classes.*.price' => 'required_with:classes|numeric|min:0',
                'classes.*.totalSeats' => 'required_with:classes|integer|min:1', // Changed from total_seats
                'classes.*.facilities' => 'sometimes|array'
            ]);

            // Update flight basic info
            $flight->update([
                'flight_number' => $validated['flight_number'],
                'airline_id' => $validated['airline_id'],
            ]);

            // Handle segments
            if (isset($validated['segments'])) {
                $existingSegmentIds = $flight->flightSegments->pluck('id')->toArray();
                $updatedSegmentIds = [];

                foreach ($validated['segments'] as $segmentData) {
                    if (isset($segmentData['id'])) {
                        // Update existing segment
                        FlightSegment::where('id', $segmentData['id'])
                            ->where('flight_id', $flight->id)
                            ->update([
                                'sequence' => $segmentData['sequence'],
                                'airport_id' => $segmentData['airportId'], // Changed from airport_id
                                'time' => $segmentData['time'],
                            ]);
                        $updatedSegmentIds[] = $segmentData['id'];
                    } else {
                        // Create new segment
                        $newSegment = FlightSegment::create([
                            'flight_id' => $flight->id,
                            'sequence' => $segmentData['sequence'],
                            'airport_id' => $segmentData['airportId'], // Changed from airport_id
                            'time' => $segmentData['time'],
                        ]);
                        $updatedSegmentIds[] = $newSegment->id;
                    }
                }

                // Delete segments that are not in the updated list
                $segmentsToDelete = array_diff($existingSegmentIds, $updatedSegmentIds);
                if (!empty($segmentsToDelete)) {
                    FlightSegment::whereIn('id', $segmentsToDelete)->delete();
                }
            }

            // Handle classes
            if (isset($validated['classes'])) {
                $existingClassIds = $flight->flightClasses->pluck('id')->toArray();
                $updatedClassIds = [];

                foreach ($validated['classes'] as $classData) {
                    if (isset($classData['id'])) {
                        // Update existing class
                        $flightClass = FlightClass::where('id', $classData['id'])
                            ->where('flight_id', $flight->id)
                            ->first();

                        if ($flightClass) {
                            $flightClass->update([
                                'class_type' => $classData['classType'], // Changed from class_type
                                'price' => $classData['price'],
                                'total_seats' => $classData['totalSeats'], // Changed from total_seats
                            ]);

                            // Sync facilities if provided
                            if (isset($classData['facilities'])) {
                                $flightClass->facilities()->sync($classData['facilities']);
                            }

                            $updatedClassIds[] = $classData['id'];

                            // Update seats for this class
                            $this->updateSeatsForClass($flight->id, $flightClass);
                        }
                    } else {
                        // Create new class
                        $newClass = FlightClass::create([
                            'flight_id' => $flight->id,
                            'class_type' => $classData['classType'], // Changed from class_type
                            'price' => $classData['price'],
                            'total_seats' => $classData['totalSeats'], // Changed from total_seats
                        ]);

                        // Attach facilities if provided
                        if (isset($classData['facilities'])) {
                            $newClass->facilities()->sync($classData['facilities']);
                        }

                        $updatedClassIds[] = $newClass->id;

                        // Create seats for this new class
                        $this->createSeatsForClass($flight->id, $newClass);
                    }
                }

                // Delete classes that are not in the updated list
                $classesToDelete = array_diff($existingClassIds, $updatedClassIds);
                // Replace this code in your update method:
                $classesToDelete = array_diff($existingClassIds, $updatedClassIds);
                if (!empty($classesToDelete)) {
                    // First get the class types for these class IDs before deleting them
                    $classTypes = FlightClass::whereIn('id', $classesToDelete)
                        ->pluck('class_type')
                        ->toArray();
                    
                    // Delete the classes
                    FlightClass::whereIn('id', $classesToDelete)->delete();
                    
                    // Delete seats based on class_type instead of flight_class_id
                    if (!empty($classTypes)) {
                        FlightSeat::where('flight_id', $flight->id)
                            ->whereIn('class_type', $classTypes)
                            ->delete();
                    }
                }
            }

            DB::commit();

            // Load relationships for response
            $flight->load(['flightSegments', 'flightClasses.facilities']);
            $flight = $this->formatModelImages($flight);

            return response()->json([
                'message' => 'Flight updated successfully',
                'flight' => $flight
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update failed', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all() // Log the request data for debugging
            ]);

            return response()->json([
                'message' => 'Update failed',
                'error' => $e->getMessage()
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

        for ($row = 1; $row <= $totalRows; $row++) {
            foreach ($columns as $column) {
                // Stop if we've created enough seats
                if ($seatsCreated >= $flightClass->total_seats) {
                    break;
                }

                FlightSeat::create([
                    'flight_id' => $flightId,
                    'flight_class_id' => $flightClass->id,
                    'row' => $row,
                    'column' => $column,
                    'class_type' => $flightClass->class_type,
                    'is_available' => true
                ]);

                $seatsCreated++;
            }

            // Stop if we've created enough seats
            if ($seatsCreated >= $flightClass->total_seats) {
                break;
            }
        }
    }

    private function updateSeatsForClass($flightId, $flightClass)
    {
        // Modified to use class_type instead of flight_class_id
        $existingSeats = FlightSeat::where('flight_id', $flightId)
            ->where('class_type', $flightClass->class_type)
            ->get();

        $totalSeatsNeeded = $flightClass->total_seats;
        $existingSeatsCount = $existingSeats->count();

        if ($totalSeatsNeeded > $existingSeatsCount) {
            // Add more seats
            $seatsToAdd = $totalSeatsNeeded - $existingSeatsCount;
            $this->createAdditionalSeats($flightId, $flightClass, $seatsToAdd);
        } elseif ($totalSeatsNeeded < $existingSeatsCount) {
            // Remove excess seats
            $seatsToRemove = $existingSeatsCount - $totalSeatsNeeded;
            $this->removeExcessSeats($flightId, $flightClass->class_type, $seatsToRemove);
        }
    }

    
    private function createAdditionalSeats($flightId, $flightClass, $seatsToAdd)
    {
        // Find the highest row and column currently used
        $lastSeat = FlightSeat::where('flight_id', $flightId)
            ->where('class_type', $flightClass->class_type)
            ->orderBy('row', 'desc')
            ->orderBy('column', 'desc')
            ->first();

        $columns = ['A', 'B', 'C', 'D', 'E', 'F'];
        $currentRow = $lastSeat ? $lastSeat->row : 1;
        $currentColIndex = $lastSeat ? array_search($lastSeat->column, $columns) : -1;

        $seatsAdded = 0;

        while ($seatsAdded < $seatsToAdd) {
            $currentColIndex++;

            // Move to next row if we've used all columns
            if ($currentColIndex >= count($columns)) {
                $currentColIndex = 0;
                $currentRow++;
            }

            FlightSeat::create([
                'flight_id' => $flightId,
                'row' => $currentRow,
                'column' => $columns[$currentColIndex],
                'class_type' => $flightClass->class_type,
                'is_available' => true
            ]);

            $seatsAdded++;
        }
    }

    private function removeExcessSeats($flightId, $classType, $seatsToRemove)
    {
        // Modified to use class_type and flight_id
        FlightSeat::where('flight_id', $flightId)
            ->where('class_type', $classType)
            ->orderBy('row', 'desc')
            ->orderBy('column', 'desc')
            ->limit($seatsToRemove)
            ->delete();
    }

    public function search(Request $request)
    {
        // Validate the request
        $request->validate([
            'departure_airport_id' => 'required|exists:airports,id',
            'arrival_airport_id' => 'required|exists:airports,id',
            'departure_date' => 'required|date_format:Y-m-d',
        ]);

        Log::debug('Starting flight search', $request->all());

        // Find flights with a full route matching the search criteria
        $validFlights = Flight::with([
            'airline',
            'flightSegments.airport',
            'flightClasses.facilities'
        ])->get()->filter(function ($flight) use ($request) {
            // Sort segments by sequence
            $segments = $flight->flightSegments->sortBy('sequence');

            // Find all segments that match departure and arrival airports
            $departureSegments = $segments->filter(function ($segment) use ($request) {
                return $segment->airport_id == $request->departure_airport_id && 
                    date('Y-m-d', strtotime($segment->time)) == $request->departure_date;
            });

            $arrivalSegments = $segments->filter(function ($segment) use ($request) {
                return $segment->airport_id == $request->arrival_airport_id;
            });

            // Check if we have valid departure and arrival segments
            if ($departureSegments->isEmpty() || $arrivalSegments->isEmpty()) {
                return false;
            }

            // Ensure there's a valid route (departure before arrival)
            foreach ($departureSegments as $departureSegment) {
                foreach ($arrivalSegments as $arrivalSegment) {
                    if ($departureSegment->sequence < $arrivalSegment->sequence) {
                        return true;
                    }
                }
            }

            return false;
        });

        Log::debug('Valid flights after filtering', ['count' => $validFlights->count()]);

        // Format the flights (e.g., image URLs)
        $formattedFlights = $validFlights->map(function ($flight) {
            // Clone the flight to avoid reference issues
            $flightCopy = clone $flight;

            // Format the airline logo
            if (isset($flightCopy->airline)) {
                $flightCopy->airline->logo = $this->formatImagePath($flightCopy->airline->logo, 'airline');
            }

            // Format facility images
            if (isset($flightCopy->flight_classes)) {
                foreach ($flightCopy->flight_classes as $class) {
                    if (isset($class->facilities)) {
                        foreach ($class->facilities as $facility) {
                            if (isset($facility->image)) {
                                $facility->image = $this->formatImagePath($facility->image, 'facility');
                            }
                        }
                    }
                }
            }

            return $flightCopy;
        });

        Log::debug('Formatted flights', ['count' => $formattedFlights->count()]);

        return response()->json([
            'status' => 'success',
            'flights' => $formattedFlights->values()->all(),
            'total_flights' => $formattedFlights->count()
        ]);

        Log::debug('Filtering flights', [
            'total_flights_before_filter' => $flights->count(),
            'departure_airport' => $request->departure_airport_id,
            'arrival_airport' => $request->arrival_airport_id,
            'departure_date' => $request->departure_date
        ]);
        // After filtering
        Log::debug('Flights after filtering', [
            'valid_flights_count' => $validFlights->count(),
            'flight_ids' => $validFlights->pluck('id')
        ]);
    }

    public function destroy($id)
    {
        $flight = Flight::findOrFail($id);

        // Delete related flight segments, classes, and seats if necessary
        $flight->flightSegments()->delete();
        $flight->flightClasses()->delete();
        $flight->flightSeats()->delete();

        $flight->delete();

        return response()->noContent();
    }

    
}
