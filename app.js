const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'employee_db'
});

function showAllEmployees() {
    connection.query(`SELECT employee.id,
        CONCAT(employee.first_name, ' ', employee.last_name) AS name, 
        role.title, 
        department.name AS department,
        role.salary,  
        CONCAT(m.first_name, ' ', m.last_name) AS manager
        FROM employee 
        INNER JOIN role on role.id = employee.role_id 
        INNER JOIN department on department.id = role.department_id 
        LEFT JOIN employee m on employee.manager_id = m.id;`,
        (err, res) => {
            if (err) throw err;
            console.table(res);
            menuPrompt();
        });
}

function showByDepartment() {
    connection.query(`SELECT employee.id,
    CONCAT(employee.first_name, ' ', employee.last_name) AS name,
    department.name AS department 
    FROM employee
    JOIN role ON employee.role_id = role.id 
    JOIN department ON role.department_id = department.id 
    ORDER BY department.id;`,
    (err, res) => {
        if (err) throw err;
        console.table(res);
        menuPrompt();
    });
}

function showByManager() {
    connection.query(`SELECT employee.id,
    CONCAT(employee.first_name, ' ', employee.last_name) AS name,
    CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee
    LEFT JOIN employee m on employee.manager_id = m.id
    ORDER BY m.id;`,
    (err, res) => {
        if (err) throw err;
        console.table(res);
        menuPrompt();
    });
}

function menuPrompt() {
    inquirer.prompt([
        {
            type: 'list',
            message: 'Please select an operation.',
            name: 'choice',
            choices: [
                'View all employees',
                'View all employees by department',
                'View all employees by manager',
                'Add new employee',
                'Remove an employee',
                'Update an employee\'s role',
                'Update an employee\'s manager'
            ]
        }
    ]).then((res) => {
        switch (res.choice) {
            case 'View all employees':
                showAllEmployees();
                break;
            case 'View all employees by department':
                showByDepartment();
                break;
            case 'View all employees by manager':
                showByManager();
                break;
            case 'Add new employee':
                break;
            case 'Remove an employee':
                break;
            case 'Update an employee\'s role':
                console.log(res.choice);
                break;
            case 'Update an employee\'s manager':
                break;
        }
    })
}

menuPrompt();
//showAllEmployees();