<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $fields = $request->validate([
            'name'=> 'required|max:255',
            'email' => 'required|email|unique:admins',
            'password' => 'required|confirmed',
        ]);

        // Hash password before creating admin
        $fields['password'] = Hash::make($fields['password']);

        $admin = Admin::create($fields);

        $token = $admin->createToken($request->name);
        return [
            'admin' => $admin,
            'token' => $token->plainTextToken
        ];
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:admins',
            'password' => 'required'
        ]);

        $admin = Admin::where('email', $request->email)->first();

        // Fixed password check logic
        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return [
                'message' => 'Invalid credentials'
            ];
        }

        $token = $admin->createToken($request->email);
        return [
            'admin' => $admin,
            'token' => $token->plainTextToken
        ];
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return [
            'message' => "you're Logged out"
        ];
    }
}
