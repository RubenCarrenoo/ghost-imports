-- ==============================================================================
-- GHOST IMPORTS - ESQUEMA DE BASE DE DATOS RELACIONAL
-- Compatible con: MySQL 8.0+, MariaDB 10.5+, PostgreSQL 13+, SQLite 3
-- ==============================================================================

-- 1. TABLA: CATEGORÍAS
-- Define las agrupaciones principales de ropa y accesorios streetwear
CREATE TABLE IF NOT EXISTS categorias (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    marca_predeterminada VARCHAR(100) NOT NULL,
    etiqueta_singular VARCHAR(50) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: PRODUCTOS
-- Catálogo central de artículos disponibles en la tienda
CREATE TABLE IF NOT EXISTS productos (
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
);

-- 3. TABLA: INVENTARIO POR TALLA
-- Control granular de unidades en stock por cada talla de producto
CREATE TABLE IF NOT EXISTS inventario_tallas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id VARCHAR(50) NOT NULL,
    talla VARCHAR(20) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_producto_talla (producto_id, talla),
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 4. TABLA: MÉTODOS DE PAGO
-- Canales de pago habilitados (Nequi, Bancolombia, etc.)
CREATE TABLE IF NOT EXISTS metodos_pago (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    numero_cuenta VARCHAR(50),
    titular VARCHAR(150),
    instrucciones TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- 5. TABLA: CLIENTES
-- Directorio de compradores que han realizado pedidos
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    correo VARCHAR(120) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    direccion_entrega TEXT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA: PEDIDOS (ÓRDENES)
-- Registro maestro de cada compra efectuada
CREATE TABLE IF NOT EXISTS pedidos (
    id VARCHAR(60) PRIMARY KEY,
    codigo_pedido VARCHAR(30) NOT NULL UNIQUE,
    cliente_id INT NOT NULL,
    metodo_pago_id VARCHAR(50) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    costo_envio DECIMAL(12, 2) DEFAULT 0.00,
    total DECIMAL(12, 2) NOT NULL,
    estado ENUM('Pendiente de comprobante', 'Comprobante recibido', 'Pago verificado', 'En preparación', 'Enviado', 'Entregado', 'Cancelado') DEFAULT 'Pendiente de comprobante',
    comprobante_url VARCHAR(255),
    notas TEXT,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id) ON DELETE RESTRICT
);

-- 7. TABLA: DETALLES DEL PEDIDO (ITEMS COMPRADOS)
-- Desglose de productos, tallas y precios congelados al momento de la compra
CREATE TABLE IF NOT EXISTS pedido_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id VARCHAR(60) NOT NULL,
    producto_id VARCHAR(50) NOT NULL,
    nombre_producto VARCHAR(150) NOT NULL,
    talla VARCHAR(20) NOT NULL,
    precio_unitario DECIMAL(12, 2) NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    subtotal DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
);

-- ÍNDICES PARA ALTO RENDIMIENTO
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_precio ON productos(precio);
CREATE INDEX idx_productos_novedad ON productos(es_novedad);
CREATE INDEX idx_inventario_producto ON inventario_tallas(producto_id);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_codigo ON pedidos(codigo_pedido);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
