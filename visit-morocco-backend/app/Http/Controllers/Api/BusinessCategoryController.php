<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BusinessCategory;
use Illuminate\Support\Facades\Validator;

class BusinessCategoryController extends Controller
{
    /**
     * Display a listing of business categories.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = BusinessCategory::query();
            
            // Search by name if provided
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                $query->orderBy('name', 'asc');
            }
            
            // Decide whether to paginate or get all
            if ($request->boolean('all', false)) {
                $categories = $query->get();
            } else {
                // Pagination
                $perPage = $request->input('per_page', 15);
                $categories = $query->paginate($perPage);
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve business categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created business category.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            // Only admin can create categories
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100|unique:business_categories,name',
                'description' => 'nullable|string',
                'icon' => 'nullable|string|max:100',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $category = BusinessCategory::create([
                'name' => $request->name,
                'description' => $request->description,
                'icon' => $request->icon,
            ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Business category created successfully',
                'data' => $category
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create business category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified business category.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        try {
            $category = BusinessCategory::findOrFail($id);
            
            return response()->json([
                'status' => 'success',
                'data' => $category
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Business category not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified business category.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id)
    {
        try {
            // Only admin can update categories
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            $category = BusinessCategory::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:100|unique:business_categories,name,' . $id . ',id',
                'description' => 'nullable|string',
                'icon' => 'nullable|string|max:100',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $updateData = $request->only(['name', 'description', 'icon']);
            $category->update($updateData);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Business category updated successfully',
                'data' => $category->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update business category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified business category.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        try {
            // Only admin can delete categories
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            $category = BusinessCategory::findOrFail($id);
            
            // Check if there are businesses using this category
            $businessCount = $category->businesses()->count();
            
            if ($businessCount > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot delete category that is in use by ' . $businessCount . ' businesses'
                ], 422);
            }
            
            $category->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Business category deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete business category',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get businesses for a specific category.
     *
     * @param  string  $id
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCategoryBusinesses(string $id, Request $request)
    {
        try {
            $category = BusinessCategory::findOrFail($id);
            
            $query = $category->businesses();
            
            // Eager load relationships
            $query->with(['city', 'businessOwner']);
            
            // Filter by status - only show active by default
            if ($request->has('status')) {
                $query->where('status', $request->status);
            } else {
                $query->where('status', 'active');
            }
            
            // Filter by city if provided
            if ($request->has('city_id')) {
                $query->where('city_id', $request->city_id);
            }
            
            // Search by name if provided
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }
            
            // Filter by price range
            if ($request->has('price_range')) {
                $query->where('price_range', $request->price_range);
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                $query->orderBy('average_rating', 'desc');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 10);
            $businesses = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'category' => $category,
                    'businesses' => $businesses
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve category businesses',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get business category statistics.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStatistics()
    {
        try {
            $categories = BusinessCategory::withCount(['businesses' => function($query) {
                $query->where('status', 'active');
            }])->get();
            
            // Enhance the data with percentage calculations
            $totalBusinesses = $categories->sum('businesses_count');
            
            $categoriesWithStats = $categories->map(function($category) use ($totalBusinesses) {
                $category->percentage = $totalBusinesses > 0 ? 
                    round(($category->businesses_count / $totalBusinesses) * 100, 2) : 0;
                return $category;
            });
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_businesses' => $totalBusinesses,
                    'categories' => $categoriesWithStats
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve category statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
