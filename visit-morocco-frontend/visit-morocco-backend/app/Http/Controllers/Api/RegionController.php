<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Region;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class RegionController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = Region::query();
            
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
            
            // Decide whether to load cities based on the request
            if ($request->has('with_cities') && $request->with_cities) {
                $query->with('cities');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 10);
            $regions = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $regions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve regions',
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
                    'message' => 'Unauthorized. Only administrators can create regions.'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:regions',
                'description' => 'required|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Create region data array
            $regionData = [
                'name' => $request->name,
                'description' => $request->description,
                'image_path' => null
            ];
            
            // Handle image upload if provided
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('public/regions', $filename);
                $regionData['image_path'] = Storage::url($path);
            }
            
            // Create region
            $region = Region::create($regionData);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Region created successfully',
                'data' => $region
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create region',
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
            $region = Region::with('cities')->findOrFail($id);
            
            return response()->json([
                'status' => 'success',
                'data' => $region
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Region not found',
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
                    'message' => 'Unauthorized. Only administrators can update regions.'
                ], 403);
            }
            
            $region = Region::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255|unique:regions,name,' . $id,
                'description' => 'sometimes|required|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Update region fields
            if ($request->has('name')) {
                $region->name = $request->name;
            }
            
            if ($request->has('description')) {
                $region->description = $request->description;
            }
            
            // Handle image upload if provided
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($region->image_path) {
                    $oldPath = str_replace('/storage', 'public', $region->image_path);
                    Storage::delete($oldPath);
                }
                
                $image = $request->file('image');
                $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('public/regions', $filename);
                $region->image_path = Storage::url($path);
            }
            
            $region->save();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Region updated successfully',
                'data' => $region
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update region',
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
                    'message' => 'Unauthorized. Only administrators can delete regions.'
                ], 403);
            }
            
            $region = Region::findOrFail($id);
            
            // Check if region has cities
            if ($region->cities()->count() > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot delete region that has associated cities. Remove cities first.'
                ], 422);
            }
            
            // Delete image if exists
            if ($region->image_path) {
                $path = str_replace('/storage', 'public', $region->image_path);
                Storage::delete($path);
            }
            
            $region->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Region deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete region',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get all regions with their cities.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRegionsWithCities()
    {
        try {
            $regions = Region::with('cities')->orderBy('name')->get();
            
            return response()->json([
                'status' => 'success',
                'data' => $regions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve regions with cities',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get cities for a specific region.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCitiesByRegion(string $id)
    {
        try {
            $region = Region::findOrFail($id);
            $cities = $region->cities()->orderBy('name')->get();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'region' => $region->only(['id', 'name']),
                    'cities' => $cities
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve cities for this region',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
