<?php

namespace App\Filament\Admin\Resources\BusinessBookingResource\Pages;

use App\Filament\Admin\Resources\BusinessBookingResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListBusinessBookings extends ListRecords
{
    protected static string $resource = BusinessBookingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
