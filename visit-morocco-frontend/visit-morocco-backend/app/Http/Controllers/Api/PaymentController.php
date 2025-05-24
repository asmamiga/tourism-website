<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\Booking;
use App\Models\GuideBooking;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Display a listing of payments for the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            // User must be authenticated
            if (!auth()->check()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $query = Payment::where('user_id', auth()->id());
            
            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            // Filter by payment type if provided
            if ($request->has('payment_type')) {
                $query->where('payment_type', $request->payment_type);
            }
            
            // Filter by date range
            if ($request->has('date_from') && $request->has('date_to')) {
                $query->whereBetween('created_at', [$request->date_from, $request->date_to]);
            }
            
            // For admins, allow viewing all payments with optional user filter
            if (auth()->user()->role === 'admin') {
                if ($request->has('user_id')) {
                    $query->where('user_id', $request->user_id);
                } else {
                    // If admin and no user_id filter, show all payments
                    $query = Payment::query();
                }
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                $query->orderBy('created_at', 'desc');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 15);
            $payments = $query->paginate($perPage);
            
            // Load relationships
            $payments->load(['user']);
            
            return response()->json([
                'status' => 'success',
                'data' => $payments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve payments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created payment for a booking.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function processBookingPayment(Request $request)
    {
        try {
            // User must be authenticated
            if (!auth()->check()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $validator = Validator::make($request->all(), [
                'booking_id' => 'required|integer',
                'booking_type' => 'required|in:business,guide',
                'amount' => 'required|numeric|min:0',
                'payment_method' => 'required|in:credit_card,paypal,bank_transfer',
                'payment_details' => 'required|array',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Verify booking exists and belongs to user
            $booking = null;
            if ($request->booking_type === 'business') {
                $booking = Booking::where('id', $request->booking_id)
                                 ->where('user_id', auth()->id())
                                 ->first();
            } else {
                $booking = GuideBooking::where('id', $request->booking_id)
                                      ->where('user_id', auth()->id())
                                      ->first();
            }
            
            if (!$booking) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Booking not found or unauthorized'
                ], 404);
            }
            
            // Verify the booking hasn't been paid already
            if (Payment::where('booking_id', $request->booking_id)
                      ->where('booking_type', $request->booking_type)
                      ->where('status', 'completed')
                      ->exists()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'This booking has already been paid'
                ], 422);
            }
            
            // Process payment (in a real app, this would integrate with a payment gateway)
            // For demonstration, we're simulating a successful payment
            $paymentResult = $this->simulatePaymentGateway($request->payment_method, $request->amount, $request->payment_details);
            
            if (!$paymentResult['success']) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Payment processing failed',
                    'error' => $paymentResult['message']
                ], 422);
            }
            
            // Create payment record
            $payment = Payment::create([
                'transaction_id' => $paymentResult['transaction_id'],
                'user_id' => auth()->id(),
                'booking_id' => $request->booking_id,
                'booking_type' => $request->booking_type,
                'amount' => $request->amount,
                'currency' => 'MAD', // Moroccan Dirham
                'payment_method' => $request->payment_method,
                'status' => $paymentResult['status'],
                'payment_details' => json_encode($request->payment_details),
                'created_at' => now()
            ]);
            
            // Update booking status
            if ($request->booking_type === 'business') {
                $booking->payment_status = 'paid';
                $booking->save();
            } else {
                $booking->payment_status = 'paid';
                $booking->save();
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'Payment processed successfully',
                'data' => [
                    'payment' => $payment,
                    'transaction_id' => $paymentResult['transaction_id']
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to process payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified payment.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        try {
            $payment = Payment::findOrFail($id);
            
            // Users can only view their own payments, admins can view all
            if (auth()->user()->role !== 'admin' && $payment->user_id !== auth()->id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to view this payment'
                ], 403);
            }
            
            // Load relationships
            $payment->load(['user']);
            
            // Load booking details based on booking type
            if ($payment->booking_type === 'business') {
                $payment->load(['businessBooking']);
            } else {
                $payment->load(['guideBooking']);
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $payment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the payment status (admin only).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, string $id)
    {
        try {
            // Only admin can update payment status
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,completed,failed,refunded',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $payment = Payment::findOrFail($id);
            $payment->status = $request->status;
            $payment->updated_at = now();
            $payment->save();
            
            // If payment is marked as refunded, update booking status
            if ($request->status === 'refunded') {
                if ($payment->booking_type === 'business') {
                    $booking = Booking::find($payment->booking_id);
                    if ($booking) {
                        $booking->payment_status = 'refunded';
                        $booking->save();
                    }
                } else {
                    $booking = GuideBooking::find($payment->booking_id);
                    if ($booking) {
                        $booking->payment_status = 'refunded';
                        $booking->save();
                    }
                }
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'Payment status updated successfully',
                'data' => $payment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update payment status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display payment statistics (admin only).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStatistics(Request $request)
    {
        try {
            // Only admin can view payment statistics
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            // Date range filter
            $startDate = $request->input('start_date', now()->subMonth());
            $endDate = $request->input('end_date', now());
            
            // Get total payments by status
            $totalByStatus = Payment::whereBetween('created_at', [$startDate, $endDate])
                                  ->select('status', \DB::raw('count(*) as count'), \DB::raw('sum(amount) as total_amount'))
                                  ->groupBy('status')
                                  ->get();
            
            // Get total payments by booking type
            $totalByBookingType = Payment::whereBetween('created_at', [$startDate, $endDate])
                                       ->select('booking_type', \DB::raw('count(*) as count'), \DB::raw('sum(amount) as total_amount'))
                                       ->groupBy('booking_type')
                                       ->get();
            
            // Get total payments by payment method
            $totalByPaymentMethod = Payment::whereBetween('created_at', [$startDate, $endDate])
                                         ->select('payment_method', \DB::raw('count(*) as count'), \DB::raw('sum(amount) as total_amount'))
                                         ->groupBy('payment_method')
                                         ->get();
            
            // Get monthly totals
            $monthlyTotals = Payment::whereBetween('created_at', [$startDate, $endDate])
                                  ->where('status', 'completed')
                                  ->select(
                                      \DB::raw('YEAR(created_at) as year'),
                                      \DB::raw('MONTH(created_at) as month'),
                                      \DB::raw('sum(amount) as total_amount')
                                  )
                                  ->groupBy('year', 'month')
                                  ->orderBy('year')
                                  ->orderBy('month')
                                  ->get();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_by_status' => $totalByStatus,
                    'total_by_booking_type' => $totalByBookingType,
                    'total_by_payment_method' => $totalByPaymentMethod,
                    'monthly_totals' => $monthlyTotals,
                    'date_range' => [
                        'start_date' => $startDate,
                        'end_date' => $endDate
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve payment statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Initiate a refund for a payment (admin only).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function initiateRefund(Request $request, string $id)
    {
        try {
            // Only admin can initiate refunds
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'refund_reason' => 'required|string|max:255',
                'refund_amount' => 'nullable|numeric|min:0',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $payment = Payment::findOrFail($id);
            
            // Check if payment is eligible for refund
            if ($payment->status !== 'completed') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Only completed payments can be refunded'
                ], 422);
            }
            
            // In a real app, this would integrate with a payment gateway
            // For demonstration, we're simulating a successful refund
            $refundAmount = $request->has('refund_amount') ? $request->refund_amount : $payment->amount;
            
            if ($refundAmount > $payment->amount) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Refund amount cannot exceed original payment amount'
                ], 422);
            }
            
            // Process refund (simulation)
            $refundResult = $this->simulateRefundProcess($payment->transaction_id, $refundAmount);
            
            if (!$refundResult['success']) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Refund processing failed',
                    'error' => $refundResult['message']
                ], 422);
            }
            
            // Update payment status
            $payment->status = 'refunded';
            $payment->refund_amount = $refundAmount;
            $payment->refund_reason = $request->refund_reason;
            $payment->refund_date = now();
            $payment->save();
            
            // Update booking status
            if ($payment->booking_type === 'business') {
                $booking = Booking::find($payment->booking_id);
                if ($booking) {
                    $booking->payment_status = 'refunded';
                    $booking->save();
                }
            } else {
                $booking = GuideBooking::find($payment->booking_id);
                if ($booking) {
                    $booking->payment_status = 'refunded';
                    $booking->save();
                }
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'Refund processed successfully',
                'data' => [
                    'payment' => $payment,
                    'refund_transaction_id' => $refundResult['refund_id']
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to process refund',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get payments for a specific booking.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $bookingType
     * @param  string  $bookingId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBookingPayments(Request $request, string $bookingType, string $bookingId)
    {
        try {
            // Verify booking exists and user has access
            $hasAccess = false;
            
            if ($bookingType === 'business') {
                $booking = Booking::find($bookingId);
                if ($booking) {
                    // Access for booking owner or admin
                    $hasAccess = auth()->id() === $booking->user_id || auth()->user()->role === 'admin';
                }
            } else if ($bookingType === 'guide') {
                $booking = GuideBooking::find($bookingId);
                if ($booking) {
                    // Access for booking owner, guide, or admin
                    $hasAccess = auth()->id() === $booking->user_id || 
                                auth()->id() === $booking->guide_id || 
                                auth()->user()->role === 'admin';
                }
            }
            
            if (!$hasAccess) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Booking not found or unauthorized'
                ], 403);
            }
            
            $payments = Payment::where('booking_id', $bookingId)
                             ->where('booking_type', $bookingType)
                             ->orderBy('created_at', 'desc')
                             ->get();
            
            return response()->json([
                'status' => 'success',
                'data' => $payments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve booking payments',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Helper function to simulate payment gateway processing.
     * In a real application, this would integrate with an actual payment provider.
     *
     * @param  string  $paymentMethod
     * @param  float  $amount
     * @param  array  $paymentDetails
     * @return array
     */
    private function simulatePaymentGateway($paymentMethod, $amount, $paymentDetails)
    {
        // Simulate successful payment
        return [
            'success' => true,
            'transaction_id' => 'TXN_' . Str::random(16),
            'status' => 'completed',
            'message' => 'Payment processed successfully'
        ];
        
        // To simulate failure, uncomment the following:
        /*
        return [
            'success' => false,
            'transaction_id' => null,
            'status' => 'failed',
            'message' => 'Payment processing failed: Insufficient funds'
        ];
        */
    }
    
    /**
     * Helper function to simulate refund processing.
     * In a real application, this would integrate with an actual payment provider.
     *
     * @param  string  $transactionId
     * @param  float  $amount
     * @return array
     */
    private function simulateRefundProcess($transactionId, $amount)
    {
        // Simulate successful refund
        return [
            'success' => true,
            'refund_id' => 'REF_' . Str::random(16),
            'message' => 'Refund processed successfully'
        ];
        
        // To simulate failure, uncomment the following:
        /*
        return [
            'success' => false,
            'refund_id' => null,
            'message' => 'Refund processing failed: Transaction too old'
        ];
        */
    }
}
