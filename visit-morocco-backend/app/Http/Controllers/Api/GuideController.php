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
            $query->with(['user', 'cities', 'services']);
            
            // Filter by approval status
            if ($request->has('is_approved')) {
                $query->where('is_approved', $request->boolean('is_approved'));
            } else {
                // By default, only show approved guides
                $query->where('is_approved', true);
            }
            
            // Filter by availability (replacing status)
            if ($request->has('is_available')) {
                $query->where('is_available', $request->boolean('is_available'));
            } else {
                // By default, only show available guides
                $query->where('is_available', true);
            }
            
            // Filter by city
            if ($request->has('city_id')) {
                $query->whereHas('cities', function($q) use ($request) {
                    $q->where('cities.id', $request->city_id);
                });
            }
            
            // Filter by language (assuming languages are stored as JSON)
            if ($request->has('language')) {
                $language = $request->language;
                $query->whereRaw("JSON_CONTAINS(languages, ?)", [json_encode($language)]);
            }
            
            // Search by name and bio
            if ($request->has('search')) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->whereHas('user', function($userQuery) use ($searchTerm) {
                        $userQuery->where('name', 'like', "%{$searchTerm}%");
                    })
                    ->orWhere('bio', 'like', "%{$searchTerm}%")
                    ->orWhere('specialties', 'like', "%{$searchTerm}%");
                });
            }
            
            // Filter by minimum experience years
            if ($request->has('min_experience')) {
                $query->where('experience_years', '>=', $request->min_experience);
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                
                // Map frontend sort parameters to actual database columns
                $sortField = match($request->sort_by) {
                    'experience' => 'experience_years',
                    'rate' => 'daily_rate',
                    default => $request->sort_by
                };
                
                $query->orderBy($sortField, $sortDirection);
            } else {
                // Default sort by experience and then daily rate
                $query->orderBy('experience_years', 'desc')
                      ->orderBy('daily_rate', 'asc');
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
                    'guide_id' => $existingGuide->guide_id
                ], 422);
            }
            
            $validator = Validator::make($request->all(), [
                'bio' => 'required|string|min:100|max:2000',
                'daily_rate' => 'required|numeric|min:0',
                'experience_years' => 'required|integer|min:0',
                'languages' => 'required|array|min:1',
                'specialties' => 'required|array|min:1',
                'identity_verification' => 'nullable|string|max:100',
                'guide_license' => 'nullable|string|max:100',
                'city_ids' => 'required|array|min:1',
                'city_ids.*' => 'exists:cities,id',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Create guide data
            $guideData = [
                'user_id' => auth()->id(),
                'bio' => $request->bio,
                'daily_rate' => $request->daily_rate,
                'experience_years' => $request->experience_years,
                'languages' => json_encode($request->languages),
                'specialties' => json_encode($request->specialties),
                'identity_verification' => $request->identity_verification,
                'guide_license' => $request->guide_license,
                'is_approved' => false, // Requires admin approval
                'is_available' => false, // Inactive until approved
            ];
            
            // Create guide
            $guide = Guide::create($guideData);
            
            // Sync cities
            $guide->cities()->sync($request->city_ids);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Guide profile created and pending approval',
                'data' => $guide->load(['user', 'cities'])
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
            $guide = Guide::with(['user', 'cities', 'services'])->findOrFail($id);
            
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
                    'daily_rate' => 'sometimes|required|numeric|min:0',
                    'experience_years' => 'sometimes|required|integer|min:0',
                    'languages' => 'sometimes|required|array|min:1',
                    'specialties' => 'sometimes|required|array|min:1',
                    'identity_verification' => 'nullable|string|max:100',
                    'guide_license' => 'nullable|string|max:100',
                    'city_ids' => 'sometimes|required|array|min:1',
                    'city_ids.*' => 'exists:cities,id',
                    'is_approved' => 'sometimes|boolean',
                    'is_available' => 'sometimes|boolean',
                ]);
            } else {
                $validator = Validator::make($request->all(), [
                    'bio' => 'sometimes|required|string|min:100|max:2000',
                    'daily_rate' => 'sometimes|required|numeric|min:0',
                    'experience_years' => 'sometimes|required|integer|min:0',
                    'languages' => 'sometimes|required|array|min:1',
                    'specialties' => 'sometimes|required|array|min:1',
                    'identity_verification' => 'nullable|string|max:100',
                    'guide_license' => 'nullable|string|max:100',
                    'city_ids' => 'sometimes|required|array|min:1',
                    'city_ids.*' => 'exists:cities,id',
                ]);
            }
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Update guide data
            if ($request->has('bio')) $guide->bio = $request->bio;
            if ($request->has('daily_rate')) $guide->daily_rate = $request->daily_rate;
            if ($request->has('experience_years')) $guide->experience_years = $request->experience_years;
            if ($request->has('languages')) $guide->languages = json_encode($request->languages);
            if ($request->has('specialties')) $guide->specialties = json_encode($request->specialties);
            if ($request->has('identity_verification')) $guide->identity_verification = $request->identity_verification;
            if ($request->has('guide_license')) $guide->guide_license = $request->guide_license;
            
            // Admin-only fields
            if (auth()->user()->role === 'admin') {
                if ($request->has('is_approved')) $guide->is_approved = $request->boolean('is_approved');
                if ($request->has('is_available')) $guide->is_available = $request->boolean('is_available');
            }
            
            $guide->save();
            
            // Sync cities if provided
            if ($request->has('city_ids')) {
                $guide->cities()->sync($request->city_ids);
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'Guide profile updated successfully',
                'data' => $guide->fresh()->load(['user', 'cities', 'services'])
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
     * Get available guides.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAvailableGuides(Request $request)
    {
        try {
            $query = Guide::where('is_available', true)
                ->where('is_approved', true)
                ->with(['user', 'cities']);
            
            // Sort by experience as secondary criteria
            $query->orderBy('experience_years', 'desc');
            
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
                'message' => 'Failed to retrieve available guides',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get experienced guides.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getExperiencedGuides(Request $request)
    {
        try {
            $query = Guide::where('is_approved', true)
                ->where('is_available', true)
                ->where('experience_years', '>=', 5) // Only guides with 5+ years experience
                ->with(['user', 'cities'])
                ->orderBy('experience_years', 'desc');
            
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
                'message' => 'Failed to retrieve experienced guides',
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
                ->where('is_available', true)
                ->with(['user', 'cities', 'services']);
            
            // Filter by language if provided
            if ($request->has('language')) {
                $language = $request->language;
                $query->whereRaw("JSON_CONTAINS(languages, ?)", [json_encode($language)]);
            }
            
            // Filter by minimum experience if provided
            if ($request->has('min_experience')) {
                $query->where('experience_years', '>=', $request->min_experience);
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                // Default sort by experience and then rate
                $query->orderBy('experience_years', 'desc')
                      ->orderBy('daily_rate', 'asc');
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
                ->with(['user', 'cities', 'services', 'bookings'])
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
            $guide->is_available = true;
            $guide->save();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Guide profile approved successfully',
                'data' => $guide->fresh()->load(['user', 'cities'])
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