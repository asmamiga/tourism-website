<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\GuideAvailability;
use App\Models\Guide;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class GuideAvailabilityController extends Controller
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
            // Must be authenticated to access guide availabilities
            if (!auth()->user()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $query = GuideAvailability::query();
            
            // Different queries based on user role
            if (auth()->user()->role === 'admin') {
                // Admins can see all availabilities
                $query->with(['guide', 'guide.user']);
            } elseif (auth()->user()->role === 'guide') {
                // Guides can only see their own availabilities
                $guide = Guide::where('user_id', auth()->id())->first();
                
                if (!$guide) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'You do not have a guide profile'
                    ], 404);
                }
                
                $query->where('guide_id', $guide->id);
            } else {
                // Tourists cannot directly access availabilities
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            // Filter by guide if provided and user is admin
            if ($request->has('guide_id') && auth()->user()->role === 'admin') {
                $query->where('guide_id', $request->guide_id);
            }
            
            // Filter by date range if provided
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->where(function($q) use ($request) {
                    $q->whereBetween('date', [$request->start_date, $request->end_date]);
                });
            } else if ($request->has('start_date')) {
                $query->where('date', '>=', $request->start_date);
            } else if ($request->has('end_date')) {
                $query->where('date', '<=', $request->end_date);
            } else {
                // Default to showing only future availabilities
                $query->where('date', '>=', Carbon::today()->toDateString());
            }
            
            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            // Sort by date
            $query->orderBy('date', 'asc')
                  ->orderBy('start_time', 'asc');
            
            $availabilities = $query->get();
            
            return response()->json([
                'status' => 'success',
                'data' => $availabilities
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve availabilities',
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
            // Only guides can create their availabilities
            if (!auth()->user() || auth()->user()->role !== 'guide') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Only guides can set their availability.'
                ], 403);
            }
            
            // Get the user's guide profile
            $guide = Guide::where('user_id', auth()->id())->first();
            
            if (!$guide) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You do not have a guide profile'
                ], 404);
            }
            
            // Check if the guide profile is approved
            if (!$guide->is_approved) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Your guide profile must be approved before setting availability'
                ], 422);
            }
            
            $validator = Validator::make($request->all(), [
                'date' => 'required|date|after_or_equal:today',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after:start_time',
                'status' => 'required|in:available,unavailable,booked',
                'notes' => 'nullable|string|max:500',
                'repeat_weekly' => 'nullable|boolean',
                'repeat_until' => 'nullable|required_if:repeat_weekly,true|date|after:date',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Check for overlapping availability
            $existingAvailability = GuideAvailability::where('guide_id', $guide->id)
                ->where('date', $request->date)
                ->where(function($query) use ($request) {
                    $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                          ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                          ->orWhere(function($q) use ($request) {
                              $q->where('start_time', '<=', $request->start_time)
                                ->where('end_time', '>=', $request->end_time);
                          });
                })
                ->first();
            
            if ($existingAvailability) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Overlapping availability exists for this time slot',
                    'existing_availability' => $existingAvailability
                ], 422);
            }
            
            // Handle repeat weekly if specified
            if ($request->boolean('repeat_weekly') && $request->has('repeat_until')) {
                $startDate = Carbon::parse($request->date);
                $endDate = Carbon::parse($request->repeat_until);
                $createdAvailabilities = [];
                
                // Create availabilities for each week
                for ($date = $startDate; $date->lte($endDate); $date = $date->copy()->addWeek()) {
                    $availabilityData = [
                        'guide_id' => $guide->id,
                        'date' => $date->toDateString(),
                        'start_time' => $request->start_time,
                        'end_time' => $request->end_time,
                        'status' => $request->status,
                        'notes' => $request->notes
                    ];
                    
                    $createdAvailabilities[] = GuideAvailability::create($availabilityData);
                }
                
                return response()->json([
                    'status' => 'success',
                    'message' => 'Recurring availabilities created successfully',
                    'data' => $createdAvailabilities
                ], 201);
            } else {
                // Create single availability
                $availabilityData = [
                    'guide_id' => $guide->id,
                    'date' => $request->date,
                    'start_time' => $request->start_time,
                    'end_time' => $request->end_time,
                    'status' => $request->status,
                    'notes' => $request->notes
                ];
                
                $availability = GuideAvailability::create($availabilityData);
                
                return response()->json([
                    'status' => 'success',
                    'message' => 'Availability created successfully',
                    'data' => $availability
                ], 201);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create availability',
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
            $availability = GuideAvailability::with(['guide', 'guide.user'])->findOrFail($id);
            
            // Authorization check
            if (!auth()->user()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            // Only the guide who owns this availability or admin can view it
            if (auth()->user()->role !== 'admin' && 
                ($availability->guide->user_id !== auth()->id())) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to view this availability'
                ], 403);
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $availability
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Availability not found',
                'error' => $e->getMessage()
            ], 404);
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
            $availability = GuideAvailability::findOrFail($id);
            
            // Authorization check
            if (!auth()->user()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            // Only the guide who owns this availability or admin can update it
            if (auth()->user()->role !== 'admin') {
                $guide = Guide::where('user_id', auth()->id())->first();
                
                if (!$guide || $availability->guide_id !== $guide->id) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Unauthorized to update this availability'
                    ], 403);
                }
            }
            
            // Can't update if it's already booked (unless admin)
            if ($availability->status === 'booked' && auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot update a time slot that is already booked'
                ], 422);
            }
            
            $validator = Validator::make($request->all(), [
                'date' => 'sometimes|required|date|after_or_equal:today',
                'start_time' => 'sometimes|required|date_format:H:i',
                'end_time' => 'sometimes|required|date_format:H:i|after:start_time',
                'status' => 'sometimes|required|in:available,unavailable,booked',
                'notes' => 'nullable|string|max:500',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // If changing time or date, check for overlaps
            if (($request->has('date') && $request->date !== $availability->date) || 
                ($request->has('start_time') && $request->start_time !== $availability->start_time) || 
                ($request->has('end_time') && $request->end_time !== $availability->end_time)) {
                
                $startTime = $request->start_time ?? $availability->start_time;
                $endTime = $request->end_time ?? $availability->end_time;
                $date = $request->date ?? $availability->date;
                
                $existingAvailability = GuideAvailability::where('guide_id', $availability->guide_id)
                    ->where('id', '!=', $id) // Exclude current availability
                    ->where('date', $date)
                    ->where(function($query) use ($startTime, $endTime) {
                        $query->whereBetween('start_time', [$startTime, $endTime])
                              ->orWhereBetween('end_time', [$startTime, $endTime])
                              ->orWhere(function($q) use ($startTime, $endTime) {
                                  $q->where('start_time', '<=', $startTime)
                                    ->where('end_time', '>=', $endTime);
                              });
                    })
                    ->first();
                
                if ($existingAvailability) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Overlapping availability exists for this time slot',
                        'existing_availability' => $existingAvailability
                    ], 422);
                }
            }
            
            // Update availability
            if ($request->has('date')) $availability->date = $request->date;
            if ($request->has('start_time')) $availability->start_time = $request->start_time;
            if ($request->has('end_time')) $availability->end_time = $request->end_time;
            if ($request->has('status')) $availability->status = $request->status;
            if ($request->has('notes')) $availability->notes = $request->notes;
            
            $availability->save();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Availability updated successfully',
                'data' => $availability->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update availability',
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
            $availability = GuideAvailability::findOrFail($id);
            
            // Authorization check
            if (!auth()->user()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            // Only the guide who owns this availability or admin can delete it
            if (auth()->user()->role !== 'admin') {
                $guide = Guide::where('user_id', auth()->id())->first();
                
                if (!$guide || $availability->guide_id !== $guide->id) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Unauthorized to delete this availability'
                    ], 403);
                }
            }
            
            // Can't delete if it's already booked (unless admin)
            if ($availability->status === 'booked' && auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot delete a time slot that is already booked'
                ], 422);
            }
            
            $availability->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Availability deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete availability',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get availabilities for a specific guide.
     *
     * @param  string  $guideId
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAvailabilitiesForGuide(string $guideId, Request $request)
    {
        try {
            // Verify the guide exists
            $guide = Guide::findOrFail($guideId);
            
            // Only approved guides should have their availabilities visible
            if (!$guide->is_approved) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Guide profile is not active'
                ], 422);
            }
            
            $query = GuideAvailability::where('guide_id', $guideId)
                ->where('status', 'available');
            
            // Filter by date range if provided
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('date', [$request->start_date, $request->end_date]);
            } else if ($request->has('start_date')) {
                $query->where('date', '>=', $request->start_date);
            } else if ($request->has('end_date')) {
                $query->where('date', '<=', $request->end_date);
            } else {
                // Default to showing only future availabilities
                $query->where('date', '>=', Carbon::today()->toDateString());
            }
            
            // Sort by date and time
            $query->orderBy('date', 'asc')
                  ->orderBy('start_time', 'asc');
            
            $availabilities = $query->get()->groupBy('date')
                ->map(function ($dateGroup) {
                    return $dateGroup->map(function ($availability) {
                        return [
                            'id' => $availability->id,
                            'start_time' => $availability->start_time,
                            'end_time' => $availability->end_time,
                            'status' => $availability->status,
                        ];
                    });
                });
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'guide' => $guide->only(['id', 'user_id', 'bio', 'hourly_rate']),
                    'availabilities' => $availabilities
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve availabilities for this guide',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get the authenticated guide's availabilities.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMyAvailabilities(Request $request)
    {
        try {
            // Verify authentication and role
            if (!auth()->user() || auth()->user()->role !== 'guide') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Only guide users can access this endpoint.'
                ], 403);
            }
            
            // Get the guide profile
            $guide = Guide::where('user_id', auth()->id())->first();
            
            if (!$guide) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You do not have a guide profile yet'
                ], 404);
            }
            
            $query = GuideAvailability::where('guide_id', $guide->id);
            
            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            // Filter by date range if provided
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('date', [$request->start_date, $request->end_date]);
            } else if ($request->has('start_date')) {
                $query->where('date', '>=', $request->start_date);
            } else if ($request->has('end_date')) {
                $query->where('date', '<=', $request->end_date);
            } else {
                // Default to showing only future availabilities
                $query->where('date', '>=', Carbon::today()->toDateString());
            }
            
            // Sort by date and time
            $query->orderBy('date', 'asc')
                  ->orderBy('start_time', 'asc');
            
            $availabilities = $query->get();
            
            return response()->json([
                'status' => 'success',
                'data' => $availabilities
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve your availabilities',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Batch create availabilities for a specific date range.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function batchCreate(Request $request)
    {
        try {
            // Only guides can create their availabilities
            if (!auth()->user() || auth()->user()->role !== 'guide') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Only guides can set their availability.'
                ], 403);
            }
            
            // Get the user's guide profile
            $guide = Guide::where('user_id', auth()->id())->first();
            
            if (!$guide) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You do not have a guide profile'
                ], 404);
            }
            
            // Check if the guide profile is approved
            if (!$guide->is_approved) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Your guide profile must be approved before setting availability'
                ], 422);
            }
            
            $validator = Validator::make($request->all(), [
                'start_date' => 'required|date|after_or_equal:today',
                'end_date' => 'required|date|after_or_equal:start_date',
                'weekdays' => 'required|array|min:1',
                'weekdays.*' => 'integer|between:0,6', // 0 = Sunday, 6 = Saturday
                'time_slots' => 'required|array|min:1',
                'time_slots.*.start_time' => 'required|date_format:H:i',
                'time_slots.*.end_time' => 'required|date_format:H:i|after:time_slots.*.start_time',
                'status' => 'required|in:available,unavailable',
                'notes' => 'nullable|string|max:500',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $startDate = Carbon::parse($request->start_date);
            $endDate = Carbon::parse($request->end_date);
            $weekdays = $request->weekdays;
            $timeSlots = $request->time_slots;
            $status = $request->status;
            $notes = $request->notes;
            
            $createdAvailabilities = [];
            
            // Loop through each day in the date range
            for ($date = $startDate; $date->lte($endDate); $date = $date->copy()->addDay()) {
                // Check if this day of the week is selected
                if (!in_array($date->dayOfWeek, $weekdays)) {
                    continue;
                }
                
                // Loop through each time slot
                foreach ($timeSlots as $timeSlot) {
                    // Check for overlapping availability
                    $existingAvailability = GuideAvailability::where('guide_id', $guide->id)
                        ->where('date', $date->toDateString())
                        ->where(function($query) use ($timeSlot) {
                            $query->whereBetween('start_time', [$timeSlot['start_time'], $timeSlot['end_time']])
                                  ->orWhereBetween('end_time', [$timeSlot['start_time'], $timeSlot['end_time']])
                                  ->orWhere(function($q) use ($timeSlot) {
                                      $q->where('start_time', '<=', $timeSlot['start_time'])
                                        ->where('end_time', '>=', $timeSlot['end_time']);
                                  });
                        })
                        ->first();
                    
                    if ($existingAvailability) {
                        // Skip this time slot if there's an overlap
                        continue;
                    }
                    
                    // Create availability
                    $availabilityData = [
                        'guide_id' => $guide->id,
                        'date' => $date->toDateString(),
                        'start_time' => $timeSlot['start_time'],
                        'end_time' => $timeSlot['end_time'],
                        'status' => $status,
                        'notes' => $notes
                    ];
                    
                    $createdAvailabilities[] = GuideAvailability::create($availabilityData);
                }
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'Availabilities batch created successfully',
                'data' => [
                    'created_count' => count($createdAvailabilities),
                    'availabilities' => $createdAvailabilities
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to batch create availabilities',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
