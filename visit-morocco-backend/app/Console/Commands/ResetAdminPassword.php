<?php

namespace App\Console\Commands;

use App\Models\Admin;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class ResetAdminPassword extends Command
{
    protected $signature = 'admin:reset-password {email} {password?}';
    protected $description = 'Reset admin password';

    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password') ?? 'Admin@1234';

        $admin = Admin::where('email', $email)->first();

        if (!$admin) {
            $this->error("Admin with email {$email} not found!");
            return 1;
        }

        $admin->password = Hash::make($password);
        $admin->save();

        $this->info("Password for {$email} has been reset to: {$password}");
        return 0;
    }
}
