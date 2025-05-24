<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BlogPost;
use App\Models\BlogCategory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BlogPostController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = BlogPost::query();
            
            // Eager load relationships
            $query->with(['user', 'category']);
            
            // Filter by category if provided
            if ($request->has('category_id')) {
                $query->where('blog_category_id', $request->category_id);
            }
            
            // Filter by author if provided
            if ($request->has('author_id')) {
                $query->where('user_id', $request->author_id);
            }
            
            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            } else {
                // By default, show only published posts to public
                if (!auth()->user() || auth()->user()->role !== 'admin') {
                    $query->where('status', 'published');
                }
            }
            
            // Search by title or content if provided
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', '%' . $search . '%')
                      ->orWhere('content', 'like', '%' . $search . '%');
                });
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
            $posts = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $posts
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve blog posts',
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
            // Check if the user is an admin
            if (!auth()->user() || !in_array(auth()->user()->role, ['admin'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Only admins can create blog posts.'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'content' => 'required|string',
                'excerpt' => 'nullable|string|max:500',
                'blog_category_id' => 'required|exists:blog_categories,id',
                'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'tags' => 'nullable|string',
                'status' => 'required|in:draft,published,archived',
                'meta_title' => 'nullable|string|max:255',
                'meta_description' => 'nullable|string|max:500',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Create blog post data
            $blogData = [
                'title' => $request->title,
                'slug' => Str::slug($request->title) . '-' . Str::random(5),
                'content' => $request->content,
                'excerpt' => $request->excerpt ?? Str::limit(strip_tags($request->content), 150),
                'blog_category_id' => $request->blog_category_id,
                'user_id' => auth()->id(),
                'tags' => $request->tags,
                'status' => $request->status,
                'meta_title' => $request->meta_title ?? $request->title,
                'meta_description' => $request->meta_description ?? Str::limit(strip_tags($request->content), 160),
                'featured_image_path' => null
            ];
            
            // Handle featured image upload
            if ($request->hasFile('featured_image')) {
                $image = $request->file('featured_image');
                $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('public/blog', $filename);
                $blogData['featured_image_path'] = Storage::url($path);
            }
            
            // Create blog post
            $post = BlogPost::create($blogData);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Blog post created successfully',
                'data' => $post->load(['user', 'category'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create blog post',
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
            // Try to find by ID first, then by slug
            $post = BlogPost::with(['user', 'category'])->find($id);
            
            if (!$post) {
                $post = BlogPost::with(['user', 'category'])->where('slug', $id)->first();
            }
            
            if (!$post) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Blog post not found'
                ], 404);
            }
            
            // Check if the post is published or if the user is an admin
            if ($post->status !== 'published' && 
                (!auth()->user() || auth()->user()->role !== 'admin')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. This blog post is not published.'
                ], 403);
            }
            
            // Increment view count
            $post->views = ($post->views ?? 0) + 1;
            $post->save();
            
            // Get related posts from the same category
            $relatedPosts = BlogPost::where('blog_category_id', $post->blog_category_id)
                ->where('id', '!=', $post->id)
                ->where('status', 'published')
                ->take(3)
                ->get(['id', 'title', 'slug', 'featured_image_path', 'created_at']);
            
            $post->related_posts = $relatedPosts;
            
            return response()->json([
                'status' => 'success',
                'data' => $post
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve blog post',
                'error' => $e->getMessage()
            ], 500);
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
            // Check if the user is an admin
            if (!auth()->user() || !in_array(auth()->user()->role, ['admin'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Only admins can update blog posts.'
                ], 403);
            }
            
            $post = BlogPost::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'content' => 'sometimes|required|string',
                'excerpt' => 'nullable|string|max:500',
                'blog_category_id' => 'sometimes|required|exists:blog_categories,id',
                'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'tags' => 'nullable|string',
                'status' => 'sometimes|required|in:draft,published,archived',
                'meta_title' => 'nullable|string|max:255',
                'meta_description' => 'nullable|string|max:500',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Update blog post fields
            if ($request->has('title')) {
                $post->title = $request->title;
                // Update slug if title changes
                $post->slug = Str::slug($request->title) . '-' . Str::random(5);
            }
            
            if ($request->has('content')) {
                $post->content = $request->content;
                // Update excerpt if not explicitly provided
                if (!$request->has('excerpt')) {
                    $post->excerpt = Str::limit(strip_tags($request->content), 150);
                }
            }
            
            // Update other fields if provided
            if ($request->has('excerpt')) {
                $post->excerpt = $request->excerpt;
            }
            
            if ($request->has('blog_category_id')) {
                $post->blog_category_id = $request->blog_category_id;
            }
            
            if ($request->has('tags')) {
                $post->tags = $request->tags;
            }
            
            if ($request->has('status')) {
                $post->status = $request->status;
            }
            
            if ($request->has('meta_title')) {
                $post->meta_title = $request->meta_title;
            } else if ($request->has('title')) {
                $post->meta_title = $request->title;
            }
            
            if ($request->has('meta_description')) {
                $post->meta_description = $request->meta_description;
            } else if ($request->has('content')) {
                $post->meta_description = Str::limit(strip_tags($request->content), 160);
            }
            
            // Handle featured image upload
            if ($request->hasFile('featured_image')) {
                // Delete old image if exists
                if ($post->featured_image_path) {
                    $oldPath = str_replace('/storage', 'public', $post->featured_image_path);
                    Storage::delete($oldPath);
                }
                
                $image = $request->file('featured_image');
                $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('public/blog', $filename);
                $post->featured_image_path = Storage::url($path);
            }
            
            // Save changes
            $post->save();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Blog post updated successfully',
                'data' => $post->fresh()->load(['user', 'category'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update blog post',
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
            // Check if the user is an admin
            if (!auth()->user() || !in_array(auth()->user()->role, ['admin'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Only admins can delete blog posts.'
                ], 403);
            }
            
            $post = BlogPost::findOrFail($id);
            
            // Delete featured image
            if ($post->featured_image_path) {
                $path = str_replace('/storage', 'public', $post->featured_image_path);
                Storage::delete($path);
            }
            
            // Delete the post
            $post->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Blog post deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete blog post',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get featured blog posts.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFeaturedPosts(Request $request)
    {
        try {
            $limit = $request->input('limit', 4);
            
            $posts = BlogPost::with(['user', 'category'])
                ->where('status', 'published')
                ->orderBy('created_at', 'desc')
                ->take($limit)
                ->get();
            
            return response()->json([
                'status' => 'success',
                'data' => $posts
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve featured blog posts',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get posts by category.
     *
     * @param  string  $categoryId
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPostsByCategory(string $categoryId, Request $request)
    {
        try {
            // Validate if category exists
            $category = BlogCategory::findOrFail($categoryId);
            
            $query = BlogPost::with(['user', 'category'])
                ->where('blog_category_id', $categoryId)
                ->where('status', 'published')
                ->orderBy('created_at', 'desc');
            
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
                'message' => 'Failed to retrieve posts by category',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get posts by tag.
     *
     * @param  string  $tag
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPostsByTag(string $tag, Request $request)
    {
        try {
            $query = BlogPost::with(['user', 'category'])
                ->where('tags', 'like', '%' . $tag . '%')
                ->where('status', 'published')
                ->orderBy('created_at', 'desc');
            
            // Pagination
            $perPage = $request->input('per_page', 10);
            $posts = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'tag' => $tag,
                    'posts' => $posts
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve posts by tag',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
