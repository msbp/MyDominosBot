// Importing Configuration class from different file
var Config = require("./Config");
var pizzapi = require("pizzapi");
var express = require("express");
var AssistantV1 = require("watson-developer-cloud/assistant/v1");
var twilio = require("twilio");

var app = express();
// Used to keep track of users for interacting with Watson
var contexts = [];

var storeID;
var data = new Config();
var myStore;
var order;
var fullAddress = new pizzapi.Address(data.address);
var client = new twilio(data.SID, data.token);
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

// Handles sms from twillio
app.get("/sendsms", function(req, res){
  var message = req.query.Body;
  var number = req.query.From;
  var twilioNumber = req.query.To;

  var context = null;
  var index = 0;
  var contextIndex = 0;
  contexts.forEach(function (value){
    console.log(value.from);
    if (value.from == number){
      context = value.context;
      contextIndex = index;
    }
    index++;
  });
  console.log("Received a message from " + number + " saying \"" + message + "\"");

  var assistant = new AssistantV1({
    username: data.username,
    password: data.password,
    url: "https://gateway.watsonplatform.net/assistant/api",
    version: "2018-02-16"
  });

  assistant.message({
    workspace_id: "c1855dd8-10c9-43cf-88f7-a7de4f866303",
    input: {"text": message},
    context: context
  }, function(err, response){
    if (err){
      console.error("There was an error with Watson: " + err);
    } else {
      // Iterating through the outputs
      response.output.text.forEach(function(value){
        console.log(value);
        // Sending output message to user using twilio
        client.messages.create({
          from: twilioNumber,
          to: number,
          body: value
        }, function(err, message){
          if (err){
            console.error("There was an error with Twilio: " + err);
          }
        });
      });

      // Setting/Updating context
      if (context == null){
        contexts.push({"from": number, "context":response.context});
      } else {
        contexts[contextIndex].context = response.context;
      }
      // Setting/Updating entities values
      if (response.entities.length > 0){
        response.entities.forEach(function (value){
          contexts[contextIndex][value.entity] = value.value;
          console.log(contexts[contextIndex]);
        });
      }

      // This will check for when the user is done interacting with Watson.
      // Also cases where the order is cancelled. Still need to create an intent
      // for that case.
      // var entities = response.intents[0].intent;
      // console.log(intent);
      // // Delete context when watson is finished the conversation
      // if (intent == "done"){
      //   contexts.splice(contextIndex, 1);
      // }

      res.send("");
    }
  });

});

// Initializing the server
var PORT = 5000;
app.listen(PORT, function(){
  console.log("Listening on port %d", PORT);
});
// Called after the server is initialized
// createOrder();

// NOTES
//  What size pizza would you like?
//  What kind of pizza would you like? Veggie, Cheese, Pepperoni
//  Would you like anything else?
//  Is this for Delivery/Carryout?
//  Do you have any coupons?
// END NOTES

// addItemToOrder("14SCVEGGIE");
// priceOrder();
// addItemToOrder("14SCVEGGIE");
// validateOrder();
// priceOrder();


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
