<?php
declare(strict_types=1);

require dirname(__DIR__) . '/lib/http.php';
require dirname(__DIR__) . '/lib/store.php';

apply_cors();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = request_path();

if (str_starts_with($path, '/v1/')) {
    $path = substr($path, 3);
}

if ($path === '/health') {
    send_json([
        'ok' => true,
        'service' => 'zacharie-l-nolet',
        'time' => gmdate('c'),
    ]);
}

if ($path === '/articles' && $method === 'GET') {
    $articles = read_collection('catalog.json');
    send_json(['articles' => $articles, 'source' => 'php-file']);
}

if (preg_match('#^/articles/([^/]+)$#', $path, $m) && $method === 'GET') {
    foreach (read_collection('catalog.json') as $article) {
        if (($article['id'] ?? '') === $m[1]) {
            send_json($article);
        }
    }
    send_json(['error' => 'not_found'], 404);
}

if (preg_match('#^/edition/([^/]+)$#', $path, $m) && $method === 'GET') {
    $date = $m[1];
    $articles = read_collection('catalog.json');
    $picked = array_values(array_filter(
        $articles,
        static fn(array $a): bool => ($a['editionDate'] ?? null) === $date
    ));
    usort($picked, static fn(array $a, array $b): int => ($a['rank'] ?? 99) <=> ($b['rank'] ?? 99));
    $picked = array_slice($picked, 0, 10);
    send_json([
        'edition' => [
            'date' => $date,
            'title' => 'Édition du jour',
            'kicker' => 'Dix textes. Pas de fil.',
            'articleIds' => array_column($picked, 'id'),
        ],
        'articles' => $picked,
    ]);
}

if ($path === '/notes' && $method === 'GET') {
    send_json(['notes' => read_collection('notes.json')]);
}

if ($path === '/notes' && $method === 'POST') {
    $note = json_input();
    if (empty($note['id'])) {
        send_json(['error' => 'id_required'], 422);
    }
    $note['updatedAt'] = $note['updatedAt'] ?? gmdate('c');
    $note['remoteUpdatedAt'] = gmdate('c');
    $items = upsert_by_id(read_collection('notes.json'), $note, 'id');
    write_collection('notes.json', $items);
    send_json($note, 201);
}

if (preg_match('#^/notes/([^/]+)$#', $path, $m) && $method === 'PUT') {
    $note = json_input();
    $note['id'] = $m[1];
    $note['updatedAt'] = $note['updatedAt'] ?? gmdate('c');
    $note['remoteUpdatedAt'] = gmdate('c');
    write_collection('notes.json', upsert_by_id(read_collection('notes.json'), $note, 'id'));
    send_json($note);
}

if (preg_match('#^/notes/([^/]+)$#', $path, $m) && $method === 'DELETE') {
    write_collection('notes.json', reject_by_id(read_collection('notes.json'), $m[1], 'id'));
    send_empty(204);
}

if ($path === '/bookmarks' && $method === 'GET') {
    send_json(['bookmarks' => read_collection('bookmarks.json')]);
}

if ($path === '/bookmarks' && $method === 'POST') {
    $bookmark = json_input();
    if (empty($bookmark['articleId'])) {
        send_json(['error' => 'articleId_required'], 422);
    }
    $bookmark['savedAt'] = $bookmark['savedAt'] ?? gmdate('c');
    $bookmark['remoteUpdatedAt'] = gmdate('c');
    write_collection(
        'bookmarks.json',
        upsert_by_id(read_collection('bookmarks.json'), $bookmark, 'articleId')
    );
    send_json($bookmark, 201);
}

if (preg_match('#^/bookmarks/([^/]+)$#', $path, $m) && $method === 'DELETE') {
    write_collection(
        'bookmarks.json',
        reject_by_id(read_collection('bookmarks.json'), $m[1], 'articleId')
    );
    send_empty(204);
}

send_json(['error' => 'not_found', 'path' => $path], 404);
