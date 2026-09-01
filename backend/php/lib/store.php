<?php
declare(strict_types=1);

function data_path(string $file): string
{
    return dirname(__DIR__) . '/data/' . $file;
}

function read_collection(string $file): array
{
    $path = data_path($file);
    if (!is_file($path)) {
        return [];
    }
    $handle = fopen($path, 'rb');
    if ($handle === false) {
        return [];
    }
    flock($handle, LOCK_SH);
    $raw = stream_get_contents($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    $data = json_decode($raw ?: '[]', true);
    return is_array($data) ? $data : [];
}

function write_collection(string $file, array $items): void
{
    $path = data_path($file);
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
    $handle = fopen($path, 'c+b');
    if ($handle === false) {
        throw new RuntimeException('store_unwritable');
    }
    flock($handle, LOCK_EX);
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode(array_values($items), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
}

function upsert_by_id(array $items, array $incoming, string $key): array
{
    $found = false;
    foreach ($items as $i => $item) {
        if (($item[$key] ?? null) === ($incoming[$key] ?? null)) {
            $items[$i] = $incoming;
            $found = true;
            break;
        }
    }
    if (!$found) {
        $items[] = $incoming;
    }
    return $items;
}

function reject_by_id(array $items, string $id, string $key): array
{
    return array_values(array_filter(
        $items,
        static fn(array $item): bool => ($item[$key] ?? null) !== $id
    ));
}
