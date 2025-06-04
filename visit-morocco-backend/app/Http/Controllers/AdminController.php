<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    /**
     * Display a listing of admins
     */
    public function index()
    {
        $admins = Admin::select(['id', 'name', 'email', 'created_at'])
            ->paginate(10);

        return response()->json($admins, 200);
    }

    /**
     * Store a newly created admin
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:admins,email',
            'password' => 'required|confirmed|min:8'
        ]);

        $admin = Admin::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'message' => 'Admin created successfully',
            'admin' => $admin
        ], 201);
    }

    /**
     * Display the specified admin
     */
    public function show($id)
    {
        $admin = Admin::findOrFail($id);

        return response()->json([
            'admin' => $admin
        ], 200);
    }

    /**
     * Get authenticated admin's profile
     */
    public function profile(Request $request)
    {
        return response()->json([
            'admin' => $request->user()
        ], 200);
    }

    /**
     * Update admin profile information
     */
    public function update(Request $request)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => [
            'sometimes',
            'email',
            Rule::unique('admins')->ignore($request->user()->id)
        ],
        'current_password' => 'required_with:password|string',
        'password' => 'sometimes|confirmed|min:8'
    ]);

    $admin = $request->user();

    // Verify current password if user is trying to change password
    if ($request->has('password')) {
        if (!Hash::check($request->current_password, $admin->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 422);
        }
    }

    if ($request->has('name')) {
        $admin->name = $request->name;
    }
    if ($request->has('email')) {
            $admin->email = $request->email;
        }
        if ($request->has('password')) {
            $admin->password = Hash::make($request->password);
        }

        $admin->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'admin' => $admin
        ], 200);
    }

    /**
     * Update any admin by ID (for super admins)
     */
    public function updateAdmin(Request $request, $id)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                Rule::unique('admins')->ignore($id)
            ],
            'password' => 'sometimes|confirmed|min:8',
            'status' => 'sometimes|in:active,inactive'
        ]);

        $admin = Admin::findOrFail($id);

        if ($request->has('name')) {
            $admin->name = $request->name;
        }
        if ($request->has('email')) {
            $admin->email = $request->email;
        }
        if ($request->has('password')) {
            $admin->password = Hash::make($request->password);
        }
        if ($request->has('status')) {
            $admin->status = $request->status;
        }

        $admin->save();

        return response()->json([
            'message' => 'Admin updated successfully',
            'admin' => $admin
        ], 200);
    }

    /**
     * Delete admin account
     */
    public function destroy(Request $request)
    {
        $admin = $request->user();
        $admin->tokens()->delete();
        $admin->delete();

        return response()->json([
            'message' => 'Account deleted successfully'
        ], 200);
    }

    /**
     * Delete any admin by ID (for super admins)
     */
    public function deleteAdmin($id)
    {
        $admin = Admin::findOrFail($id);
        $admin->tokens()->delete();
        $admin->delete();

        return response()->json([
            'message' => 'Admin deleted successfully'
        ], 200);
    }

    /**
     * Admin login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $admin = Admin::where('email', $request->email)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $admin->createToken('admin-token')->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully',
            'admin' => $admin,
            'token' => $token
        ], 200);
    }

    /**
     * Admin logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ], 200);
    }
}
