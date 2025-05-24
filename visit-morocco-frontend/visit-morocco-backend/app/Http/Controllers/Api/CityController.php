<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\City;
use App\Models\Region;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CityController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = City::query();
            
            // With relationships
            if ($request->has('with_region') && $request->with_region) {
                $query->with('region');
            }
            
            // Filter by region if provided
            if ($request->has('region_id')) {
                $query->where('region_id', $request->region_id);
            }
            
            // Filter by name if provided
            if ($request->has('name')) {
                $query->where('name', 'like', '%' . $request->name . '%');
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
            $cities = $query->paginate($perPage);
            
            // Get counts for each city if requested
            if ($request->has('with_counts') && $request->with_counts) {
                $cities->each(function ($city) {
                    $city->attractions_count = $city->attractions()->count();
                    $city->businesses_count = $city->businesses()->count();
                    $city->guide_services_count = $city->guideServices()->count();
                });
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $cities
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve cities',
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
            // Check if the user has admin role
            if (!auth()->user() || auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Only administrators can create cities.'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'region_id' => 'required|exists:regions,id',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric',
                'is_featured' => 'nullable|boolean',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Verify that the region exists
            $region = Region::findOrFail($request->region_id);
            
            // Create city data array
            $cityData = [
                'name' => $request->name,
                'description' => $request->description,
                'region_id' => $request->region_id,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'is_featured' => $request->is_featured ?? false,
                'image_path' => null
            ];
            
            // Handle image upload if provided
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('public/cities', $filename);
                $cityData['image_path'] = Storage::url($path);
            }
            
            // Create city
            $city = City::create($cityData);
            
            return response()->json([
                'status' => 'success',
                'message' => 'City created successfully',
                'data' => $city->load('region')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create city',
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
            $city = City::with('region')->findOrFail($id);
            
            // Add counts
            $city->attractions_count = $city->attractions()->count();
            $city->businesses_count = $city->businesses()->count();
            $city->guide_services_count = $city->guideServices()->count();
            
            return response()->json([
                'status' => 'success',
                'data' => $city
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'City not found',
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
            // Check if the user has admin role
            if (!auth()->user() || auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Only administrators can update cities.'
                ], 403);
            }
            
            $city = City::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'region_id' => 'sometimes|required|exists:regions,id',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric',
                'is_featured' => 'nullable|boolean',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Update city fields
            if ($request->has('name')) {
                $city->name = $request->name;
            }
            
            if ($request->has('description')) {
                $city->description = $request->description;
            }
            
            if ($request->has('region_id')) {
                // Verify that the region exists
                Region::findOrFail($request->region_id);
                $city->region_id = $request->region_id;
            }
            
            if ($request->has('latitude')) {
                $city->latitude = $request->latitude;
            }
            
            if ($request->has('longitude')) {
                $city->longitude = $request->longitude;
            }
            
            if ($request->has('is_featured')) {
                $city->is_featured = $request->is_featured;
            }
            
            // Handle image upload if provided
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($city->image_path) {
                    $oldPath = str_replace('/storage', 'public', $city->image_path);
                    Storage::delete($oldPath);
                }
                
                $image = $request->file('image');
                $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('public/cities', $filename);
                $city->image_path = Storage::url($path);
            }
            
            $city->save();
            
            return response()->json([
                'status' => 'success',
                'message' => 'City updated successfully',
                'data' => $city->fresh()->load('region')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update city',
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
            // Check if the user has admin role
            if (!auth()->user() || auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Only administrators can delete cities.'
                ], 403);
            }
            
            $city = City::findOrFail($id);
            
            // Check for related entities
            $hasBusinesses = $city->businesses()->count() > 0;
            $hasAttractions = $city->attractions()->count() > 0;
            $hasGuideServices = $city->guideServices()->count() > 0;
            
            if ($hasBusinesses || $hasAttractions || $hasGuideServices) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot delete city with associated businesses, attractions, or guide services.',
                    'has_businesses' => $hasBusinesses,
                    'has_attractions' => $hasAttractions,
                    'has_guide_services' => $hasGuideServices
                ], 422);
            }
            
            // Delete image if exists
            if ($city->image_path) {
                $path = str_replace('/storage', 'public', $city->image_path);
                Storage::delete($path);
            }
            
            $city->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'City deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete city',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get featured cities.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFeaturedCities(Request $request)
    {
        try {
            $limit = $request->input('limit', 6);
            
            $query = City::where('is_featured', true)
                ->with('region');
                
            // Add random ordering if specified
            if ($request->has('random') && $request->random) {
                $query->inRandomOrder();
            } else {
                $query->orderBy('name');
            }
            
            $cities = $query->limit($limit)->get();
            
            // Add counts if requested
            if ($request->has('with_counts') && $request->with_counts) {
                $cities->each(function ($city) {
                    $city->attractions_count = $city->attractions()->count();
                    $city->businesses_count = $city->businesses()->count();
                });
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $cities
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve featured cities',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get attractions for a specific city.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAttractionsForCity(string $id)
    {
        try {
            $city = City::findOrFail($id);
            $attractions = $city->attractions()->with('photos')->get();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'city' => $city->only(['id', 'name', 'region_id']),
                    'attractions' => $attractions
                ]
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
     * Get businesses for a specific city.
     *
     * @param  string  $id
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBusinessesForCity(string $id, Request $request)
    {
        try {
            $city = City::findOrFail($id);
            
            $query = $city->businesses()->with(['businessCategory', 'photos']);
            
            // Filter by category if provided
            if ($request->has('category_id')) {
                $query->where('business_category_id', $request->category_id);
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'asc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                $query->orderBy('name', 'asc');
            }
            
            $businesses = $query->get();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'city' => $city->only(['id', 'name', 'region_id']),
                    'businesses' => $businesses
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve businesses for this city',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get guide services for a specific city.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getGuideServicesForCity(string $id)
    {
        try {
            $city = City::findOrFail($id);
            $guideServices = $city->guideServices()->with(['guide', 'photos'])->get();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'city' => $city->only(['id', 'name', 'region_id']),
                    'guide_services' => $guideServices
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve guide services for this city',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
