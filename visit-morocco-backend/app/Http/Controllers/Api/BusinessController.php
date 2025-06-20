<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Business;
use App\Models\BusinessPhoto;
use App\Models\BusinessCategory;
use App\Models\BusinessOwner;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BusinessController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = Business::query();
            
            // With relationships - load all photos
            $query->with(['city.region', 'businessCategory', 'photos']);
            
            // If no search parameters, return all businesses
            if (!$request->hasAny(['city_id', 'region_id', 'category_id', 'name', 'features', 'min_price', 'max_price', 'min_rating'])) {
                $businesses = $query->orderBy('name', 'asc')->get();
                
                return response()->json([
                    'status' => 'success',
                    'data' => $businesses
                ]);
            }
            
            // Filter by city if provided
            if ($request->has('city_id')) {
                $query->where('city_id', $request->city_id);
            }
            
            // Filter by region if provided
            if ($request->has('region_id')) {
                $query->whereHas('city', function($query) use ($request) {
                    $query->where('region_id', $request->region_id);
                });
            }
            
            // Filter by category if provided
            if ($request->has('category_id')) {
                $query->where('business_category_id', $request->category_id);
            }
            
            // Filter by name if provided
            if ($request->has('name')) {
                $query->where('name', 'like', '%' . $request->name . '%');
            }
            
            // Filter by features if provided
            if ($request->has('features')) {
                $features = explode(',', $request->features);
                foreach ($features as $feature) {
                    $query->where('features', 'like', '%' . $feature . '%');
                }
            }
            
            // Filter by price range if provided
            if ($request->has('min_price') && $request->has('max_price')) {
                $query->whereBetween('price_range', [$request->min_price, $request->max_price]);
            } else if ($request->has('min_price')) {
                $query->where('price_range', '>=', $request->min_price);
            } else if ($request->has('max_price')) {
                $query->where('price_range', '<=', $request->max_price);
            }
            
            // Filter by rating if provided
            if ($request->has('min_rating')) {
                $query->where('average_rating', '>=', $request->min_rating);
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'asc');
                
                if ($request->sort_by === 'rating') {
                    $query->orderBy('average_rating', $sortDirection === 'asc' ? 'asc' : 'desc');
                } else {
                    $query->orderBy($request->sort_by, $sortDirection);
                }
            } else {
                $query->orderBy('name', 'asc');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 10);
            $businesses = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $businesses
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve businesses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
 * Store a newly created business in storage.
 *
 * @param  \Illuminate\Http\Request  $request
 * @return \Illuminate\Http\JsonResponse
 */


    /**
     * Display the specified resource.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        try {
            // Load business with available relationships
            $business = Business::with([
                'city.region',
                'businessCategory',
                'photos',
                'businessOwner.user',
                'reviews' => function($query) {
                    $query->latest()
                          ->with(['user' => function($q) {
                              $q->select('id', 'name', 'profile_photo_path');
                          }]);
                },
                'reviews.photos'
            ])->findOrFail($id);
            
            // Increment view count if the column exists
            if (Schema::hasColumn('businesses', 'views_count')) {
                $business->increment('views_count');
            }
            
            // Calculate additional properties
            $business->review_count = $business->reviews()->count();
            $business->average_rating = $business->reviews()->avg('rating') ?? 0;
            
            // Format business hours
            $business->formatted_hours = $this->formatBusinessHours($business->opening_hours ?? []);
            
            // Add related businesses in the same category
            $business->related_businesses = Business::where('category_id', $business->category_id)
                ->where('business_id', '!=', $business->business_id)
                ->with(['photos' => function($q) {
                    $q->where('is_primary', true);
                }])
                ->take(4)
                ->get();
                
            // Initialize is_favorite to false by default
            $business->is_favorite = false;
            
            return response()->json([
                'status' => 'success',
                'data' => $business
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Business not found',
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
            $business = Business::findOrFail($id);
            
            // Check if user is authorized (must be the business owner or an admin)
            if (auth()->user()->role === 'admin' || 
                (auth()->user()->role === 'business_owner' && 
                 $business->businessOwner->user_id === auth()->id())) {
                
                $validator = Validator::make($request->all(), [
                    'name' => 'sometimes|required|string|max:255',
                    'description' => 'sometimes|required|string',
                    'business_category_id' => 'sometimes|required|exists:business_categories,id',
                    'city_id' => 'sometimes|required|exists:cities,id',
                    'address' => 'sometimes|required|string',
                    'phone' => 'sometimes|required|string|max:20',
                    'email' => 'sometimes|required|email',
                    'website' => 'nullable|url',
                    'opening_hours' => 'nullable|string',
                    'price_range' => 'nullable|integer|between:1,5',
                    'features' => 'nullable|string',
                    'latitude' => 'nullable|numeric',
                    'longitude' => 'nullable|numeric',
                    'photos' => 'nullable|array',
                    'photos.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
                    'photos_to_delete' => 'nullable|array',
                    'photos_to_delete.*' => 'integer|exists:business_photos,id',
                    'featured_photo_id' => 'nullable|integer|exists:business_photos,id',
                ]);
                
                if ($validator->fails()) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Validation failed',
                        'errors' => $validator->errors()
                    ], 422);
                }
                
                // Update business fields if provided
                $updateData = $request->only([
                    'name', 'description', 'business_category_id', 'city_id',
                    'address', 'phone', 'email', 'website', 'opening_hours',
                    'price_range', 'features', 'latitude', 'longitude'
                ]);
                
                // Only admin can update approval status
                if (auth()->user()->role === 'admin') {
                    if ($request->has('is_approved')) {
                        $updateData['is_approved'] = $request->is_approved;
                        $updateData['status'] = $request->is_approved ? 'active' : 'pending';
                    }
                }
                
                $business->update(array_filter($updateData));
                
                // Handle photo uploads if provided
                if ($request->hasFile('photos')) {
                    foreach ($request->file('photos') as $index => $photo) {
                        $filename = Str::uuid() . '.' . $photo->getClientOriginalExtension();
                        $path = $photo->storeAs('public/businesses', $filename);
                        
                        BusinessPhoto::create([
                            'business_id' => $business->id,
                            'photo_path' => Storage::url($path),
                            'caption' => $request->input('captions.' . $index, $business->name),
                            'is_featured' => false
                        ]);
                    }
                }
                
                // Handle photo deletions if specified
                if ($request->has('photos_to_delete') && is_array($request->photos_to_delete)) {
                    $photosToDelete = BusinessPhoto::where('business_id', $business->id)
                        ->whereIn('id', $request->photos_to_delete)
                        ->get();
                    
                    foreach ($photosToDelete as $photo) {
                        // Extract path from URL and remove file
                        $path = str_replace('/storage', 'public', $photo->photo_path);
                        Storage::delete($path);
                        $photo->delete();
                    }
                }
                
                // Set a specific photo as featured if requested
                if ($request->has('featured_photo_id')) {
                    // First, set all photos as not featured
                    BusinessPhoto::where('business_id', $business->id)
                        ->update(['is_featured' => false]);
                    
                    // Then set the requested photo as featured
                    BusinessPhoto::where('id', $request->featured_photo_id)
                        ->where('business_id', $business->id)
                        ->update(['is_featured' => true]);
                }
                
                // If there's no featured photo, set the first one as featured
                $hasFeatured = BusinessPhoto::where('business_id', $business->id)
                    ->where('is_featured', true)
                    ->exists();
                
                if (!$hasFeatured) {
                    $firstPhoto = BusinessPhoto::where('business_id', $business->id)
                        ->first();
                        
                    if ($firstPhoto) {
                        $firstPhoto->update(['is_featured' => true]);
                    }
                }
                
                return response()->json([
                    'status' => 'success',
                    'message' => 'Business updated successfully',
                    'data' => $business->fresh()->load(['city.region', 'businessCategory', 'photos'])
                ]);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. You do not have permission to update this business.'
                ], 403);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update business',
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
            // Check if user is authenticated
            if (!auth()->check()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            $business = Business::findOrFail($id);
            
            // Check if user is authorized (must be the business owner or an admin)
            if (auth()->user()->role === 'admin' || 
                (auth()->user()->role === 'business_owner' && 
                 $business->businessOwner && $business->businessOwner->user_id === auth()->id())) {
                
                // Check if the business has reviews or bookings
                $hasReviews = $business->reviews()->exists();
                $hasBookings = method_exists($business, 'bookings') ? $business->bookings()->exists() : false;
                
                if ($hasReviews || $hasBookings) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Cannot delete a business with existing reviews or bookings',
                        'has_reviews' => $hasReviews,
                        'has_bookings' => $hasBookings
                    ], 422);
                }
                
                // Delete all photos
                foreach ($business->photos as $photo) {
                    $path = str_replace('/storage', 'public', $photo->photo_path);
                    Storage::delete($path);
                    $photo->delete();
                }
                
                // Delete the business
                $business->delete();
                
                return response()->json([
                    'status' => 'success',
                    'message' => 'Business deleted successfully'
                ]);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. You do not have permission to delete this business.'
                ], 403);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete business',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get businesses by category.
     *
     * @param  string  $categoryId
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBusinessesByCategory(string $categoryId, Request $request)
    {
        try {
            $query = Business::where('business_category_id', $categoryId)
                ->where('is_approved', true)
                ->where('status', 'active')
                ->with(['city', 'photos' => function($query) {
                    $query->where('is_featured', true);
                }]);
            
            // Filter by city if provided
            if ($request->has('city_id')) {
                $query->where('city_id', $request->city_id);
            }
            
            // Pagination
            $perPage = $request->input('per_page', 10);
            $businesses = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $businesses
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve businesses by category',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get top-rated businesses.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTopRatedBusinesses(Request $request)
    {
        try {
            $limit = $request->input('limit', 6);
            
            $query = Business::where('is_approved', true)
                ->where('status', 'active')
                ->where('average_rating', '>=', 4)
                ->with(['city', 'businessCategory', 'photos' => function($query) {
                    $query->where('is_featured', true);
                }])
                ->orderBy('average_rating', 'desc');
            
            // Filter by category if provided
            if ($request->has('category_id')) {
                $query->where('business_category_id', $request->category_id);
            }
            
            // Filter by city if provided
            if ($request->has('city_id')) {
                $query->where('city_id', $request->city_id);
            }
            
            $businesses = $query->limit($limit)->get();
            
            return response()->json([
                'status' => 'success',
                'data' => $businesses
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve top-rated businesses',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get businesses owned by the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMyBusinesses()
    {
        try {
            // Check if the user is a business owner
            if (auth()->user()->role !== 'business_owner') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Only business owners can access this endpoint.'
                ], 403);
            }
            
            $businessOwner = BusinessOwner::where('user_id', auth()->id())->first();
            
            if (!$businessOwner) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Business owner profile not found'
                ], 404);
            }
            
            $businesses = Business::where('business_owner_id', $businessOwner->id)
                ->with(['city', 'businessCategory', 'photos'])
                ->get();
            
            return response()->json([
                'status' => 'success',
                'data' => $businesses
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve your businesses',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Toggle business approval status (admin only).
     *
     * @param  string  $id
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggleApproval(string $id, Request $request)
    {
        try {
            // Check if the user is an admin
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Only administrators can approve businesses.'
                ], 403);
            }
            
            $business = Business::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'is_approved' => 'required|boolean',
                'admin_note' => 'nullable|string'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $business->is_approved = $request->is_approved;
            $business->status = $request->is_approved ? 'active' : 'pending';
            $business->admin_note = $request->admin_note;
            $business->save();
            
            return response()->json([
                'status' => 'success',
                'message' => $request->is_approved ? 'Business approved successfully' : 'Business approval revoked',
                'data' => $business
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update business approval status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Format business hours for display
     *
     * @param array $hours
     * @return array
     */
    private function formatBusinessHours($hours)
    {
        if (!is_array($hours)) {
            return [];
        }

        $days = [
            'monday' => 'Monday',
            'tuesday' => 'Tuesday',
            'wednesday' => 'Wednesday',
            'thursday' => 'Thursday',
            'friday' => 'Friday',
            'saturday' => 'Saturday',
            'sunday' => 'Sunday'
        ];

        $formatted = [];
        
        foreach ($days as $day => $dayName) {
            if (isset($hours[$day]) && ($hours[$day]['is_open'] ?? false)) {
                $formatted[] = [
                    'day' => $dayName,
                    'hours' => $hours[$day]['open'] . ' - ' . $hours[$day]['close']
                ];
            } else {
                $formatted[] = [
                    'day' => $dayName,
                    'hours' => 'Closed'
                ];
            }
        }

        return $formatted;
    }

    /**
     * Search businesses
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'query' => 'required|string|min:2',
                'category_id' => 'nullable|exists:business_categories,id',
                'city_id' => 'nullable|exists:cities,id',
                'region_id' => 'nullable|exists:regions,id',
                'min_rating' => 'nullable|numeric|min:1|max:5',
                'features' => 'nullable|string'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $query = Business::where('is_approved', true)
                ->where('status', 'active')
                ->with(['city.region', 'businessCategory', 'photos' => function($query) {
                    $query->where('is_featured', true);
                }]);
            
            // Search by keyword
            $searchTerm = $request->query;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('description', 'like', '%' . $searchTerm . '%')
                  ->orWhere('features', 'like', '%' . $searchTerm . '%');
            });
            
            // Apply filters
            if ($request->has('category_id')) {
                $query->where('business_category_id', $request->category_id);
            }
            
            if ($request->has('city_id')) {
                $query->where('city_id', $request->city_id);
            }
            
            if ($request->has('region_id')) {
                $query->whereHas('city', function($q) use ($request) {
                    $q->where('region_id', $request->region_id);
                });
            }
            
            if ($request->has('min_rating')) {
                $query->where('average_rating', '>=', $request->min_rating);
            }
            
            if ($request->has('features')) {
                $features = explode(',', $request->features);
                foreach ($features as $feature) {
                    $query->where('features', 'like', '%' . $feature . '%');
                }
            }
            
            // Pagination
            $perPage = $request->input('per_page', 10);
            $businesses = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $businesses
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to search businesses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created business in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            // Log the incoming request for debugging
            error_log('=== NEW BUSINESS CREATION REQUEST ===');
            error_log('Request data: ' . json_encode($request->except(['photos'])));
            
            // Get the authenticated user
            $user = $request->user();
            error_log('Authenticated user ID: ' . $user->id);
            
            // Create business data with minimal required fields
            $businessData = [
                'name' => $request->input('name', 'New Business'),
                'description' => $request->input('description', 'Business description'),
                'category_id' => $request->input('category_id', 1), // Default to first category
                'address' => $request->input('address', 'Default Address'),
                'city_id' => $request->input('city_id', 1), // Default to first city
                'phone' => $request->input('phone', '1234567890'),
                'email' => $request->input('email', 'business@example.com'),
                'business_owner_id' => $user->id,
                'status' => 'pending',
                'is_verified' => false,
                'average_rating' => 0
            ];
            
            error_log('Attempting to create business with data: ' . json_encode($businessData));
            
            // Create the business
            $business = Business::create($businessData);
            error_log('Business created successfully with ID: ' . $business->id);
            
            // Return success response
            return response()->json([
                'status' => 'success',
                'message' => 'Business created successfully',
                'data' => $business
            ], 201);
            
        } catch (\Exception $e) {
            // Log detailed error
            error_log('ERROR CREATING BUSINESS:');
            error_log('Message: ' . $e->getMessage());
            error_log('File: ' . $e->getFile() . ':' . $e->getLine());
            error_log('Trace: ' . $e->getTraceAsString());
            
            // Return error response
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create business',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
}