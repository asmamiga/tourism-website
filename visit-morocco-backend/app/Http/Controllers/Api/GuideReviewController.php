<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\GuideReview;
use App\Models\Guide;
use App\Models\GuideBooking;
use Illuminate\Support\Facades\Validator;

class GuideReviewController extends Controller
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
            $query = GuideReview::query();
            
            // Eager load relationships
            $query->with(['user', 'guide', 'guide.user']);
            
            // Filter by guide if provided
            if ($request->has('guide_id')) {
                $query->where('guide_id', $request->guide_id);
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
            
            // Filter by status - by default only show published
            if ($request->has('status')) {
                $query->where('status', $request->status);
            } else {
                $query->where('status', 'published');
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
                'message' => 'Failed to retrieve guide reviews',
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
                'guide_id' => 'required|exists:guides,id',
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'required|string|min:10|max:1000',
                'title' => 'nullable|string|max:255',
                'tour_date' => 'nullable|date|before_or_equal:today',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Verify the guide exists and is active
            $guide = Guide::findOrFail($request->guide_id);
            if (!$guide->is_approved || $guide->status !== 'active') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot review an inactive guide'
                ], 422);
            }
            
            // Check if user has already reviewed this guide
            $existingReview = GuideReview::where('guide_id', $request->guide_id)
                ->where('user_id', auth()->id())
                ->first();
            
            if ($existingReview) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You have already reviewed this guide',
                    'review_id' => $existingReview->id
                ], 422);
            }
            
            // Optionally, verify if the user has actually booked and completed a tour with this guide
            $hasBooking = GuideBooking::where('guide_id', $request->guide_id)
                ->where('user_id', auth()->id())
                ->where('status', 'completed')
                ->exists();
                
            // Create review data
            $reviewData = [
                'guide_id' => $request->guide_id,
                'user_id' => auth()->id(),
                'rating' => $request->rating,
                'title' => $request->title,
                'comment' => $request->comment,
                'tour_date' => $request->tour_date,
                'verified_booking' => $hasBooking,
                'status' => 'published' // Or 'pending' if you want to moderate reviews
            ];
            
            // Create review
            $review = GuideReview::create($reviewData);
            
            // Update guide average rating
            $this->updateGuideAverageRating($request->guide_id);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Review submitted successfully',
                'data' => $review->load(['user', 'guide', 'guide.user'])
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
            $review = GuideReview::with(['user', 'guide', 'guide.user'])->findOrFail($id);
            
            // Only return published reviews unless requesting user is admin, guide being reviewed, or review author
            if ($review->status !== 'published' && 
                (!auth()->user() || 
                 (auth()->user()->role !== 'admin' && 
                  auth()->id() !== $review->guide->user_id && 
                  auth()->id() !== $review->user_id))) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Review not found or not published'
                ], 404);
            }
            
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
            $review = GuideReview::findOrFail($id);
            
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
                'tour_date' => 'nullable|date|before_or_equal:today',
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
                $updateData = $request->only(['rating', 'comment', 'title', 'tour_date']);
            } else {
                // Admins can update status as well
                $updateData = $request->only(['rating', 'comment', 'title', 'tour_date', 'status']);
            }
            
            // Update review
            $review->update($updateData);
            
            // Update guide average rating if rating changed
            if ($request->has('rating')) {
                $this->updateGuideAverageRating($review->guide_id);
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'Review updated successfully',
                'data' => $review->fresh()->load(['user', 'guide', 'guide.user'])
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
            $review = GuideReview::findOrFail($id);
            
            // Check authorization - only the review author or admin can delete
            if (!auth()->user() || 
                (auth()->id() !== $review->user_id && auth()->user()->role !== 'admin')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to delete this review'
                ], 403);
            }
            
            $guideId = $review->guide_id;
            
            // Delete the review
            $review->delete();
            
            // Update guide average rating
            $this->updateGuideAverageRating($guideId);
            
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
     * Get reviews for a specific guide.
     *
     * @param  string  $guideId
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getReviewsForGuide(string $guideId, Request $request)
    {
        try {
            // Verify the guide exists
            $guide = Guide::findOrFail($guideId);
            
            $query = GuideReview::where('guide_id', $guideId)
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
                'average_rating' => $guide->average_rating,
                'total_reviews' => GuideReview::where('guide_id', $guideId)
                    ->where('status', 'published')
                    ->count(),
                'rating_breakdown' => [
                    '5' => GuideReview::where('guide_id', $guideId)
                        ->where('status', 'published')
                        ->where('rating', 5)
                        ->count(),
                    '4' => GuideReview::where('guide_id', $guideId)
                        ->where('status', 'published')
                        ->where('rating', 4)
                        ->count(),
                    '3' => GuideReview::where('guide_id', $guideId)
                        ->where('status', 'published')
                        ->where('rating', 3)
                        ->count(),
                    '2' => GuideReview::where('guide_id', $guideId)
                        ->where('status', 'published')
                        ->where('rating', 2)
                        ->count(),
                    '1' => GuideReview::where('guide_id', $guideId)
                        ->where('status', 'published')
                        ->where('rating', 1)
                        ->count(),
                ]
            ];
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'guide' => $guide->only(['id', 'user_id', 'average_rating']),
                    'stats' => $stats,
                    'reviews' => $reviews
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve reviews for this guide',
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
            
            $query = GuideReview::where('user_id', auth()->id())
                ->with(['guide', 'guide.user']);
            
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
     * Get reviews left by the guide (as a user).
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getGuideWrittenReviews(Request $request)
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
            
            // Get reviews written by this user (not reviews of the guide)
            $query = GuideReview::where('user_id', auth()->id())
                ->with(['guide', 'guide.user']);
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                $query->orderBy('created_at', 'desc');
            }
            
            $reviews = $query->get();
            
            return response()->json([
                'status' => 'success',
                'data' => $reviews
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve reviews written by you',
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
            
            $review = GuideReview::findOrFail($id);
            
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
     * Get review statistics for a guide.
     *
     * @param  string  $guideId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getGuideReviewStats(string $guideId)
    {
        try {
            // Verify the guide exists
            $guide = Guide::findOrFail($guideId);
            
            $stats = [
                'average_rating' => $guide->average_rating,
                'total_reviews' => GuideReview::where('guide_id', $guideId)
                    ->where('status', 'published')
                    ->count(),
                'verified_bookings_count' => GuideReview::where('guide_id', $guideId)
                    ->where('status', 'published')
                    ->where('verified_booking', true)
                    ->count(),
                'rating_breakdown' => [
                    '5' => GuideReview::where('guide_id', $guideId)
                        ->where('status', 'published')
                        ->where('rating', 5)
                        ->count(),
                    '4' => GuideReview::where('guide_id', $guideId)
                        ->where('status', 'published')
                        ->where('rating', 4)
                        ->count(),
                    '3' => GuideReview::where('guide_id', $guideId)
                        ->where('status', 'published')
                        ->where('rating', 3)
                        ->count(),
                    '2' => GuideReview::where('guide_id', $guideId)
                        ->where('status', 'published')
                        ->where('rating', 2)
                        ->count(),
                    '1' => GuideReview::where('guide_id', $guideId)
                        ->where('status', 'published')
                        ->where('rating', 1)
                        ->count(),
                ]
            ];
            
            // Calculate percentage for each rating
            $total = $stats['total_reviews'];
            if ($total > 0) {
                foreach ($stats['rating_breakdown'] as $rating => $count) {
                    $stats['rating_percentages'][$rating] = round(($count / $total) * 100);
                }
            } else {
                $stats['rating_percentages'] = [
                    '5' => 0,
                    '4' => 0,
                    '3' => 0,
                    '2' => 0,
                    '1' => 0,
                ];
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve review statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Helper method to update a guide's average rating.
     *
     * @param  string  $guideId
     * @return void
     */
    private function updateGuideAverageRating(string $guideId)
    {
        $guide = Guide::findOrFail($guideId);
        
        $avgRating = GuideReview::where('guide_id', $guideId)
            ->where('status', 'published')
            ->avg('rating');
        
        // If there are no reviews, set to 0
        $guide->average_rating = $avgRating ?: 0;
        $guide->save();
    }
}
