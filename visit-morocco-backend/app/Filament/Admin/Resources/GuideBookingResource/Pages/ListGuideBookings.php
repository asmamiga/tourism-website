<?php

namespace App\Filament\Admin\Resources\GuideBookingResource\Pages;

use App\Filament\Admin\Resources\GuideBookingResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListGuideBookings extends ListRecords
{
    protected static string $resource = GuideBookingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
