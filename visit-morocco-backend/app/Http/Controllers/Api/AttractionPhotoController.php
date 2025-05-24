<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attraction;
use App\Models\AttractionPhoto;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class AttractionPhotoController extends Controller
{
    /**
     * Display a listing of photos for an attraction.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $attractionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request, string $attractionId)
    {
        try {
            // Verify attraction exists
            $attraction = Attraction::findOrFail($attractionId);
            
            $query = AttractionPhoto::where('attraction_id', $attractionId);
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                // Default: primary photo first, then newest uploads
                $query->orderBy('is_primary', 'desc')
                      ->orderBy('upload_date', 'desc');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 20);
            $photos = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $photos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve attraction photos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created photo for an attraction.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $attractionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, string $attractionId)
    {
        try {
            // Verify attraction exists
            $attraction = Attraction::findOrFail($attractionId);
            
            // Check if user is authorized to add photos
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to add photos to this attraction'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'photo' => 'required|image|max:5120', // 5MB max
                'caption' => 'nullable|string|max:255',
                'is_primary' => 'nullable|boolean',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Handle file upload
            $path = $request->file('photo')->store('attraction-photos', 'public');
            
            // If this is set as primary photo, update other photos
            if ($request->boolean('is_primary', false)) {
                AttractionPhoto::where('attraction_id', $attractionId)
                    ->update(['is_primary' => false]);
            }
            
            // Create photo record
            $photo = AttractionPhoto::create([
                'attraction_id' => $attractionId,
                'photo_url' => $path,
                'caption' => $request->caption,
                'is_primary' => $request->boolean('is_primary', false),
                'upload_date' => now()
            ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Photo uploaded successfully',
                'data' => $photo
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to upload photo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified photo.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        try {
            $photo = AttractionPhoto::findOrFail($id);
            
            return response()->json([
                'status' => 'success',
                'data' => $photo
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Photo not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified photo.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id)
    {
        try {
            $photo = AttractionPhoto::findOrFail($id);
            
            // Check if user is authorized to update this photo
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to update this photo'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'caption' => 'nullable|string|max:255',
                'is_primary' => 'nullable|boolean',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $updateData = [];
            
            if ($request->has('caption')) {
                $updateData['caption'] = $request->caption;
            }
            
            // If this is set as primary photo, update other photos
            if ($request->has('is_primary') && $request->boolean('is_primary')) {
                AttractionPhoto::where('attraction_id', $photo->attraction_id)
                    ->update(['is_primary' => false]);
                $updateData['is_primary'] = true;
            }
            
            $photo->update($updateData);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Photo updated successfully',
                'data' => $photo->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update photo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified photo.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        try {
            $photo = AttractionPhoto::findOrFail($id);
            
            // Check if user is authorized to delete this photo
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to delete this photo'
                ], 403);
            }
            
            // Delete the file from storage
            Storage::disk('public')->delete($photo->photo_url);
            
            // If this was the primary photo and there are other photos,
            // set a new primary photo
            if ($photo->is_primary) {
                $newPrimary = AttractionPhoto::where('attraction_id', $photo->attraction_id)
                    ->where('id', '!=', $id)
                    ->first();
                
                if ($newPrimary) {
                    $newPrimary->is_primary = true;
                    $newPrimary->save();
                }
            }
            
            // Delete the record
            $photo->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Photo deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete photo',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Batch upload multiple photos for an attraction.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $attractionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function batchUpload(Request $request, string $attractionId)
    {
        try {
            // Verify attraction exists
            $attraction = Attraction::findOrFail($attractionId);
            
            // Check if user is authorized to add photos
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to add photos to this attraction'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'photos' => 'required|array|min:1|max:10',
                'photos.*' => 'required|image|max:5120', // 5MB max per image
                'captions' => 'nullable|array',
                'captions.*' => 'nullable|string|max:255',
                'primary_index' => 'nullable|integer|min:0',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $uploadedPhotos = [];
            
            // If setting a primary photo, clear existing primary flag
            $primaryIndex = $request->input('primary_index', -1);
            if ($primaryIndex >= 0 && $primaryIndex < count($request->file('photos'))) {
                AttractionPhoto::where('attraction_id', $attractionId)
                    ->update(['is_primary' => false]);
            }
            
            // Process each photo
            foreach ($request->file('photos') as $index => $photoFile) {
                $path = $photoFile->store('attraction-photos', 'public');
                
                $caption = isset($request->captions[$index]) ? $request->captions[$index] : null;
                $isPrimary = ($index == $primaryIndex);
                
                $photo = AttractionPhoto::create([
                    'attraction_id' => $attractionId,
                    'photo_url' => $path,
                    'caption' => $caption,
                    'is_primary' => $isPrimary,
                    'upload_date' => now()
                ]);
                
                $uploadedPhotos[] = $photo;
            }
            
            return response()->json([
                'status' => 'success',
                'message' => count($uploadedPhotos) . ' photos uploaded successfully',
                'data' => $uploadedPhotos
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to upload photos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Set a photo as the primary photo for an attraction.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function setPrimary(string $id)
    {
        try {
            $photo = AttractionPhoto::findOrFail($id);
            
            // Check if user is authorized to update this photo
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to update this photo'
                ], 403);
            }
            
            // Update all photos for this attraction
            AttractionPhoto::where('attraction_id', $photo->attraction_id)
                ->update(['is_primary' => false]);
            
            // Set this photo as primary
            $photo->is_primary = true;
            $photo->save();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Photo set as primary successfully',
                'data' => $photo->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to set primary photo',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
