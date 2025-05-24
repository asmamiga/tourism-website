<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Guide;
use App\Models\City;
use App\Models\GuideService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class GuideController extends Controller
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
            $query = Guide::query();
            
            // Eager load relationships
            $query->with(['user', 'cities', 'languages', 'services']);
            
            // Filter by approval status
            if ($request->has('is_approved')) {
                $query->where('is_approved', $request->boolean('is_approved'));
            } else {
                // By default, only show approved guides
                $query->where('is_approved', true);
            }
            
            // Filter by status (active/inactive)
            if ($request->has('status')) {
                $query->where('status', $request->status);
            } else {
                // By default, only show active guides
                $query->where('status', 'active');
            }
            
            // Filter by city
            if ($request->has('city_id')) {
                $query->whereHas('cities', function($q) use ($request) {
                    $q->where('cities.id', $request->city_id);
                });
            }
            
            // Filter by language
            if ($request->has('language_id')) {
                $query->whereHas('languages', function($q) use ($request) {
                    $q->where('languages.id', $request->language_id);
                });
            }
            
            // Search by name
            if ($request->has('search')) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->whereHas('user', function($userQuery) use ($searchTerm) {
                        $userQuery->where('name', 'like', "%{$searchTerm}%");
                    })
                    ->orWhere('bio', 'like', "%{$searchTerm}%")
                    ->orWhere('qualifications', 'like', "%{$searchTerm}%");
                });
            }
            
            // Filter by rating
            if ($request->has('min_rating')) {
                $query->where('average_rating', '>=', $request->min_rating);
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                // Default sort by featured and then rating
                $query->orderBy('is_featured', 'desc')
                      ->orderBy('average_rating', 'desc');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 10);
            $guides = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $guides
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve guides',
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
            // Only users with guide role can create guide profiles
            if (!auth()->user() || auth()->user()->role !== 'guide') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Only users with guide role can create guide profiles.'
                ], 403);
            }
            
            // Check if the user already has a guide profile
            $existingGuide = Guide::where('user_id', auth()->id())->first();
            if ($existingGuide) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You already have a guide profile',
                    'guide_id' => $existingGuide->id
                ], 422);
            }
            
            $validator = Validator::make($request->all(), [
                'bio' => 'required|string|min:100|max:2000',
                'hourly_rate' => 'required|numeric|min:0',
                'qualifications' => 'required|string|min:50|max:1000',
                'years_of_experience' => 'required|integer|min:0',
                'profile_photo' => 'nullable|image|max:5120', // 5MB max
                'city_ids' => 'required|array|min:1',
                'city_ids.*' => 'exists:cities,id',
                'language_ids' => 'required|array|min:1',
                'language_ids.*' => 'exists:languages,id',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Handle profile photo upload
            $profilePhotoPath = null;
            if ($request->hasFile('profile_photo')) {
                $profilePhotoPath = $request->file('profile_photo')->store('guides/profile_photos', 'public');
            }
            
            // Create guide data
            $guideData = [
                'user_id' => auth()->id(),
                'bio' => $request->bio,
                'hourly_rate' => $request->hourly_rate,
                'qualifications' => $request->qualifications,
                'years_of_experience' => $request->years_of_experience,
                'profile_photo' => $profilePhotoPath,
                'is_approved' => false, // Requires admin approval
                'status' => 'inactive', // Inactive until approved
                'average_rating' => 0, // No ratings yet
                'is_featured' => false, // Not featured by default
            ];
            
            // Create guide
            $guide = Guide::create($guideData);
            
            // Sync cities
            $guide->cities()->sync($request->city_ids);
            
            // Sync languages
            $guide->languages()->sync($request->language_ids);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Guide profile created and pending approval',
                'data' => $guide->load(['user', 'cities', 'languages'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create guide profile',
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
            $guide = Guide::with(['user', 'cities', 'languages', 'services'])->findOrFail($id);
            
            // Only show non-approved guides to admins or the guide themselves
            if (!$guide->is_approved && 
                (!auth()->user() || 
                 (auth()->user()->role !== 'admin' && auth()->id() !== $guide->user_id))) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Guide profile not found or not yet approved'
                ], 404);
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $guide
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Guide profile not found',
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
            $guide = Guide::findOrFail($id);
            
            // Authorization check - only the guide owner or admin can update
            if (!auth()->user() || 
                (auth()->id() !== $guide->user_id && auth()->user()->role !== 'admin')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to update this guide profile'
                ], 403);
            }
            
            // Different validation rules based on user role
            if (auth()->user()->role === 'admin') {
                $validator = Validator::make($request->all(), [
                    'bio' => 'sometimes|required|string|min:100|max:2000',
                    'hourly_rate' => 'sometimes|required|numeric|min:0',
                    'qualifications' => 'sometimes|required|string|min:50|max:1000',
                    'years_of_experience' => 'sometimes|required|integer|min:0',
                    'profile_photo' => 'nullable|image|max:5120', // 5MB max
                    'city_ids' => 'sometimes|required|array|min:1',
                    'city_ids.*' => 'exists:cities,id',
                    'language_ids' => 'sometimes|required|array|min:1',
                    'language_ids.*' => 'exists:languages,id',
                    'is_approved' => 'sometimes|boolean',
                    'status' => 'sometimes|in:active,inactive',
                    'is_featured' => 'sometimes|boolean',
                ]);
            } else {
                $validator = Validator::make($request->all(), [
                    'bio' => 'sometimes|required|string|min:100|max:2000',
                    'hourly_rate' => 'sometimes|required|numeric|min:0',
                    'qualifications' => 'sometimes|required|string|min:50|max:1000',
                    'years_of_experience' => 'sometimes|required|integer|min:0',
                    'profile_photo' => 'nullable|image|max:5120', // 5MB max
                    'city_ids' => 'sometimes|required|array|min:1',
                    'city_ids.*' => 'exists:cities,id',
                    'language_ids' => 'sometimes|required|array|min:1',
                    'language_ids.*' => 'exists:languages,id',
                ]);
            }
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Handle profile photo upload
            if ($request->hasFile('profile_photo')) {
                // Delete old photo if exists
                if ($guide->profile_photo) {
                    Storage::disk('public')->delete($guide->profile_photo);
                }
                
                $profilePhotoPath = $request->file('profile_photo')->store('guides/profile_photos', 'public');
                $guide->profile_photo = $profilePhotoPath;
            }
            
            // Update guide data
            if ($request->has('bio')) $guide->bio = $request->bio;
            if ($request->has('hourly_rate')) $guide->hourly_rate = $request->hourly_rate;
            if ($request->has('qualifications')) $guide->qualifications = $request->qualifications;
            if ($request->has('years_of_experience')) $guide->years_of_experience = $request->years_of_experience;
            
            // Admin-only fields
            if (auth()->user()->role === 'admin') {
                if ($request->has('is_approved')) $guide->is_approved = $request->boolean('is_approved');
                if ($request->has('status')) $guide->status = $request->status;
                if ($request->has('is_featured')) $guide->is_featured = $request->boolean('is_featured');
            }
            
            $guide->save();
            
            // Sync cities if provided
            if ($request->has('city_ids')) {
                $guide->cities()->sync($request->city_ids);
            }
            
            // Sync languages if provided
            if ($request->has('language_ids')) {
                $guide->languages()->sync($request->language_ids);
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'Guide profile updated successfully',
                'data' => $guide->fresh()->load(['user', 'cities', 'languages', 'services'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update guide profile',
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
            $guide = Guide::findOrFail($id);
            
            // Authorization check - only the guide owner or admin can delete
            if (!auth()->user() || 
                (auth()->id() !== $guide->user_id && auth()->user()->role !== 'admin')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to delete this guide profile'
                ], 403);
            }
            
            // Delete profile photo if exists
            if ($guide->profile_photo) {
                Storage::disk('public')->delete($guide->profile_photo);
            }
            
            // Delete the guide (relationships should cascade in the database)
            $guide->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Guide profile deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete guide profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get featured guides.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFeaturedGuides(Request $request)
    {
        try {
            $query = Guide::where('is_featured', true)
                ->where('is_approved', true)
                ->where('status', 'active')
                ->with(['user', 'cities', 'languages']);
            
            // Sort by rating as secondary criteria
            $query->orderBy('average_rating', 'desc');
            
            // Limit the number of results
            $limit = $request->input('limit', 6);
            $guides = $query->take($limit)->get();
            
            return response()->json([
                'status' => 'success',
                'data' => $guides
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve featured guides',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get top-rated guides.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTopRatedGuides(Request $request)
    {
        try {
            $query = Guide::where('is_approved', true)
                ->where('status', 'active')
                ->where('average_rating', '>=', 4.0) // Only guides with 4+ stars
                ->with(['user', 'cities', 'languages'])
                ->orderBy('average_rating', 'desc');
            
            // Limit the number of results
            $limit = $request->input('limit', 10);
            $guides = $query->take($limit)->get();
            
            return response()->json([
                'status' => 'success',
                'data' => $guides
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve top-rated guides',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get guides for a specific city.
     *
     * @param  string  $cityId
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getGuidesByCity(string $cityId, Request $request)
    {
        try {
            // Verify the city exists
            $city = City::findOrFail($cityId);
            
            $query = Guide::whereHas('cities', function($q) use ($cityId) {
                    $q->where('cities.id', $cityId);
                })
                ->where('is_approved', true)
                ->where('status', 'active')
                ->with(['user', 'cities', 'languages', 'services']);
            
            // Filter by language if provided
            if ($request->has('language_id')) {
                $query->whereHas('languages', function($q) use ($request) {
                    $q->where('languages.id', $request->language_id);
                });
            }
            
            // Filter by minimum rating if provided
            if ($request->has('min_rating')) {
                $query->where('average_rating', '>=', $request->min_rating);
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                // Default sort by featured and then rating
                $query->orderBy('is_featured', 'desc')
                      ->orderBy('average_rating', 'desc');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 10);
            $guides = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'city' => $city->only(['id', 'name']),
                    'guides' => $guides
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve guides for this city',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get profile of the authenticated guide user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMyGuideProfile()
    {
        try {
            // Verify authentication and role
            if (!auth()->user() || auth()->user()->role !== 'guide') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Only guide users can access this endpoint.'
                ], 403);
            }
            
            $guide = Guide::where('user_id', auth()->id())
                ->with(['user', 'cities', 'languages', 'services', 'bookings'])
                ->first();
            
            if (!$guide) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You do not have a guide profile yet'
                ], 404);
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $guide
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve your guide profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Approve a guide profile (admin only).
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function approveGuide(string $id)
    {
        try {
            // Check if user is admin
            if (!auth()->user() || auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Only administrators can approve guide profiles.'
                ], 403);
            }
            
            $guide = Guide::findOrFail($id);
            
            // Update guide status
            $guide->is_approved = true;
            $guide->status = 'active';
            $guide->save();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Guide profile approved successfully',
                'data' => $guide->fresh()->load(['user', 'cities', 'languages'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to approve guide profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
