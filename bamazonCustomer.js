var mysql = require("mysql"),
    inquirer = require("inquirer");

var connection = mysql.createConnection({
  host:"localhost",
  port: 3306,
  user:"root",
  password: "",
  database: "bamazon"
});

var totalCost = 0;

connection.connect(function(err){
  if (err) throw err;
  console.log("connected as id: " + connection.threadId)
  start();
});

function start() {
  // query the database here

  connection.query("SELECT * FROM products", function(err, res){
    if(err) throw err;
    console.log(res);
    buyItem();

  });
};

function buyItem() {
  // query the database
  connection.query("SELECT * FROM products", function(err, res){
  if(err) throw err;

  // ask for ID and how many they want to buy
  inquirer.prompt([
  {
    // get item ID
    name: "id",
    type: "input",
    message: "What's the ID of the product you're looking for?",
    // make sure it's a number
    validate: function(val) {
      if (isNaN(val) === false) {
        return true;
      }
      console.log("\n" + "Please enter a number between 1 and " + res.length);
      return false
    }
  },
  {
    // get order quantity
    name: "quantity",
    type: "input",
    message: "How many do you want to buy?",
    // make sure it's a number
    validate: function(val) {
      if (isNaN(val) === false) {
        return true;
      }
      return false
    }
  }
  ]).then(function(answer) {
      var chosenItem = '';
      var found = false;
      var inStock = false;
      var stock = 0;

      console.log(stock);

      // check if we have enough, and if we have it at all
      for(var i=0; i < res.length; i++){
        if(res[i].id === parseInt(answer.id) && res[i].stock_quantity >= answer.quantity){
          found = true;
          inStock = true;
          chosenItem = res[i];
          stock = res[i].stock_quantity;
        } else if (res[i].id === parseInt(answer.id) && res[i].stock_quantity < answer.quantity) {
          found = true;
          inStock = false;
          chosenItem = res[i];
          stock = res[i].stock_quantity;
        };
      };
      // we have it and we have enough of the item
      if(found === true && inStock === true){
        connection.query(
         "UPDATE products SET ? WHERE ?",
         [
          {
            stock_quantity: chosenItem.stock_quantity - answer.quantity
           },
          {
           id: chosenItem.id
          }
         ],
        );
        var cost = chosenItem.price * answer.quantity;
        totalCost += cost;

        console.log("You bought " + answer.quantity + " of our "+ chosenItem.product_name + ", and it only cost you $" + cost + "! What a bargain! So far you've spent $" + totalCost + ".");


      } else if(found === true && inStock === false && stock > 0) {
        console.log("Sorry, we only have " + stock + " " + chosenItem.product_name + "s.");
      } else if(found === true && inStock === false && stock < 1){
        console.log("Sorry, we're waiting on a new shipment of " + chosenItem.product_name + "s currently.");
      }
      else {
        console.log("We don't have anything with that ID number, please enter an ID between 1 and " + res.length + ".");
      }

      inquirer.prompt([
        {
          name: "continue",
          type: "list",
          message: "Do you want to buy something else?",
          choices: ['Well, it is the driving force behind my existence in this capitalist hellhole...', 'No thanks, my mindless consumption has triggered enough dopamine for me today.']
        }
      ]).then(function(answer){
        var buyMore = false;
        if(answer.continue === 'Well, it is the driving force behind my existence in this capitalist hellhole...') {
          buyMore = true;
        }

        if(buyMore) {
          console.log("You've currently spent $" + totalCost + ".");
          buyItem();
        }
        else {
          console.log("Good call. Better to get out when you've only spent $" + totalCost + ".");
          connection.end();
        }

      });

   });
 });


 };
