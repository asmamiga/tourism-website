<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AppUser as User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Register a new user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:business_owner,guide,tourist',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create the user with the correct model
        $user = new User();
        $user->email = $request->email;
        $user->password = $request->password; // Will be hashed by the model
        $user->first_name = $request->first_name;
        $user->last_name = $request->last_name;
        $user->phone = $request->phone;
        $user->role = $request->role;
        $user->is_verified = false;
        $user->verification_code = Str::random(60);
        $user->save();

        // Handle additional profile creation based on role
        if ($request->role === 'business_owner' && $request->has('business_name')) {
            $user->businessOwner()->create([
                'business_name' => $request->business_name,
                'business_description' => $request->business_description ?? null,
                'is_approved' => false
            ]);
        } elseif ($request->role === 'guide') {
            $user->guide()->create([
                'bio' => $request->bio ?? null,
                'is_approved' => false
            ]);
        }

        // Generate token for the user
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    /**
     * Login user and create token.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        // Check if user exists and password is correct
        if (!$user || !(
            (isset($user->password) && Hash::check($request->password, $user->password)) ||
            (isset($user->password_hash) && Hash::check($request->password, $user->password_hash))
        )) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid login credentials',
                'debug' => [
                    'has_password' => isset($user->password),
                    'has_password_hash' => isset($user->password_hash),
                    'email_found' => $user !== null
                ]
            ], 401);
        }
        
        // If password_hash is empty but password is set, update it for backward compatibility
        if (empty($user->password_hash) && !empty($user->password)) {
            $user->password_hash = $user->password;
            $user->save();
        }

        // Update last login timestamp
        $user->last_login = now();
        $user->save();

        $token = $user->createToken('auth_token')->plainTextToken;

        // Load any relationships if needed
        if ($user->role === 'business_owner') {
            $user->load('businessOwner');
        } elseif ($user->role === 'guide') {
            $user->load('guide');
        }

        return response()->json([
            'status' => 'success',
            'message' => 'User logged in successfully',
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer'
        ])->header('Access-Control-Allow-Credentials', 'true')
          ->header('Access-Control-Allow-Origin', config('cors.allowed_origins')[0] ?? '*');
    }

    /**
     * Logout user (revoke the token).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'User logged out successfully'
        ]);
    }

    /**
     * Get authenticated user profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function profile(Request $request)
    {
        $user = $request->user();
        
        // Load additional profile data based on role
        if ($user->role === 'business_owner') {
            $user->load('businessOwner');
        } elseif ($user->role === 'guide') {
            $user->load('guide');
        }

        return response()->json([
            'status' => 'success',
            'user' => $user
        ]);
    }
}
