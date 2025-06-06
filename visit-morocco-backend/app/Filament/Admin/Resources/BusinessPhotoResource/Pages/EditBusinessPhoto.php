<?php

namespace App\Filament\Admin\Resources\BusinessPhotoResource\Pages;

use App\Filament\Admin\Resources\BusinessPhotoResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditBusinessPhoto extends EditRecord
{
    protected static string $resource = BusinessPhotoResource::class;

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
    
    protected function afterSave(): void
    {
        // Ensure we have a fresh state after saving
        $this->fillForm();
    }
}
