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
  console.log("connected as id: " + connection.threadId)
});
