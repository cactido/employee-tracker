DROP DATABSE `employee_db`

CREATE DATABASE `employee_db`
CREATE TABLE `department` (
  `id` int NOT NULL,
  `name` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`)
) 

CREATE TABLE `employee` (
  `id` int NOT NULL,
  `first_name` varchar(30) DEFAULT NULL,
  `last_name` varchar(30) DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `manager_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) 

CREATE TABLE `role` (
  `id` int NOT NULL,
  `title` varchar(30) DEFAULT NULL,
  `salary` decimal(10,0) DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) 
