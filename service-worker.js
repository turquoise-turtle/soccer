var CACHE = 'cache-and-update-and-offline-soccer';

/*self.addEventListener('install', function(event) {
  // Put `offline.html` page into cache
  var offlineRequest = new Request('offline.html');
  event.waitUntil(
    fetch(offlineRequest).then(function(response) {
      return caches.open('offline').then(function(cache) {
        console.log('[oninstall] Cached offline page', response.url);
        return cache.put(offlineRequest, response);
      });
    })
  );
});*/
// On install, cache some resources.
self.addEventListener('install', function(evt) {
  console.log('The service worker is being installed.');
  // Ask the service worker to keep installing until the returning promise resolves.
  evt.waitUntil(precache());
});


// On fetch, use cache but update the entry with the latest contents from the server.
self.addEventListener('fetch', function(evt) {
  //console.log('The service worker is serving the asset.');
  // You can use `respondWith()` to answer immediately, without waiting for the network response to reach the service worker...
  evt.respondWith(fromCache(evt.request));
  // ...and `waitUntil()` to prevent the worker from being killed until the cache is updated.
  evt.waitUntil(update(evt.request));
});


// Open a cache and use `addAll()` with an array of assets to add all of them to the cache. Return a promise resolving when all the assets are added.
function precache() {
  return caches.open(CACHE).then(function (cache) {
	return cache.addAll([
	  '/soccer/offline.html',
	  '/soccer/index.html',
	  '/soccer/arrow.jpg',
	  '/soccer/soccerapp.js',
	  '/soccer/style.css',
	  '/soccer/vue.min.js',
	  '/soccer/favicon.ico',
	  '/soccer/icon/favicon-16x16.png',
	  '/soccer/icon/favicon-32x32.png',
	  '/soccer/icon/favicon-96x96.png',
	  '/soccer/icon/favicon-128.png',
	  '/soccer/icon/favicon-196x196.png',
	  '/soccer/icon/icon-192x192.png',
	  '/soccer/icon/icon-512x512.png'
	]);
  });
}

// Open the cache where the assets were stored and search for the requested resource. Notice that in case of no matching, the promise still resolves but it does with `undefined` as value.
function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      //v3
      if (!matching) {
      	if (navigator.onLine) {
      	  console.log('from online', request.url);
      	  return fetch(request);
      	} else {
      	  if (request.method === 'GET' && request.headers.get('accept').includes('text/html')) {
      	  	console.log('offline.html');
      	  	return cache.match('/soccer/offline.html');
      	  }

      	}
      } else {
      	console.log('from cache', request.url);
      	return matching;
      }
      
      /*v3
      if (navigator.onLine) {
      	return matching || fetch(request);
      } else {
      	if (request.method === 'GET' && request.headers.get('accept').includes('text/html')) {
      		return cache.match('/soccer/offline.html');
      	}
      	return Promise.reject('no-match, offline, not html');
      }
      */
      /*v2
      if (navigator.onLine) {
      	return matching || Promise.reject('no-match');
      } else {
      	var offlineReq = new Request('offline.html');
      	cache.match(offlineReq).then(function(match){
      	  return match || Promise.reject('no-match');
      	});
      }
      */
      /*v1
      return matching || Promise.reject('no-match');
      */
    }).catch(function(error) {
      console.log(error);
    });
  });
}

// Update consists in opening the cache, performing a network request and storing the new response data.
function update(request) {
  if (request.url.indexOf('soccerapp-cors') > -1) {
  	return Promise.resolve();
  }
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response);
    }).catch(function(error){
    	console.log(error);
    	//do nothing
    	return Promise.resolve();
    });
  });
}