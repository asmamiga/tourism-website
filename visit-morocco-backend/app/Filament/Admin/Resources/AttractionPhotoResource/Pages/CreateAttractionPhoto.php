<?php

namespace App\Filament\Admin\Resources\AttractionPhotoResource\Pages;

use App\Filament\Admin\Resources\AttractionPhotoResource;
use Filament\Resources\Pages\CreateRecord;

class CreateAttractionPhoto extends CreateRecord
{
    protected static string $resource = AttractionPhotoResource::class;
    
    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
