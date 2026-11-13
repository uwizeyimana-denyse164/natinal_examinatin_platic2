USE SRMS;

INSERT INTO users (username, password) VALUES
('admin', 'admin123'),
('user1', 'password1');

INSERT INTO items (itemName, Specification, unitMeasure, Quantity, unitPrice, TotalQuantity) VALUES
('Laptop', 'Dell Inspiron 15', 'pcs', 10, 850.00, 10),
('Mouse', 'Wireless USB', 'pcs', 50, 25.00, 50),
('Keyboard', 'Mechanical RGB', 'pcs', 30, 45.00, 30),
('Monitor', '24 inch LED', 'pcs', 15, 200.00, 15);
