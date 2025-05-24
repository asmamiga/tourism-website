<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\GuideService;
use App\Models\Guide;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class GuideServiceController extends Controller
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
            $query = GuideService::query();
            
            // Eager load relationships
            $query->with(['guide', 'guide.user', 'city']);
            
            // Filter by guide if provided
            if ($request->has('guide_id')) {
                $query->where('guide_id', $request->guide_id);
            }
            
            // Filter by city if provided
            if ($request->has('city_id')) {
                $query->where('city_id', $request->city_id);
            }
            
            // Filter by service type if provided
            if ($request->has('service_type')) {
                $query->where('service_type', $request->service_type);
            }
            
            // Filter by price range
            if ($request->has('min_price')) {
                $query->where('price', '>=', $request->min_price);
            }
            if ($request->has('max_price')) {
                $query->where('price', '<=', $request->max_price);
            }
            
            // Filter by duration
            if ($request->has('min_duration')) {
                $query->where('duration_hours', '>=', $request->min_duration);
            }
            if ($request->has('max_duration')) {
                $query->where('duration_hours', '<=', $request->max_duration);
            }
            
            // Search by title or description
            if ($request->has('search')) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('title', 'like', "%{$searchTerm}%")
                      ->orWhere('description', 'like', "%{$searchTerm}%");
                });
            }
            
            // Filter by status (active/inactive)
            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            } else {
                // By default, only show active services
                $query->where('is_active', true);
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'asc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                // Default sort by price
                $query->orderBy('price', 'asc');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 10);
            $services = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $services
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve guide services',
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
            // Ensure user is authenticated as a guide
            if (!auth()->user() || auth()->user()->role !== 'guide') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Only guide users can create services.'
                ], 403);
            }
            
            // Get the user's guide profile
            $guide = Guide::where('user_id', auth()->id())->first();
            
            if (!$guide) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You must create a guide profile before adding services'
                ], 422);
            }
            
            // Check if the guide profile is approved
            if (!$guide->is_approved) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Your guide profile must be approved before adding services'
                ], 422);
            }
            
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string|min:100|max:2000',
                'city_id' => 'required|exists:cities,id',
                'service_type' => 'required|in:walking_tour,excursion,multi_day_tour,private_guide,custom',
                'price' => 'required|numeric|min:0',
                'duration_hours' => 'required|numeric|min:0.5',
                'max_participants' => 'required|integer|min:1',
                'included_items' => 'nullable|string|max:1000',
                'excluded_items' => 'nullable|string|max:1000',
                'meeting_point' => 'required|string|max:255',
                'what_to_expect' => 'required|string|min:50|max:2000',
                'service_photos' => 'nullable|array',
                'service_photos.*' => 'image|max:5120', // 5MB max per image
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Process service photos
            $photosPaths = [];
            if ($request->hasFile('service_photos')) {
                foreach ($request->file('service_photos') as $photo) {
                    $path = $photo->store('guides/service_photos', 'public');
                    $photosPaths[] = $path;
                }
            }
            
            // Create service data
            $serviceData = [
                'guide_id' => $guide->id,
                'city_id' => $request->city_id,
                'title' => $request->title,
                'description' => $request->description,
                'service_type' => $request->service_type,
                'price' => $request->price,
                'duration_hours' => $request->duration_hours,
                'max_participants' => $request->max_participants,
                'included_items' => $request->included_items,
                'excluded_items' => $request->excluded_items,
                'meeting_point' => $request->meeting_point,
                'what_to_expect' => $request->what_to_expect,
                'photos' => json_encode($photosPaths),
                'is_active' => true,
            ];
            
            // Create guide service
            $service = GuideService::create($serviceData);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Guide service created successfully',
                'data' => $service->load(['guide', 'guide.user', 'city'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create guide service',
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
            $service = GuideService::with(['guide', 'guide.user', 'city', 'guide.languages'])->findOrFail($id);
            
            // Only show active services unless the requester is the guide or an admin
            if (!$service->is_active && 
                (!auth()->user() || 
                 (auth()->id() !== $service->guide->user_id && auth()->user()->role !== 'admin'))) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Service not found or not active'
                ], 404);
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $service
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Service not found',
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
            $service = GuideService::findOrFail($id);
            
            // Get the guide associated with this service
            $guide = Guide::findOrFail($service->guide_id);
            
            // Authorization check - only the guide owner or admin can update
            if (!auth()->user() || 
                (auth()->id() !== $guide->user_id && auth()->user()->role !== 'admin')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to update this service'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string|min:100|max:2000',
                'city_id' => 'sometimes|required|exists:cities,id',
                'service_type' => 'sometimes|required|in:walking_tour,excursion,multi_day_tour,private_guide,custom',
                'price' => 'sometimes|required|numeric|min:0',
                'duration_hours' => 'sometimes|required|numeric|min:0.5',
                'max_participants' => 'sometimes|required|integer|min:1',
                'included_items' => 'nullable|string|max:1000',
                'excluded_items' => 'nullable|string|max:1000',
                'meeting_point' => 'sometimes|required|string|max:255',
                'what_to_expect' => 'sometimes|required|string|min:50|max:2000',
                'is_active' => 'sometimes|boolean',
                'new_service_photos' => 'nullable|array',
                'new_service_photos.*' => 'image|max:5120', // 5MB max per image
                'remove_photo_indices' => 'nullable|array',
                'remove_photo_indices.*' => 'integer|min:0',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Update service data
            if ($request->has('title')) $service->title = $request->title;
            if ($request->has('description')) $service->description = $request->description;
            if ($request->has('city_id')) $service->city_id = $request->city_id;
            if ($request->has('service_type')) $service->service_type = $request->service_type;
            if ($request->has('price')) $service->price = $request->price;
            if ($request->has('duration_hours')) $service->duration_hours = $request->duration_hours;
            if ($request->has('max_participants')) $service->max_participants = $request->max_participants;
            if ($request->has('included_items')) $service->included_items = $request->included_items;
            if ($request->has('excluded_items')) $service->excluded_items = $request->excluded_items;
            if ($request->has('meeting_point')) $service->meeting_point = $request->meeting_point;
            if ($request->has('what_to_expect')) $service->what_to_expect = $request->what_to_expect;
            if ($request->has('is_active')) $service->is_active = $request->boolean('is_active');
            
            // Handle photo updates
            $currentPhotos = json_decode($service->photos, true) ?: [];
            
            // Remove photos if requested
            if ($request->has('remove_photo_indices') && !empty($request->remove_photo_indices)) {
                foreach ($request->remove_photo_indices as $index) {
                    if (isset($currentPhotos[$index])) {
                        // Delete the file from storage
                        Storage::disk('public')->delete($currentPhotos[$index]);
                        unset($currentPhotos[$index]);
                    }
                }
                // Re-index the array
                $currentPhotos = array_values($currentPhotos);
            }
            
            // Add new photos if provided
            if ($request->hasFile('new_service_photos')) {
                foreach ($request->file('new_service_photos') as $photo) {
                    $path = $photo->store('guides/service_photos', 'public');
                    $currentPhotos[] = $path;
                }
            }
            
            // Update the photos JSON field
            $service->photos = json_encode($currentPhotos);
            
            $service->save();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Guide service updated successfully',
                'data' => $service->fresh()->load(['guide', 'guide.user', 'city'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update guide service',
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
            $service = GuideService::findOrFail($id);
            
            // Get the guide associated with this service
            $guide = Guide::findOrFail($service->guide_id);
            
            // Authorization check - only the guide owner or admin can delete
            if (!auth()->user() || 
                (auth()->id() !== $guide->user_id && auth()->user()->role !== 'admin')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to delete this service'
                ], 403);
            }
            
            // Delete service photos
            $photos = json_decode($service->photos, true) ?: [];
            foreach ($photos as $photo) {
                Storage::disk('public')->delete($photo);
            }
            
            // Delete the service
            $service->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Guide service deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete guide service',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get services for a specific city.
     *
     * @param  string  $cityId
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getServicesByCity(string $cityId, Request $request)
    {
        try {
            $query = GuideService::where('city_id', $cityId)
                ->where('is_active', true)
                ->with(['guide', 'guide.user', 'city', 'guide.languages']);
            
            // Filter by service type if provided
            if ($request->has('service_type')) {
                $query->where('service_type', $request->service_type);
            }
            
            // Filter by price range
            if ($request->has('min_price')) {
                $query->where('price', '>=', $request->min_price);
            }
            if ($request->has('max_price')) {
                $query->where('price', '<=', $request->max_price);
            }
            
            // Filter by duration
            if ($request->has('min_duration')) {
                $query->where('duration_hours', '>=', $request->min_duration);
            }
            if ($request->has('max_duration')) {
                $query->where('duration_hours', '<=', $request->max_duration);
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'asc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                // Default sort by price
                $query->orderBy('price', 'asc');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 10);
            $services = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $services
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve services for this city',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get services for a specific guide.
     *
     * @param  string  $guideId
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getServicesByGuide(string $guideId, Request $request)
    {
        try {
            // Verify the guide exists
            $guide = Guide::findOrFail($guideId);
            
            $query = GuideService::where('guide_id', $guideId)
                ->with(['city']);
            
            // Only include active services for non-owners
            if (!auth()->user() || 
                (auth()->id() !== $guide->user_id && auth()->user()->role !== 'admin')) {
                $query->where('is_active', true);
            }
            
            // Filter by service type if provided
            if ($request->has('service_type')) {
                $query->where('service_type', $request->service_type);
            }
            
            // Filter by city if provided
            if ($request->has('city_id')) {
                $query->where('city_id', $request->city_id);
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'asc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                // Default sort by price
                $query->orderBy('price', 'asc');
            }
            
            // Get all services without pagination for the guide's services page
            $services = $query->get();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'guide' => $guide->load(['user']),
                    'services' => $services
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve services for this guide',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get the authenticated guide's services.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMyServices(Request $request)
    {
        try {
            // Verify authentication and role
            if (!auth()->user() || auth()->user()->role !== 'guide') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Only guide users can access this endpoint.'
                ], 403);
            }
            
            // Get the guide profile
            $guide = Guide::where('user_id', auth()->id())->first();
            
            if (!$guide) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You do not have a guide profile yet'
                ], 404);
            }
            
            $query = GuideService::where('guide_id', $guide->id)
                ->with(['city']);
            
            // Filter by active status if provided
            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }
            
            // Filter by service type if provided
            if ($request->has('service_type')) {
                $query->where('service_type', $request->service_type);
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'asc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                // Default sort by creation date (newest first)
                $query->orderBy('created_at', 'desc');
            }
            
            $services = $query->get();
            
            return response()->json([
                'status' => 'success',
                'data' => $services
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve your services',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
