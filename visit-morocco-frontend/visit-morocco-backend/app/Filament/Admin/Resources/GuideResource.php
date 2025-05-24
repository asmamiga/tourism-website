<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\GuideResource\Pages;
use App\Filament\Admin\Resources\GuideResource\RelationManagers;
use App\Models\Guide;
use App\Models\AppUser;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class GuideResource extends Resource
{
    // Disable timestamps for this model since the database doesn't have created_at/updated_at columns in the standard format
    public $timestamps = false;
    
    // Always redirect to the list after creation or update
    protected static bool $shouldRedirectToListAfterCreate = true;
    protected static bool $shouldRedirectToListAfterSave = true;
    protected static ?string $model = Guide::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('user name')
                    ->options(function () {
                        // Get all app users with the guide role
                        $guideUsers = AppUser::where('role', 'guide')->get();
                        
                        $options = [];
                        foreach ($guideUsers as $user) {
                            // Check if there's already a guide record for this user
                            $guide = Guide::where('user_id', $user->user_id)->first();
                            
                            if (!$guide) {
                                // Create a guide record for this user
                                $guide = new Guide();
                                $guide->user_id = $user->user_id;
                                $guide->is_available = true;
                                $guide->is_approved = true;
                                $guide->save();
                            }
                            
                            // Now we have a guide record, so use it
                            $options[$user->user_id] = "{$user->first_name} {$user->last_name} ({$user->email})";
                        }
                        
                        return $options;
                    })
                    ->searchable()
                    ->required(),
                Forms\Components\Textarea::make('bio')
                    ->columnSpanFull(),
                Forms\Components\TextInput::make('experience_years')
                    ->numeric()
                    ->default(null),
                Forms\Components\Textarea::make('languages')
                    ->columnSpanFull(),
                Forms\Components\Textarea::make('specialties')
                    ->columnSpanFull(),
                Forms\Components\TextInput::make('daily_rate')
                    ->numeric()
                    ->default(null),
                Forms\Components\Toggle::make('is_available')
                    ->required(),
                Forms\Components\Toggle::make('is_approved')
                    ->required(),
                Forms\Components\TextInput::make('identity_verification')
                    ->maxLength(100)
                    ->default(null),
                Forms\Components\TextInput::make('guide_license')
                    ->maxLength(100)
                    ->default(null),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user_id')
                    ->label('Guide Name')
                    ->formatStateUsing(function ($state, $record) {
                        // Get the app user associated with this guide
                        $appUser = \App\Models\AppUser::find($state);
                        if ($appUser) {
                            return "{$appUser->first_name} {$appUser->last_name}";
                        }
                        return "Guide #{$state}";
                    })
                    ->searchable(),
                Tables\Columns\TextColumn::make('experience_years')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('daily_rate')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_available')
                    ->boolean(),
                Tables\Columns\IconColumn::make('is_approved')
                    ->boolean(),
                Tables\Columns\TextColumn::make('identity_verification')
                    ->searchable(),
                Tables\Columns\TextColumn::make('guide_license')
                    ->searchable(),
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
            'index' => Pages\ListGuides::route('/'),
            'create' => Pages\CreateGuide::route('/create'),
            'edit' => Pages\EditGuide::route('/{record}/edit'),
        ];
    }
}
