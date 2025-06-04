<?php

namespace App\Http\Controllers;

use App\Models\FlightSegment;
use App\Models\Flight;
use App\Models\Airport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class FlightSegmentController extends Controller
{
    public function index()
    {
        $flightSegments = FlightSegment::with('flight', 'airport')->get();

        return $flightSegments;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sequence' => 'required|integer|min:1',
            'flight_id' => 'required|exists:flights,id',
            'airport_id' => 'required|exists:airports,id',
            'time' => 'required|date_format:Y-m-d H:i:s',
        ]);

        $flightSegment = FlightSegment::create([
            'sequence' => $validated['sequence'],
            'flight_id' => $validated['flight_id'],
            'airport_id' => $validated['airport_id'],
            'time' => $validated['time'],
        ]);

        return response()->json([
            'message' => 'Flight segment created successfully!',
            'flight_segment' => $flightSegment
        ], 201);
    }

    public function show($id)
    {
        $flightSegment = FlightSegment::with('flight', 'airport')->findOrFail($id);
        return $flightSegment;
    }

    public function update(Request $request, $id)
    {
        try {
            $flightSegment = FlightSegment::findOrFail($id);

            // Validate the input
            $validated = $request->validate([
                'sequence' => 'required|integer|min:1',
                'flight_id' => 'required|exists:flights,id',
                'airport_id' => 'required|exists:airports,id',
                'time' => 'required|date_format:Y-m-d H:i:s',
            ]);

            // Update the flight segment
            $flightSegment->update($validated);
            $flightSegment->refresh();

            return response()->json([
                'message' => 'Flight segment updated successfully!',
                'flight_segment' => $flightSegment
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
        $flightSegment = FlightSegment::findOrFail($id);
        $flightSegment->delete();

        return response()->noContent();
    }
}
