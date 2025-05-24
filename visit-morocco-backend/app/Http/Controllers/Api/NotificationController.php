<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    /**
     * Display a listing of the user's notifications.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            // User must be authenticated
            if (!auth()->check()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $query = Notification::where('user_id', auth()->id());
            
            // Filter by read status if provided
            if ($request->has('is_read')) {
                $query->where('is_read', $request->boolean('is_read'));
            }
            
            // Filter by type if provided
            if ($request->has('type')) {
                $query->where('type', $request->type);
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
            $notifications = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $notifications,
                'meta' => [
                    'unread_count' => Notification::where('user_id', auth()->id())
                        ->where('is_read', false)
                        ->count()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created notification.
     * 
     * Typically used by admin to send notifications to users.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            // Only admin can create notifications for others
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'type' => 'required|string|max:50',
                'content' => 'required|string',
                'related_entity_type' => 'nullable|string|max:20',
                'related_entity_id' => 'nullable|integer',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $notification = Notification::create([
                'user_id' => $request->user_id,
                'type' => $request->type,
                'content' => $request->content,
                'related_entity_type' => $request->related_entity_type,
                'related_entity_id' => $request->related_entity_id,
                'created_at' => now(),
                'is_read' => false
            ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Notification created successfully',
                'data' => $notification
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified notification.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        try {
            $notification = Notification::findOrFail($id);
            
            // User can only view their own notifications
            if (auth()->id() !== $notification->user_id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to view this notification'
                ], 403);
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $notification
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Notification not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Mark a notification as read.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsRead(string $id)
    {
        try {
            $notification = Notification::findOrFail($id);
            
            // User can only update their own notifications
            if (auth()->id() !== $notification->user_id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to update this notification'
                ], 403);
            }
            
            if ($notification->is_read) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Notification is already marked as read',
                    'data' => $notification
                ]);
            }
            
            $notification->is_read = true;
            $notification->read_at = now();
            $notification->save();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Notification marked as read',
                'data' => $notification
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to mark notification as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark multiple notifications as read.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function markMultipleAsRead(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'notification_ids' => 'required|array',
                'notification_ids.*' => 'required|integer|exists:notifications,id',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $updatedCount = Notification::whereIn('id', $request->notification_ids)
                ->where('user_id', auth()->id())
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now()
                ]);
            
            return response()->json([
                'status' => 'success',
                'message' => $updatedCount . ' notifications marked as read',
                'updated_count' => $updatedCount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to mark notifications as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark all notifications as read for the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAllAsRead()
    {
        try {
            $updatedCount = Notification::where('user_id', auth()->id())
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now()
                ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'All notifications marked as read',
                'updated_count' => $updatedCount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to mark all notifications as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified notification.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        try {
            $notification = Notification::findOrFail($id);
            
            // User can only delete their own notifications
            if (auth()->id() !== $notification->user_id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to delete this notification'
                ], 403);
            }
            
            $notification->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Notification deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Delete all notifications for the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteAll()
    {
        try {
            $deletedCount = Notification::where('user_id', auth()->id())->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'All notifications deleted successfully',
                'deleted_count' => $deletedCount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete all notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Delete multiple notifications.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteMultiple(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'notification_ids' => 'required|array',
                'notification_ids.*' => 'required|integer|exists:notifications,id',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $deletedCount = Notification::whereIn('id', $request->notification_ids)
                ->where('user_id', auth()->id())
                ->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => $deletedCount . ' notifications deleted successfully',
                'deleted_count' => $deletedCount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get unread notification count for the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUnreadCount()
    {
        try {
            $unreadCount = Notification::where('user_id', auth()->id())
                ->where('is_read', false)
                ->count();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'unread_count' => $unreadCount
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get unread notification count',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Create notifications for multiple users.
     * 
     * Admin-only endpoint used for broadcasting notifications.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createBulk(Request $request)
    {
        try {
            // Only admin can create notifications for others
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'user_ids' => 'required|array',
                'user_ids.*' => 'required|integer|exists:users,id',
                'type' => 'required|string|max:50',
                'content' => 'required|string',
                'related_entity_type' => 'nullable|string|max:20',
                'related_entity_id' => 'nullable|integer',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $created = 0;
            
            foreach ($request->user_ids as $userId) {
                Notification::create([
                    'user_id' => $userId,
                    'type' => $request->type,
                    'content' => $request->content,
                    'related_entity_type' => $request->related_entity_type,
                    'related_entity_id' => $request->related_entity_id,
                    'created_at' => now(),
                    'is_read' => false
                ]);
                
                $created++;
            }
            
            return response()->json([
                'status' => 'success',
                'message' => $created . ' notifications created successfully',
                'created_count' => $created
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
