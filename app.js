const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
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
var departments = [];
var departmentIds = [];

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
    });
}

function menuPrompt() {
    getEmployees();
    getRoles();
    getManagers();
    getDepartments();
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
                'Update an employee\'s manager',
                'Add new department',
                'Add new role'
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
                })
                menuPrompt();
                break;
            case 'Remove an employee':
                await inquirer.prompt([
                    {
                        name: 'employee',
                        type: 'list',
                        message: 'Select employee to remove: ',
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
                await inquirer.prompt([
                    {
                        name: 'employee',
                        type: 'list',
                        message: 'Select employee to update: ',
                        choices: employees
                    },
                    {
                        name: 'newRole',
                        type: 'list',
                        message: 'Change to which role?',
                        choices: roles
                    }
                ])
                .then(data => {
                    data.employee = employeeIds[employees.indexOf(data.employee)];
                    data.newRole = roleIds[roles.indexOf(data.newRole)];
                    connection.query(`UPDATE employee SET role_id = ${data.newRole} WHERE id = ${data.employee}`);
                })
                menuPrompt();
                break;
            case 'Update an employee\'s manager':
                await inquirer.prompt([
                    {
                        name: 'employee',
                        type: 'list',
                        message: 'Select employee to update: ',
                        choices: employees
                    },
                    {
                        name: 'newManager',
                        type: 'list',
                        message: 'Change to which manager?',
                        choices: managers
                    }
                ])
                .then(data => {
                    data.employee = employeeIds[employees.indexOf(data.employee)];
                    data.newManager = managerIds[roles.indexOf(data.newManager)];
                    connection.query(`UPDATE employee SET manager_id = ${data.newManager} WHERE id = ${data.employee}`);
                })
                menuPrompt();
                break;
            case 'Add new department':
                await inquirer.prompt([
                    {
                        name: 'department',
                        type: 'input',
                        message: 'Enter the department\'s name: ',
                    }
                ])
                .then(data => {
                    connection.query('INSERT INTO department SET ?', { name: data.department });
                })
                menuPrompt();
                break;
            case 'Add new role':
                await inquirer.prompt([
                    {
                        name: 'title',
                        type: 'input',
                        message: 'Enter the new role\'s title: '
                    },
                    {
                        name: 'salary',
                        type: 'input',
                        message: 'Enter the new role\'s salary: '
                    },
                    {
                        name: 'department',
                        type: 'list',
                        message: 'Add to which department?',
                        choices: departments
                    }
                ])
                .then(data => {
                    data.department = departmentIds[departments.indexOf(data.department)];
                    connection.query('INSERT INTO role SET ?',
                    {
                        title: data.title,
                        salary: data.salary,
                        department_id: data.department
                    });
                })
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

function getRoles() {
    connection.query('SELECT title, id FROM role', (err, res) => {
        if (err) throw err;
        roles.length = 0;
        roleIds.length = 0;
        res.forEach((data) => {
            roles.push(data.title);
            roleIds.push(data.id);
        })
    })
}

function getManagers() {
    connection.query('SELECT CONCAT(first_name, " ", last_name ) AS name, id FROM employee WHERE manager_id IS NULL', (err, res) => {
        if (err) throw err;
        managers.length = 0;
        managerIds.length = 0;
        res.forEach((data) => {
            managers.push(data.name);
            managerIds.push(data.id);
        });
    })
}

function getDepartments() {
    connection.query('SELECT name, id FROM department', (err, res) => {
        if (err) throw err;
        departments.length = 0;
        departmentIds.length = 0;
        res.forEach((data) => {
            departments.push(data.name);
            departmentIds.push(data.id);
        });
    })
}

menuPrompt();