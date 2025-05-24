<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UserController extends Controller
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
            // Only admin can see all users
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            $query = User::query();
            
            // Filter by role if provided
            if ($request->has('role')) {
                $query->where('role', $request->role);
            }
            
            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            // Search by name or email if provided
            if ($request->has('search')) {
                $query->where(function($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('email', 'like', '%' . $request->search . '%');
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
            $perPage = $request->input('per_page', 15);
            $users = $query->paginate($perPage);
            
            // Remove password field from the results
            $users->getCollection()->transform(function ($user) {
                unset($user->password);
                return $user;
            });
            
            return response()->json([
                'status' => 'success',
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve users',
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
            // Only admin can create users via this endpoint
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
                'role' => 'required|in:admin,tourist,guide,business_owner',
                'phone' => 'nullable|string|max:20',
                'profile_picture' => 'nullable|image|max:2048', // 2MB max
                'bio' => 'nullable|string|max:1000',
                'status' => 'nullable|in:active,inactive,banned',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $userData = [
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'phone' => $request->phone,
                'bio' => $request->bio,
                'status' => $request->status ?? 'active',
            ];
            
            // Handle profile picture upload
            if ($request->hasFile('profile_picture')) {
                $path = $request->file('profile_picture')->store('profile-pictures', 'public');
                $userData['profile_picture'] = $path;
            }
            
            $user = User::create($userData);
            
            // Remove password from the response
            unset($user->password);
            
            return response()->json([
                'status' => 'success',
                'message' => 'User created successfully',
                'data' => $user
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create user',
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
            $user = User::findOrFail($id);
            
            // Regular users can only view their own profile, unless they're admins
            if (auth()->id() !== (int)$id && auth()->user()->role !== 'admin') {
                // For non-admin users, only return public information
                $publicUser = $user->only([
                    'id', 'name', 'role', 'profile_picture', 'bio', 
                    'created_at', 'updated_at'
                ]);
                
                return response()->json([
                    'status' => 'success',
                    'data' => $publicUser
                ]);
            }
            
            // For admins or the user themselves, return all info except password
            unset($user->password);
            
            return response()->json([
                'status' => 'success',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found',
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
            $user = User::findOrFail($id);
            
            // Regular users can only update their own profile
            if (auth()->id() !== (int)$id && auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to update this user'
                ], 403);
            }
            
            // Different validation rules for admin vs self-update
            if (auth()->user()->role === 'admin') {
                $validator = Validator::make($request->all(), [
                    'name' => 'sometimes|string|max:255',
                    'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
                    'role' => 'sometimes|in:admin,tourist,guide,business_owner',
                    'phone' => 'nullable|string|max:20',
                    'profile_picture' => 'nullable|image|max:2048',
                    'bio' => 'nullable|string|max:1000',
                    'status' => 'sometimes|in:active,inactive,banned',
                ]);
            } else {
                $validator = Validator::make($request->all(), [
                    'name' => 'sometimes|string|max:255',
                    'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
                    'phone' => 'nullable|string|max:20',
                    'profile_picture' => 'nullable|image|max:2048',
                    'bio' => 'nullable|string|max:1000',
                    // Regular users can't change their role or status
                ]);
            }
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // For regular users, only these fields can be updated
            $updateData = $request->only(['name', 'email', 'phone', 'bio']);
            
            // Admin can update additional fields
            if (auth()->user()->role === 'admin') {
                $adminUpdateData = $request->only(['role', 'status']);
                $updateData = array_merge($updateData, $adminUpdateData);
            }
            
            // Handle password update if provided
            if ($request->has('password') && !empty($request->password)) {
                $updateData['password'] = Hash::make($request->password);
            }
            
            // Handle profile picture update
            if ($request->hasFile('profile_picture')) {
                // Delete old profile picture if it exists
                if ($user->profile_picture) {
                    Storage::disk('public')->delete($user->profile_picture);
                }
                
                $path = $request->file('profile_picture')->store('profile-pictures', 'public');
                $updateData['profile_picture'] = $path;
            }
            
            $user->update($updateData);
            
            // Remove password from the response
            unset($user->password);
            
            return response()->json([
                'status' => 'success',
                'message' => 'User updated successfully',
                'data' => $user->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update user',
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
            // Only admins can delete users
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            $user = User::findOrFail($id);
            
            // Check if the user is trying to delete themselves
            if (auth()->id() === (int)$id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You cannot delete your own account through this endpoint'
                ], 400);
            }
            
            // Delete profile picture if it exists
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }
            
            // Delete the user
            $user->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'User deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete user',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get authenticated user's profile.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProfile()
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            // Remove password from the response
            unset($user->password);
            
            return response()->json([
                'status' => 'success',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Update the authenticated user's password.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|different:current_password',
                'confirm_password' => 'required|same:new_password',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $user = auth()->user();
            
            // Verify current password
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Current password is incorrect'
                ], 422);
            }
            
            // Update password
            $user->password = Hash::make($request->new_password);
            $user->save();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Password updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update password',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get users by role (public data only).
     * 
     * @param  string  $role
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUsersByRole(string $role, Request $request)
    {
        try {
            if (!in_array($role, ['admin', 'tourist', 'guide', 'business_owner'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid role specified'
                ], 400);
            }
            
            $query = User::where('role', $role)
                        ->where('status', 'active');
            
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
            $perPage = $request->input('per_page', 15);
            $users = $query->paginate($perPage);
            
            // Filter to only return public information
            $users->getCollection()->transform(function ($user) {
                return $user->only([
                    'id', 'name', 'role', 'profile_picture', 'bio', 
                    'created_at', 'updated_at'
                ]);
            });
            
            return response()->json([
                'status' => 'success',
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve users',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Update user's profile picture.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfilePicture(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'profile_picture' => 'required|image|max:2048', // 2MB max
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $user = auth()->user();
            
            // Delete old profile picture if it exists
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }
            
            // Upload new profile picture
            $path = $request->file('profile_picture')->store('profile-pictures', 'public');
            $user->profile_picture = $path;
            $user->save();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Profile picture updated successfully',
                'data' => [
                    'profile_picture' => $path,
                    'full_url' => url('storage/' . $path)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update profile picture',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Remove user's profile picture.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeProfilePicture()
    {
        try {
            $user = auth()->user();
            
            // Delete profile picture if it exists
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
                $user->profile_picture = null;
                $user->save();
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'Profile picture removed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to remove profile picture',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
