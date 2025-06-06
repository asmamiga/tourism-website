<?php

namespace App\Filament\Admin\Resources\BusinessPhotoResource\Pages;

use App\Filament\Admin\Resources\BusinessPhotoResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListBusinessPhotos extends ListRecords
{
    protected static string $resource = BusinessPhotoResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
