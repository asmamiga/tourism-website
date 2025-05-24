<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    /**
     * Display a list of conversations for the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getConversations(Request $request)
    {
        try {
            // User must be authenticated
            if (!auth()->check()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $userId = auth()->id();
            
            // Get conversations (users who the authenticated user has exchanged messages with)
            $conversations = DB::select("
                SELECT 
                    users.id as user_id,
                    users.first_name,
                    users.last_name,
                    users.profile_picture,
                    users.role,
                    latest_messages.content as last_message,
                    latest_messages.sent_at as last_message_time,
                    latest_messages.is_read,
                    unread_counts.unread_count
                FROM users
                INNER JOIN (
                    SELECT 
                        CASE 
                            WHEN sender_id = ? THEN receiver_id 
                            ELSE sender_id 
                        END as user_id,
                        MAX(messages.id) as max_message_id
                    FROM messages
                    WHERE sender_id = ? OR receiver_id = ?
                    GROUP BY user_id
                ) as conversations ON users.id = conversations.user_id
                INNER JOIN messages as latest_messages ON latest_messages.id = conversations.max_message_id
                LEFT JOIN (
                    SELECT 
                        sender_id,
                        COUNT(*) as unread_count
                    FROM messages
                    WHERE receiver_id = ? AND is_read = false
                    GROUP BY sender_id
                ) as unread_counts ON unread_counts.sender_id = users.id
                ORDER BY latest_messages.sent_at DESC
            ", [$userId, $userId, $userId, $userId]);
            
            // Pagination (manually since we're using a raw query)
            $page = $request->input('page', 1);
            $perPage = $request->input('per_page', 15);
            $offset = ($page - 1) * $perPage;
            
            $paginatedConversations = array_slice($conversations, $offset, $perPage);
            $total = count($conversations);
            
            $result = [
                'current_page' => (int)$page,
                'data' => $paginatedConversations,
                'from' => $offset + 1,
                'last_page' => ceil($total / $perPage),
                'per_page' => (int)$perPage,
                'to' => min($offset + $perPage, $total),
                'total' => $total,
            ];
            
            return response()->json([
                'status' => 'success',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve conversations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get messages between the authenticated user and another user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMessagesWith(Request $request, string $userId)
    {
        try {
            // User must be authenticated
            if (!auth()->check()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            // Verify the other user exists
            $otherUser = User::findOrFail($userId);
            
            $query = Message::where(function($q) use ($userId) {
                $q->where('sender_id', auth()->id())
                  ->where('receiver_id', $userId);
            })->orWhere(function($q) use ($userId) {
                $q->where('sender_id', $userId)
                  ->where('receiver_id', auth()->id());
            })->orderBy('sent_at', 'asc');
            
            // Pagination
            $perPage = $request->input('per_page', 25);
            $messages = $query->paginate($perPage);
            
            // Mark messages from other user as read
            Message::where('sender_id', $userId)
                 ->where('receiver_id', auth()->id())
                 ->where('is_read', false)
                 ->update([
                     'is_read' => true,
                     'read_at' => now()
                 ]);
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'messages' => $messages,
                    'other_user' => [
                        'id' => $otherUser->id,
                        'first_name' => $otherUser->first_name,
                        'last_name' => $otherUser->last_name,
                        'profile_picture' => $otherUser->profile_picture,
                        'role' => $otherUser->role
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve messages',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send a message to another user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendMessage(Request $request)
    {
        try {
            // User must be authenticated
            if (!auth()->check()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $validator = Validator::make($request->all(), [
                'receiver_id' => 'required|exists:users,id',
                'content' => 'required|string|max:1000',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Cannot send message to self
            if (auth()->id() == $request->receiver_id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot send message to yourself'
                ], 422);
            }
            
            $message = Message::create([
                'sender_id' => auth()->id(),
                'receiver_id' => $request->receiver_id,
                'content' => $request->content,
                'sent_at' => now(),
                'is_read' => false
            ]);
            
            // Load sender and receiver relationship for response
            $message->load(['sender', 'receiver']);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Message sent successfully',
                'data' => $message
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to send message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark message as read.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsRead(string $id)
    {
        try {
            $message = Message::findOrFail($id);
            
            // Only the receiver can mark a message as read
            if (auth()->id() !== $message->receiver_id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to update this message'
                ], 403);
            }
            
            if ($message->is_read) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Message is already marked as read',
                    'data' => $message
                ]);
            }
            
            $message->is_read = true;
            $message->read_at = now();
            $message->save();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Message marked as read',
                'data' => $message
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to mark message as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark all messages from a user as read.
     *
     * @param  string  $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAllAsRead(string $userId)
    {
        try {
            // User must be authenticated
            if (!auth()->check()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $updatedCount = Message::where('sender_id', $userId)
                ->where('receiver_id', auth()->id())
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now()
                ]);
            
            return response()->json([
                'status' => 'success',
                'message' => $updatedCount . ' messages marked as read',
                'updated_count' => $updatedCount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to mark messages as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a message.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        try {
            $message = Message::findOrFail($id);
            
            // Only sender or receiver can delete the message
            if (auth()->id() !== $message->sender_id && auth()->id() !== $message->receiver_id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to delete this message'
                ], 403);
            }
            
            $message->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Message deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete message',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Delete all messages between the authenticated user and another user.
     *
     * @param  string  $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteConversation(string $userId)
    {
        try {
            // User must be authenticated
            if (!auth()->check()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $deletedCount = Message::where(function($q) use ($userId) {
                $q->where('sender_id', auth()->id())
                  ->where('receiver_id', $userId);
            })->orWhere(function($q) use ($userId) {
                $q->where('sender_id', $userId)
                  ->where('receiver_id', auth()->id());
            })->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Conversation deleted successfully',
                'deleted_count' => $deletedCount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete conversation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get unread message count for the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUnreadCount()
    {
        try {
            // User must be authenticated
            if (!auth()->check()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $unreadCount = Message::where('receiver_id', auth()->id())
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
                'message' => 'Failed to get unread message count',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Search for users to start a conversation with.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function searchUsers(Request $request)
    {
        try {
            // User must be authenticated
            if (!auth()->check()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $validator = Validator::make($request->all(), [
                'search' => 'required|string|min:2',
                'role' => 'nullable|in:admin,business_owner,guide,tourist',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $query = User::where('id', '!=', auth()->id()) // Exclude current user
                        ->where(function($q) use ($request) {
                            $q->where('first_name', 'like', '%' . $request->search . '%')
                              ->orWhere('last_name', 'like', '%' . $request->search . '%')
                              ->orWhere('email', 'like', '%' . $request->search . '%');
                        });
            
            // Filter by role if provided
            if ($request->has('role')) {
                $query->where('role', $request->role);
            }
            
            // Pagination
            $perPage = $request->input('per_page', 15);
            $users = $query->paginate($perPage);
            
            // Transform to return only necessary fields
            $users->getCollection()->transform(function ($user) {
                return [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'profile_picture' => $user->profile_picture,
                    'role' => $user->role
                ];
            });
            
            return response()->json([
                'status' => 'success',
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to search users',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
