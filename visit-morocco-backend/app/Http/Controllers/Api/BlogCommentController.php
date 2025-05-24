<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BlogComment;
use App\Models\BlogPost;
use Illuminate\Support\Facades\Validator;

class BlogCommentController extends Controller
{
    /**
     * Display a listing of comments for a blog post.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $postId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request, string $postId)
    {
        try {
            // Verify post exists
            $post = BlogPost::findOrFail($postId);
            
            $query = BlogComment::where('post_id', $postId);
            
            // With relationships
            $query->with('user');
            
            // For non-admin users, only show approved comments
            if (!auth()->check() || auth()->user()->role !== 'admin') {
                $query->where('is_approved', true);
            } else if ($request->has('is_approved')) {
                // Filter by approval status for admin
                $query->where('is_approved', $request->boolean('is_approved'));
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                // Default newest first
                $query->orderBy('created_at', 'desc');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 15);
            $comments = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $comments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve blog comments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created comment for a blog post.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $postId
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, string $postId)
    {
        try {
            // User must be logged in to comment
            if (!auth()->check()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            // Verify post exists and is published
            $post = BlogPost::where('id', $postId)
                           ->where('status', 'published')
                           ->firstOrFail();
            
            $validator = Validator::make($request->all(), [
                'content' => 'required|string|min:3|max:1000',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Determine if comment requires approval
            $requiresApproval = true;
            
            // Auto-approve for admins or the post author
            if (auth()->user()->role === 'admin' || auth()->id() === $post->author_id) {
                $requiresApproval = false;
            }
            
            $comment = BlogComment::create([
                'post_id' => $postId,
                'user_id' => auth()->id(),
                'content' => $request->content,
                'is_approved' => !$requiresApproval,
                'created_at' => now()
            ]);
            
            // Load user relationship for response
            $comment->load('user');
            
            return response()->json([
                'status' => 'success',
                'message' => $requiresApproval ? 
                    'Comment submitted successfully and awaiting approval' : 
                    'Comment posted successfully',
                'data' => $comment
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to post comment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified comment.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        try {
            $comment = BlogComment::with('user', 'post')->findOrFail($id);
            
            // For non-admin users, only allow viewing approved comments
            if ((!auth()->check() || auth()->user()->role !== 'admin') && !$comment->is_approved) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Comment not found or pending approval'
                ], 404);
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $comment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Comment not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified comment.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id)
    {
        try {
            $comment = BlogComment::findOrFail($id);
            
            // Only allow comment author or admin to update
            if (auth()->id() !== $comment->user_id && auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to update this comment'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'content' => 'sometimes|required|string|min:3|max:1000',
                'is_approved' => 'sometimes|boolean',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $updateData = [];
            
            // Users can only update content
            if ($request->has('content') && auth()->id() === $comment->user_id) {
                $updateData['content'] = $request->content;
                
                // Reset approval if regular user edits their comment
                if (auth()->user()->role !== 'admin') {
                    $updateData['is_approved'] = false;
                }
            }
            
            // Only admins can change approval status
            if (auth()->user()->role === 'admin') {
                if ($request->has('content')) {
                    $updateData['content'] = $request->content;
                }
                
                if ($request->has('is_approved')) {
                    $updateData['is_approved'] = $request->boolean('is_approved');
                }
            }
            
            $comment->update($updateData);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Comment updated successfully',
                'data' => $comment->fresh()->load('user')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update comment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified comment.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        try {
            $comment = BlogComment::findOrFail($id);
            
            // Only allow comment author or admin to delete
            if (auth()->id() !== $comment->user_id && auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to delete this comment'
                ], 403);
            }
            
            $comment->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Comment deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete comment',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Approve or reject a comment.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function approveReject(Request $request, string $id)
    {
        try {
            // Only admin can approve/reject comments
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'is_approved' => 'required|boolean',
                'rejection_reason' => 'nullable|string|required_if:is_approved,false',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $comment = BlogComment::findOrFail($id);
            
            $comment->is_approved = $request->boolean('is_approved');
            $comment->rejection_reason = $request->input('rejection_reason');
            $comment->save();
            
            return response()->json([
                'status' => 'success',
                'message' => $request->boolean('is_approved') ? 
                    'Comment has been approved' : 
                    'Comment has been rejected',
                'data' => $comment->fresh()->load('user')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to process approval/rejection',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get comments awaiting approval (admin only).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPendingComments(Request $request)
    {
        try {
            // Only admin can see pending comments
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            $query = BlogComment::where('is_approved', false)
                              ->with(['user', 'post']);
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                // Default oldest first for moderation
                $query->orderBy('created_at', 'asc');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 15);
            $comments = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $comments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve pending comments',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get comments by user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserComments(Request $request, string $userId)
    {
        try {
            $query = BlogComment::where('user_id', $userId)
                              ->with('post');
            
            // For non-admin users, only show approved comments
            // Unless viewing your own comments
            if ((!auth()->check() || auth()->user()->role !== 'admin') && 
                auth()->id() != $userId) {
                $query->where('is_approved', true);
            } else if ($request->has('is_approved')) {
                // Filter by approval status when allowed
                $query->where('is_approved', $request->boolean('is_approved'));
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                $query->orderBy('created_at', 'desc');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 15);
            $comments = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $comments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve user comments',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get authenticated user's comments.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMyComments(Request $request)
    {
        try {
            if (!auth()->check()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            return $this->getUserComments($request, auth()->id());
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve your comments',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
