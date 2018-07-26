// Importing Configuration class from different file
var Config = require("./Config");
var pizzapi = require("pizzapi");

var storeID;

var data = new Config();
var myStore;

// Method gets StoreID variable based on nearest store to Configured Address
var getStoreID = function(){
  pizzapi.Util.findNearbyStores(
    data.address, data.method, function(storeData){
      storeID = storeData.result.Stores[0].StoreID;
      console.log("StoreID for address: " + storeID);
    }
  );
}

var getMenu = function(){
  myStore.getFriendlyNames(function(storeData){
    console.log(storeData);
  });
}

var placeOrder = function(){
  getStoreID();
  // Timeout allows variable to be retrieved
  setTimeout(function(){
    myStore = new pizzapi.Store(0);
    myStore.ID = storeID;
    //console.log("storeID: " + myStore.ID + " and variable:"+storeID);
    // myStore.getInfo(function(storeData){
    //   console.log(storeData);
    // });
    getMenu();
  }, 5000);
}
placeOrder();
// console.log("HERE: " + storeID);
//
// console.log("Running now:");
// console.log("Address is: " + data.address);
// console.log("Name is: " + data.name);




// //////////////////////////////////////////////////////////////////////////////
// pizzapi.Util.findNearbyStores(
//   "3989 Panther Street, Victoria,BC, V8N3R2",
//   "Delivery",
//   function(storeData){
//     console.log(storeData);
//     console.log("\n");
//     console.log(storeData.result.Stores[0]);
//   }
// );
