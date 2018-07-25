var pizzapi = require("pizzapi");

pizzapi.Util.findNearbyStores(
  "3989 Panther Street, Victoria,BC, V8N3R2",
  "Delivery",
  function(storeData){
    console.log(storeData);
    console.log("\n");
    console.log(storeData.result.Stores[0]);
  }
);
