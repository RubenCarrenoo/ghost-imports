-- ==============================================================================
-- GHOST IMPORTS - BASE DE DATOS EMPRESARIAL COMPLETA
-- Streetwear & Accesorios Colombia
-- Compatible con MySQL 8.0 y MySQL Workbench
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS ghost_imports
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ghost_imports;

-- Desactivar temporalmente revisión de claves foráneas para recreación limpia si aplica
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS pedido_detalles;
DROP TABLE IF EXISTS pedido_items;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS inventario_tallas;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS metodos_pago;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS clientes;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- 1. TABLA: USUARIOS (CLIENTES Y ADMINISTRADORES)
-- Permite registrar usuarios, clientes y administradores con control de acceso
-- ==============================================================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(30),
    ciudad VARCHAR(100),
    direccion TEXT,
    rol ENUM('cliente', 'admin') DEFAULT 'cliente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 2. TABLA: CATEGORÍAS
-- ==============================================================================
CREATE TABLE categorias (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    marca_predeterminada VARCHAR(100) NOT NULL,
    etiqueta_singular VARCHAR(50) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 3. TABLA: PRODUCTOS
-- Precios comerciales en Pesos Colombianos (COP) para alta rentabilidad
-- ==============================================================================
CREATE TABLE productos (
    id VARCHAR(50) PRIMARY KEY,
    categoria_id VARCHAR(50) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    precio DECIMAL(12, 2) NOT NULL,
    descripcion TEXT,
    es_novedad BOOLEAN DEFAULT FALSE,
    imagen_url VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 4. TABLA: INVENTARIO POR TALLA
-- ==============================================================================
CREATE TABLE inventario_tallas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id VARCHAR(50) NOT NULL,
    talla VARCHAR(20) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_producto_talla (producto_id, talla),
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 5. TABLA: MÉTODOS DE PAGO
-- ==============================================================================
CREATE TABLE metodos_pago (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    numero_cuenta VARCHAR(50),
    titular VARCHAR(150),
    instrucciones TEXT,
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 6. TABLA: PEDIDOS (ÓRDENES CON INFORMACIÓN DEL CLIENTE Y ENVÍO)
-- ==============================================================================
CREATE TABLE pedidos (
    id VARCHAR(60) PRIMARY KEY,
    codigo_pedido VARCHAR(30) NOT NULL UNIQUE,
    usuario_id INT NULL,
    cliente_nombre VARCHAR(150) NOT NULL,
    cliente_email VARCHAR(120) NOT NULL,
    cliente_telefono VARCHAR(30) NOT NULL,
    cliente_ciudad VARCHAR(100) NOT NULL,
    cliente_direccion TEXT NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    costo_envio DECIMAL(12, 2) DEFAULT 0.00,
    total DECIMAL(12, 2) NOT NULL,
    estado ENUM('Pendiente de comprobante', 'Comprobante recibido', 'Pago verificado', 'En preparación', 'Enviado', 'Entregado', 'Cancelado') DEFAULT 'Pendiente de comprobante',
    comprobante_url VARCHAR(255) NULL,
    notas TEXT NULL,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 7. TABLA: DETALLES DEL PEDIDO (PRENDAS COMPRADAS)
-- ==============================================================================
CREATE TABLE pedido_detalles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id VARCHAR(60) NOT NULL,
    producto_id VARCHAR(50) NOT NULL,
    nombre_producto VARCHAR(150) NOT NULL,
    talla VARCHAR(20) NOT NULL,
    precio_unitario DECIMAL(12, 2) NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    subtotal DECIMAL(12, 2) NOT NULL,
    imagen_url VARCHAR(255),
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- ÍNDICES DE BÚSQUEDA RÁPIDA
-- ==============================================================================
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_codigo ON pedidos(codigo_pedido);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_detalles_pedido ON pedido_detalles(pedido_id);

-- ==============================================================================
-- VISTAS INTELIGENTES PARA CONSULTAS DIRECTAS EN MYSQL WORKBENCH
-- ==============================================================================

-- Vista 1: Reporte de Usuarios Registrados y su Historial de Compras
CREATE OR REPLACE VIEW vista_usuarios_registrados AS
SELECT 
    u.id AS usuario_id,
    u.nombre AS cliente_nombre,
    u.email AS correo,
    u.telefono,
    u.ciudad,
    u.direccion AS direccion_entrega,
    u.rol,
    u.fecha_registro,
    COUNT(p.id) AS total_pedidos,
    COALESCE(SUM(p.total), 0.00) AS total_comprado_cop
FROM usuarios u
LEFT JOIN pedidos p ON u.id = p.usuario_id
GROUP BY u.id, u.nombre, u.email, u.telefono, u.ciudad, u.direccion, u.rol, u.fecha_registro;

-- Vista 2: Resumen Completo de Pedidos con Datos de Cliente y Despacho
CREATE OR REPLACE VIEW vista_pedidos_clientes AS
SELECT 
    p.codigo_pedido,
    p.fecha_pedido,
    p.estado,
    p.cliente_nombre,
    p.cliente_email,
    p.cliente_telefono,
    p.cliente_ciudad,
    p.cliente_direccion,
    p.metodo_pago,
    COUNT(pd.id) AS items_totales,
    p.total AS total_cop,
    p.notas
FROM pedidos p
LEFT JOIN pedido_detalles pd ON p.id = pd.pedido_id
GROUP BY p.id, p.codigo_pedido, p.fecha_pedido, p.estado, p.cliente_nombre, 
         p.cliente_email, p.cliente_telefono, p.cliente_ciudad, p.cliente_direccion, 
         p.metodo_pago, p.total, p.notas;

-- Vista 3: Detalle Producto a Producto por cada Pedido
CREATE OR REPLACE VIEW vista_pedidos_articulos AS
SELECT 
    p.codigo_pedido,
    p.fecha_pedido,
    p.cliente_nombre,
    p.cliente_telefono,
    p.cliente_ciudad,
    pd.nombre_producto,
    pd.talla,
    pd.cantidad,
    pd.precio_unitario,
    pd.subtotal,
    p.estado
FROM pedidos p
JOIN pedido_detalles pd ON p.id = pd.pedido_id
ORDER BY p.fecha_pedido DESC;

-- ==============================================================================
-- INSERCIÓN DE DATOS INICIALES
-- ==============================================================================

-- 1. Categorías
INSERT INTO categorias (id, nombre, marca_predeterminada, etiqueta_singular, descripcion) VALUES
('hoodies', 'Hoodies & Buzos', 'Nike / Supreme / Undergold', 'Hoodie', 'Hoodies y buzos urbanos en algodón pesado con corte oversize.'),
('sneakers', 'Sneakers Jordan', 'Jordan', 'Sneaker', 'Zapatillas retro de colección streetwear.'),
('bolsos', 'Morrales Sprayground', 'Sprayground', 'Morral', 'Mochilas y morrales con diseños disruptivos Shark.'),
('pantalonetas', 'Pantalonetas Urbanas', 'Jordan', 'Pantaloneta', 'Shorts deportivos y urbanos transpirables.'),
('gorras', 'Gorras New Era cerradas', 'New Era', 'Gorra', 'Gorras cerradas oficiales 59FIFTY.');

-- 2. Métodos de Pago
INSERT INTO metodos_pago (id, nombre, tipo, numero_cuenta, titular, instrucciones, activo) VALUES
('nequi', 'Nequi', 'Billetera digital', '3001234567', 'Ghost Imports S.A.S', 'Transfiere al Nequi y envía comprobante por WhatsApp.', TRUE),
('bancolombia', 'Bancolombia', 'Cuenta de Ahorros', '12345678901', 'Ghost Imports S.A.S', 'Transferencia directa o QR Bancolombia.', TRUE);

-- 3. Productos (11 prendas con fotos locales y precios con margen comercial)
INSERT INTO productos (id, categoria_id, nombre, marca, precio, descripcion, es_novedad, imagen_url) VALUES
('h1', 'hoodies', 'Hoodie Nike Swoosh Club', 'Nike', 295000.00, 'Hoodie Nike confeccionado en algodón fleece pesado con forro térmico suave y corte oversize urbano.', TRUE, 'img/hoddie nike.png'),
('h2', 'hoodies', 'Hoodie Supreme Box Logo', 'Supreme', 450000.00, 'Sudadera icónica Supreme Box Logo en algodón peinado premium con bordado frontal en relieve.', TRUE, 'img/hoddie supreme.png'),
('h3', 'hoodies', 'Hoodie Undergold Oversize', 'Undergold', 395000.00, 'Buzo Undergold de silueta holgada y hombros caídos con caída pesada contemporánea.', FALSE, 'img/hoddie undergold.png'),
('s1', 'sneakers', 'Air Jordan 3 Retro Black Cement', 'Jordan', 890000.00, 'Sneakers Air Jordan 3 Retro Black Cement con estampado Elephant Print y cápsula de aire visible.', TRUE, 'img/jordan 3 negras.png'),
('s2', 'sneakers', 'Air Jordan 4 Retro White Oreo', 'Jordan', 960000.00, 'Silueta Jordan 4 White Oreo elaborada en piel prémium blanca con detalles moteados en gris cemento.', TRUE, 'img/jordan 4 oreo.png'),
('b1', 'bolsos', 'Morral Sprayground Shark in Paris', 'Sprayground', 580000.00, 'Mochila Sprayground de edición exclusiva con gráfico Shark Mouth, tela impermeable y funda para laptop.', TRUE, 'img/sprawground.png'),
('b2', 'bolsos', 'Morral Sprayground White Shark', 'Sprayground', 590000.00, 'Morral Sprayground blanco puro con diseño reflectivo Shark, bolsillo oculto y correas ergonómicas.', FALSE, 'img/sprawground blanco.png'),
('p1', 'pantalonetas', 'Pantaloneta Jordan Diamond Roja', 'Jordan', 210000.00, 'Pantaloneta deportiva Jordan roja con paneles laterales estilo diamante y malla transpirable.', TRUE, 'img/pantaloneta jordan roja.png'),
('p2', 'pantalonetas', 'Pantaloneta Jordan Jumpman Negra', 'Jordan', 195000.00, 'Short streetwear Jordan negro total con bolsillos laterales y logotipo Jumpman bordado.', FALSE, 'img/pantaloneta negra jordan.png'),
('g1', 'gorras', 'Gorra New Era 59FIFTY LA Dodgers Negra', 'New Era', 245000.00, 'Gorra oficial 59FIFTY cerrada de Los Angeles Dodgers en negro total con logo LA en 3D.', TRUE, 'img/new era LA negra.png'),
('g2', 'gorras', 'Gorra New Era 59FIFTY NY Yankees Bicolor', 'New Era', 235000.00, 'Gorra cerrada New Era 59FIFTY de los New York Yankees con corona negra y visera blanca en contraste.', FALSE, 'img/new era negra con blanco.png');

-- 4. Inventario por tallas
INSERT INTO inventario_tallas (producto_id, talla, stock) VALUES
('h1', 'S', 3), ('h1', 'M', 5), ('h1', 'L', 4), ('h1', 'XL', 2),
('h2', 'S', 2), ('h2', 'M', 4), ('h2', 'L', 2), ('h2', 'XL', 1),
('h3', 'S', 1), ('h3', 'M', 3), ('h3', 'L', 5), ('h3', 'XL', 2),
('s1', '39', 1), ('s1', '40', 2), ('s1', '41', 2), ('s1', '42', 3), ('s1', '43', 1),
('s2', '39', 2), ('s2', '40', 3), ('s2', '41', 1), ('s2', '42', 4), ('s2', '43', 2), ('s2', '44', 1),
('b1', 'Única', 5),
('b2', 'Única', 3),
('p1', 'S', 3), ('p1', 'M', 5), ('p1', 'L', 4), ('p1', 'XL', 2),
('p2', 'S', 2), ('p2', 'M', 6), ('p2', 'L', 3), ('p2', 'XL', 1),
('g1', '7 1/4', 3), ('g1', '7 3/8', 4), ('g1', '7 1/2', 2),
('g2', '7 1/4', 2), ('g2', '7 3/8', 3), ('g2', '7 1/2', 2);

-- 5. Usuarios iniciales (Administrador y Clientes Registrados)
INSERT INTO usuarios (id, nombre, email, password, telefono, ciudad, direccion, rol) VALUES
(1, 'Administrador Ghost Imports', 'admin@ghostimports.com', 'admin123', '3105550000', 'Bogotá D.C.', 'Oficina Principal Ghost Imports Calle 93 # 11-20', 'admin'),
(2, 'Carlos Mendoza', 'carlos.mendoza@email.com', 'cliente123', '3009876543', 'Medellín', 'Carrera 43A # 1-50, Poblado', 'cliente'),
(3, 'Valentina Gómez', 'valentina.gomez@email.com', 'cliente123', '3157891234', 'Bogotá D.C.', 'Calle 127 # 15-40, Usaquén', 'cliente'),
(4, 'Mateo Restrepo', 'mateo.restrepo@email.com', 'cliente123', '3204567890', 'Cali', 'Avenida 6N # 24N-12, Granada', 'cliente');

-- 6. Pedidos Registrados Vinculados a los Clientes
INSERT INTO pedidos (id, codigo_pedido, usuario_id, cliente_nombre, cliente_email, cliente_telefono, cliente_ciudad, cliente_direccion, metodo_pago, subtotal, costo_envio, total, estado, notas) VALUES
('ord_001', 'GI-2026-8812', 2, 'Carlos Mendoza', 'carlos.mendoza@email.com', '3009876543', 'Medellín', 'Carrera 43A # 1-50, Poblado', 'Nequi', 295000.00, 0.00, 295000.00, 'En preparación', 'Entregar en portería del edificio.'),
('ord_002', 'GI-2026-9045', 3, 'Valentina Gómez', 'valentina.gomez@email.com', '3157891234', 'Bogotá D.C.', 'Calle 127 # 15-40, Usaquén', 'Bancolombia', 960000.00, 0.00, 960000.00, 'Pago verificado', 'Llamar antes de entregar por favor.'),
('ord_003', 'GI-2026-9210', 4, 'Mateo Restrepo', 'mateo.restrepo@email.com', '3204567890', 'Cali', 'Avenida 6N # 24N-12, Granada', 'Nequi', 450000.00, 0.00, 450000.00, 'Enviado', 'Guía Interrapidísimo # 700291823');

-- 7. Detalles de los Pedidos
INSERT INTO pedido_detalles (pedido_id, producto_id, nombre_producto, talla, precio_unitario, cantidad, subtotal, imagen_url) VALUES
('ord_001', 'h1', 'Hoodie Nike Swoosh Club', 'M', 295000.00, 1, 295000.00, 'img/hoddie nike.png'),
('ord_002', 's2', 'Air Jordan 4 Retro White Oreo', '40', 960000.00, 1, 960000.00, 'img/jordan 4 oreo.png'),
('ord_003', 'h2', 'Hoodie Supreme Box Logo', 'L', 450000.00, 1, 450000.00, 'img/hoddie supreme.png');
