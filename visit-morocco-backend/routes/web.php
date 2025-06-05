<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;

Route::get('/', function () {
    return view('welcome');
});

// Temporary route to check admin users
Route::get('/check-admins', function () {
    $admins = DB::table('admins')->select('id', 'name', 'email')->get();
    return response()->json($admins);
});

// Temporary route to create flight admin user
Route::get('/create-flight-admin', function () {
    // Check if admin exists
    $admin = Admin::where('email', 'flight@admin.com')->first();
    
    if (!$admin) {
        // Create new admin
        $admin = new Admin();
        $admin->name = 'Flight Admin';
        $admin->email = 'flight@admin.com';
    }
    
    // Set/update password
    $admin->password = Hash::make('flightadmin123');
    $admin->save();
    
    return [
        'message' => 'Flight admin user created/updated successfully!',
        'email' => 'flight@admin.com',
        'password' => 'flightadmin123'
    ];
});
