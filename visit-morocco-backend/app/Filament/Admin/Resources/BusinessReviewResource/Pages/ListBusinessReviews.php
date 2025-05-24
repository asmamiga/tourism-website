<?php

namespace App\Filament\Admin\Resources\BusinessReviewResource\Pages;

use App\Filament\Admin\Resources\BusinessReviewResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListBusinessReviews extends ListRecords
{
    protected static string $resource = BusinessReviewResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
