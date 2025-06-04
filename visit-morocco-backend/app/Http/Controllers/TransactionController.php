<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\FlightSeat;
use App\Models\TransactionPassenger;
use App\Models\FlightClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        // Check if there's a flight_id filter
        if ($request->has('flight_id')) {
            return Transaction::where('flight_id', $request->flight_id)->get();
        }
        
        return Transaction::all();
    }
    public function getTransactionsByFlight($flightId)
    {
        // Get all transactions for a specific flight
        $transactions = Transaction::where('flight_id', $flightId)->get();
        
        // Get flight details
        $flight = Flight::with('airline')->findOrFail($flightId);
        
        // Calculate totals
        $totalTransactions = $transactions->count();
        $totalPending = $transactions->where('payment_status', 'pending')
            ->sum('subtotal');
        $totalPaid = $transactions->where('payment_status', 'paid')
            ->sum('subtotal');
        
        return response()->json([
            'flight' => $flight,
            'transactions' => $transactions,
            'summary' => [
                'total_transactions' => $totalTransactions,
                'total_pending' => $totalPending,
                'total_paid' => $totalPaid
            ]
        ]);
    }
    
    public function allFlightsReport()
    {
        // Get all flights
        $flights = Flight::with('airline')->get();
        
        $flightReports = [];
        
        foreach ($flights as $flight) {
            // Get transactions for this flight
            $transactions = Transaction::where('flight_id', $flight->id)->get();
            
            // Calculate totals for this flight
            $totalTransactions = $transactions->count();
            $totalPending = $transactions->where('payment_status', 'pending')
                ->sum('subtotal');
            $totalPaid = $transactions->where('payment_status', 'paid')
                ->sum('subtotal');
            
            // Add to report
            $flightReports[] = [
                'flight' => $flight,
                'summary' => [
                    'total_transactions' => $totalTransactions,
                    'total_pending' => $totalPending,
                    'total_paid' => $totalPaid
                ]
            ];
        }
        
        return response()->json([
            'reports' => $flightReports,
            'generated_at' => now()
        ]);
    }
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            // Validate request
            $validated = $request->validate([
                'flight_id' => 'required|exists:flights,id',
                'class_type' => 'required|in:Economy,Business,First',
                'total_amount' => 'required|numeric|min:0',
                'payment_method' => 'required|in:credit_card,debit_card',
                'payment_details' => 'required|array',
                'passengers' => 'required|array|min:1',
                'passengers.*.first_name' => 'required|string|max:255',
                'passengers.*.last_name' => 'required|string|max:255',
                'passengers.*.email' => 'required|email|max:255',
                'passengers.*.phone' => 'required|string|max:20',
                'passengers.*.date_of_birth' => 'required|date',
                'passengers.*.seat_id' => 'required|exists:flight_seats,id',
            ]);

            // Get flight class ID based on class type
            $flightClass = FlightClass::where('class_type', $validated['class_type'])->firstOrFail();

            // Create transaction
            $transaction = Transaction::create([
                'code' => 'BK' . strtoupper(Str::random(6)),
                'flight_id' => $validated['flight_id'],
                'flight_class_id' => $flightClass->id,
                'name' => $validated['passengers'][0]['first_name'] . ' ' . $validated['passengers'][0]['last_name'],
                'email' => $validated['passengers'][0]['email'],
                'phone' => $validated['passengers'][0]['phone'],
                'number_of_passengers' => count($validated['passengers']),
                'payment_status' => 'paid',
                'subtotal' => $validated['total_amount'],
                'grandtotal' => $validated['total_amount']
            ]);

            // Create passengers and mark seats as unavailable
            foreach ($validated['passengers'] as $passengerData) {
                TransactionPassenger::create([
                    'transaction_id' => $transaction->id,
                    'flight_seat_id' => $passengerData['seat_id'],
                    'name' => $passengerData['first_name'] . ' ' . $passengerData['last_name'],
                    'date_of_birth' => $passengerData['date_of_birth'],
                    'nationality' => 'Not Specified'
                ]);

                // Mark seat as unavailable
                FlightSeat::where('id', $passengerData['seat_id'])
                    ->update(['is_available' => false]);
            }

            DB::commit();

            $transaction->load([
                'flight',
                'flightClass',
                'passengers.flightSeat',
                'promoCode'
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Booking and payment completed successfully!',
                'data' => $transaction
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create booking: ' . $e->getMessage()
            ], 500);
        }
    }

    private function processPayment($paymentMethod, $paymentDetails, $amount)
    {
        // Here you would typically integrate with a payment gateway
        // This is a simplified example
        try {
            // Simulate payment processing
            $success = true; // In reality, this would be based on payment gateway response
            
            if ($success) {
                return [
                    'status' => 'completed',
                    'reference' => 'PAY-' . strtoupper(Str::random(10)),
                    'message' => 'Payment processed successfully'
                ];
            } else {
                return [
                    'status' => 'failed',
                    'reference' => null,
                    'message' => 'Payment processing failed'
                ];
            }
        } catch (\Exception $e) {
            Log::error('Payment processing failed', [
                'method' => $paymentMethod,
                'amount' => $amount,
                'error' => $e->getMessage()
            ]);

            return [
                'status' => 'failed',
                'reference' => null,
                'message' => 'Payment processing failed: ' . $e->getMessage()
            ];
        }
    }

    public function updatePaymentStatus(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'payment_status' => 'required|in:completed,failed,refunded,pending',
                'payment_reference' => 'required|string',
            ]);

            $transaction = Transaction::findOrFail($id);

            DB::beginTransaction();

            $transaction->update([
                'payment_status' => $validated['payment_status'],
                'payment_reference' => $validated['payment_reference'],
                'payment_date' => now()
            ]);

            // If payment is completed, ensure seats are marked as unavailable
            if ($validated['payment_status'] === 'completed') {
                foreach ($transaction->passengers as $passenger) {
                    FlightSeat::where('id', $passenger->flight_seat_id)
                        ->update(['is_available' => false]);
                }
            }

            // If payment failed or refunded, make seats available again
            if (in_array($validated['payment_status'], ['failed', 'refunded'])) {
                foreach ($transaction->passengers as $passenger) {
                    FlightSeat::where('id', $passenger->flight_seat_id)
                        ->update(['is_available' => true]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Payment status updated successfully',
                'data' => $transaction
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Payment status update failed', [
                'transaction_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update payment status: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        return Transaction::with([
            'flight.airline',
            'flightClass',
            'passengers.flightSeat',
            'promoCode'
        ])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);
        $validated = $request->validate([
            'code' => 'sometimes|string',
            'flight_id' => 'sometimes|exists:flights,id',
            'flight_class_id' => 'sometimes|exists:flight_classes,id',
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'phone' => 'sometimes|string|max:20',
            'number_of_passengers' => 'sometimes|integer|min:1',
            'promo_code_id' => 'sometimes|nullable|exists:promo_codes,id',
            'payment_status' => 'sometimes|string',
            'subtotal' => 'sometimes|numeric|min:0',
            'grandtotal' => 'sometimes|numeric|min:0'
        ]);

        $transaction->update($validated);
        return $transaction;
    }

    public function destroy($id)
    {
        Transaction::findOrFail($id)->delete();
        return response()->noContent();
    }
}