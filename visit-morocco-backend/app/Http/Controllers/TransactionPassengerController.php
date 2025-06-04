<?php

namespace App\Http\Controllers;

use App\Models\TransactionPassenger;
use App\Models\FlightSeat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TransactionPassengerController extends Controller
{
    public function index()
    {
        try {
            $passengers = TransactionPassenger::with(['transaction', 'flightSeat'])->get();
            return response()->json([
                'status' => 'success',
                'passengers' => $passengers
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch passengers', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch passengers'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'transaction_id' => 'required|exists:transactions,id',
                'flight_seat_id' => 'required|exists:flight_seats,id',
                'name' => 'required|string|max:255',
                'date_of_birth' => 'required|date',
                'nationality' => 'required|string|max:100'
            ]);

            // Start a database transaction
            DB::beginTransaction();

            // Check if the seat is still available
            $seat = FlightSeat::findOrFail($validated['flight_seat_id']);
            if (!$seat->is_available) {
                DB::rollBack();
                return response()->json([
                    'status' => 'error',
                    'message' => 'Selected seat is no longer available'
                ], 400);
            }

            // Create the passenger record
            $passenger = TransactionPassenger::create($validated);

            // Update seat availability
            $seat->update(['is_available' => false]);

            // Commit the transaction
            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Passenger booked successfully',
                'passenger' => $passenger
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create passenger booking', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create passenger booking'
            ], 500);
        }
    }

    public function show(TransactionPassenger $transactionPassenger)
    {
        try {
            $passenger = $transactionPassenger->load(['transaction', 'flightSeat']);
            return response()->json([
                'status' => 'success',
                'passenger' => $passenger
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch passenger details', [
                'passenger_id' => $transactionPassenger->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch passenger details'
            ], 500);
        }
    }

    public function update(Request $request, TransactionPassenger $transactionPassenger)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'date_of_birth' => 'required|date',
                'nationality' => 'required|string|max:100'
            ]);

            $transactionPassenger->update($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Passenger details updated successfully',
                'passenger' => $transactionPassenger
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to update passenger', [
                'passenger_id' => $transactionPassenger->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update passenger details'
            ], 500);
        }
    }

    public function destroy(TransactionPassenger $transactionPassenger)
    {
        try {
            DB::beginTransaction();

            // Get the seat ID before deleting the passenger
            $seatId = $transactionPassenger->flight_seat_id;

            // Delete the passenger
            $transactionPassenger->delete();

            // Make the seat available again
            if ($seatId) {
                FlightSeat::where('id', $seatId)->update(['is_available' => true]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Passenger booking cancelled successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete passenger', [
                'passenger_id' => $transactionPassenger->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to cancel passenger booking'
            ], 500);
        }
    }
}
