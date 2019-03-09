'use strict';

var carDealsCacheName = 'carDealsCacheV1';
var carDealsCachePagesName = 'carDealsCachePagesV1';
var carDealsCacheImagesName = 'carDealsCacheImagesV1';

const carDealsCacheFiles = [
  'js/app.js',
  'js/carService.js',
  'js/clientStorage.js',
  'js/swRegister.js',
  'js/template.js',
  'favicon.ico',
  './',
  'resources/es6-promise/es6-promise.js',
  'resources/localforage/localforage.min.js',
  'resources/localforage/localforage-getitems.js',
  'resources/localforage/localforage-setitems.js',
  'resources/material-design-light/material.min.js',
  'resources/material-design-light/material.min.js.map',
  'resources/material-design-light/material.red-indigo.min.css',
  'resources/systemjs/system.js',
  'resources/systemjs/system-polyfills.js',
  'resources/systemjs/system.js.map',
  'resources/systemjs/system.src.js'
];

var latestPath = '/pluralsight/courses/progressive-web-apps/service/latest-deals.php';
var imagePath = '/pluralsight/courses/progressive-web-apps/service/car-image.php';
var carPath = '/pluralsight/courses/progressive-web-apps/service/car.php';


self.addEventListener('install', (event) => {
  console.log('From SW: Install Event', event);
  self.skipWaiting();
  event.waitUntil(
    caches.open(carDealsCacheName)
      .then((cache) => cache.addAll(carDealsCacheFiles))
      .catch(err => console.log(err))
  );
})

self.addEventListener('activate', (event) => {
  console.log('From SW: Activate State', event);
  self.clients.claim();
  event.waitUntil(
    caches.keys()
      .then((cacheKeys) => {
        const deletePromises = [];
        for(var i = 0; i < cacheKeys.length; i++) {
          if(cacheKeys[i] !== carDealsCacheName &&
            cacheKeys[i] !== carDealsCachePagesName &&
            cacheKeys[i] !== carDealsCacheImagesName) {
            deletePromises.push(caches.delete(cacheKeys[i]))
          }
        }
        return Promise.all(deletePromises);
      })
  )
});

self.addEventListener('fetch', (e) => {
  const requestUrl = new URL(e.request.url);
  const requestPath = requestUrl.pathname;
  const fileName = requestPath.substring(requestPath.lastIndexOf('/') + 1);

  if(requestPath === latestPath || fileName === 'sw.js') {
    e.respondWith(fetch(e.request));
  } else if(requestPath === imagePath) {
    e.respondWith(networkFirstStrategy(e.request));
  } else {
    e.respondWith(cacheFirstStrategy(e.request));
  }
})

function cacheFirstStrategy(request) {
  return caches.match(request).then((cacheResponse) => {
    return cacheResponse || fetchRequestAndCache(request);
  });
}

function networkFirstStrategy(request) {
  return fetchRequestAndCache(request).catch((response) => {
    return caches.match(request);
  })
}

function fetchRequestAndCache(request) {
  return fetch(request).then((networkResponse) => {
    caches.open(getCacheName(request)).then((cache) => {
      if(!(request.url.indexOf('http'))) {
        cache.put(request, networkResponse);
      }
    });
    return networkResponse.clone();
  })
}

function getCacheName(request) {
  const requestUrl = new URL(request.url);
  const requestPath = requestUrl.pathname;

  if(requestPath === imagePath) {
    return carDealsCacheImagesName;
  } else if(requestPath === carPath) {
    return carDealsCachePagesName;
  } else {
    return carDealsCacheName;
  }
}

self.addEventListener('message', (event) => {
  console.log(event);
  event.source.postMessage({ clientId: event.source.id, message: 'sw' });
})
