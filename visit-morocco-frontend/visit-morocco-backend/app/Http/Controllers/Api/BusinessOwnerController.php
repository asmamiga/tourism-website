<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BusinessOwner;
use App\Models\User;
use App\Models\Business;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class BusinessOwnerController extends Controller
{
    /**
     * Display a listing of business owners.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            // Only admin can see all business owners
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            $query = BusinessOwner::query();
            
            // Eager load relationships
            $query->with('user');
            
            // Filter by approval status if provided
            if ($request->has('is_approved')) {
                $query->where('is_approved', $request->boolean('is_approved'));
            }
            
            // Search by business name if provided
            if ($request->has('search')) {
                $query->where('business_name', 'like', '%' . $request->search . '%');
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                $query->orderBy('created_at', 'desc');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 15);
            $businessOwners = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $businessOwners
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve business owners',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created business owner profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            // User must be logged in and have role 'business_owner'
            if (!auth()->check() || auth()->user()->role !== 'business_owner') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Only business owner accounts can create a business owner profile.'
                ], 403);
            }
            
            // Check if user already has a business owner profile
            $existingProfile = BusinessOwner::where('user_id', auth()->id())->first();
            if ($existingProfile) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You already have a business owner profile',
                    'profile' => $existingProfile
                ], 422);
            }
            
            $validator = Validator::make($request->all(), [
                'business_name' => 'required|string|max:255',
                'business_description' => 'nullable|string',
                'business_license' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $businessOwnerData = [
                'user_id' => auth()->id(),
                'business_name' => $request->business_name,
                'business_description' => $request->business_description,
                'is_approved' => false // Default to not approved
            ];
            
            // Handle business license upload
            if ($request->hasFile('business_license')) {
                $path = $request->file('business_license')->store('business-licenses', 'public');
                $businessOwnerData['business_license'] = $path;
            }
            
            $businessOwner = BusinessOwner::create($businessOwnerData);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Business owner profile created successfully. It will be reviewed by an admin.',
                'data' => $businessOwner->load('user')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create business owner profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified business owner.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        try {
            $businessOwner = BusinessOwner::with(['user', 'businesses'])->findOrFail($id);
            
            // Only the owner or admin can see full details
            if (auth()->id() !== $businessOwner->user_id && auth()->user()->role !== 'admin') {
                // For public viewing, only return limited data
                $publicData = [
                    'id' => $businessOwner->id,
                    'business_name' => $businessOwner->business_name,
                    'business_description' => $businessOwner->business_description,
                    'is_approved' => $businessOwner->is_approved,
                    'user' => [
                        'id' => $businessOwner->user->id,
                        'name' => $businessOwner->user->name,
                        'profile_picture' => $businessOwner->user->profile_picture
                    ],
                    'businesses' => $businessOwner->businesses->map(function($business) {
                        return [
                            'id' => $business->id,
                            'name' => $business->name,
                            'description' => $business->description,
                            'address' => $business->address,
                            'city_id' => $business->city_id,
                        ];
                    })
                ];
                
                return response()->json([
                    'status' => 'success',
                    'data' => $publicData
                ]);
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $businessOwner
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Business owner not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified business owner.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id)
    {
        try {
            $businessOwner = BusinessOwner::findOrFail($id);
            
            // Check if user is authorized to update
            if (auth()->id() !== $businessOwner->user_id && auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to update this business owner profile'
                ], 403);
            }
            
            // Different validation based on user role
            if (auth()->user()->role === 'admin') {
                $validator = Validator::make($request->all(), [
                    'business_name' => 'sometimes|required|string|max:255',
                    'business_description' => 'nullable|string',
                    'business_license' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
                    'is_approved' => 'sometimes|boolean',
                ]);
            } else {
                $validator = Validator::make($request->all(), [
                    'business_name' => 'sometimes|required|string|max:255',
                    'business_description' => 'nullable|string',
                    'business_license' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
                ]);
            }
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Update business owner data
            $updateData = $request->only(['business_name', 'business_description']);
            
            // Admin can update approval status
            if (auth()->user()->role === 'admin' && $request->has('is_approved')) {
                $updateData['is_approved'] = $request->boolean('is_approved');
            }
            
            // Handle business license update
            if ($request->hasFile('business_license')) {
                // Delete old license if it exists
                if ($businessOwner->business_license) {
                    Storage::disk('public')->delete($businessOwner->business_license);
                }
                
                $path = $request->file('business_license')->store('business-licenses', 'public');
                $updateData['business_license'] = $path;
            }
            
            $businessOwner->update($updateData);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Business owner profile updated successfully',
                'data' => $businessOwner->fresh()->load(['user', 'businesses'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update business owner profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified business owner.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        try {
            $businessOwner = BusinessOwner::findOrFail($id);
            
            // Only the owner or admin can delete
            if (auth()->id() !== $businessOwner->user_id && auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to delete this business owner profile'
                ], 403);
            }
            
            // Delete business license if it exists
            if ($businessOwner->business_license) {
                Storage::disk('public')->delete($businessOwner->business_license);
            }
            
            // Note: This will cascade delete related businesses if foreign key is set up with cascading deletes
            $businessOwner->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Business owner profile deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete business owner profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get the authenticated user's business owner profile.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMyProfile()
    {
        try {
            // Verify authentication and role
            if (!auth()->check() || auth()->user()->role !== 'business_owner') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Only business owners can access this endpoint.'
                ], 403);
            }
            
            $businessOwner = BusinessOwner::with(['user', 'businesses'])
                ->where('user_id', auth()->id())
                ->first();
            
            if (!$businessOwner) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You do not have a business owner profile yet'
                ], 404);
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $businessOwner
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve business owner profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get all businesses for a specific business owner.
     *
     * @param  string  $id
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBusinesses(string $id, Request $request)
    {
        try {
            $businessOwner = BusinessOwner::findOrFail($id);
            
            $query = Business::where('business_owner_id', $id);
            
            // Eager load relationships
            $query->with(['city', 'category']);
            
            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            // Filter by category if provided
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }
            
            // Search by name if provided
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
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
     * Get all businesses for the authenticated business owner.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMyBusinesses(Request $request)
    {
        try {
            // Verify authentication and role
            if (!auth()->check() || auth()->user()->role !== 'business_owner') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Only business owners can access this endpoint.'
                ], 403);
            }
            
            $businessOwner = BusinessOwner::where('user_id', auth()->id())->first();
            
            if (!$businessOwner) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You do not have a business owner profile yet'
                ], 404);
            }
            
            $query = Business::where('business_owner_id', $businessOwner->id);
            
            // Eager load relationships
            $query->with(['city', 'category']);
            
            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            // Filter by category if provided
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }
            
            // Search by name if provided
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
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
            $businesses = $query->paginate($perPage);
            
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
     * Approve or reject a business owner profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function approveReject(Request $request, string $id)
    {
        try {
            // Only admin can approve/reject
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'is_approved' => 'required|boolean',
                'rejection_reason' => 'nullable|string|required_if:is_approved,false',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $businessOwner = BusinessOwner::findOrFail($id);
            
            $businessOwner->is_approved = $request->is_approved;
            
            if (!$request->is_approved && $request->has('rejection_reason')) {
                $businessOwner->rejection_reason = $request->rejection_reason;
            }
            
            $businessOwner->save();
            
            // You could also trigger notifications here (email, in-app, etc.)
            
            return response()->json([
                'status' => 'success',
                'message' => $request->is_approved ? 
                    'Business owner profile has been approved' : 
                    'Business owner profile has been rejected',
                'data' => $businessOwner->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to process approval/rejection',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
