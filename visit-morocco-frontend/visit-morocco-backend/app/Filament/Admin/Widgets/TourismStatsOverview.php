<?php

namespace App\Filament\Admin\Widgets;

use App\Models\AppUser;
use App\Models\Business;
use App\Models\Guide;
use App\Models\Region;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class TourismStatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Total Users', AppUser::count())
                ->description('All registered users')
                ->descriptionIcon('heroicon-m-user')
                ->color('success'),
            
            Stat::make('Total Guides', Guide::count())
                ->description('Approved tour guides')
                ->descriptionIcon('heroicon-m-map')
                ->color('warning'),
            
            Stat::make('Total Businesses', Business::count())
                ->description('Registered businesses')
                ->descriptionIcon('heroicon-m-building-storefront')
                ->color('danger'),
            
            Stat::make('Morocco Regions', Region::count())
                ->description('Regions available for tourism')
                ->descriptionIcon('heroicon-m-globe-alt')
                ->color('primary'),
        ];
    }
}
