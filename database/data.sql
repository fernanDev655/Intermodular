

INSERT INTO vehiculos (id, marca, modelo, anyo, precio, categoria, matricula, descripcion) VALUES
(1, 'Porsche', 'Taycan Turbo S', 2026, 195000.00, 'Deportivo Eléctrico', '1234-ABC', 'Deportivo 100% eléctrico con diseño futurista, car...'),
(2, 'Mercedes', 'Clase C', 2026, 1500000.00, 'suv', '1234 ABC', 'dsadadsa'),
(3, 'BMW', 'M4', 2025, 1499998.00, 'deportivo', '1235 ABC', 'dW'),
(4, 'Bentley', 'Lincoln Navigator', 2025, 1000000.00, 'suv', '0001 ABC', 'La Lincoln Navigator 2025-2026 es un SUV de lujo d...'),
(7, 'Rolls-Royce', 'Silver Ghost', 2020, 1000000.00, 'deportivo', '0111 PKB', '1915'),
(9, 'BMW', 'x1', 2017, 12.00, 'suv', '1234 JLD', 'Jose Luis');


INSERT INTO vehiculo_imagenes (id, vehiculo_id, url) VALUES
(1, 4, '/uploads/vehiculo/Lincoln-Navigator-delante.jpg'),
(3, 7, '/uploads/vehiculo/1925_Rolls-Royce-45-50.jpg'),
(5, 1, '/uploads/vehiculo/porsche_taycan.jpg'),
(6, 2, '/uploads/vehiculo/2019-mercedes-benz-c-class.jpg'),
(7, 3, '/uploads/vehiculo/BMW_M4_CS_2024.jpg'),
(14, 9, '/uploads/vehiculo/a5ae0779-ecc7-429c-b0de-e0312e96...');


INSERT INTO users (id, nombre, apellidos, dni, telefono, email, password, role) VALUES
(1, 'fran', NULL, NULL, NULL, 'danilopezdeve@gmail.com', '$2b$10$BvbLLZKUX7a0Ro7fQRfpGeNRGM/h3Y7OWk9Xi1RclwGNFGkYHPfNi', 'USER'),
(2, 'fer', NULL, NULL, NULL, 'fer@example.com', '$2b$10$0EIlguNw10nlMOOr2vbknuLv3wtldp/UVT0w74CrC3unJH2FufT4a', 'USER'),
(3, 'dani', NULL, NULL, NULL, 'dani@example.com', '$2b$10$EOs5G5FaE6F9/dVexfwKFOw3awAExNkpLz/TL0Vx5K96UhNDxoWUW', 'USER'),
(7, 'mecanico', NULL, NULL, NULL, 'mecanico@autoelite.es', '$2b$10$TuXfMkSfAvzzt3dh.3Gyk.dD1ee54.RUkCO10dStvdcDqMmxBtaE6', 'MECANICO'),
(8, 'comercial', NULL, NULL, NULL, 'comercial@autoelite.es', '$2b$10$PCtTl9BfYuZGcwfjJSICjekboqIY5gNCw99/b4cpc3vUmszRxjEOm', 'COMERCIAL'),
(9, 'admin', NULL, NULL, NULL, 'admin@autoelite.es', '$2b$10$3N2pP5PnjxIDW4YiJNXi..baSm.KS0FgVVR7L1v.3gsg/lws/O/xC', 'ADMIN');