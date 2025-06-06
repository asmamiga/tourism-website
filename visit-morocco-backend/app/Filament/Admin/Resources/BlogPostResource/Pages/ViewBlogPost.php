<?php

namespace App\Filament\Admin\Resources\BlogPostResource\Pages;

use App\Filament\Admin\Resources\BlogPostResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;
use Filament\Infolists\Components;
use Filament\Infolists\Infolist;

class ViewBlogPost extends ViewRecord
{
    protected static string $resource = BlogPostResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Components\Section::make('Post Details')
                    ->schema([
                        Components\Grid::make(2)
                            ->schema([
                                Components\Group::make([
                                    Components\TextEntry::make('title')
                                        ->size('lg')
                                        ->weight('bold'),
                                    Components\TextEntry::make('author.full_name')
                                        ->label('Author')
                                        ->color('gray'),
                                    Components\TextEntry::make('publish_date')
                                        ->dateTime()
                                        ->label('Publish Date'),
                                    Components\TextEntry::make('status')
                                        ->badge()
                                        ->color(fn (string $state): string => match ($state) {
                                            'published' => 'success',
                                            'draft' => 'warning',
                                            'archived' => 'danger',
                                            default => 'gray',
                                        }),
                                ]),
                                Components\Group::make([
                                    Components\ImageEntry::make('featured_image')
                                        ->label('')
                                        ->extraImgAttributes([
                                            'class' => 'rounded-lg shadow-md w-full h-auto max-h-64 object-cover',
                                            'loading' => 'lazy',
                                        ])
                                        ->defaultImageUrl(fn ($record) => $record->featured_image 
                                            ? asset('storage/' . $record->featured_image)
                                            : 'https://placehold.co/800x400?text=No+Image')
                                        ->columnSpanFull(),
                                ]),
                            ]),
                        Components\Section::make('Content')
                            ->schema([
                                Components\TextEntry::make('excerpt')
                                    ->markdown()
                                    ->columnSpanFull(),
                                Components\TextEntry::make('content')
                                    ->markdown()
                                    ->columnSpanFull()
                                    ->prose(),
                            ])
                            ->collapsible(),
                    ]),
            ]);
    }
}
