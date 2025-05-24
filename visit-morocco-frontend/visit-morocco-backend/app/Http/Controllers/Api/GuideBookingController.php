<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\GuideBooking;
use App\Models\Guide;
use App\Models\GuideAvailability;
use App\Models\GuideService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Carbon\Carbon;

class GuideBookingController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param  \Illuminate\Http\Request  $request
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
            
            $query = GuideBooking::query();
            
            // Different queries based on user role
            if (auth()->user()->role === 'admin') {
                // Admins can see all bookings
                $query->with(['guide', 'guide.user', 'user', 'service']);
            } elseif (auth()->user()->role === 'guide') {
                // Guides can only see bookings for their services
                $guide = Guide::where('user_id', auth()->id())->first();
                
                if (!$guide) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'You do not have a guide profile'
                    ], 404);
                }
                
                $query->where('guide_id', $guide->id)
                      ->with(['user', 'service']);
            } else {
                // Regular users can only see their own bookings
                $query->where('user_id', auth()->id())
                      ->with(['guide', 'guide.user', 'service']);
            }
            
            // Filter by guide if provided
            if ($request->has('guide_id') && (auth()->user()->role === 'admin' || 
                (auth()->user()->role === 'guide' && Guide::where('user_id', auth()->id())->value('id') == $request->guide_id))) {
                $query->where('guide_id', $request->guide_id);
            }
            
            // Filter by service if provided
            if ($request->has('service_id')) {
                $query->where('service_id', $request->service_id);
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
                $query->orderBy('booking_date', 'desc')->orderBy('created_at', 'desc');
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
                'guide_id' => 'required|exists:guides,id',
                'service_id' => 'nullable|exists:guide_services,id',
                'availability_id' => 'nullable|exists:guide_availabilities,id',
                'booking_date' => 'required|date|after_or_equal:today',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after:start_time',
                'number_of_people' => 'required|integer|min:1',
                'special_requests' => 'nullable|string|max:500',
                'meeting_location' => 'required|string|max:255',
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
            
            // Verify the guide exists and is active
            $guide = Guide::findOrFail($request->guide_id);
            if (!$guide->is_approved || $guide->status !== 'active') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'This guide is not available for bookings'
                ], 422);
            }
            
            // If availability_id is provided, check it's valid and available
            if ($request->has('availability_id')) {
                $availability = GuideAvailability::find($request->availability_id);
                
                if (!$availability || $availability->guide_id != $guide->id || $availability->status !== 'available') {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'The selected availability is not valid or not available'
                    ], 422);
                }
                
                // Use availability date and times
                $bookingDate = $availability->date;
                $startTime = $availability->start_time;
                $endTime = $availability->end_time;
            } else {
                // Using custom date/time - check if guide is available for this time
                $bookingDate = $request->booking_date;
                $startTime = $request->start_time;
                $endTime = $request->end_time;
                
                // Check for existing availabilities that conflict
                $conflicting = GuideAvailability::where('guide_id', $guide->id)
                    ->where('date', $bookingDate)
                    ->where(function($query) use ($startTime, $endTime) {
                        $query->whereBetween('start_time', [$startTime, $endTime])
                              ->orWhereBetween('end_time', [$startTime, $endTime])
                              ->orWhere(function($q) use ($startTime, $endTime) {
                                  $q->where('start_time', '<=', $startTime)
                                    ->where('end_time', '>=', $endTime);
                              });
                    })
                    ->where('status', '!=', 'available')
                    ->exists();
                
                if ($conflicting) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'The guide is not available for the requested date and time'
                    ], 422);
                }
                
                // Check for existing bookings that conflict
                $conflictingBooking = GuideBooking::where('guide_id', $guide->id)
                    ->where('booking_date', $bookingDate)
                    ->where(function($query) use ($startTime, $endTime) {
                        $query->whereBetween('start_time', [$startTime, $endTime])
                              ->orWhereBetween('end_time', [$startTime, $endTime])
                              ->orWhere(function($q) use ($startTime, $endTime) {
                                  $q->where('start_time', '<=', $startTime)
                                    ->where('end_time', '>=', $endTime);
                              });
                    })
                    ->where('status', '!=', 'cancelled')
                    ->exists();
                
                if ($conflictingBooking) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'The guide already has a booking for the requested date and time'
                    ], 422);
                }
            }
            
            // If service_id is provided, check it's valid and belongs to the guide
            $serviceId = null;
            $finalPrice = $guide->hourly_rate * Carbon::parse($endTime)->diffInHours(Carbon::parse($startTime));
            
            if ($request->has('service_id') && $request->service_id) {
                $service = GuideService::find($request->service_id);
                
                if (!$service || $service->guide_id != $guide->id || !$service->is_active) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'The selected service is not valid or not available'
                    ], 422);
                }
                
                $serviceId = $service->id;
                $finalPrice = $service->price;
                
                // Adjust price based on participants if it exceeds the service's max
                if ($request->number_of_people > $service->max_participants) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'The number of participants exceeds the maximum allowed for this service',
                        'max_participants' => $service->max_participants
                    ], 422);
                }
            }
            
            // Create booking data
            $bookingData = [
                'user_id' => auth()->id(),
                'guide_id' => $guide->id,
                'service_id' => $serviceId,
                'booking_date' => $bookingDate,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'number_of_people' => $request->number_of_people,
                'price' => $finalPrice,
                'special_requests' => $request->special_requests,
                'meeting_location' => $request->meeting_location,
                'contact_phone' => $request->contact_phone,
                'contact_email' => $request->contact_email,
                'booking_reference' => 'GD-' . strtoupper(Str::random(8)),
                'status' => 'pending'
            ];
            
            // Create booking
            $booking = GuideBooking::create($bookingData);
            
            // If using an availability slot, update its status
            if ($request->has('availability_id') && $availability) {
                $availability->status = 'booked';
                $availability->save();
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'Booking created successfully and pending approval',
                'data' => $booking->load(['guide', 'guide.user', 'service'])
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
            $booking = GuideBooking::with(['guide', 'guide.user', 'service', 'user'])->findOrFail($id);
            
            // Authorization check
            $authorized = false;
            
            // Admin can see all bookings
            if (auth()->user() && auth()->user()->role === 'admin') {
                $authorized = true;
            }
            // Guide can see bookings for their services
            else if (auth()->user() && auth()->user()->role === 'guide') {
                $guide = Guide::where('user_id', auth()->id())->first();
                $authorized = $guide && $booking->guide_id === $guide->id;
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
            $booking = GuideBooking::findOrFail($id);
            
            // Authorization check - guides can update bookings for their services, users can update their own bookings
            $authorized = false;
            $isGuide = false;
            
            if (auth()->user()->role === 'admin') {
                $authorized = true;
            } else if (auth()->user()->role === 'guide') {
                $guide = Guide::where('user_id', auth()->id())->first();
                if ($guide && $booking->guide_id === $guide->id) {
                    $authorized = true;
                    $isGuide = true;
                }
            } else if ($booking->user_id === auth()->id()) {
                $authorized = true;
            }
            
            if (!$authorized) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to update this booking'
                ], 403);
            }
            
            // Different validation rules based on user role
            if ($isGuide || auth()->user()->role === 'admin') {
                $validator = Validator::make($request->all(), [
                    'status' => 'required|in:pending,confirmed,completed,cancelled,no-show',
                    'notes' => 'nullable|string|max:500'
                ]);
            } else {
                // Regular users can only cancel their booking
                $validator = Validator::make($request->all(), [
                    'status' => 'required|in:cancelled',
                    'notes' => 'nullable|string|max:500'
                ]);
            }
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            if (!$isGuide && !auth()->user()->role === 'admin' && $request->status === 'cancelled') {
                // Check if the booking is not already completed or too close to the booking date
                if (in_array($booking->status, ['completed', 'no-show'])) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Cannot cancel a completed or no-show booking'
                    ], 422);
                }
                
                // Cannot cancel if less than 24 hours before booking
                $bookingDateTime = Carbon::parse($booking->booking_date . ' ' . $booking->start_time);
                $now = Carbon::now();
                
                if ($now->diffInHours($bookingDateTime) < 24) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Bookings must be cancelled at least 24 hours in advance'
                    ], 422);
                }
            }
            
            // Update booking status
            $booking->status = $request->status;
            
            // Add notes if provided
            if ($request->has('notes')) {
                $booking->notes = $request->notes;
            }
            
            $booking->save();
            
            // If booking is cancelled, free up the availability
            if ($request->status === 'cancelled' && $booking->availability_id) {
                $availability = GuideAvailability::find($booking->availability_id);
                if ($availability) {
                    $availability->status = 'available';
                    $availability->save();
                }
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'Booking status updated successfully',
                'data' => $booking->fresh()->load(['guide', 'guide.user', 'service', 'user'])
            ]);
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
            
            $booking = GuideBooking::findOrFail($id);
            
            // If there's an associated availability, free it up
            if ($booking->availability_id) {
                $availability = GuideAvailability::find($booking->availability_id);
                if ($availability) {
                    $availability->status = 'available';
                    $availability->save();
                }
            }
            
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
     * Get bookings for a specific guide.
     *
     * @param  string  $guideId
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBookingsForGuide(string $guideId, Request $request)
    {
        try {
            // Verify the guide exists
            $guide = Guide::findOrFail($guideId);
            
            // Check authorization
            $authorized = false;
            
            // Admin can see all guide bookings
            if (auth()->user() && auth()->user()->role === 'admin') {
                $authorized = true;
            }
            // Guide can see their own bookings
            else if (auth()->user() && auth()->user()->role === 'guide') {
                $userGuide = Guide::where('user_id', auth()->id())->first();
                $authorized = $userGuide && $userGuide->id === $guide->id;
            }
            
            if (!$authorized) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to view bookings for this guide'
                ], 403);
            }
            
            $query = GuideBooking::where('guide_id', $guideId)
                ->with(['user', 'service']);
            
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
                $query->orderBy('booking_date', 'asc')->orderBy('start_time', 'asc');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 10);
            $bookings = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'guide' => $guide->only(['id', 'user_id']),
                    'bookings' => $bookings
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve bookings for this guide',
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
            
            $query = GuideBooking::where('user_id', auth()->id())
                ->with(['guide', 'guide.user', 'service']);
            
            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            // Filter by date (past/upcoming)
            if ($request->has('timeframe') && $request->timeframe === 'past') {
                $query->where('booking_date', '<', Carbon::today()->toDateString());
            } else if ($request->has('timeframe') && $request->timeframe === 'upcoming') {
                $query->where('booking_date', '>=', Carbon::today()->toDateString());
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
