define(['./template.js', './clientStorage.js'], function(template, clientStorage) {
  var apiUrlPath = 'https://bstavroulakis.com/pluralsight/courses/progressive-web-apps/service/';
  var apiUrlLatest = apiUrlPath + 'latest-deals.php';
  var apiUrlCar = apiUrlPath + 'car.php?carId='

  function loadMoreRequest() {
    fetchPromise()
      .then((status) => {
        document.getElementById('connection-status').innerHTML = status;
        loadMore()
      });
  }

  function fetchPromise() {
    return new Promise((resolve, reject) => {
      fetch(apiUrlLatest + "?carId=" + clientStorage.getLastCarId())
        .then((response) => response.json())
        .then((data) => {
          clientStorage.addCars(data.cars)
            .then(() => {
              data.cars.forEach(preCatchDetailsPage);
              resolve('The connection is OK, showing latest results')
          });
        })
        .catch((e) => resolve('No connection, showing offline results'));
        setTimeout(() => resolve('The connection is hanging, showing offline results'), 3000);
    })
  }

  function loadMore() {
    clientStorage.getCars().then((cars) => {
      template.appendCars(cars);
    });
  }

  function loadCarPage(carId) {
    fetch(apiUrlCar + carId)
      .then((response) => response.text())
      .then((data) => {
        document.body.insertAdjacentHTML('beforeend', data)
      })
      .catch(() => alert("Oops, can't retrieve page"));
  }

  function preCatchDetailsPage(car) {
    if('serviceWorker' in navigator) {
      var carDetailsUrl = apiUrlCar + car.value.details_id
      window.caches.open('carDealsCachePagesV1')
        .then((cache) => {
          cache.match(carDetailsUrl).then((response) => {
            if(!response) cache.add(new Request(carDetailsUrl));
          })
        })
    }
  }

  return {
    loadMoreRequest,
    loadCarPage
  }
});
