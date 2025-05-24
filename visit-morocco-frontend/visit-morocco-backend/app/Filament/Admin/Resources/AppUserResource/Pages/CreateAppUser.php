<?php

namespace App\Filament\Admin\Resources\AppUserResource\Pages;

use App\Filament\Admin\Resources\AppUserResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;
use Filament\Notifications\Notification;

class CreateAppUser extends CreateRecord
{
    protected static string $resource = AppUserResource::class;
    
    // Disable timestamps for this model since the database doesn't have created_at/updated_at columns
    public $timestamps = false;
    
    // Disable the default redirect behavior
    protected bool $shouldCreateAnother = false;
    
    // Override the default behavior to redirect to the list page
    protected function afterCreate(): void
    {
        // Show a success notification
        Notification::make()
            ->title('User created successfully')
            ->success()
            ->send();
    }
    
    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
