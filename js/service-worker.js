let CACHE_VERSION = 'app-v21';

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(function (cache) {
                console.log('Opened cache');
                return fetchAndCacheFiles(cache);
            })
    );
});

function fetchAndCacheFiles(cache) {
    // List of directories to cache
    let directoriesToCache = ['js', 'images', 'gamelist'];

    // Files to cache in addition to the directories
    let additionalFilesToCache = ['index.html', 'styles.css'];

    // Array to store all the fetch promises
    let fetchPromises = [];

    // Cache the additional files
    additionalFilesToCache.forEach(function (file) {
        fetchPromises.push(cache.add(file));
    });

    // Loop through each directory and fetch all files within it
    directoriesToCache.forEach(function (directory) {
        fetchPromises.push(
            fetch(directory)
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error('Failed to fetch ' + directory);
                    }

                    // Cache each file within the directory
                    return response.text().then(function (text) {
                        let files = text.split('\n').filter(Boolean);
                        let filePromises = files.map(function (file) {
                            let url = directory + '/' + file;
                            return cache.add(url);
                        });

                        return Promise.all(filePromises);
                    });
                })
        );
    });

    // Return a promise that resolves when all files are cached
    return Promise.all(fetchPromises);
}


self.addEventListener('fetch', function (event) {
    let online = navigator.onLine
    if (!online) {
        event.respondWith(
            caches.match(event.request).then(function (res) {
                if (res) {
                    return res;
                }
                requestBackend(event);
            })
        )
    }
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (key, i) {
                if (key !== CACHE_VERSION) {
                    return caches.delete(keys[i]);
                }
            }))
        })
    )
});

function requestBackend(event) {
    var url = event.request.clone();
    return fetch(url).then(function (res) {
        //if not a valid response send the error
        if (!res || res.status !== 200 || res.type !== 'basic') {
            return res;
        }

        var response = res.clone();

        caches.open(CACHE_VERSION).then(function (cache) {
            cache.put(event.request, response);
        });

        return res;
    })
}

self.addEventListener('install', (event) => {
    console.log('👷', 'install', event);
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
console.log('👷', 'activate', event);
return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
// console.log('👷', 'fetch', event);
event.respondWith(fetch(event.request));
});
