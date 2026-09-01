<?php
declare(strict_types=1);

/**
 * Routeur pour `php -S 127.0.0.1:8080 backend/php/router.php`
 * Toute URL non-fichier passe à public/index.php.
 */
$public = __DIR__ . '/public';
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$path = is_string($uri) ? $uri : '/';
$file = $public . $path;

if ($path !== '/' && is_file($file)) {
    return false;
}

require $public . '/index.php';
