<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\GuideBookingResource\Pages;
use App\Models\GuideBooking;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class GuideBookingResource extends Resource
{
    protected static ?string $model = GuideBooking::class;

    protected static ?string $navigationIcon = 'heroicon-o-map';
    protected static ?string $navigationGroup = 'Bookings';
    protected static ?string $navigationLabel = 'Guide Bookings';
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
                Forms\Components\Select::make('service_id')
                    ->label('Service')
                    ->relationship('service', 'title')
                    ->searchable()
                    ->preload()
                    ->required(),
                    
                Forms\Components\Select::make('guide_id')
                    ->label('Guide')
                    ->relationship('guide', 'guide_id', function ($query) {
                        return $query->join('app_users', 'guides.user_id', '=', 'app_users.user_id')
                            ->select('guides.guide_id', 'app_users.first_name', 'app_users.last_name')
                            ->selectRaw("CONCAT(app_users.first_name, ' ', app_users.last_name) as full_name");
                    })
                    ->getOptionLabelFromRecordUsing(fn ($record) => $record->full_name ?? "Guide #{$record->guide_id}")
                    ->searchable()
                    ->preload()
                    ->required(),
                    
                Forms\Components\Select::make('user_id')
                    ->label('Customer')
                    ->relationship('user', 'email', function ($query) {
                        return $query->select('user_id', 'email', 'first_name', 'last_name')
                            ->selectRaw("CONCAT(first_name, ' ', last_name) as full_name");
                    })
                    ->getOptionLabelFromRecordUsing(fn ($record) => $record->full_name ?? $record->email)
                    ->searchable()
                    ->preload()
                    ->required(),
                    
                Forms\Components\DatePicker::make('booking_date')
                    ->label('Booking Date')
                    ->required()
                    ->native(false)
                    ->displayFormat('Y-m-d'),
                    
                Forms\Components\TimePicker::make('start_time')
                    ->label('Start Time')
                    ->seconds(false)
                    ->required(),
                    
                Forms\Components\TextInput::make('num_people')
                    ->label('Number of People')
                    ->numeric()
                    ->minValue(1)
                    ->required()
                    ->suffix('people'),
                    
                Forms\Components\Textarea::make('special_requests')
                    ->label('Special Requests')
                    ->maxLength(65535)
                    ->columnSpanFull(),
                    
                Forms\Components\Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'confirmed' => 'Confirmed',
                        'completed' => 'Completed',
                        'cancelled' => 'Cancelled',
                    ])
                    ->default('pending')
                    ->required()
                    ->columnSpan(1),
                    
                Forms\Components\Select::make('payment_status')
                    ->options([
                        'unpaid' => 'Unpaid',
                        'partially_paid' => 'Partially Paid',
                        'paid' => 'Paid',
                    ])
                    ->default('unpaid')
                    ->required()
                    ->columnSpan(1),
                    
                Forms\Components\TextInput::make('total_amount')
                    ->label('Total Amount')
                    ->numeric()
                    ->prefix('$')
                    ->required()
                    ->columnSpan(1),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('service.title')
                    ->label('Tour/Service')
                    ->searchable()
                    ->sortable(),
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
                    ->label('Customer')
                    ->formatStateUsing(function ($state, $record) {
                        $user = $record->user;
                        if ($user) {
                            return $user->first_name . ' ' . $user->last_name;
                        }
                        return $state;
                    })
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('booking_date')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('start_time')
                    ->time()
                    ->sortable(),
                Tables\Columns\TextColumn::make('num_people')
                    ->numeric()
                    ->suffix(' people'),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'confirmed',
                        'primary' => 'completed',
                        'danger' => 'cancelled',
                    ]),
                Tables\Columns\BadgeColumn::make('payment_status')
                    ->colors([
                        'danger' => 'unpaid',
                        'warning' => 'partially_paid',
                        'success' => 'paid',
                    ]),
                Tables\Columns\TextColumn::make('total_amount')
                    ->money('USD')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'confirmed' => 'Confirmed',
                        'completed' => 'Completed',
                        'cancelled' => 'Cancelled',
                    ]),
                Tables\Filters\SelectFilter::make('payment_status')
                    ->options([
                        'unpaid' => 'Unpaid',
                        'partially_paid' => 'Partially Paid',
                        'paid' => 'Paid',
                    ]),
                Tables\Filters\Filter::make('booking_date')
                    ->form([
                        Forms\Components\DatePicker::make('from'),
                        Forms\Components\DatePicker::make('until'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['from'],
                                fn (Builder $query, $date): Builder => $query->whereDate('booking_date', '>=', $date),
                            )
                            ->when(
                                $data['until'],
                                fn (Builder $query, $date): Builder => $query->whereDate('booking_date', '<=', $date),
                            );
                    }),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('confirm')
                    ->label('Confirm')
                    ->icon('heroicon-o-check')
                    ->color('success')
                    ->action(function (GuideBooking $record) {
                        $record->status = 'confirmed';
                        $record->save();
                    })
                    ->requiresConfirmation()
                    ->hidden(fn (GuideBooking $record) => $record->status !== 'pending'),
                Tables\Actions\Action::make('complete')
                    ->label('Mark as Completed')
                    ->icon('heroicon-o-check-circle')
                    ->color('primary')
                    ->action(function (GuideBooking $record) {
                        $record->status = 'completed';
                        $record->save();
                    })
                    ->requiresConfirmation()
                    ->hidden(fn (GuideBooking $record) => $record->status !== 'confirmed'),
                Tables\Actions\Action::make('cancel')
                    ->label('Cancel')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->action(function (GuideBooking $record) {
                        $record->status = 'cancelled';
                        $record->save();
                    })
                    ->requiresConfirmation()
                    ->hidden(fn (GuideBooking $record) => in_array($record->status, ['completed', 'cancelled'])),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('confirmSelected')
                        ->label('Confirm Selected')
                        ->icon('heroicon-o-check')
                        ->action(function (\Illuminate\Support\Collection $records) {
                            $records->each(function ($record) {
                                if ($record->status === 'pending') {
                                    $record->status = 'confirmed';
                                    $record->save();
                                }
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
            'index' => Pages\ListGuideBookings::route('/'),
            'create' => Pages\CreateGuideBooking::route('/create'),
            'edit' => Pages\EditGuideBooking::route('/{record}/edit'),
        ];
    }
}
