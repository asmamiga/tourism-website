<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Favorite;
use App\Models\Business;
use App\Models\Guide;
use App\Models\Attraction;
use Illuminate\Support\Facades\Validator;

class FavoriteController extends Controller
{
    /**
     * Display a listing of the user's favorites.
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
            
            $query = Favorite::where('user_id', auth()->id());
            
            // Filter by entity type if provided
            if ($request->has('entity_type')) {
                $query->where('entity_type', $request->entity_type);
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
            $favorites = $query->paginate($perPage);
            
            // Load entity data for each favorite
            $favorites->getCollection()->transform(function ($favorite) {
                $entityData = $this->getEntityData($favorite->entity_type, $favorite->entity_id);
                $favorite->entity = $entityData;
                return $favorite;
            });
            
            return response()->json([
                'status' => 'success',
                'data' => $favorites
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve favorites',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created favorite.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
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
                'entity_type' => 'required|in:business,guide,attraction',
                'entity_id' => 'required|integer',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Verify the entity exists
            $entityExists = $this->verifyEntityExists($request->entity_type, $request->entity_id);
            if (!$entityExists) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Entity not found or invalid'
                ], 404);
            }
            
            // Check if already favorited
            $existingFavorite = Favorite::where('user_id', auth()->id())
                ->where('entity_type', $request->entity_type)
                ->where('entity_id', $request->entity_id)
                ->first();
            
            if ($existingFavorite) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'This item is already in your favorites',
                    'data' => $existingFavorite
                ], 422);
            }
            
            // Create favorite
            $favorite = Favorite::create([
                'user_id' => auth()->id(),
                'entity_type' => $request->entity_type,
                'entity_id' => $request->entity_id,
                'created_at' => now()
            ]);
            
            // Load entity data
            $entityData = $this->getEntityData($favorite->entity_type, $favorite->entity_id);
            $favorite->entity = $entityData;
            
            return response()->json([
                'status' => 'success',
                'message' => 'Item added to favorites successfully',
                'data' => $favorite
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to add to favorites',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if an item is in the user's favorites.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function check(Request $request)
    {
        try {
            // User must be authenticated
            if (!auth()->check()) {
                return response()->json([
                    'status' => 'success',
                    'is_favorite' => false
                ]);
            }
            
            $validator = Validator::make($request->all(), [
                'entity_type' => 'required|in:business,guide,attraction',
                'entity_id' => 'required|integer',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Check if in favorites
            $isFavorite = Favorite::where('user_id', auth()->id())
                ->where('entity_type', $request->entity_type)
                ->where('entity_id', $request->entity_id)
                ->exists();
            
            return response()->json([
                'status' => 'success',
                'is_favorite' => $isFavorite
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to check favorite status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified favorite.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        try {
            // User must be authenticated
            if (!auth()->check()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $favorite = Favorite::findOrFail($id);
            
            // Verify ownership
            if ($favorite->user_id !== auth()->id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to remove this favorite'
                ], 403);
            }
            
            $favorite->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Item removed from favorites successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to remove from favorites',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Toggle favorite status for an entity.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggle(Request $request)
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
                'entity_type' => 'required|in:business,guide,attraction',
                'entity_id' => 'required|integer',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Verify the entity exists
            $entityExists = $this->verifyEntityExists($request->entity_type, $request->entity_id);
            if (!$entityExists) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Entity not found or invalid'
                ], 404);
            }
            
            // Check if already favorited
            $existingFavorite = Favorite::where('user_id', auth()->id())
                ->where('entity_type', $request->entity_type)
                ->where('entity_id', $request->entity_id)
                ->first();
            
            if ($existingFavorite) {
                // Remove from favorites
                $existingFavorite->delete();
                
                return response()->json([
                    'status' => 'success',
                    'message' => 'Item removed from favorites successfully',
                    'is_favorite' => false
                ]);
            } else {
                // Add to favorites
                $favorite = Favorite::create([
                    'user_id' => auth()->id(),
                    'entity_type' => $request->entity_type,
                    'entity_id' => $request->entity_id,
                    'created_at' => now()
                ]);
                
                // Load entity data
                $entityData = $this->getEntityData($favorite->entity_type, $favorite->entity_id);
                $favorite->entity = $entityData;
                
                return response()->json([
                    'status' => 'success',
                    'message' => 'Item added to favorites successfully',
                    'is_favorite' => true,
                    'data' => $favorite
                ], 201);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to toggle favorite status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get favorites by entity type.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $entityType
     * @return \Illuminate\Http\JsonResponse
     */
    public function getByEntityType(Request $request, string $entityType)
    {
        try {
            // User must be authenticated
            if (!auth()->check()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            // Validate entity type
            if (!in_array($entityType, ['business', 'guide', 'attraction'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid entity type'
                ], 422);
            }
            
            $query = Favorite::where('user_id', auth()->id())
                           ->where('entity_type', $entityType);
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                $query->orderBy('created_at', 'desc');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 15);
            $favorites = $query->paginate($perPage);
            
            // Load entity data for each favorite
            $favorites->getCollection()->transform(function ($favorite) {
                $entityData = $this->getEntityData($favorite->entity_type, $favorite->entity_id);
                $favorite->entity = $entityData;
                return $favorite;
            });
            
            return response()->json([
                'status' => 'success',
                'data' => $favorites
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve favorites',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Delete a favorite by entity info.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteByEntity(Request $request)
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
                'entity_type' => 'required|in:business,guide,attraction',
                'entity_id' => 'required|integer',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Find and delete the favorite
            $deleted = Favorite::where('user_id', auth()->id())
                ->where('entity_type', $request->entity_type)
                ->where('entity_id', $request->entity_id)
                ->delete();
            
            if ($deleted) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Item removed from favorites successfully'
                ]);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Item not found in favorites'
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to remove from favorites',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Helper function to verify if an entity exists.
     *
     * @param  string  $entityType
     * @param  int  $entityId
     * @return bool
     */
    private function verifyEntityExists(string $entityType, int $entityId)
    {
        switch ($entityType) {
            case 'business':
                return Business::where('id', $entityId)->exists();
            case 'guide':
                return Guide::where('id', $entityId)->exists();
            case 'attraction':
                return Attraction::where('id', $entityId)->exists();
            default:
                return false;
        }
    }
    
    /**
     * Helper function to get entity data.
     *
     * @param  string  $entityType
     * @param  int  $entityId
     * @return array|null
     */
    private function getEntityData(string $entityType, int $entityId)
    {
        switch ($entityType) {
            case 'business':
                $business = Business::with(['city', 'category'])->find($entityId);
                if ($business) {
                    return [
                        'id' => $business->id,
                        'name' => $business->name,
                        'description' => $business->description,
                        'city' => $business->city ? $business->city->name : null,
                        'category' => $business->category ? $business->category->name : null,
                        'address' => $business->address,
                        'price_range' => $business->price_range,
                        'average_rating' => $business->average_rating,
                    ];
                }
                break;
            case 'guide':
                $guide = Guide::with('user')->find($entityId);
                if ($guide) {
                    return [
                        'id' => $guide->id,
                        'name' => $guide->user ? $guide->user->name : null,
                        'bio' => $guide->bio,
                        'languages' => $guide->languages,
                        'experience_years' => $guide->experience_years,
                        'specialties' => $guide->specialties,
                        'daily_rate' => $guide->daily_rate,
                        'average_rating' => $guide->average_rating,
                    ];
                }
                break;
            case 'attraction':
                $attraction = Attraction::with('city')->find($entityId);
                if ($attraction) {
                    return [
                        'id' => $attraction->id,
                        'name' => $attraction->name,
                        'description' => $attraction->description,
                        'city' => $attraction->city ? $attraction->city->name : null,
                        'category' => $attraction->category,
                        'address' => $attraction->address,
                        'entrance_fee' => $attraction->entrance_fee,
                        'average_rating' => $attraction->average_rating,
                    ];
                }
                break;
        }
        
        return null;
    }
}
