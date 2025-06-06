<?php

namespace App\Filament\Admin\Resources;

use App\Models\BusinessPhoto;
use Filament\Forms;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class BusinessPhotoResource extends Resource
{
    protected static ?string $model = BusinessPhoto::class;
    protected static ?string $navigationIcon = 'heroicon-o-building-office';
    protected static ?string $navigationGroup = 'Business Directory';
    protected static ?int $navigationSort = 4;
    protected static ?string $modelLabel = 'Business Photo';
    protected static ?string $pluralModelLabel = 'Business Photos';
    
    // Redirect to list after create/save
    protected static bool $shouldRedirectToListAfterCreate = true;
    protected static bool $shouldRedirectToListAfterSave = true;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('business_id')
                    ->label('Business')
                    ->relationship('business', 'name')
                    ->required()
                    ->searchable()
                    ->preload()
                    ->createOptionForm([
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('description')
                            ->required()
                            ->maxLength(1000),
                        // Add other required fields for business creation
                    ])
                    ->createOptionUsing(function (array $data) {
                        return \App\Models\Business::create($data)->business_id;
                    }),
                    
                // Current photo display (only shown when editing)
                Forms\Components\Group::make()
                    ->schema([
                        Forms\Components\Placeholder::make('current_photo')
                            ->label('Current Photo')
                            ->visible(fn ($record) => $record?->photo_url)
                            ->content(function ($record) {
                                $imageUrl = str_starts_with($record->photo_url, 'http') 
                                    ? $record->photo_url 
                                    : asset('storage/' . ltrim($record->photo_url, '/'));  
                                
                                return new \Illuminate\Support\HtmlString(
                                    '<div style="margin: 1rem 0;">' .
                                    '<img src="' . $imageUrl . '" style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 1px solid #e2e8f0;" onerror="this.onerror=null; this.src=\'' . asset('images/placeholder.jpg') . '\';" />' .
                                    '</div>'
                                );
                            })
                    ])
                    ->columnSpanFull()
                    ->visible(fn ($record) => $record?->photo_url),
                    
                // File upload field
                // Forms\Components\FileUpload::make('photo_url')
                //     ->label(fn ($record) => $record ? 'Change Photo' : 'Upload Photo')
                //     ->image()
                //     ->disk('public')
                //     ->directory('attractions/photos')
                //     ->visibility('public')
                //     ->required(fn (string $context): bool => $context === 'create')
                //     ->imageEditor()
                //     ->imagePreviewHeight(150)
                //     ->panelLayout('compact')
                //     ->openable()
                //     ->downloadable()
                //     ->previewable(true)
                //     ->loadingIndicatorPosition('left')
                //     ->removeUploadedFileButtonPosition('right')
                //     ->uploadButtonPosition('right')
                //     ->uploadProgressIndicatorPosition('left')
                //     ->getUploadedFileNameForStorageUsing(
                //         fn (TemporaryUploadedFile $file): string => 
                //             'business-' . uniqid() . '.' . $file->getClientOriginalExtension()
                //     )
                //     ->columnSpanFull()
                //     ->helperText('Upload a new photo to replace the current one')
                //     ->imageResizeMode('cover')
                //     ->imageResizeTargetWidth(800)
                //     ->imageResizeTargetHeight(600)
                //     ->imageEditorAspectRatios([
                //         null,
                //         '16:9',
                //         '4:3',
                //         '1:1',
                //     ]),

                Forms\Components\TextInput::make('caption')
                    ->maxLength(255),
                    
                Forms\Components\Toggle::make('is_primary')
                    ->label('Primary Photo')
                    ->helperText('Set as the main display photo for this business')
                    ->afterStateUpdated(function ($state, $set, $get, $record) {
                        if ($state) {
                            // If this photo is being set as primary, we don't need to do anything
                            // as the model's booted() method will handle unsetting other primary photos
                            return;
                        }
                        
                        // If unsetting the primary, check if there are other photos
                        $businessId = $get('business_id');
                        $photoId = $record?->getKey() ?? $get('photo_id');
                        
                        if (!$photoId) {
                            // If this is a new photo, just allow the toggle to work
                            return;
                        }
                        
                        $otherPhotosCount = \App\Models\BusinessPhoto::where('business_id', $businessId)
                            ->where('photo_id', '!=', $photoId)
                            ->count();
                            
                        if ($otherPhotosCount === 0) {
                            // If this is the only photo, prevent unsetting it as primary
                            $set('is_primary', true);
                            \Filament\Facades\Filament::notify('warning', 'Cannot unset primary photo - there must be at least one primary photo per business.');
                        }
                    })
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('photo_url')
                    ->label('Photo')
                    ->disk('public')
                    ->circular()
                    ->size(50)
                    ->height(50)
                    ->width(50)
                    ->grow(false)
                    ->extraImgAttributes(['class' => 'rounded-lg shadow-sm'])
                    ->state(function ($record) {
                        $url = $record->photo_url;
                        
                        // If it's already a full URL, return as is
                        if (filter_var($url, FILTER_VALIDATE_URL)) {
                            return $url;
                        }
                        
                        // If it's a path, make sure it's relative to storage
                        $url = ltrim($url, '/');
                        
                        // Check if the file exists in storage
                        if (\Storage::disk('public')->exists($url)) {
                            return asset('storage/' . $url);
                        }
                        
                        // Check in the business/photos directory
                        if (\Storage::disk('public')->exists('business/photos/' . basename($url))) {
                            return asset('storage/business/photos/' . basename($url));
                        }
                        
                        return null;
                    })
                    ->url(fn ($record) => $record->photo_url)
                    ->defaultImageUrl(asset('images/placeholder.jpg')),
                Tables\Columns\TextColumn::make('business.name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('caption')
                    ->searchable()
                    ->limit(30)
                    ->tooltip(fn ($record) => $record->caption),
                Tables\Columns\IconColumn::make('is_primary')
                    ->label('Primary')
                    ->boolean()
                    ->sortable(),
                Tables\Columns\TextColumn::make('upload_date')
                    ->label('Uploaded')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('business')
                    ->relationship('business', 'name')
                    ->searchable()
                    ->preload(),
                Tables\Filters\TernaryFilter::make('is_primary')
                    ->label('Primary Photo Only'),
                Tables\Filters\Filter::make('upload_date')
                    ->form([
                        Forms\Components\DatePicker::make('uploaded_from'),
                        Forms\Components\DatePicker::make('uploaded_until'),
                    ])
                    ->query(function ($query, array $data) {
                        return $query
                            ->when(
                                $data['uploaded_from'],
                                fn ($query) => $query->whereDate('upload_date', '>=', $data['uploaded_from'])
                            )
                            ->when(
                                $data['uploaded_until'],
                                fn ($query) => $query->whereDate('upload_date', '<=', $data['uploaded_until'])
                            );
                    }),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => \App\Filament\Admin\Resources\BusinessPhotoResource\Pages\ListBusinessPhotos::route('/'),
            'create' => \App\Filament\Admin\Resources\BusinessPhotoResource\Pages\CreateBusinessPhoto::route('/create'),
            'edit' => \App\Filament\Admin\Resources\BusinessPhotoResource\Pages\EditBusinessPhoto::route('/{record}/edit'),
        ];
    }
    
    public static function getRedirectUrl(): string
    {
        return static::getUrl('index');
    }
}
