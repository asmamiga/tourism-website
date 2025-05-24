<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BusinessBooking;
use App\Models\Business;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BusinessBookingController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            // Verify authentication
            if (!auth()->user()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $query = BusinessBooking::query();
            
            // Different queries based on user role
            if (auth()->user()->role === 'admin') {
                // Admins can see all bookings
                $query->with(['business', 'user']);
            } elseif (auth()->user()->role === 'business_owner') {
                // Business owners can only see bookings for their businesses
                $query->whereHas('business', function($q) {
                    $q->whereHas('businessOwner', function($q2) {
                        $q2->where('user_id', auth()->id());
                    });
                })->with(['business', 'user']);
            } else {
                // Regular users can only see their own bookings
                $query->where('user_id', auth()->id())->with(['business']);
            }
            
            // Filter by business if provided
            if ($request->has('business_id')) {
                $query->where('business_id', $request->business_id);
            }
            
            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            // Filter by date range if provided
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('booking_date', [$request->start_date, $request->end_date]);
            } else if ($request->has('start_date')) {
                $query->where('booking_date', '>=', $request->start_date);
            } else if ($request->has('end_date')) {
                $query->where('booking_date', '<=', $request->end_date);
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                $query->orderBy('created_at', 'desc');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 10);
            $bookings = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $bookings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve bookings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            // Users must be logged in to book
            if (!auth()->user()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $validator = Validator::make($request->all(), [
                'business_id' => 'required|exists:businesses,id',
                'booking_date' => 'required|date|after_or_equal:today',
                'booking_time' => 'required|string',
                'number_of_people' => 'required|integer|min:1',
                'special_requests' => 'nullable|string|max:500',
                'contact_phone' => 'required|string|max:20',
                'contact_email' => 'required|email',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Verify the business exists and is active
            $business = Business::findOrFail($request->business_id);
            if (!$business->is_approved || $business->status !== 'active') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'This business is not available for bookings'
                ], 422);
            }
            
            // Check if there's availability for the requested date and time
            // This is a simplified check; in a real system, you'd have more complex availability logic
            $existingBookingsCount = BusinessBooking::where('business_id', $request->business_id)
                ->where('booking_date', $request->booking_date)
                ->where('booking_time', $request->booking_time)
                ->where('status', '!=', 'cancelled')
                ->count();
            
            // Assuming a business can handle up to 10 bookings at the same time slot (simplistic approach)
            if ($existingBookingsCount >= 10) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No availability for the requested date and time'
                ], 422);
            }
            
            // Create booking data
            $bookingData = [
                'business_id' => $request->business_id,
                'user_id' => auth()->id(),
                'booking_date' => $request->booking_date,
                'booking_time' => $request->booking_time,
                'number_of_people' => $request->number_of_people,
                'special_requests' => $request->special_requests,
                'contact_phone' => $request->contact_phone,
                'contact_email' => $request->contact_email,
                'booking_reference' => 'BK-' . strtoupper(Str::random(8)),
                'status' => 'pending'
            ];
            
            // Create booking
            $booking = BusinessBooking::create($bookingData);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Booking created successfully and pending approval',
                'data' => $booking->load('business')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        try {
            $booking = BusinessBooking::with(['business', 'user'])->findOrFail($id);
            
            // Authorization check
            $authorized = false;
            
            // Admin can see all bookings
            if (auth()->user() && auth()->user()->role === 'admin') {
                $authorized = true;
            }
            // Business owner can see bookings for their businesses
            else if (auth()->user() && auth()->user()->role === 'business_owner') {
                $businessOwnerUserId = $booking->business->businessOwner->user_id ?? null;
                $authorized = $businessOwnerUserId === auth()->id();
            }
            // User can only see their own bookings
            else if (auth()->user() && $booking->user_id === auth()->id()) {
                $authorized = true;
            }
            
            if (!$authorized) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to view this booking'
                ], 403);
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $booking
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id)
    {
        try {
            $booking = BusinessBooking::findOrFail($id);
            
            // Authorization check - only business owners of this business or admins can update bookings
            if (auth()->user()->role === 'admin' || 
                (auth()->user()->role === 'business_owner' && 
                 $booking->business->businessOwner->user_id === auth()->id())) {
                
                $validator = Validator::make($request->all(), [
                    'status' => 'required|in:pending,confirmed,completed,cancelled,no-show',
                    'notes' => 'nullable|string|max:500'
                ]);
                
                if ($validator->fails()) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Validation failed',
                        'errors' => $validator->errors()
                    ], 422);
                }
                
                // Update booking status
                $booking->status = $request->status;
                
                // Add notes if provided
                if ($request->has('notes')) {
                    $booking->notes = $request->notes;
                }
                
                $booking->save();
                
                return response()->json([
                    'status' => 'success',
                    'message' => 'Booking status updated successfully',
                    'data' => $booking->fresh()->load(['business', 'user'])
                ]);
            } 
            // Users can only cancel their own bookings
            else if (auth()->user() && $booking->user_id === auth()->id()) {
                if ($request->status === 'cancelled') {
                    // Check if the booking is not already completed or too close to the booking date
                    if (in_array($booking->status, ['completed', 'no-show'])) {
                        return response()->json([
                            'status' => 'error',
                            'message' => 'Cannot cancel a completed or no-show booking'
                        ], 422);
                    }
                    
                    // Simple check: cannot cancel if less than 24 hours before booking
                    $bookingDateTime = \Carbon\Carbon::parse($booking->booking_date . ' ' . $booking->booking_time);
                    $now = \Carbon\Carbon::now();
                    
                    if ($now->diffInHours($bookingDateTime) < 24) {
                        return response()->json([
                            'status' => 'error',
                            'message' => 'Bookings must be cancelled at least 24 hours in advance'
                        ], 422);
                    }
                    
                    $booking->status = 'cancelled';
                    $booking->notes = ($booking->notes ? $booking->notes . "\n" : '') . 
                                     'Cancelled by user on ' . now()->toDateTimeString();
                    $booking->save();
                    
                    return response()->json([
                        'status' => 'success',
                        'message' => 'Booking cancelled successfully',
                        'data' => $booking->fresh()->load('business')
                    ]);
                } else {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Users can only cancel bookings, not change to other statuses'
                    ], 403);
                }
            }
            else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to update this booking'
                ], 403);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        try {
            // Only admins can delete bookings
            if (!auth()->user() || auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Only administrators can delete bookings.'
                ], 403);
            }
            
            $booking = BusinessBooking::findOrFail($id);
            $booking->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Booking deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get bookings for a specific business.
     *
     * @param  string  $businessId
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBookingsForBusiness(string $businessId, Request $request)
    {
        try {
            // Verify the business exists
            $business = Business::findOrFail($businessId);
            
            // Check authorization
            $authorized = false;
            
            // Admin can see all bookings
            if (auth()->user() && auth()->user()->role === 'admin') {
                $authorized = true;
            }
            // Business owner can see bookings for their businesses
            else if (auth()->user() && auth()->user()->role === 'business_owner') {
                $businessOwnerUserId = $business->businessOwner->user_id ?? null;
                $authorized = $businessOwnerUserId === auth()->id();
            }
            
            if (!$authorized) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to view bookings for this business'
                ], 403);
            }
            
            $query = BusinessBooking::where('business_id', $businessId)
                ->with(['user']);
            
            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            // Filter by date range if provided
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('booking_date', [$request->start_date, $request->end_date]);
            } else if ($request->has('start_date')) {
                $query->where('booking_date', '>=', $request->start_date);
            } else if ($request->has('end_date')) {
                $query->where('booking_date', '<=', $request->end_date);
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                $query->orderBy('booking_date', 'asc')->orderBy('booking_time', 'asc');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 10);
            $bookings = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'business' => $business->only(['id', 'name']),
                    'bookings' => $bookings
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve bookings for this business',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get user's bookings.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMyBookings(Request $request)
    {
        try {
            // Verify authentication
            if (!auth()->user()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $query = BusinessBooking::where('user_id', auth()->id())
                ->with(['business']);
            
            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            // Filter by date range if provided
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('booking_date', [$request->start_date, $request->end_date]);
            } else if ($request->has('start_date')) {
                $query->where('booking_date', '>=', $request->start_date);
            } else if ($request->has('end_date')) {
                $query->where('booking_date', '<=', $request->end_date);
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                $query->orderBy('booking_date', 'desc');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 10);
            $bookings = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $bookings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve your bookings',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
