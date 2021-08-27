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
        switch(res.choice) {
            case 'View all employees': showAllEmployees();
            break;
        }
    })
}

menuPrompt();
//showAllEmployees();