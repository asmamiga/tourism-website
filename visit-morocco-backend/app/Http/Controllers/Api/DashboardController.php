<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AppUser;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard data based on user role
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Load only the relevant relationship based on user role
        if ($user->isGuide()) {
            $user->load('guide');
        } elseif ($user->isBusinessOwner()) {
            $user->load('businessOwner');
        }
        
        $dashboardData = [
            'stats' => $this->getRoleBasedStats($user),
            'upcoming' => $this->getUpcomingActivities($user),
            'recent_activities' => $this->getRecentActivities($user),
            'quick_actions' => $this->getQuickActions($user),
        ];
        
        return response()->json([
            'status' => 'success',
            'data' => $dashboardData
        ]);
    }
    
    /**
     * Get role-specific statistics
     */
    protected function getRoleBasedStats($user)
    {
        $now = Carbon::now();
        
        switch ($user->role) {
            case 'guide':
                if (!$user->guide) {
                    return $this->getDefaultGuideStats();
                }
                return [
                    'upcoming_sessions' => $user->guide->bookings()
                        ->where('start_time', '>=', $now)
                        ->count() ?? 0,
                    'completed_sessions' => $user->guide->bookings()
                        ->where('end_time', '<', $now)
                        ->count() ?? 0,
                    'total_earnings' => $user->guide->earnings ?? 0,
                    'average_rating' => $user->guide->reviews()->avg('rating') ?? 0,
                ];
                
            case 'business_owner':
                if (!$user->businessOwner) {
                    return $this->getDefaultBusinessOwnerStats();
                }
                return [
                    'total_bookings' => $user->businessOwner->bookings()->count() ?? 0,
                    'upcoming_bookings' => $user->businessOwner->bookings()
                        ->where('start_time', '>=', $now)
                        ->count() ?? 0,
                    'total_revenue' => $user->businessOwner->bookings()
                        ->sum('total_amount') ?? 0,
                    'average_rating' => $user->businessOwner->reviews()->avg('rating') ?? 0,
                ];
                
            case 'tourist':
            default:
                return [
                    'upcoming_trips' => $user->bookings()
                        ?->where('start_date', '>=', $now)
                        ->count() ?? 0,
                    'past_trips' => $user->bookings()
                        ?->where('end_date', '<', $now)
                        ->count() ?? 0,
                    'saved_guides' => $user->savedGuides()?->count() ?? 0,
                    'saved_businesses' => $user->savedBusinesses()?->count() ?? 0,
                ];
        }
    }
    
    /**
     * Get default guide statistics
     */
    protected function getDefaultGuideStats()
    {
        return [
            'upcoming_sessions' => 0,
            'completed_sessions' => 0,
            'total_earnings' => 0,
            'average_rating' => 0,
        ];
    }
    
    /**
     * Get default business owner statistics
     */
    protected function getDefaultBusinessOwnerStats()
    {
        return [
            'total_bookings' => 0,
            'upcoming_bookings' => 0,
            'total_revenue' => 0,
            'average_rating' => 0,
        ];
    }
    
    /**
     * Get upcoming activities based on user role
     */
    protected function getUpcomingActivities($user)
    {
        $now = Carbon::now();
        
        switch ($user->role) {
            case 'guide':
                if (!$user->guide) {
                    return [];
                }
                return $user->guide->bookings()
                    ->with(['user', 'service'])
                    ->where('start_time', '>=', $now)
                    ->orderBy('start_time', 'asc')
                    ->take(5)
                    ->get() ?? [];
                    
            case 'business_owner':
                if (!$user->businessOwner) {
                    return [];
                }
                return $user->businessOwner->bookings()
                    ->with(['user', 'service'])
                    ->where('start_time', '>=', $now)
                    ->orderBy('start_time', 'asc')
                    ->take(5)
                    ->get();
                    
            case 'tourist':
            default:
                return $user->bookings()
                    ->with(['guide', 'business'])
                    ->where('start_date', '>=', $now)
                    ->orderBy('start_date', 'asc')
                    ->take(5)
                    ->get();
        }
    }
    
    /**
     * Get recent activities based on user role
     */
    protected function getRecentActivities($user)
    {
        $now = Carbon::now();
        
        switch ($user->role) {
            case 'guide':
                return [
                    'recent_reviews' => $user->guide->reviews()
                        ->with(['user'])
                        ->latest()
                        ->take(3)
                        ->get(),
                    'recent_messages' => $user->receivedMessages()
                        ->with(['sender'])
                        ->latest()
                        ->take(3)
                        ->get(),
                ];
                
            case 'business_owner':
                return [
                    'recent_reviews' => $user->businessOwner->reviews()
                        ->with(['user'])
                        ->latest()
                        ->take(3)
                        ->get(),
                    'recent_bookings' => $user->businessOwner->bookings()
                        ->with(['user', 'service'])
                        ->latest()
                        ->take(3)
                        ->get(),
                ];
                
            case 'tourist':
            default:
                return [
                    'recent_bookings' => $user->bookings()
                        ->with(['guide', 'business'])
                        ->latest()
                        ->take(3)
                        ->get(),
                    'saved_items' => [
                        'guides' => $user->savedGuades()
                            ->with(['user'])
                            ->latest()
                            ->take(3)
                            ->get(),
                        'businesses' => $user->savedBusinesses()
                            ->with(['user'])
                            ->latest()
                            ->take(3)
                            ->get(),
                    ]
                ];
        }
    }
    
    /**
     * Get quick actions based on user role
     */
    protected function getQuickActions($user)
    {
        switch ($user->role) {
            case 'guide':
                return [
                    ['title' => 'Update Availability', 'icon' => 'calendar', 'route' => '/guide/availability'],
                    ['title' => 'Create Tour Package', 'icon' => 'plus-circle', 'route' => '/guide/packages/create'],
                    ['title' => 'View Earnings', 'icon' => 'dollar-sign', 'route' => '/guide/earnings'],
                    ['title' => 'View Profile', 'icon' => 'user', 'route' => '/guide/profile'],
                ];
                
            case 'business_owner':
                return [
                    ['title' => 'Add New Service', 'icon' => 'plus-circle', 'route' => '/business/services/create'],
                    ['title' => 'View Bookings', 'icon' => 'calendar', 'route' => '/business/bookings'],
                    ['title' => 'View Analytics', 'icon' => 'bar-chart', 'route' => '/business/analytics'],
                    ['title' => 'Update Business Info', 'icon' => 'edit', 'route' => '/business/profile'],
                ];
                
            case 'tourist':
            default:
                return [
                    ['title' => 'Find a Guide', 'icon' => 'search', 'route' => '/explore/guides'],
                    ['title' => 'Discover Attractions', 'icon' => 'map-pin', 'route' => '/explore/attractions'],
                    ['title' => 'Plan a Trip', 'icon' => 'plus-circle', 'route' => '/trips/plan'],
                    ['title' => 'View My Bookings', 'icon' => 'calendar', 'route' => '/bookings'],
                ];
        }
    }
}
