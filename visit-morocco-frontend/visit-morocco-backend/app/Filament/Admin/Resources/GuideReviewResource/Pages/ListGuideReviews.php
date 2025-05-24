<?php

namespace App\Filament\Admin\Resources\GuideReviewResource\Pages;

use App\Filament\Admin\Resources\GuideReviewResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListGuideReviews extends ListRecords
{
    protected static string $resource = GuideReviewResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
