<?php

namespace App\Filament\Admin\Resources\GuideServiceResource\Pages;

use App\Filament\Admin\Resources\GuideServiceResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateGuideService extends CreateRecord
{
    protected static string $resource = GuideServiceResource::class;
    
    // Disable timestamps for this model since the database doesn't have created_at/updated_at columns in the standard format
    public $timestamps = false;
    
    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
