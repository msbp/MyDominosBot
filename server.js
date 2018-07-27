// Importing Configuration class from different file
var Config = require("./Config");
var pizzapi = require("pizzapi");

var storeID;

var data = new Config();
var myStore;
var order;
var fullAddress = new pizzapi.Address(data.address);

// Method gets StoreID variable based on nearest store to Configured Address
var getStoreID = function(){
  pizzapi.Util.findNearbyStores(
    data.address, data.method, function(storeData){
      storeID = storeData.result.Stores[0].StoreID;
      console.log("StoreID for address: " + storeID);
    }
  );
}

// Method used to retrieve and output the store menu to console
var getMenu = function(){
  myStore.getFriendlyNames(function(storeData){
    console.log(storeData.result);
  });
}

// Method used to place order
var setUpOrder = function(){
  // getStoreID();
  // var fullAddress = new pizzapi.Address(data.address);

  // Timeout allows variable to be retrieved
    myStore = new pizzapi.Store(0);
    myStore.ID = storeID;

    // Customer object
    var customer = new pizzapi.Customer({
      address: fullAddress,
      firstName: data.firstName,
      lastName: data.lastName,
      phonenumber: data.phoneNumber,
      email: data.email
    });

    // Order object
    order = new pizzapi.Order({
      customer: customer,
      storeID: myStore.ID,
      deliveryMethod: data.method
    });

    // // Adding Item object to Order
    // order.addItem(new pizzapi.Item({
    //   code: "14SCVEGGIE",
    //   options:[],
    //   quantity: 1
    // }));

    // Validating Order
    // order.validate(function(result){
    //   if (result.success == true){
    //     console.log("--- Order has been validated ---");
    //     return;
    //   }
    //   console.log("--- Order failed to be validated ---");
    //   // console.log(result);
    // });
    // // Calculating price
    // order.price(function (result){
    //   console.log("Calculating price...: " + result.result.Order.Amounts.Payment);
    //   // console.log(result);
    // });

}

var addItemToOrder = function (code){
  if (typeof order === "undefined"){
    console.log("--- There was an error. The order object has not been initialized yet. ---");
    return;
  }
  order.addItem(new pizzapi.Item({
    code: code,
    options: [],
    quantity: 1
  }));
}

var validateOrder = function(){
  if (typeof order === "undefined"){
    console.log("--- There was an error. The order object has not been initialized yet. ---");
    return;
  }
  order.validate(function(result){
    if (result.success == true){
      console.log("--- Order has been validated ---");
      return;
    }
    console.log("--- Order failed to be validated ---");
  });
}

var priceOrder = function(){
  if (typeof order === "undefined"){
    console.log("--- There was an error. The order object has not been initialized yet. ---");
    return;
  }
  order.price(function (result){
    console.log("Calculating price...: " + result.result.Order.Amounts.Payment);
    // console.log(result);
  });
}

// Code used to log the menu to console
// var testStore = new pizzapi.Store(10053);
// testStore.ID = 10053;
// var menu;
// testStore.getFriendlyNames(function (storeData){
//   menu = storeData;
// });
// setTimeout(function () {
//   console.log("Output:");
//   console.log(menu.result);
// }, 5000);

getStoreID();
setTimeout(function(){
  setUpOrder();
  addItemToOrder("14SCVEGGIE");
  addItemToOrder("14SCVEGGIE");
  validateOrder();
  priceOrder();
}, 5000);
