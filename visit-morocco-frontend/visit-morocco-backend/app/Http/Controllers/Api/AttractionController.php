<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attraction;
use App\Models\AttractionPhoto;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AttractionController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = Attraction::with(['city', 'photos']);
            
            // Filter by city if provided
            if ($request->has('city_id')) {
                $query->where('city_id', $request->city_id);
            }
            
            // Filter by name if provided
            if ($request->has('name')) {
                $query->where('name', 'like', '%' . $request->name . '%');
            }
            
            // Filter by category if provided
            if ($request->has('category')) {
                $query->where('category', $request->category);
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'asc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                $query->orderBy('name', 'asc');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 10);
            $attractions = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $attractions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve attractions',
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
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'address' => 'required|string',
                'city_id' => 'required|exists:cities,id',
                'category' => 'required|string',
                'opening_hours' => 'nullable|string',
                'admission_fee' => 'nullable|numeric',
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric',
                'website' => 'nullable|url',
                'photos' => 'nullable|array',
                'photos.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Create attraction
            $attraction = Attraction::create([
                'name' => $request->name,
                'description' => $request->description,
                'address' => $request->address,
                'city_id' => $request->city_id,
                'category' => $request->category,
                'opening_hours' => $request->opening_hours,
                'admission_fee' => $request->admission_fee,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'website' => $request->website,
            ]);
            
            // Handle photos if provided
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $photo) {
                    $filename = Str::uuid() . '.' . $photo->getClientOriginalExtension();
                    $path = $photo->storeAs('public/attractions', $filename);
                    
                    AttractionPhoto::create([
                        'attraction_id' => $attraction->id,
                        'photo_path' => Storage::url($path),
                        'caption' => $request->input('caption', $attraction->name),
                        'is_featured' => false,
                    ]);
                }
                
                // Set the first photo as featured
                $attraction->photos()->first()->update(['is_featured' => true]);
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'Attraction created successfully',
                'data' => $attraction->load(['city', 'photos'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create attraction',
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
            $attraction = Attraction::with(['city', 'photos'])->findOrFail($id);
            
            return response()->json([
                'status' => 'success',
                'data' => $attraction
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Attraction not found',
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
            $attraction = Attraction::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'address' => 'sometimes|required|string',
                'city_id' => 'sometimes|required|exists:cities,id',
                'category' => 'sometimes|required|string',
                'opening_hours' => 'nullable|string',
                'admission_fee' => 'nullable|numeric',
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric',
                'website' => 'nullable|url',
                'photos' => 'nullable|array',
                'photos.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Update attraction fields
            $attraction->update($request->only([
                'name', 'description', 'address', 'city_id', 'category',
                'opening_hours', 'admission_fee', 'latitude', 'longitude', 'website'
            ]));
            
            // Handle photos if provided
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $photo) {
                    $filename = Str::uuid() . '.' . $photo->getClientOriginalExtension();
                    $path = $photo->storeAs('public/attractions', $filename);
                    
                    AttractionPhoto::create([
                        'attraction_id' => $attraction->id,
                        'photo_path' => Storage::url($path),
                        'caption' => $request->input('caption', $attraction->name),
                        'is_featured' => false,
                    ]);
                }
            }
            
            // Handle photo deletion if specified
            if ($request->has('delete_photos')) {
                $photoIds = $request->input('delete_photos');
                $photosToDelete = AttractionPhoto::where('attraction_id', $attraction->id)
                    ->whereIn('id', $photoIds)
                    ->get();
                
                foreach ($photosToDelete as $photo) {
                    // Extract path from URL and remove file
                    $path = str_replace('/storage', 'public', $photo->photo_path);
                    Storage::delete($path);
                    $photo->delete();
                }
                
                // If featured photo was deleted, set another one as featured
                if (!$attraction->photos()->where('is_featured', true)->exists()) {
                    $firstPhoto = $attraction->photos()->first();
                    if ($firstPhoto) {
                        $firstPhoto->update(['is_featured' => true]);
                    }
                }
            }
            
            // Set a specific photo as featured if specified
            if ($request->has('featured_photo_id')) {
                // Reset all photos to non-featured
                $attraction->photos()->update(['is_featured' => false]);
                
                // Set the specified photo as featured
                $attraction->photos()->where('id', $request->featured_photo_id)->update(['is_featured' => true]);
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'Attraction updated successfully',
                'data' => $attraction->fresh()->load(['city', 'photos'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update attraction',
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
            $attraction = Attraction::findOrFail($id);
            
            // Delete all associated photos from storage
            foreach ($attraction->photos as $photo) {
                // Extract path from URL and remove file
                $path = str_replace('/storage', 'public', $photo->photo_path);
                Storage::delete($path);
            }
            
            // Delete the attraction (will cascade delete photos due to relationship)
            $attraction->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Attraction deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete attraction',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get attractions by city.
     *
     * @param  string  $cityId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAttractionsByCity(string $cityId)
    {
        try {
            $attractions = Attraction::with(['photos'])
                ->where('city_id', $cityId)
                ->get();
            
            return response()->json([
                'status' => 'success',
                'data' => $attractions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve attractions for this city',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get attractions by category.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAttractionsByCategory(Request $request)
    {
        try {
            $query = Attraction::with(['city', 'photos'])
                ->where('category', $request->category);
            
            // Filter by city if provided
            if ($request->has('city_id')) {
                $query->where('city_id', $request->city_id);
            }
            
            $attractions = $query->get();
            
            return response()->json([
                'status' => 'success',
                'data' => $attractions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve attractions for this category',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
