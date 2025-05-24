<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ReviewPhoto;
use App\Models\BusinessReview;
use App\Models\GuideReview;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ReviewPhotoController extends Controller
{
    /**
     * Display a listing of photos for a review.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $reviewId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request, string $reviewId)
    {
        try {
            // Validate review type parameter
            $validator = Validator::make($request->all(), [
                'review_type' => 'required|in:business,guide',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Verify review exists based on type
            if ($request->review_type === 'business') {
                BusinessReview::findOrFail($reviewId);
            } else {
                GuideReview::findOrFail($reviewId);
            }
            
            $query = ReviewPhoto::where('review_id', $reviewId)
                             ->where('review_type', $request->review_type);
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                $query->orderBy('upload_date', 'desc');
            }
            
            $photos = $query->get();
            
            return response()->json([
                'status' => 'success',
                'data' => $photos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve review photos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created photo for a review.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $reviewId
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, string $reviewId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'photo' => 'required|image|max:5120', // 5MB max
                'caption' => 'nullable|string|max:255',
                'review_type' => 'required|in:business,guide',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Verify review exists and user is authorized
            if ($request->review_type === 'business') {
                $review = BusinessReview::findOrFail($reviewId);
            } else {
                $review = GuideReview::findOrFail($reviewId);
            }
            
            // Only the review author or admin can add photos
            if (auth()->id() !== $review->user_id && auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to add photos to this review'
                ], 403);
            }
            
            // Handle file upload
            $path = $request->file('photo')->store('review-photos', 'public');
            
            // Create photo record
            $photo = ReviewPhoto::create([
                'review_id' => $reviewId,
                'review_type' => $request->review_type,
                'photo_url' => $path,
                'caption' => $request->caption,
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
            $photo = ReviewPhoto::findOrFail($id);
            
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
            $photo = ReviewPhoto::findOrFail($id);
            
            // Get the associated review
            if ($photo->review_type === 'business') {
                $review = BusinessReview::findOrFail($photo->review_id);
            } else {
                $review = GuideReview::findOrFail($photo->review_id);
            }
            
            // Only the review author or admin can update photos
            if (auth()->id() !== $review->user_id && auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to update this photo'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'caption' => 'nullable|string|max:255',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            if ($request->has('caption')) {
                $photo->caption = $request->caption;
                $photo->save();
            }
            
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
            $photo = ReviewPhoto::findOrFail($id);
            
            // Get the associated review
            if ($photo->review_type === 'business') {
                $review = BusinessReview::findOrFail($photo->review_id);
            } else {
                $review = GuideReview::findOrFail($photo->review_id);
            }
            
            // Only the review author or admin can delete photos
            if (auth()->id() !== $review->user_id && auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to delete this photo'
                ], 403);
            }
            
            // Delete the file from storage
            Storage::disk('public')->delete($photo->photo_url);
            
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
     * Batch upload multiple photos for a review.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $reviewId
     * @return \Illuminate\Http\JsonResponse
     */
    public function batchUpload(Request $request, string $reviewId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'photos' => 'required|array|min:1|max:5', // Max 5 photos per review
                'photos.*' => 'required|image|max:5120', // 5MB max per image
                'captions' => 'nullable|array',
                'captions.*' => 'nullable|string|max:255',
                'review_type' => 'required|in:business,guide',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Verify review exists and user is authorized
            if ($request->review_type === 'business') {
                $review = BusinessReview::findOrFail($reviewId);
            } else {
                $review = GuideReview::findOrFail($reviewId);
            }
            
            // Only the review author or admin can add photos
            if (auth()->id() !== $review->user_id && auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to add photos to this review'
                ], 403);
            }
            
            // Check if review already has photos (limit to max 5 total)
            $existingPhotoCount = ReviewPhoto::where('review_id', $reviewId)
                                         ->where('review_type', $request->review_type)
                                         ->count();
                                         
            $maxNewPhotos = 5 - $existingPhotoCount;
            
            if ($maxNewPhotos <= 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Maximum number of photos (5) already reached for this review'
                ], 422);
            }
            
            if (count($request->file('photos')) > $maxNewPhotos) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You can only add ' . $maxNewPhotos . ' more photos to this review'
                ], 422);
            }
            
            $uploadedPhotos = [];
            
            // Process each photo
            foreach ($request->file('photos') as $index => $photoFile) {
                $path = $photoFile->store('review-photos', 'public');
                
                $caption = isset($request->captions[$index]) ? $request->captions[$index] : null;
                
                $photo = ReviewPhoto::create([
                    'review_id' => $reviewId,
                    'review_type' => $request->review_type,
                    'photo_url' => $path,
                    'caption' => $caption,
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
}
