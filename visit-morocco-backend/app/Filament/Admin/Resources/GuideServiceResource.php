<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\GuideServiceResource\Pages;
use App\Models\GuideService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class GuideServiceResource extends Resource
{
    protected static ?string $model = GuideService::class;

    protected static ?string $navigationIcon = 'heroicon-o-wrench-screwdriver';
    protected static ?string $navigationGroup = null;
    protected static ?string $navigationLabel = 'Guide Services';
    protected static ?int $navigationSort = null;
    protected static bool $shouldRegisterNavigation = false;

    // Disable timestamps for this model since the database doesn't have created_at/updated_at columns
    public $timestamps = false;
    
    // Always redirect to the list after creation or update
    protected static bool $shouldRedirectToListAfterCreate = true;
    protected static bool $shouldRedirectToListAfterSave = true;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('guide_id')
                    ->relationship('guide', 'user_id', function ($query) {
                        // Join with app_users to display the guide's name
                        return $query->join('app_users', 'guides.user_id', '=', 'app_users.user_id')
                            ->select('guides.guide_id', 'app_users.first_name', 'app_users.last_name')
                            ->selectRaw("CONCAT(app_users.first_name, ' ', app_users.last_name) as full_name");
                    })
                    ->getOptionLabelFromRecordUsing(fn ($record) => $record->full_name ?? "Guide #{$record->guide_id}")
                    ->required(),
                Forms\Components\TextInput::make('title')
                    ->required()
                    ->maxLength(255),
                Forms\Components\Select::make('city_id')
                    ->relationship('city', 'name')
                    ->required(),
                Forms\Components\TextInput::make('duration')
                    ->numeric()
                    ->suffix('hours')
                    ->required(),
                Forms\Components\TextInput::make('price')
                    ->numeric()
                    ->prefix('$')
                    ->required(),
                Forms\Components\TextInput::make('max_group_size')
                    ->numeric()
                    ->suffix('people'),
                Forms\Components\Textarea::make('description')
                    ->maxLength(65535)
                    ->columnSpanFull(),
                Forms\Components\Textarea::make('meeting_point')
                    ->maxLength(65535),
                Forms\Components\TagsInput::make('languages')
                    ->separator(','),
                Forms\Components\TagsInput::make('includes')
                    ->separator(',')
                    ->helperText('Items included in the service'),
                Forms\Components\TagsInput::make('excludes')
                    ->separator(',')
                    ->helperText('Items excluded from the service'),
                Forms\Components\Toggle::make('is_private')
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->searchable(),
                Tables\Columns\TextColumn::make('guide.user_id')
                    ->label('Guide')
                    ->formatStateUsing(function ($state, $record) {
                        $guide = $record->guide;
                        if ($guide && $guide->user) {
                            return $guide->user->first_name . ' ' . $guide->user->last_name;
                        }
                        return "Guide #{$state}";
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('city.name')
                    ->sortable(),
                Tables\Columns\TextColumn::make('duration')
                    ->numeric()
                    ->suffix(' hours')
                    ->sortable(),
                Tables\Columns\TextColumn::make('price')
                    ->money('USD')
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_private')
                    ->boolean(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('city')
                    ->relationship('city', 'name'),
                Tables\Filters\SelectFilter::make('guide')
                    ->relationship('guide', 'guide_id'),
                Tables\Filters\TernaryFilter::make('is_private'),
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
            'index' => Pages\ListGuideServices::route('/'),
            'create' => Pages\CreateGuideService::route('/create'),
            'edit' => Pages\EditGuideService::route('/{record}/edit'),
        ];
    }
}
