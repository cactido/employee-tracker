const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const { connect } = require('http2');
const { get } = require('http');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'employee_db'
});

var roles = [];
var roleIds = [];
var managers = [];
var managerIds = [];
var employees = [];
var employeeIds = [];

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
            console.log('');
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
        console.log('');
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
        console.log('');
        console.table(res);
        menuPrompt();
    });
}

function menuPrompt() {
    getEmployees();
    if (!roles[0]) { getRoles(); }
    if (!managers[0]) { getManagers(); }
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
    ]).then(async (data) => {
        switch (data.choice) {
            case 'View all employees':
                showAllEmployees();
                menuPrompt();
                break;
            case 'View all employees by department':
                showByDepartment();
                menuPrompt();
                break;
            case 'View all employees by manager':
                showByManager();
                menuPrompt();
                break;
            case 'Add new employee':
                await inquirer.prompt([
                    {
                         name: 'firstName',
                         type: 'input',
                         message: 'Enter new employee\'s first name: '
                    },
                    {
                        name: 'lastName',
                        type: 'input',
                        message: 'Enter new employee\'s last name: '
                    },
                    {
                        name: 'role',
                        type: 'list',
                        message: 'Choose new employee\'s role: ',
                        choices: roles
                    },
                    {
                        name: 'manager',
                        type: 'list',
                        message: 'Choose new employee\'s manager: ',
                        choices: managers
                    }
                ])
                .then(data => {
                    // find the corresponding ID for the selected manager to reference the employee.id column
                    // and change the prompt's String to that ID
                    data.manager = managerIds[managers.indexOf(data.manager)];
                    // do the same for the selected role
                    data.role = roleIds[roles.indexOf(data.role)];
                    connection.query('INSERT INTO employee SET ?',
                    {
                        first_name: data.firstName,
                        last_name: data.lastName,
                        manager_id: data.manager,
                        role_id: data.role
                    });
                    console.table(data);
                    menuPrompt();
                })
                break;
            case 'Remove an employee':
                await inquirer.prompt([
                    {
                        name: 'employee',
                        type: 'list',
                        message: 'Select employee to delete: ',
                        choices: employees
                    }
                ])
                .then(data => {
                    var deleteId = employeeIds[employees.indexOf(data.employee)];
                    connection.query('DELETE FROM employee WHERE ?', { id: deleteId });
                })
                menuPrompt();
                break;
            case 'Update an employee\'s role':
                updateRole();
                menuPrompt();
                break;
            case 'Update an employee\'s manager':
                updateManager();
                menuPrompt();
                break;
        }
    })
}

function getEmployees() {
    connection.query('SELECT CONCAT(first_name, " ", last_name) AS name, id FROM employee', (err, res) => {
        if (err) throw err;
        employees.length = 0;
        employeeIds.length = 0;
        res.forEach((data) => {
            employees.push(data.name);
            employeeIds.push(data.id);
        })
    })
}

function updateRole() {
    connection.query('SELECT title, id FROM role', (err, res) => {
        console.log(res);
        console.log(res[0].title);
    })
}

function updateManager() {
    console.log(managers);
}

function getRoles() {
    connection.query('SELECT title, id FROM role', (err, res) => {
        if (err) throw err;
        res.forEach((data) => {
            roles.push(data.title);
            roleIds.push(data.id);
        })
    })
}

function getManagers() {
    connection.query('SELECT CONCAT(first_name, " ", last_name ) AS name, id FROM employee WHERE manager_id IS NULL', (err, res) => {
        if (err)
            throw err;
        res.forEach((data) => {
            managers.push(data.name);
            managerIds.push(data.id);
        });
    })
}

menuPrompt();