var mysql = require("mysql"),
    inquirer = require("inquirer");

var connection = mysql.createConnection({
  host:"localhost",
  port: 3306,
  user:"root",
  password: "",
  database: "bamazon"
});

connection.connect(function(err){
  if (err) throw err;
  console.log("connected as id: " + connection.threadId)
  start();
});

function start() {
  // query the database here
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;

  connection.query("SELECT * FROM products", function(err, res){
    if(err) throw err;
    console.log(res);
  });

 //  inquirer.prompt({
 //    name: "postOrBid",
 //    type: "input",
 //    message: "What's the ID of the product you're looking for?"
 //    // validate: function IDCheck(int) {
 //    //   var input = int;
 //    //   if (input % 1 === 0) {
 //    //     return true;
 //    //   } else if(isNaN(input)) {
 //    //     return "please enter an integer for the ID."
 //    //   } else {
 //    //     "Please enter the integer number for your product ID."
 //    //   }
 //    // }
 //  }).then(function(answer) {
 //
 //   });
 });
};
