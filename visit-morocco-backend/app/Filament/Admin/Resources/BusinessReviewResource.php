<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\BusinessReviewResource\Pages;
use App\Models\BusinessReview;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class BusinessReviewResource extends Resource
{
    protected static ?string $model = BusinessReview::class;

    protected static ?string $navigationIcon = 'heroicon-o-star';
    protected static ?string $navigationGroup = null;
    protected static ?string $navigationLabel = 'Business Reviews';
    protected static ?int $navigationSort = null;
    protected static bool $shouldRegisterNavigation = false;
    
    // Disable timestamps for this model since the database doesn't have created_at/updated_at columns in the standard format
    public $timestamps = false;
    
    // Always redirect to the list after creation or update
    protected static bool $shouldRedirectToListAfterCreate = true;
    protected static bool $shouldRedirectToListAfterSave = true;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('business_id')
                    ->relationship('business', 'name')
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
                Forms\Components\DatePicker::make('visit_date'),
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
                Tables\Columns\TextColumn::make('business.name')
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
                Tables\Columns\TextColumn::make('visit_date')
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
                    ->action(function (BusinessReview $record) {
                        $record->is_verified = true;
                        $record->save();
                    })
                    ->requiresConfirmation()
                    ->hidden(fn (BusinessReview $record) => $record->is_verified),
                Tables\Actions\Action::make('unverify')
                    ->label('Unverify')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->action(function (BusinessReview $record) {
                        $record->is_verified = false;
                        $record->save();
                    })
                    ->requiresConfirmation()
                    ->hidden(fn (BusinessReview $record) => !$record->is_verified),
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
            'index' => Pages\ListBusinessReviews::route('/'),
            'create' => Pages\CreateBusinessReview::route('/create'),
            'edit' => Pages\EditBusinessReview::route('/{record}/edit'),
        ];
    }
}
