-- Seed de datos para microservicio medicamentos

INSERT INTO medicamentos (nombre, presentacion, concentracion, creado_por)
VALUES
    ('N/A', 'N/A', 'N/A', 'admin'),
    ('Acetaminofen', 'tableta', '500mg', 'admin'),
    ('Ibuprofeno', 'tableta', '400mg', 'admin'),
    ('Amoxicilina', 'capsula', '500mg', 'admin'),
    ('Omeprazol', 'capsula', '20mg', 'admin'),
    ('Loratadina', 'tableta', '10mg', 'admin'),
    ('Aspirina', 'tableta', '100mg', 'admin'),
    ('Metformina', 'tableta', '850mg', 'admin'),
    ('Losartan', 'tableta', '50mg', 'admin'),
    ('Atorvastatina', 'tableta', '20mg', 'admin'),
    ('Salbutamol', 'inhalador', '100mcg', 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inventario (id_medicamento, total)
VALUES
    (1, 0), (2, 150), (3, 200), (4, 100), (5, 180),
    (6, 120), (7, 90), (8, 160), (9, 140), (10, 110), (11, 75);

INSERT INTO movimientos (id_medicamento, tipo_movimiento, cantidad, creado_por, fecha_creacion)
VALUES
    (1, 'entrada', 150, 'admin', CURRENT_TIMESTAMP - INTERVAL '10 days'),
    (2, 'entrada', 200, 'admin', CURRENT_TIMESTAMP - INTERVAL '10 days'),
    (3, 'entrada', 100, 'admin', CURRENT_TIMESTAMP - INTERVAL '9 days'),
    (4, 'entrada', 200, 'admin', CURRENT_TIMESTAMP - INTERVAL '9 days'),
    (5, 'entrada', 150, 'admin', CURRENT_TIMESTAMP - INTERVAL '8 days'),
    (6, 'entrada', 100, 'admin', CURRENT_TIMESTAMP - INTERVAL '8 days'),
    (7, 'entrada', 180, 'admin', CURRENT_TIMESTAMP - INTERVAL '7 days'),
    (8, 'entrada', 150, 'admin', CURRENT_TIMESTAMP - INTERVAL '7 days'),
    (9, 'entrada', 120, 'admin', CURRENT_TIMESTAMP - INTERVAL '6 days'),
    (10, 'entrada', 80, 'admin', CURRENT_TIMESTAMP - INTERVAL '6 days'),
    (4, 'salida', 20, 'doctor_garcia', CURRENT_TIMESTAMP - INTERVAL '5 days'),
    (5, 'salida', 30, 'doctor_lopez', CURRENT_TIMESTAMP - INTERVAL '4 days'),
    (6, 'salida', 10, 'enfermera_martinez', CURRENT_TIMESTAMP - INTERVAL '3 days'),
    (7, 'salida', 20, 'doctor_garcia', CURRENT_TIMESTAMP - INTERVAL '2 days'),
    (8, 'salida', 10, 'doctor_lopez', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (10, 'salida', 5, 'enfermera_rodriguez', CURRENT_TIMESTAMP - INTERVAL '1 day');
