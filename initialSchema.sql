DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
	id int not null auto_increment,
	product_name varchar(50) not null,
	price int default 0,
	stock_quantity int default 0,
  	PRIMARY KEY (id)
);
