<?php

namespace App\Filament\Admin\Resources\AttractionPhotoResource\Pages;

use App\Filament\Admin\Resources\AttractionPhotoResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListAttractionPhotos extends ListRecords
{
    protected static string $resource = AttractionPhotoResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
