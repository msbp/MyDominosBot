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
  var fullAddress = new Address(data.address);
  // Timeout allows variable to be retrieved
  setTimeout(function(){
    myStore = new pizzapi.Store(0);
    myStore.ID = storeID;
    //console.log("storeID: " + myStore.ID + " and variable:"+storeID);
    // Creating Customer
    var customer = new Customer({
      address: fullAddress,
      firstName: data.firstName,
      lastName: data.lastName,
      phonenumber: data.phoneNumber,
      email: data.email
    });
    
    getMenu();
  }, 5000);
}



placeOrder();
