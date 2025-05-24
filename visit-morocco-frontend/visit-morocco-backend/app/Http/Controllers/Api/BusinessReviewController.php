<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BusinessReview;
use App\Models\Business;
use App\Models\BusinessBooking;
use Illuminate\Support\Facades\Validator;

class BusinessReviewController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = BusinessReview::query();
            
            // Eager load relationships
            $query->with(['user', 'business']);
            
            // Filter by business if provided
            if ($request->has('business_id')) {
                $query->where('business_id', $request->business_id);
            }
            
            // Filter by user if provided
            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }
            
            // Filter by rating if provided
            if ($request->has('min_rating')) {
                $query->where('rating', '>=', $request->min_rating);
            }
            if ($request->has('max_rating')) {
                $query->where('rating', '<=', $request->max_rating);
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                $query->orderBy('created_at', 'desc');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 10);
            $reviews = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $reviews
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve reviews',
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
            // Users must be logged in to leave reviews
            if (!auth()->user()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $validator = Validator::make($request->all(), [
                'business_id' => 'required|exists:businesses,id',
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'required|string|min:10|max:1000',
                'title' => 'nullable|string|max:255',
                'visit_date' => 'nullable|date|before_or_equal:today',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Verify the business exists and is active
            $business = Business::findOrFail($request->business_id);
            if (!$business->is_approved || $business->status !== 'active') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot review an inactive business'
                ], 422);
            }
            
            // Check if user has already reviewed this business
            $existingReview = BusinessReview::where('business_id', $request->business_id)
                ->where('user_id', auth()->id())
                ->first();
            
            if ($existingReview) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You have already reviewed this business',
                    'review_id' => $existingReview->id
                ], 422);
            }
            
            // Optionally, verify if the user has actually visited/booked the business
            // This is a good practice to ensure authentic reviews
            $hasBooking = BusinessBooking::where('business_id', $request->business_id)
                ->where('user_id', auth()->id())
                ->where('status', 'completed')
                ->exists();
                
            // Create review data
            $reviewData = [
                'business_id' => $request->business_id,
                'user_id' => auth()->id(),
                'rating' => $request->rating,
                'title' => $request->title,
                'comment' => $request->comment,
                'visit_date' => $request->visit_date,
                'verified_visit' => $hasBooking,
                'status' => 'published' // Or 'pending' if you want to moderate reviews
            ];
            
            // Create review
            $review = BusinessReview::create($reviewData);
            
            // Update business average rating
            $this->updateBusinessAverageRating($request->business_id);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Review submitted successfully',
                'data' => $review->load(['user', 'business'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create review',
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
            $review = BusinessReview::with(['user', 'business'])->findOrFail($id);
            
            return response()->json([
                'status' => 'success',
                'data' => $review
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Review not found',
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
            $review = BusinessReview::findOrFail($id);
            
            // Check authorization - only the review author or admin can update
            if (!auth()->user() || 
                (auth()->id() !== $review->user_id && auth()->user()->role !== 'admin')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to update this review'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'rating' => 'sometimes|required|integer|min:1|max:5',
                'comment' => 'sometimes|required|string|min:10|max:1000',
                'title' => 'nullable|string|max:255',
                'visit_date' => 'nullable|date|before_or_equal:today',
                'status' => 'sometimes|in:published,hidden,flagged,pending',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Regular users can only update certain fields
            if (auth()->user()->role !== 'admin') {
                $updateData = $request->only(['rating', 'comment', 'title', 'visit_date']);
            } else {
                // Admins can update status as well
                $updateData = $request->only(['rating', 'comment', 'title', 'visit_date', 'status']);
            }
            
            // Update review
            $review->update($updateData);
            
            // Update business average rating if rating changed
            if ($request->has('rating')) {
                $this->updateBusinessAverageRating($review->business_id);
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'Review updated successfully',
                'data' => $review->fresh()->load(['user', 'business'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update review',
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
            $review = BusinessReview::findOrFail($id);
            
            // Check authorization - only the review author or admin can delete
            if (!auth()->user() || 
                (auth()->id() !== $review->user_id && auth()->user()->role !== 'admin')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to delete this review'
                ], 403);
            }
            
            $businessId = $review->business_id;
            
            // Delete the review
            $review->delete();
            
            // Update business average rating
            $this->updateBusinessAverageRating($businessId);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Review deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete review',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get reviews for a specific business.
     *
     * @param  string  $businessId
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getReviewsForBusiness(string $businessId, Request $request)
    {
        try {
            // Verify the business exists
            $business = Business::findOrFail($businessId);
            
            $query = BusinessReview::where('business_id', $businessId)
                ->with(['user'])
                ->where('status', 'published'); // Only show published reviews
            
            // Filter by rating if provided
            if ($request->has('min_rating')) {
                $query->where('rating', '>=', $request->min_rating);
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                $query->orderBy('created_at', 'desc'); // Newest first by default
            }
            
            // Pagination
            $perPage = $request->input('per_page', 10);
            $reviews = $query->paginate($perPage);
            
            // Get review statistics
            $stats = [
                'average_rating' => $business->average_rating,
                'total_reviews' => BusinessReview::where('business_id', $businessId)
                    ->where('status', 'published')
                    ->count(),
                'rating_breakdown' => [
                    '5' => BusinessReview::where('business_id', $businessId)
                        ->where('status', 'published')
                        ->where('rating', 5)
                        ->count(),
                    '4' => BusinessReview::where('business_id', $businessId)
                        ->where('status', 'published')
                        ->where('rating', 4)
                        ->count(),
                    '3' => BusinessReview::where('business_id', $businessId)
                        ->where('status', 'published')
                        ->where('rating', 3)
                        ->count(),
                    '2' => BusinessReview::where('business_id', $businessId)
                        ->where('status', 'published')
                        ->where('rating', 2)
                        ->count(),
                    '1' => BusinessReview::where('business_id', $businessId)
                        ->where('status', 'published')
                        ->where('rating', 1)
                        ->count(),
                ]
            ];
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'business' => $business->only(['id', 'name', 'average_rating']),
                    'stats' => $stats,
                    'reviews' => $reviews
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve reviews for this business',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get user's reviews.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMyReviews(Request $request)
    {
        try {
            // Verify authentication
            if (!auth()->user()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $query = BusinessReview::where('user_id', auth()->id())
                ->with(['business']);
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                $query->orderBy('created_at', 'desc');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 10);
            $reviews = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $reviews
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve your reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Flag a review as inappropriate.
     *
     * @param  string  $id
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function flagReview(string $id, Request $request)
    {
        try {
            // Users must be logged in to flag reviews
            if (!auth()->user()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $review = BusinessReview::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'reason' => 'required|string|max:500',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Update review's flag status (simple implementation)
            // In a real app, you might have a separate model for flagged reviews
            $review->flag_count = ($review->flag_count ?? 0) + 1;
            $review->flag_reasons = ($review->flag_reasons ? $review->flag_reasons . "\n" : '') .
                                   "Flagged by user " . auth()->id() . " on " . now()->toDateTimeString() .
                                   " for reason: " . $request->reason;
            
            // If the flag count is high, change status
            if ($review->flag_count >= 3) {
                $review->status = 'flagged';
            }
            
            $review->save();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Review has been flagged for review by moderators'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to flag review',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Helper method to update a business's average rating.
     *
     * @param  string  $businessId
     * @return void
     */
    private function updateBusinessAverageRating(string $businessId)
    {
        $business = Business::findOrFail($businessId);
        
        $avgRating = BusinessReview::where('business_id', $businessId)
            ->where('status', 'published')
            ->avg('rating');
        
        // If there are no reviews, set to 0
        $business->average_rating = $avgRating ?: 0;
        $business->save();
    }
}
