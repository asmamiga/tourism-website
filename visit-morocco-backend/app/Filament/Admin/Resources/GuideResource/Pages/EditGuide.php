<?php

namespace App\Filament\Admin\Resources\GuideResource\Pages;

use App\Filament\Admin\Resources\GuideResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Filament\Notifications\Notification;

class EditGuide extends EditRecord
{
    protected static string $resource = GuideResource::class;
    
    // Disable timestamps for this model since the database doesn't have created_at/updated_at columns
    public $timestamps = false;
    
    // Override the default behavior to redirect to the list page
    protected function afterSave(): void
    {
        // Show a success notification
        Notification::make()
            ->title('Guide updated successfully')
            ->success()
            ->send();
    }
    
    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
