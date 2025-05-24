<?php

namespace App\Filament\Admin\Resources\BusinessCategoryResource\Pages;

use App\Filament\Admin\Resources\BusinessCategoryResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListBusinessCategories extends ListRecords
{
    protected static string $resource = BusinessCategoryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
