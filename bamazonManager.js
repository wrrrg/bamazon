var mysql = require("mysql"),
    inquirer = require("inquirer"),
    Table = require("cli-table");

var connection = mysql.createConnection({
  host:"localhost",
  port: 3306,
  user:"root",
  password: "",
  database: "bamazon"
});

var actions = ["View all products", "View products low in stock", "Restock an item", "Add a new product"];

connection.connect(function(err){
  if (err) throw err;
  console.log("connected as id: " + connection.threadId)
  start();
});

function start() {
  // query the database here

  connection.query("SELECT * FROM products", function(err, res){
    if(err) throw err;
    inquirer.prompt([
    {
      // get the manager action
      name: "action",
      type: "list",
      message: "What did you want to do with your bamazon store today?",
      choices: actions

    },
    ]).then(function(answer) {
      var action = answer.action;
      actionDB = actions;
      switch(action){
        case action = actionDB[0]:
          console.log("View products! Great!");
          viewProductsForSale();
          break;
        case action = actionDB[1]:
          console.log("Checking on low stock items...");
          viewLowStock();
          break;
        case action = actionDB[2]:
          console.log("Restocking now!");
          restockInv();
          break;
        case action = actionDB[3]:
          console.log("Add a new item eh?");
          addNewProduct();
          break;
        default:
          console.log("You didn't pick anything, or this is broken!");
          break;
      };
    });
  });
};


function viewProductsForSale() {
  // query the database
  connection.query("SELECT * FROM products", function(err, res){
    if(err) throw err;
    // instantiate
      var table = new Table({
      head: ['id', 'name', 'stock', 'price']
    , colWidths: [15, 60, 15, 15]
    });

    // table is an Array, so you can `push`, `unshift`, `splice` and friends
    for (var i = 0; i < res.length; i++) {
      table.push([res[i].id, res[i].product_name,res[i].stock_quantity,res[i].price]);
    };

    console.log("\n" + table.toString() + "\n" + "\n");
    moreAction();
  });
};

function viewLowStock(){
  //query DB
  connection.query("SELECT * FROM products", function(err, res){
    if(err) throw err;
    // instantiate
      var table = new Table({
      head: ['id', 'name', 'stock', 'price']
    , colWidths: [15, 60, 15, 15]
    });

    for (var i = 0; i < res.length; i++) {
      // anything with less than 3 in stock is pushed to table results
      if(res[i].stock_quantity < 3){
       table.push([res[i].id, res[i].product_name,res[i].stock_quantity,res[i].price]);
      };
    };

    console.log("\n" + table.toString() + "\n" + "\n");
    moreAction();
  });
};

function restockInv(){
  connection.query("SELECT * FROM products", function(err, res){
  if(err) throw err;

  inquirer.prompt([
    { name: "id",
      type: "input",
      message: "Please enter the item ID that you want to restock",
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
      name: "restock",
      type: "input",
      message: "How many did you want to add?",    // make sure it's a number
          validate: function(val) {
            if (isNaN(val) === false && val > 0) {
              return true;
            }
            console.log("\n" + "Please enter a positive integer for how much you want to add to your stock.");
            return false
          }
    }
  ]).then(function(answer) {
      var chosenItem = '';
      var newStock = 0;
      for (var i = 0; i < res.length; i++) {
        if(res[i].id == answer.id){
          chosenItem = res[i];
          newStock = res[i].stock_quantity + parseInt(answer.restock);
        }
      }

      connection.query(
        "UPDATE products SET ? WHERE ?",
        [
          {
            stock_quantity: newStock
          },
          {
            id: chosenItem.id
          }
        ],
      function(error) {
        if(error) throw err;
        console.log("Your stock for " + chosenItem.product_name + " is now " + newStock + ".");
        moreAction();
      }
    );

    });
  });

};

function addNewProduct(){
  connection.query("SELECT * FROM products", function(err, res){
  if(err) throw err;

  inquirer.prompt([
    { name: "product_name",
      type: "input",
      message: "What is the name of your new product?",
      // make sure it's a number
      validate: function(val) {
        if (typeof val == 'string'){
          return true
        }
        console.log("Please enter the name of your new item.");
        return false
      }
    },
    {
      name: "stock",
      type: "input",
      message: "What's your starting stock of this item?",    // make sure it's a number
          validate: function(val) {
            if (isNaN(val) === false && val > 0) {
              return true;
            }
            console.log("\n" + "Please enter a positive integer for the initial item stock.");
            return false
          }
    },
    {
      name: "price",
      type: "input",
      message: "What's your starting price for this item?",    // make sure it's a number
          validate: function(val) {
            if (isNaN(val) === false && val > 0) {
              return true;
            }
            console.log("\n" + "Please enter a positive integer for the initial item price.");
            return false
          }
    },
  ]).then(function(answer) {
      var newItem = {
          product_name: answer.product_name,
          price: parseInt(answer.price),
          stock_quantity: parseInt(answer.stock),
          id: res.length + 1
      };
      var sql = "INSERT INTO products (id, product_name, stock_quantity, price) VALUES ?";
      var values = [newItem.id, newItem.product_name, newItem.stock_quantity, newItem.price];

     connection.query(sql, [values],


      function(error) {
        if(error){
          console.log(error);
        }
        console.log("Added successfully.");
        moreAction();
      }
     );

    });
  });

};

function moreAction() {
  inquirer.prompt([
    {
      name: "continue",
      type: "list",
      message: "Anything else today boss?",
      choices: ["One more thing...", "Not today, thanks."]
    }
  ]).then(function(answer){
    var moreAction = false;
    if(answer.continue === 'One more thing...') {
      moreAction = true;
    }

    if(moreAction) {
      start();
    }
    else {
      console.log("See ya at the bar!");
      connection.end();
    }
  });
};
