<?php

namespace App\Events;

use App\Models\AppUser;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AppUserDeleted
{
    use Dispatchable, SerializesModels;

    /**
     * The app user instance.
     *
     * @var \App\Models\AppUser
     */
    public $appUser;

    /**
     * Create a new event instance.
     *
     * @param  \App\Models\AppUser  $appUser
     * @return void
     */
    public function __construct(AppUser $appUser)
    {
        $this->appUser = $appUser;
    }
}
