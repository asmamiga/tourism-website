<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Disable CSRF for API routes
        $middleware->validateCsrfTokens(except: [
            'api/*',
            'sanctum/*',
            'login',
            'logout',
            'register',
            'password/*'
        ]);
        
        // Add CORS middleware to all routes
        $middleware->append(\App\Http\Middleware\HandleCors::class);
        
        // Trust all proxies (useful if using a load balancer or proxy)
        $middleware->trustProxies(at: '*');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
