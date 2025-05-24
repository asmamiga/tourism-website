<?php

namespace App\Filament\Admin\Widgets;

use App\Models\AppUser;
use App\Models\Business;
use App\Models\BusinessBooking;
use App\Models\GuideBooking;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class LatestActivities extends BaseWidget
{
    protected int | string | array $columnSpan = 'full';
    protected function getHeading(): string
    {
        return 'Latest Activities';
    }

    protected function getStats(): array
    {
        // Get latest user
        $latestUser = AppUser::query()
            ->orderBy('created_at', 'desc')
            ->first();
            
        $userStat = $latestUser ? 
            Stat::make('Latest User', "{$latestUser->first_name} {$latestUser->last_name}")
                ->description('Joined ' . $latestUser->created_at->diffForHumans())
                ->descriptionIcon('heroicon-m-user')
                ->color('success') :
            Stat::make('Latest User', 'None')
                ->description('No users yet')
                ->color('gray');
        
        // Get latest guide booking
        $latestGuideBooking = GuideBooking::query()
            ->orderBy('created_at', 'desc')
            ->first();
            
        $guideBookingStat = $latestGuideBooking ? 
            Stat::make('Latest Guide Booking', "#{$latestGuideBooking->booking_id}")
                ->description("Status: {$latestGuideBooking->status}")
                ->descriptionIcon('heroicon-m-map')
                ->color('warning') :
            Stat::make('Latest Guide Booking', 'None')
                ->description('No guide bookings yet')
                ->color('gray');
                
        // Get latest business booking
        $latestBusinessBooking = BusinessBooking::query()
            ->orderBy('created_at', 'desc')
            ->first();
            
        $businessBookingStat = $latestBusinessBooking ? 
            Stat::make('Latest Business Booking', "#{$latestBusinessBooking->booking_id}")
                ->description("Status: {$latestBusinessBooking->status}")
                ->descriptionIcon('heroicon-m-building-storefront')
                ->color('danger') :
            Stat::make('Latest Business Booking', 'None')
                ->description('No business bookings yet')
                ->color('gray');
        
        return [
            $userStat,
            $guideBookingStat,
            $businessBookingStat,
        ];
    }
}
