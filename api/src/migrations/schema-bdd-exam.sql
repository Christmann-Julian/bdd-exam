CREATE DATABASE IF NOT EXISTS `bdd-exam` CHARACTER SET utf8mb4;
USE `bdd-exam`;

CREATE TABLE IF NOT EXISTS `customer` (
    id int UNSIGNED NOT NULL AUTO_INCREMENT,
    firstname varchar(255) NOT NULL,
    lastname varchar(255) NOT NULL,
    adress varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    phone varchar(255) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `category` (
    id int UNSIGNED NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `product` (
    id int UNSIGNED NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    reference varchar(255) NOT NULL,
    price decimal(10,2) NOT NULL,
    stock int NOT NULL,
    category_id int UNSIGNED NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (category_id) REFERENCES category(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `order` (
    id int UNSIGNED NOT NULL AUTO_INCREMENT,
    reference varchar(255) NOT NULL,
    order_date datetime NOT NULL,
    status varchar(255) NOT NULL DEFAULT 'en attente',
    customer_id int UNSIGNED NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (customer_id) REFERENCES customer(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `order_line` (
    id int UNSIGNED NOT NULL AUTO_INCREMENT,
    quantity int NOT NULL,
    product_id int UNSIGNED NOT NULL,
    order_id int UNSIGNED NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (product_id) REFERENCES product(id),
    FOREIGN KEY (order_id) REFERENCES `order`(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `supplier` (
    id int UNSIGNED NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    adress varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    phone varchar(255) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `product_supplier` (
    product_id int UNSIGNED NOT NULL,
    supplier_id int UNSIGNED NOT NULL,
    PRIMARY KEY (product_id, supplier_id),
    FOREIGN KEY (product_id) REFERENCES product(id),
    FOREIGN KEY (supplier_id) REFERENCES supplier(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `user` (
  id int UNSIGNED NOT NULL AUTO_INCREMENT,
  lastname VARCHAR(255) NOT NULL,
  firstname VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY `unique_email` (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;