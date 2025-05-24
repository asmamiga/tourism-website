<?php

namespace App\Filament\Admin\Resources\BusinessReviewResource\Pages;

use App\Filament\Admin\Resources\BusinessReviewResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Filament\Notifications\Notification;

class EditBusinessReview extends EditRecord
{
    protected static string $resource = BusinessReviewResource::class;
    
    // Disable timestamps for this model since the database doesn't have created_at/updated_at columns in the standard format
    public $timestamps = false;
    
    // Override the default behavior to redirect to the list page
    protected function afterSave(): void
    {
        // Show a success notification
        Notification::make()
            ->title('Business review updated successfully')
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
