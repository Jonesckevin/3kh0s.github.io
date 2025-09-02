const CACHE_NAME = 'seraph-cache';
const OFFLINE_URLS = [
    '/offline.html',
];

// Block Google Analytics/Tag Manager requests (privacy)
const ANALYTICS_HOSTS = new Set([
    'www.google-analytics.com',
    'ssl.google-analytics.com',
    'analytics.google.com',
    'www.googletagmanager.com',
    'googletagmanager.com',
]);

function isAnalyticsRequest(urlString) {
    try {
        const u = new URL(urlString);
        const h = u.hostname;
        if (
            ANALYTICS_HOSTS.has(h) ||
            h.endsWith('.google-analytics.com') ||
            h.endsWith('.googletagmanager.com')
        ) {
            return true;
        }
        const p = u.pathname || '';
        // GA Universal/GA4/Mobile SDK endpoints
        if (
            (p === '/collect' || p === '/g/collect' || p === '/j/collect' ||
                p.startsWith('/collect') || p.startsWith('/g/collect') || p.startsWith('/j/collect')) &&
            (h.endsWith('google-analytics.com') || h === 'analytics.google.com')
        ) {
            return true;
        }
        // Tag Manager script
        if (p === '/gtm.js' && (h === 'www.googletagmanager.com' || h === 'googletagmanager.com')) {
            return true;
        }
    } catch (_) {}
    return false;
}

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(OFFLINE_URLS).then(function() {
                self.skipWaiting();
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => client.postMessage('cached'));
                });
            });
        })
    );
});

self.addEventListener('fetch', function(event) {
    // Block tracking beacons
    if (isAnalyticsRequest(event.request.url)) {
        event.respondWith(new Response('', { status: 204, statusText: 'No Content' }));
        return;
    }

    event.respondWith(
        fetch(event.request).catch(function() {
            return caches.match(event.request).then(function(response) {
                if (response) {
                    return response;
                }
                if (event.request.mode === 'navigate') {
                    return caches.match('/offline.html');
                }
            });
        })
    );
});

self.addEventListener('activate', function(event) {
    var cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});


