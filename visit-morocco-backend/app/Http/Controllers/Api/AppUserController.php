<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AppUser as User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AppUserController extends Controller
{
    /**
     * Get the authenticated user's profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function showProfile(Request $request)
    {
        $user = $request->user();
        $user->load(['businessOwner', 'guide']);
        
        return response()->json([
            'status' => 'success',
            'user' => $user
        ]);
    }

    /**
     * Update the authenticated user's profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|string|max:100',
            'last_name' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:app_users,email,' . $user->user_id . ',user_id',
            'phone' => 'nullable|string|max:20',
            'profile_picture' => 'nullable|string|url',
            'password' => 'nullable|string|min:8|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = $request->only([
            'first_name',
            'last_name',
            'email',
            'phone',
            'profile_picture'
        ]);

        // Handle password update if provided
        if ($request->has('password') && $request->password) {
            $updateData['password_hash'] = Hash::make($request->password);
        }

        // Use DB transaction to ensure data consistency
        DB::beginTransaction();
        
        try {
            $user->update($updateData);

            // Handle role-specific updates
            if ($user->role === 'business_owner' && $request->hasAny(['business_name', 'business_description'])) {
                $user->businessOwner()->updateOrCreate(
                    ['user_id' => $user->user_id],
                    $request->only(['business_name', 'business_description'])
                );
            } elseif ($user->role === 'guide' && $request->hasAny(['bio', 'specialties', 'languages'])) {
                $user->guide()->updateOrCreate(
                    ['user_id' => $user->user_id],
                    $request->only(['bio', 'specialties', 'languages'])
                );
            }

            DB::commit();

            // Reload the user with relationships
            $user->load(['businessOwner', 'guide']);

            return response()->json([
                'status' => 'success',
                'message' => 'Profile updated successfully',
                'user' => $user
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle profile picture upload.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadProfilePicture(Request $request)
    {
        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
        ]);

        $user = $request->user();
        
        try {
            // Delete old profile picture if exists
            if ($user->profile_picture) {
                $oldPath = str_replace(asset('storage'), 'public', $user->profile_picture);
                if (Storage::exists($oldPath)) {
                    Storage::delete($oldPath);
                }
            }

            // Store the new file
            $path = $request->file('profile_picture')->store('public/profiles');
            
            // Update user's profile picture URL
            $user->profile_picture = asset(Storage::url($path));
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Profile picture uploaded successfully',
                'profile_picture_url' => $user->profile_picture
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to upload profile picture',
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
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password_hash)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Current password is incorrect'
            ], 422);
        }

        $user->update([
            'password_hash' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Password updated successfully'
        ]);
    }
}
