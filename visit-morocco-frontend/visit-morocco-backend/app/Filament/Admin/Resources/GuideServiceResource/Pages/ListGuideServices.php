<?php

namespace App\Filament\Admin\Resources\GuideServiceResource\Pages;

use App\Filament\Admin\Resources\GuideServiceResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListGuideServices extends ListRecords
{
    protected static string $resource = GuideServiceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
