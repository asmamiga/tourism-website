<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\BlogCommentResource\Pages;
use App\Models\BlogComment;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class BlogCommentResource extends Resource
{
    protected static ?string $model = BlogComment::class;

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';
    
    protected static ?string $navigationGroup = 'Content';
    
    protected static ?string $navigationLabel = 'Blog Comments';
    
    // Hide from navigation
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
                Forms\Components\Select::make('post_id')
                    ->relationship('post', 'title')
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
                Forms\Components\Textarea::make('content')
                    ->required()
                    ->maxLength(65535)
                    ->columnSpanFull(),
                Forms\Components\Toggle::make('is_approved')
                    ->default(false)
                    ->helperText('Approved comments are displayed on the blog'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('post.title')
                    ->label('Blog Post')
                    ->searchable()
                    ->limit(30)
                    ->sortable(),
                Tables\Columns\TextColumn::make('user.email')
                    ->label('Commenter')
                    ->formatStateUsing(function ($state, $record) {
                        $user = $record->user;
                        if ($user) {
                            return $user->first_name . ' ' . $user->last_name;
                        }
                        return $state;
                    })
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('content')
                    ->limit(50)
                    ->searchable(),
                Tables\Columns\IconColumn::make('is_approved')
                    ->boolean()
                    ->label('Approved'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_approved')
                    ->label('Approval Status'),
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
                Tables\Actions\Action::make('approve')
                    ->label('Approve')
                    ->icon('heroicon-o-check')
                    ->color('success')
                    ->action(function (BlogComment $record) {
                        $record->is_approved = true;
                        $record->save();
                    })
                    ->requiresConfirmation()
                    ->hidden(fn (BlogComment $record) => $record->is_approved),
                Tables\Actions\Action::make('unapprove')
                    ->label('Unapprove')
                    ->icon('heroicon-o-x-mark')
                    ->color('danger')
                    ->action(function (BlogComment $record) {
                        $record->is_approved = false;
                        $record->save();
                    })
                    ->requiresConfirmation()
                    ->hidden(fn (BlogComment $record) => !$record->is_approved),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('approveSelected')
                        ->label('Approve Selected')
                        ->icon('heroicon-o-check')
                        ->action(function (\Illuminate\Support\Collection $records) {
                            $records->each(function ($record) {
                                $record->is_approved = true;
                                $record->save();
                            });
                        })
                        ->requiresConfirmation()
                        ->deselectRecordsAfterCompletion(),
                    Tables\Actions\BulkAction::make('unapproveSelected')
                        ->label('Unapprove Selected')
                        ->icon('heroicon-o-x-mark')
                        ->action(function (\Illuminate\Support\Collection $records) {
                            $records->each(function ($record) {
                                $record->is_approved = false;
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
            'index' => Pages\ListBlogComments::route('/'),
            'create' => Pages\CreateBlogComment::route('/create'),
            'edit' => Pages\EditBlogComment::route('/{record}/edit'),
        ];
    }
}
