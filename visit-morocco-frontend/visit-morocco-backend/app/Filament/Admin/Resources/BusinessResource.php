<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\BusinessResource\Pages;
use App\Filament\Admin\Resources\BusinessResource\RelationManagers;
use App\Filament\Admin\Resources\BusinessResource\Hooks\CreateBusinessOwnerHook;
use App\Models\Business;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class BusinessResource extends Resource
{
    protected static ?string $model = Business::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
    
    // Disable timestamps for this model since the database doesn't have created_at/updated_at columns in the standard format
    public $timestamps = false;
    
    // Always redirect to the list after creation or update
    protected static bool $shouldRedirectToListAfterCreate = true;
    protected static bool $shouldRedirectToListAfterSave = true;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                // Hidden field to store the original user_id if we're creating a new business owner
                Forms\Components\Hidden::make('temp_user_id'),
                Forms\Components\Select::make('business_owner_id')
                    ->label('Business Owner')
                    ->options(function () {
                        // Get all app users with the business_owner role
                        $businessOwnerUsers = \App\Models\AppUser::where('role', 'business_owner')->get();
                        
                        $options = [];
                        foreach ($businessOwnerUsers as $user) {
                            // Check if there's already a business_owner record for this user
                            $businessOwner = \App\Models\BusinessOwner::where('user_id', $user->user_id)->first();
                            
                            if (!$businessOwner) {
                                // Create a business owner record for this user
                                $businessOwner = new \App\Models\BusinessOwner();
                                $businessOwner->user_id = $user->user_id;
                                $businessOwner->business_name = "Business of {$user->first_name} {$user->last_name}";
                                $businessOwner->business_description = "Auto-generated business owner profile";
                                $businessOwner->is_approved = true;
                                $businessOwner->save();
                            }
                            
                            // Now we have a business owner record, so use it
                            $options[$businessOwner->business_owner_id] = "{$user->first_name} {$user->last_name} ({$user->email})";
                        }
                        
                        return $options;
                    })
                    ->searchable()
                    ->required(),
                Forms\Components\Select::make('category_id')
                    ->relationship('category', 'name')
                    ->required(),
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\Textarea::make('description')
                    ->columnSpanFull(),
                Forms\Components\Textarea::make('address')
                    ->columnSpanFull(),
                Forms\Components\Select::make('city_id')
                    ->relationship('city', 'name')
                    ->required(),
                Forms\Components\TextInput::make('phone')
                    ->tel()
                    ->maxLength(20)
                    ->default(null),
                Forms\Components\TextInput::make('email')
                    ->email()
                    ->maxLength(255)
                    ->default(null),
                Forms\Components\TextInput::make('website')
                    ->maxLength(255)
                    ->default(null),
                Forms\Components\Select::make('price_range')
                    ->options([
                        '$' => 'Budget',
                        '$$' => 'Moderate',
                        '$$$' => 'Expensive',
                        '$$$$' => 'Luxury',
                    ])
                    ->helperText('$ = Budget, $$ = Moderate, $$$ = Expensive, $$$$ = Luxury')
                    ->placeholder('Select price range'),
                Forms\Components\TextInput::make('latitude')
                    ->numeric()
                    ->default(null),
                Forms\Components\TextInput::make('longitude')
                    ->numeric()
                    ->default(null),
                Forms\Components\Textarea::make('opening_hours')
                    ->columnSpanFull(),
                Forms\Components\Textarea::make('features')
                    ->columnSpanFull(),
                Forms\Components\Toggle::make('is_verified')
                    ->required(),
                Forms\Components\Toggle::make('is_featured')
                    ->required(),
                Forms\Components\TextInput::make('avg_rating')
                    ->numeric()
                    ->default(null),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('business_owner_id')
                    ->label('Business Owner')
                    ->formatStateUsing(function ($state, $record) {
                        // Direct query to get the business owner and user info
                        $ownerInfo = \DB::table('business_owners')
                            ->join('app_users', 'business_owners.user_id', '=', 'app_users.user_id')
                            ->where('business_owners.business_owner_id', $state)
                            ->select('app_users.first_name', 'app_users.last_name')
                            ->first();
                            
                        if ($ownerInfo) {
                            return $ownerInfo->first_name . ' ' . $ownerInfo->last_name;
                        }
                        
                        return "Owner #{$state}";
                    })
                    ->searchable(),
                Tables\Columns\TextColumn::make('category.name')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('city.name')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('phone')
                    ->searchable(),
                Tables\Columns\TextColumn::make('email')
                    ->searchable(),
                Tables\Columns\TextColumn::make('website')
                    ->searchable(),
                Tables\Columns\TextColumn::make('price_range'),
                Tables\Columns\TextColumn::make('latitude')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('longitude')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\IconColumn::make('is_verified')
                    ->boolean(),
                Tables\Columns\IconColumn::make('is_featured')
                    ->boolean(),
                Tables\Columns\TextColumn::make('avg_rating')
                    ->numeric()
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
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
            'index' => Pages\ListBusinesses::route('/'),
            'create' => Pages\CreateBusiness::route('/create'),
            'edit' => Pages\EditBusiness::route('/{record}/edit'),
        ];
    }
}
