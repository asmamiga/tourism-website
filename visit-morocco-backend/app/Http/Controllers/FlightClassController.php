<?php

namespace App\Http\Controllers;

use App\Models\FlightClass;
use App\Models\Flight;
use App\Models\Facility;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class FlightClassController extends Controller
{
    public function index()
    {
        $flightClasses = FlightClass::with('flight', 'facilities')->get();

        return $flightClasses;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'flight_id' => 'required|exists:flights,id',
            'class_type' => 'required|string',
            'price' => 'required|numeric|min:0',
            'total_seats' => 'required|integer|min:1',
            'facilities' => 'nullable|array',
            'facilities.*' => 'exists:facilities,id',
        ]);

        // Create the flight class
        $flightClass = FlightClass::create([
            'flight_id' => $validated['flight_id'],
            'class_type' => $validated['class_type'],
            'price' => $validated['price'],
            'total_seats' => $validated['total_seats'],
        ]);

        // Attach facilities if provided
        if (isset($validated['facilities'])) {
            $flightClass->facilities()->attach($validated['facilities']);
        }

        return response()->json([
            'message' => 'Flight class created successfully!',
            'flight_class' => $flightClass->load('facilities')
        ], 201);
    }

    public function show($id)
    {
        $flightClass = FlightClass::with('flight', 'facilities')->findOrFail($id);
        return $flightClass;
    }

    public function update(Request $request, $id)
    {
        try {
            $flightClass = FlightClass::findOrFail($id);

            // Validate the input
            $validated = $request->validate([
                'flight_id' => 'required|exists:flights,id',
                'class_type' => 'required|string',
                'price' => 'required|numeric|min:0',
                'total_seats' => 'required|integer|min:1',
                'facilities' => 'nullable|array',
                'facilities.*' => 'exists:facilities,id',
            ]);

            // Update the flight class
            $flightClass->update([
                'flight_id' => $validated['flight_id'],
                'class_type' => $validated['class_type'],
                'price' => $validated['price'],
                'total_seats' => $validated['total_seats'],
            ]);

            // Sync facilities if provided
            if (isset($validated['facilities'])) {
                $flightClass->facilities()->sync($validated['facilities']);
            }

            return response()->json([
                'message' => 'Flight class updated successfully!',
                'flight_class' => $flightClass->load('facilities')
            ]);

        } catch (\Exception $e) {
            Log::error('Update failed', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Update failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $flightClass = FlightClass::findOrFail($id);

        // Detach all facilities before deleting
        $flightClass->facilities()->detach();

        $flightClass->delete();

        return response()->noContent();
    }
}
