interface ExtendableEvent extends Event {
  waitUntil(fn: Promise<any>): void;
}

interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Promise<Response> | Response): Promise<Response>;
}

const CACHE_NAME = 'sw-cache-1';
const INITIAL_FILES_TO_CACHE = [
  '/fonts/Merriweather_Bold.woff2',
  '/fonts/SourceSansPro_Regular.woff2',
  '/fonts/SourceSansPro_Bold.woff2',
  '/fonts/SourceSansPro_It.woff2',
];
const DYNAMIC_FILES_CACHE_PATTERN = /(\.js|\.css|\.png|\.jpg|\.woff2)$/i;

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      cache.addAll(INITIAL_FILES_TO_CACHE);
    }),
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  return event.respondWith(
    new Promise((resolve, reject) => {
      const { method, url } = event.request;

      if (method !== 'GET' || /(browser-sync)/g.test(url)) {
        return fetch(event.request)
          .then(resolve)
          .catch(reject);
      }

      const shouldGetFromCache = DYNAMIC_FILES_CACHE_PATTERN.test(url);

      // if url is of cacheable type, look in cache: if cached return, else fetch -> cache -> return
      if (shouldGetFromCache) {
        return caches.match(event.request).then(response => {
          if (response) {
            return resolve(response);
          }
          fetchAndCache(event)
            .then(resolve)
            .catch(reject);
        });
      } else {
        // if url is not cacheable then fetch -> if error, then return from cache, else cache -> return
        return fetchAndCache(event)
          .then(resolve)
          .catch(error => {
            caches.match(event.request.clone()).then(response => {
              if (response) {
                return resolve(response);
              }
              reject(error);
            });
          });
      }
    }),
  );
});

function fetchAndCache(event: FetchEvent): Promise<any> {
  return fetch(event.request.clone()).then(res => {
    if (!isResponseValid(res)) {
      return res;
    }
    const resCloned = res.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request.clone(), resCloned));
    return res;
  });
}

function isResponseValid(response: Response) {
  return response && response.status === 200 && response.type === 'basic';
}
