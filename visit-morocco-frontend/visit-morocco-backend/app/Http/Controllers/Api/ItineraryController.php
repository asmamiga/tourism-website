<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Itinerary;
use App\Models\ItineraryDay;
use App\Models\ItineraryPlace;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ItineraryController extends Controller
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
            $query = Itinerary::query();
            
            // Only show public itineraries or owned by the user
            if (auth()->check()) {
                $query->where(function($q) {
                    $q->where('is_public', true)
                      ->orWhere('user_id', auth()->id());
                });
            } else {
                $query->where('is_public', true);
            }
            
            // With relationships
            $query->with(['user', 'days', 'days.places']);
            
            // Filter by user if provided
            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
                
                // If it's not the current user, only show public
                if (!auth()->check() || auth()->id() != $request->user_id) {
                    $query->where('is_public', true);
                }
            }
            
            // Filter by name if provided
            if ($request->has('search')) {
                $query->where('title', 'like', '%' . $request->search . '%');
            }
            
            // Filter by duration if provided
            if ($request->has('min_days')) {
                $query->where('duration_days', '>=', $request->min_days);
            }
            if ($request->has('max_days')) {
                $query->where('duration_days', '<=', $request->max_days);
            }
            
            // Filter by region if provided
            if ($request->has('region_id')) {
                $query->where('region_id', $request->region_id);
            }
            
            // Filter by city if provided
            if ($request->has('city_id')) {
                $query->whereHas('days.places', function($q) use ($request) {
                    $q->where('city_id', $request->city_id);
                });
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
            $itineraries = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $itineraries
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve itineraries',
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
            // User must be logged in
            if (!auth()->check()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'cover_image' => 'nullable|image|max:2048',
                'region_id' => 'nullable|exists:regions,id',
                'is_public' => 'boolean',
                'days' => 'required|array|min:1',
                'days.*.day_number' => 'required|integer|min:1',
                'days.*.title' => 'required|string|max:255',
                'days.*.description' => 'nullable|string',
                'days.*.places' => 'required|array|min:1',
                'days.*.places.*.place_id' => 'required|exists:places,id',
                'days.*.places.*.description' => 'nullable|string',
                'days.*.places.*.duration_minutes' => 'nullable|integer|min:0',
                'days.*.places.*.order' => 'required|integer|min:1',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Calculate duration based on days
            $durationDays = count($request->days);
            
            $itineraryData = [
                'title' => $request->title,
                'description' => $request->description,
                'user_id' => auth()->id(),
                'region_id' => $request->region_id,
                'duration_days' => $durationDays,
                'is_public' => $request->input('is_public', false),
            ];
            
            // Handle cover image upload
            if ($request->hasFile('cover_image')) {
                $path = $request->file('cover_image')->store('itinerary-covers', 'public');
                $itineraryData['cover_image'] = $path;
            }
            
            // Create itinerary
            $itinerary = Itinerary::create($itineraryData);
            
            // Create days and places
            foreach ($request->days as $dayData) {
                $day = ItineraryDay::create([
                    'itinerary_id' => $itinerary->id,
                    'day_number' => $dayData['day_number'],
                    'title' => $dayData['title'],
                    'description' => $dayData['description'] ?? null,
                ]);
                
                foreach ($dayData['places'] as $placeData) {
                    ItineraryPlace::create([
                        'itinerary_day_id' => $day->id,
                        'place_id' => $placeData['place_id'],
                        'description' => $placeData['description'] ?? null,
                        'duration_minutes' => $placeData['duration_minutes'] ?? 60,
                        'order' => $placeData['order'],
                    ]);
                }
            }
            
            // Reload with relationships
            $itinerary = Itinerary::with(['user', 'days', 'days.places'])->find($itinerary->id);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Itinerary created successfully',
                'data' => $itinerary
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create itinerary',
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
            $itinerary = Itinerary::with(['user', 'days', 'days.places', 'days.places.place'])
                ->findOrFail($id);
            
            // Check if itinerary is public or owned by the user
            if (!$itinerary->is_public && 
                (!auth()->check() || auth()->id() != $itinerary->user_id)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to view this itinerary'
                ], 403);
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $itinerary
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Itinerary not found',
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
            $itinerary = Itinerary::findOrFail($id);
            
            // Check if user is authorized to update this itinerary
            if (!auth()->check() || 
                (auth()->id() != $itinerary->user_id && auth()->user()->role !== 'admin')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to update this itinerary'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'cover_image' => 'nullable|image|max:2048',
                'region_id' => 'nullable|exists:regions,id',
                'is_public' => 'boolean',
                'days' => 'sometimes|required|array|min:1',
                'days.*.id' => 'sometimes|exists:itinerary_days,id',
                'days.*.day_number' => 'required|integer|min:1',
                'days.*.title' => 'required|string|max:255',
                'days.*.description' => 'nullable|string',
                'days.*.places' => 'required|array|min:1',
                'days.*.places.*.id' => 'sometimes|exists:itinerary_places,id',
                'days.*.places.*.place_id' => 'required|exists:places,id',
                'days.*.places.*.description' => 'nullable|string',
                'days.*.places.*.duration_minutes' => 'nullable|integer|min:0',
                'days.*.places.*.order' => 'required|integer|min:1',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $updateData = $request->only(['title', 'description', 'region_id', 'is_public']);
            
            // Calculate duration if days are provided
            if ($request->has('days')) {
                $updateData['duration_days'] = count($request->days);
            }
            
            // Handle cover image update
            if ($request->hasFile('cover_image')) {
                // Delete old cover image if it exists
                if ($itinerary->cover_image) {
                    Storage::disk('public')->delete($itinerary->cover_image);
                }
                
                $path = $request->file('cover_image')->store('itinerary-covers', 'public');
                $updateData['cover_image'] = $path;
            }
            
            // Update itinerary
            $itinerary->update($updateData);
            
            // Update days and places if provided
            if ($request->has('days')) {
                // Get existing day IDs
                $existingDayIds = $itinerary->days->pluck('id')->toArray();
                $updatedDayIds = [];
                
                foreach ($request->days as $dayData) {
                    // Update or create day
                    if (isset($dayData['id']) && in_array($dayData['id'], $existingDayIds)) {
                        // Update existing day
                        $day = ItineraryDay::find($dayData['id']);
                        $day->update([
                            'day_number' => $dayData['day_number'],
                            'title' => $dayData['title'],
                            'description' => $dayData['description'] ?? null,
                        ]);
                        $updatedDayIds[] = $day->id;
                    } else {
                        // Create new day
                        $day = ItineraryDay::create([
                            'itinerary_id' => $itinerary->id,
                            'day_number' => $dayData['day_number'],
                            'title' => $dayData['title'],
                            'description' => $dayData['description'] ?? null,
                        ]);
                        $updatedDayIds[] = $day->id;
                    }
                    
                    // Get existing place IDs for this day
                    $existingPlaceIds = $day->places->pluck('id')->toArray();
                    $updatedPlaceIds = [];
                    
                    foreach ($dayData['places'] as $placeData) {
                        // Update or create place
                        if (isset($placeData['id']) && in_array($placeData['id'], $existingPlaceIds)) {
                            // Update existing place
                            $place = ItineraryPlace::find($placeData['id']);
                            $place->update([
                                'place_id' => $placeData['place_id'],
                                'description' => $placeData['description'] ?? null,
                                'duration_minutes' => $placeData['duration_minutes'] ?? 60,
                                'order' => $placeData['order'],
                            ]);
                            $updatedPlaceIds[] = $place->id;
                        } else {
                            // Create new place
                            $place = ItineraryPlace::create([
                                'itinerary_day_id' => $day->id,
                                'place_id' => $placeData['place_id'],
                                'description' => $placeData['description'] ?? null,
                                'duration_minutes' => $placeData['duration_minutes'] ?? 60,
                                'order' => $placeData['order'],
                            ]);
                            $updatedPlaceIds[] = $place->id;
                        }
                    }
                    
                    // Delete places that were not updated or created
                    ItineraryPlace::where('itinerary_day_id', $day->id)
                        ->whereNotIn('id', $updatedPlaceIds)
                        ->delete();
                }
                
                // Delete days that were not updated or created
                ItineraryDay::where('itinerary_id', $itinerary->id)
                    ->whereNotIn('id', $updatedDayIds)
                    ->delete();
            }
            
            // Reload with relationships
            $itinerary = Itinerary::with(['user', 'days', 'days.places'])->find($itinerary->id);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Itinerary updated successfully',
                'data' => $itinerary
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update itinerary',
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
            $itinerary = Itinerary::findOrFail($id);
            
            // Check if user is authorized to delete this itinerary
            if (!auth()->check() || 
                (auth()->id() != $itinerary->user_id && auth()->user()->role !== 'admin')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to delete this itinerary'
                ], 403);
            }
            
            // Delete cover image if it exists
            if ($itinerary->cover_image) {
                Storage::disk('public')->delete($itinerary->cover_image);
            }
            
            // Delete the itinerary (days and places will be cascade deleted)
            $itinerary->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Itinerary deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete itinerary',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
