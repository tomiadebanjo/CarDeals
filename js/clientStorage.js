define([], function () {
  var limit = 3, lastItemId = null;
  var carsInstance = localforage.createInstance({
    name: 'cars'
  });

  function addCars(newCars) {
    return new Promise((resolve, reject) => {
      carsInstance.setItems(newCars)
        .then(() => resolve());
    })
  }

  function getCars() {
    return new Promise((resolve, reject) => {
      carsInstance.keys().then((keys) => {
        var index = keys.indexOf(lastItemId);
        if(index === -1) { index = keys.length; }
        if(index === 0) { resolve([]); return; }

        var keys = keys.splice(index - limit, limit);
        carsInstance.getItems(keys).then((results) => {
          var returnArr = Object.keys(results).map((k) => results[k]).reverse();
          lastItemId = returnArr[returnArr.length - 1].id;
          resolve(returnArr);
        })
      })
    })
  }

  function getLastCarId() {
    return lastItemId;
  }

  return {
    addCars,
    getCars,
    getLastCarId,
  }
})
