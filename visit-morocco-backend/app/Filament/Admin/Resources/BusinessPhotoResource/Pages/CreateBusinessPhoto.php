<?php

namespace App\Filament\Admin\Resources\BusinessPhotoResource\Pages;

use App\Filament\Admin\Resources\BusinessPhotoResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateBusinessPhoto extends CreateRecord
{
    protected static string $resource = BusinessPhotoResource::class;
    
    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
    
    protected function afterCreate(): void
    {
        // Ensure we have a fresh state after creation
        $this->fillForm();
    }
}
