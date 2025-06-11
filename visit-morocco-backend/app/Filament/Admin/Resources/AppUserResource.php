<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\AppUserResource\Pages;
use App\Filament\Admin\Resources\AppUserResource\RelationManagers;
use App\Models\AppUser;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

class AppUserResource extends Resource
{
    // Disable timestamps for this model since the database doesn't have created_at/updated_at columns in the standard format
    public $timestamps = false;
    
    // Always redirect to the list after creation or update
    protected static bool $shouldRedirectToListAfterCreate = true;
    protected static bool $shouldRedirectToListAfterSave = true;
    protected static ?string $model = AppUser::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';
    
    protected static ?string $navigationLabel = 'Users';
    
    protected static ?string $navigationGroup = 'User Management';
    
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('User Information')
                    ->schema([
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('first_name')
                                    ->required()
                                    ->maxLength(100),
                                Forms\Components\TextInput::make('last_name')
                                    ->required()
                                    ->maxLength(100),
                            ]),
                            
                        Forms\Components\TextInput::make('email')
                            ->email()
                            ->required()
                            ->unique(ignorable: fn ($record) => $record)
                            ->maxLength(255),
                            
                        Forms\Components\TextInput::make('phone')
                            ->tel()
                            ->telRegex('/^[0-9]{10,15}$/')
                            ->maxLength(20)
                            ->helperText('Enter phone number without + or country code (e.g., 1234567890)'),
                            
                        // Profile picture section
                        Forms\Components\Section::make('Profile Picture')
                            ->schema([
                                // Show current image in view/edit mode
                                Forms\Components\Placeholder::make('current_image')
                                    ->visible(fn ($record) => $record !== null) // Only show in edit/view
                                    ->content(function ($record) {
                                        return new \Illuminate\Support\HtmlString(
                                            '<div style="margin-bottom: 1rem;">' .
                                            '<p style="margin-bottom: 0.5rem; font-weight: 500;">Current Profile Picture:</p>' .
                                            '<img src="' . $record->profile_picture_url . '" style="max-width: 150px; max-height: 150px; border-radius: 8px; border: 1px solid #e2e8f0;" />' .
                                            '</div>'
                                        );
                                    }),
                                
                                // File upload for new/changing profile picture
                                Forms\Components\FileUpload::make('profile_picture')
                                    ->label(fn ($record) => $record ? 'Change Profile Picture' : 'Upload Profile Picture')
                                    ->image()
                                    ->disk('public')
                                    ->directory('profile-pictures')
                                    ->visibility('public')
                                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/gif'])
                                    ->maxSize(2048)
                                    ->required(fn (string $context): bool => $context === 'create')
                                    ->imagePreviewHeight(150)
                                    ->panelLayout('compact')
                                    ->openable()
                                    ->downloadable()
                                    ->previewable(false)
                                    ->getUploadedFileNameForStorageUsing(
                                        fn (TemporaryUploadedFile $file): string => 
                                            'user-' . uniqid() . '.' . $file->getClientOriginalExtension()
                                    )
                            ])
                            ->columnSpan(1)
                    ])->columns(2),
                    
                Forms\Components\Section::make('Account Details')
                    ->schema([
                        Forms\Components\Select::make('role')
                            ->options([
                                'business_owner' => 'Business Owner',
                                'guide' => 'Guide',
                                'tourist' => 'Tourist',
                            ])
                            ->required()
                            ->searchable(),
                            
                        Forms\Components\DateTimePicker::make('last_login')
                            ->label('Last Login')
                            ->disabled(),
                            
                        Forms\Components\Toggle::make('is_verified')
                            ->label('Email Verified')
                            ->required(),
                            
                        Forms\Components\TextInput::make('password_hash')
                            ->label('Password')
                            ->password()
                            ->dehydrated(fn ($state) => filled($state))
                            ->dehydrateStateUsing(fn ($state) => bcrypt($state))
                            ->required(fn (string $context): bool => $context === 'create')
                            ->maxLength(255),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('profile_picture_url')
                    ->label('Avatar')
                    ->circular()
                    ->size(40)
                    ->grow(false)
                    ->defaultImageUrl(fn ($record) => 'https://ui-avatars.com/api/?name=' . urlencode($record->first_name . ' ' . $record->last_name) . '&color=7F9CF5&background=EBF4FF')
                    ->extraImgAttributes(['class' => 'border border-gray-200']),
                    
                Tables\Columns\TextColumn::make('first_name')
                    ->label('First Name')
                    ->searchable()
                    ->sortable(),
                    
                Tables\Columns\TextColumn::make('last_name')
                    ->label('Last Name')
                    ->searchable()
                    ->sortable(),
                    
                Tables\Columns\TextColumn::make('email')
                    ->searchable()
                    ->sortable()
                    ->copyable()
                    ->toggleable(),
                    
                Tables\Columns\TextColumn::make('phone')
                    ->searchable()
                    ->toggleable(),
                    
                Tables\Columns\BadgeColumn::make('role')
                    ->colors([
                        'danger' => 'admin',
                        'rose' => 'guide',
                        'info' => 'business_owner',
                        'rose' => 'tourist',
                    ])
                    ->searchable()
                    ->sortable(),
                    
                Tables\Columns\IconColumn::make('is_verified')
                    ->boolean()
                    ->label('Verified')
                    ->sortable(),
                    
                Tables\Columns\TextColumn::make('last_login')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(),
                    
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('role')
                    ->options([
                        'business_owner' => 'Business Owner',
                        'guide' => 'Guide',
                        'tourist' => 'Tourist',
                    ]),
                    
                Tables\Filters\TernaryFilter::make('is_verified')
                    ->label('Email Verification'),
                    
                Tables\Filters\Filter::make('created_at')
                    ->form([
                        Forms\Components\DatePicker::make('created_from'),
                        Forms\Components\DatePicker::make('created_until'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['created_from'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '>=', $date),
                            )
                            ->when(
                                $data['created_until'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '<=', $date),
                            );
                    }),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\ViewAction::make(),
                    Tables\Actions\EditAction::make(),
                    Tables\Actions\Action::make('verify')
                        ->label('Verify Email')
                        ->icon('heroicon-o-check-badge')
                        ->color('success')
                        ->action(function (AppUser $record) {
                            $record->is_verified = true;
                            $record->verification_code = null;
                            $record->save();
                        })
                        ->requiresConfirmation()
                        ->hidden(fn (AppUser $record) => $record->is_verified),
                    Tables\Actions\DeleteAction::make(),
                ]),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('verifySelected')
                        ->label('Verify Selected')
                        ->icon('heroicon-o-check-badge')
                        ->action(function (Collection $records) {
                            $records->each(function ($record) {
                                $record->is_verified = true;
                                $record->verification_code = null;
                                $record->save();
                            });
                        })
                        ->requiresConfirmation()
                        ->deselectRecordsAfterCompletion(),
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
            'index' => Pages\ListAppUsers::route('/'),
            'create' => Pages\CreateAppUser::route('/create'),
            'edit' => Pages\EditAppUser::route('/{record}/edit'),
        ];
    }
}
