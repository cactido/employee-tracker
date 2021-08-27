INSERT INTO department (name) VALUES
('Sales'),
('Engineering'),
('Finance'),
('Legal');

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('Haleema', 'Craft', 1, null),
('Bob', 'Varun', 2, 1),
('Ali', 'Perez', 3, null),
('Jonah', 'Rayner', 4, 3),
('Terry', 'Berry', 5, null),
('James', 'Cunningham', 6, null),
('Alica', 'Garcia', 7, 6);

INSERT INTO role (title, salary, department_id) VALUES
('Sales Lead', 80000, 1),
('Salesperson', 40000, 1),
('Lead Engineer', 100000, 2),
('Software Engineer', 60000, 2),
('Accountant', 90000, 3),
('Legal Team Lead', 150000, 4),
('Lawyer', 130000, 4); 