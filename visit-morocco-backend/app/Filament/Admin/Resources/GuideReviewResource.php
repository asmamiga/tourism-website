<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\GuideReviewResource\Pages;
use App\Models\GuideReview;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class GuideReviewResource extends Resource
{
    protected static ?string $model = GuideReview::class;

    protected static ?string $navigationIcon = 'heroicon-o-star';
    
    protected static ?string $navigationGroup = 'Reviews';
    
    protected static ?string $navigationLabel = 'Guide Reviews';
    
    protected static ?int $navigationSort = 2;
    
    // Disable timestamps for this model since the database doesn't have created_at/updated_at columns in the standard format
    public $timestamps = false;
    
    // Always redirect to the list after creation or update
    protected static bool $shouldRedirectToListAfterCreate = true;
    protected static bool $shouldRedirectToListAfterSave = true;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('guide_id')
                    ->relationship('guide', 'guide_id', function ($query) {
                        // Join with app_users to display the guide's name
                        return $query->join('app_users', 'guides.user_id', '=', 'app_users.user_id')
                            ->select('guides.guide_id', 'app_users.first_name', 'app_users.last_name')
                            ->selectRaw("CONCAT(app_users.first_name, ' ', app_users.last_name) as full_name");
                    })
                    ->getOptionLabelFromRecordUsing(fn ($record) => $record->full_name ?? "Guide #{$record->guide_id}")
                    ->searchable()
                    ->preload()
                    ->required(),
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'email', function ($query) {
                        return $query->select('user_id', 'email', 'first_name', 'last_name')
                            ->selectRaw("CONCAT(first_name, ' ', last_name) as full_name");
                    })
                    ->getOptionLabelFromRecordUsing(fn ($record) => $record->full_name ?? $record->email)
                    ->searchable()
                    ->preload()
                    ->required(),
                Forms\Components\TextInput::make('rating')
                    ->numeric()
                    ->minValue(1)
                    ->maxValue(5)
                    ->required()
                    ->suffix('stars'),
                Forms\Components\TextInput::make('title')
                    ->maxLength(255),
                Forms\Components\Textarea::make('content')
                    ->maxLength(65535)
                    ->columnSpanFull(),
                Forms\Components\DatePicker::make('tour_date'),
                Forms\Components\Toggle::make('is_verified')
                    ->default(false)
                    ->helperText('Verified reviews are displayed prominently'),
                Forms\Components\TextInput::make('helpful_votes')
                    ->numeric()
                    ->default(0)
                    ->disabled()
                    ->dehydrated(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('guide.guide_id')
                    ->label('Guide')
                    ->formatStateUsing(function ($state, $record) {
                        $guide = $record->guide;
                        if ($guide && $guide->user) {
                            return $guide->user->first_name . ' ' . $guide->user->last_name;
                        }
                        return "Guide #{$state}";
                    })
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('user.email')
                    ->label('Reviewer')
                    ->formatStateUsing(function ($state, $record) {
                        $user = $record->user;
                        if ($user) {
                            return $user->first_name . ' ' . $user->last_name;
                        }
                        return $state;
                    })
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('rating')
                    ->numeric()
                    ->sortable()
                    ->formatStateUsing(fn (int $state): string => str_repeat('★', $state) . str_repeat('☆', 5 - $state)),
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->limit(30),
                Tables\Columns\TextColumn::make('tour_date')
                    ->date()
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_verified')
                    ->boolean()
                    ->label('Verified'),
                Tables\Columns\TextColumn::make('helpful_votes')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('rating')
                    ->options([
                        '1' => '1 Star',
                        '2' => '2 Stars',
                        '3' => '3 Stars',
                        '4' => '4 Stars',
                        '5' => '5 Stars',
                    ]),
                Tables\Filters\TernaryFilter::make('is_verified')
                    ->label('Verification Status'),
                Tables\Filters\Filter::make('created_at')
                    ->form([
                        Forms\Components\DatePicker::make('from'),
                        Forms\Components\DatePicker::make('until'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['from'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '>=', $date),
                            )
                            ->when(
                                $data['until'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '<=', $date),
                            );
                    }),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('verify')
                    ->label('Verify')
                    ->icon('heroicon-o-check-badge')
                    ->color('success')
                    ->action(function (GuideReview $record) {
                        $record->is_verified = true;
                        $record->save();
                    })
                    ->requiresConfirmation()
                    ->hidden(fn (GuideReview $record) => $record->is_verified),
                Tables\Actions\Action::make('unverify')
                    ->label('Unverify')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->action(function (GuideReview $record) {
                        $record->is_verified = false;
                        $record->save();
                    })
                    ->requiresConfirmation()
                    ->hidden(fn (GuideReview $record) => !$record->is_verified),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('verifySelected')
                        ->label('Verify Selected')
                        ->icon('heroicon-o-check-badge')
                        ->action(function (\Illuminate\Support\Collection $records) {
                            $records->each(function ($record) {
                                $record->is_verified = true;
                                $record->save();
                            });
                        })
                        ->requiresConfirmation()
                        ->deselectRecordsAfterCompletion(),
                    Tables\Actions\BulkAction::make('unverifySelected')
                        ->label('Unverify Selected')
                        ->icon('heroicon-o-x-circle')
                        ->action(function (\Illuminate\Support\Collection $records) {
                            $records->each(function ($record) {
                                $record->is_verified = false;
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
            'index' => Pages\ListGuideReviews::route('/'),
            'create' => Pages\CreateGuideReview::route('/create'),
            'edit' => Pages\EditGuideReview::route('/{record}/edit'),
        ];
    }
}
