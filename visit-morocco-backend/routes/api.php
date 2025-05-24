<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Tourism data public routes
Route::get('/regions', 'App\Http\Controllers\Api\RegionController@index');
Route::get('/regions/{id}', 'App\Http\Controllers\Api\RegionController@show');
Route::get('/cities', 'App\Http\Controllers\Api\CityController@index');
Route::get('/cities/{id}', 'App\Http\Controllers\Api\CityController@show');
Route::get('/attractions', 'App\Http\Controllers\Api\AttractionController@index');
Route::get('/attractions/{id}', 'App\Http\Controllers\Api\AttractionController@show');
Route::get('/businesses', 'App\Http\Controllers\Api\BusinessController@index');
Route::get('/businesses/{id}', 'App\Http\Controllers\Api\BusinessController@show');
Route::get('/guides', 'App\Http\Controllers\Api\GuideController@index');
Route::get('/guides/{id}', 'App\Http\Controllers\Api\GuideController@show');
Route::get('/blog-posts', 'App\Http\Controllers\Api\BlogPostController@index');
Route::get('/blog-posts/{id}', 'App\Http\Controllers\Api\BlogPostController@show');

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    
    // User routes
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);

    // Business owner routes
    Route::middleware('role:business_owner,admin')->group(function () {
        Route::post('/businesses', 'App\Http\Controllers\Api\BusinessController@store');
        Route::put('/businesses/{id}', 'App\Http\Controllers\Api\BusinessController@update');
        Route::delete('/businesses/{id}', 'App\Http\Controllers\Api\BusinessController@destroy');
        Route::post('/businesses/{id}/photos', 'App\Http\Controllers\Api\BusinessController@addPhoto');
        Route::delete('/businesses/{id}/photos/{photoId}', 'App\Http\Controllers\Api\BusinessController@deletePhoto');
    });

    // Guide routes
    Route::middleware('role:guide,admin')->group(function () {
        Route::post('/guide-services', 'App\Http\Controllers\Api\GuideServiceController@store');
        Route::put('/guide-services/{id}', 'App\Http\Controllers\Api\GuideServiceController@update');
        Route::delete('/guide-services/{id}', 'App\Http\Controllers\Api\GuideServiceController@destroy');
        Route::post('/guide-services/{id}/photos', 'App\Http\Controllers\Api\GuideServiceController@addPhoto');
        Route::delete('/guide-services/{id}/photos/{photoId}', 'App\Http\Controllers\Api\GuideServiceController@deletePhoto');
        Route::post('/guide-availability', 'App\Http\Controllers\Api\GuideAvailabilityController@store');
        Route::put('/guide-availability/{id}', 'App\Http\Controllers\Api\GuideAvailabilityController@update');
        Route::delete('/guide-availability/{id}', 'App\Http\Controllers\Api\GuideAvailabilityController@destroy');
    });

    // Booking routes
    Route::post('/business-bookings', 'App\Http\Controllers\Api\BusinessBookingController@store');
    Route::get('/business-bookings', 'App\Http\Controllers\Api\BusinessBookingController@index');
    Route::get('/business-bookings/{id}', 'App\Http\Controllers\Api\BusinessBookingController@show');
    Route::put('/business-bookings/{id}', 'App\Http\Controllers\Api\BusinessBookingController@update');
    Route::delete('/business-bookings/{id}', 'App\Http\Controllers\Api\BusinessBookingController@destroy');
    
    Route::post('/guide-bookings', 'App\Http\Controllers\Api\GuideBookingController@store');
    Route::get('/guide-bookings', 'App\Http\Controllers\Api\GuideBookingController@index');
    Route::get('/guide-bookings/{id}', 'App\Http\Controllers\Api\GuideBookingController@show');
    Route::put('/guide-bookings/{id}', 'App\Http\Controllers\Api\GuideBookingController@update');
    Route::delete('/guide-bookings/{id}', 'App\Http\Controllers\Api\GuideBookingController@destroy');

    // Review routes
    Route::post('/business-reviews', 'App\Http\Controllers\Api\BusinessReviewController@store');
    Route::put('/business-reviews/{id}', 'App\Http\Controllers\Api\BusinessReviewController@update');
    Route::delete('/business-reviews/{id}', 'App\Http\Controllers\Api\BusinessReviewController@destroy');
    
    Route::post('/guide-reviews', 'App\Http\Controllers\Api\GuideReviewController@store');
    Route::put('/guide-reviews/{id}', 'App\Http\Controllers\Api\GuideReviewController@update');
    Route::delete('/guide-reviews/{id}', 'App\Http\Controllers\Api\GuideReviewController@destroy');

    // Itinerary routes
    Route::post('/itineraries', 'App\Http\Controllers\Api\ItineraryController@store');
    Route::get('/itineraries', 'App\Http\Controllers\Api\ItineraryController@index');
    Route::get('/itineraries/{id}', 'App\Http\Controllers\Api\ItineraryController@show');
    Route::put('/itineraries/{id}', 'App\Http\Controllers\Api\ItineraryController@update');
    Route::delete('/itineraries/{id}', 'App\Http\Controllers\Api\ItineraryController@destroy');

    // Admin-only routes
    Route::middleware('role:admin')->group(function () {
        Route::post('/regions', 'App\Http\Controllers\Api\RegionController@store');
        Route::put('/regions/{id}', 'App\Http\Controllers\Api\RegionController@update');
        Route::delete('/regions/{id}', 'App\Http\Controllers\Api\RegionController@destroy');
        
        Route::post('/cities', 'App\Http\Controllers\Api\CityController@store');
        Route::put('/cities/{id}', 'App\Http\Controllers\Api\CityController@update');
        Route::delete('/cities/{id}', 'App\Http\Controllers\Api\CityController@destroy');
        
        Route::post('/attractions', 'App\Http\Controllers\Api\AttractionController@store');
        Route::put('/attractions/{id}', 'App\Http\Controllers\Api\AttractionController@update');
        Route::delete('/attractions/{id}', 'App\Http\Controllers\Api\AttractionController@destroy');

        Route::post('/blog-posts', 'App\Http\Controllers\Api\BlogPostController@store');
        Route::put('/blog-posts/{id}', 'App\Http\Controllers\Api\BlogPostController@update');
        Route::delete('/blog-posts/{id}', 'App\Http\Controllers\Api\BlogPostController@destroy');
        
        // User management
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });
});
