<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BlogCategoryController extends Controller
{
    /**
     * Display a listing of blog categories.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = BlogCategory::query();
            
            // Search by name if provided
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }
            
            // With post counts if requested
            if ($request->boolean('with_counts', false)) {
                $query->withCount('posts');
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'asc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                $query->orderBy('name', 'asc');
            }
            
            // Decide whether to paginate or get all
            if ($request->boolean('all', false)) {
                $categories = $query->get();
            } else {
                $perPage = $request->input('per_page', 15);
                $categories = $query->paginate($perPage);
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve blog categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created blog category.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            // Only admin can create categories
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100|unique:blog_categories,name',
                'description' => 'nullable|string',
                'slug' => 'nullable|string|max:100|unique:blog_categories,slug',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Generate slug if not provided
            $slug = $request->slug ?? Str::slug($request->name);
            
            $category = BlogCategory::create([
                'name' => $request->name,
                'description' => $request->description,
                'slug' => $slug,
            ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Blog category created successfully',
                'data' => $category
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create blog category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified blog category.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        try {
            // The ID could be numeric or a slug
            $category = is_numeric($id) ? 
                BlogCategory::findOrFail($id) : 
                BlogCategory::where('slug', $id)->firstOrFail();
            
            $category->load('posts');
            
            return response()->json([
                'status' => 'success',
                'data' => $category
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Blog category not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified blog category.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id)
    {
        try {
            // Only admin can update categories
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            // The ID could be numeric or a slug
            $category = is_numeric($id) ? 
                BlogCategory::findOrFail($id) : 
                BlogCategory::where('slug', $id)->firstOrFail();
            
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:100|unique:blog_categories,name,' . $category->id,
                'description' => 'nullable|string',
                'slug' => 'nullable|string|max:100|unique:blog_categories,slug,' . $category->id,
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $updateData = [];
            
            if ($request->has('name')) {
                $updateData['name'] = $request->name;
                
                // Auto-update slug if name changes and slug was not explicitly provided
                if (!$request->has('slug')) {
                    $updateData['slug'] = Str::slug($request->name);
                }
            }
            
            if ($request->has('description')) {
                $updateData['description'] = $request->description;
            }
            
            if ($request->has('slug')) {
                $updateData['slug'] = $request->slug;
            }
            
            $category->update($updateData);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Blog category updated successfully',
                'data' => $category->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update blog category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified blog category.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        try {
            // Only admin can delete categories
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            // The ID could be numeric or a slug
            $category = is_numeric($id) ? 
                BlogCategory::findOrFail($id) : 
                BlogCategory::where('slug', $id)->firstOrFail();
            
            // Check if there are posts using this category
            $postsCount = $category->posts()->count();
            
            if ($postsCount > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot delete category that is in use by ' . $postsCount . ' blog posts'
                ], 422);
            }
            
            $category->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Blog category deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete blog category',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get blog posts for a specific category.
     *
     * @param  string  $id
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCategoryPosts(string $id, Request $request)
    {
        try {
            // The ID could be numeric or a slug
            $category = is_numeric($id) ? 
                BlogCategory::findOrFail($id) : 
                BlogCategory::where('slug', $id)->firstOrFail();
            
            $query = $category->posts();
            
            // Eager load relationships
            $query->with('author');
            
            // Only show published posts for non-admin users
            if (!auth()->check() || auth()->user()->role !== 'admin') {
                $query->where('status', 'published');
            } else if ($request->has('status')) {
                // Filter by status for admin
                $query->where('status', $request->status);
            }
            
            // Search by title if provided
            if ($request->has('search')) {
                $query->where('title', 'like', '%' . $request->search . '%');
            }
            
            // Sort options
            if ($request->has('sort_by')) {
                $sortDirection = $request->input('sort_direction', 'desc');
                $query->orderBy($request->sort_by, $sortDirection);
            } else {
                $query->orderBy('publish_date', 'desc');
            }
            
            // Pagination
            $perPage = $request->input('per_page', 10);
            $posts = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'category' => $category,
                    'posts' => $posts
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve category posts',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get blog category statistics.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStatistics()
    {
        try {
            $categories = BlogCategory::withCount(['posts' => function($query) {
                $query->where('status', 'published');
            }])->get();
            
            // Enhance the data with percentage calculations
            $totalPosts = $categories->sum('posts_count');
            
            $categoriesWithStats = $categories->map(function($category) use ($totalPosts) {
                $category->percentage = $totalPosts > 0 ? 
                    round(($category->posts_count / $totalPosts) * 100, 2) : 0;
                return $category;
            });
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_posts' => $totalPosts,
                    'categories' => $categoriesWithStats
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve category statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
