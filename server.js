// Importing Configuration class from different file
var Config = require("./Config");
var pizzapi = require("pizzapi");
var express = require("express");

var app = express();

var storeID;
var data = new Config();
var myStore;
var order;
var fullAddress = new pizzapi.Address(data.address);

// Method gets StoreID variable based on nearest store and calls the method
// responsible for setting up the order. It also validates the order.
var createOrder = function(){
  pizzapi.Util.findNearbyStores(
    data.address, data.method, function(storeData){
      console.log("--- Retrieving store number for address ---");
      storeID = storeData.result.Stores[0].StoreID;
      console.log("\tStoreID: " + storeID);
      console.log("--- Setting up order ---");
      setUpOrder();
      validateOrder();
    }
  );
}

// Method used to retrieve and output the store menu to console
var getMenu = function(){
  myStore.getFriendlyNames(function(storeData){
    console.log(storeData.result);
  });
}

// Method used to initialize and set up the order object
var setUpOrder = function(){
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


// --- Express Routings --- //
app.get("/", function(req, res){
  console.log("* The main page has been loaded by a client.");
});


// Initializing the server
var PORT = 5000;
app.listen(PORT, function(){
  console.log("Listening on port %d", PORT);
});
// Called after the server is initialized
createOrder();


// addItemToOrder("14SCVEGGIE");
// priceOrder();
// addItemToOrder("14SCVEGGIE");
// validateOrder();
// priceOrder();
// WE WILL GET RID OF THE TIME OUT. ORDER WILL BE INITIALIZED WHEN THE SERVER IS INITIALIZED.
// DIFFERENT ROUTES WILL HANDLE DIFFERENT METHODS. ONCE THEY ARE CALLED THE ORDER OBJECT
// WILL HAVE BEEN PREVIOUSLY SET UP.
// // Created timer to allow program to fetch store ID from API before intializing the store variable
// setTimeout(function(){
//   setUpOrder();
//   addItemToOrder("14SCVEGGIE");
//   addItemToOrder("14SCVEGGIE");
//   validateOrder();
//   priceOrder();
// // console.log("NEW SECTION:");
// // var cardNumber = '4100123422343234';
// //
// // var cardInfo = new order.PaymentObject();
// // cardInfo.Amount = order.Amounts.Customer;
// // cardInfo.Number = cardNumber;
// // cardInfo.CardType = order.validateCC(cardNumber);
// // cardInfo.Expiration = '0115';//  01/15 just the numbers "01/15".replace(/\D/g,'');
// // cardInfo.SecurityCode = '777';
// // cardInfo.PostalCode = '90210'; // Billing Zipcode
// }, 5000);


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
