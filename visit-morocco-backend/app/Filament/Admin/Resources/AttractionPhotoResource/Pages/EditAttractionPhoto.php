<?php

namespace App\Filament\Admin\Resources\AttractionPhotoResource\Pages;

use App\Filament\Admin\Resources\AttractionPhotoResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditAttractionPhoto extends EditRecord
{
    protected static string $resource = AttractionPhotoResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
    
    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
