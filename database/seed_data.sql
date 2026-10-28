-- ==============================================================================
-- GHOST IMPORTS - DATOS INICIALES (SEEDS)
-- Catálogo oficial con precios de venta optimizados para margen de ganancia en Colombia
-- ==============================================================================

-- 1. INSERTAR CATEGORÍAS
INSERT INTO categorias (id, nombre, marca_predeterminada, etiqueta_singular, descripcion) VALUES
('hoodies', 'Hoodies & Buzos', 'Nike / Supreme / Undergold', 'Hoodie', 'Hoodies y buzos urbanos en algodón pesado con corte oversize.'),
('sneakers', 'Sneakers Jordan', 'Jordan', 'Sneaker', 'Zapatillas retro de colección streetwear.'),
('bolsos', 'Morrales Sprayground', 'Sprayground', 'Morral', 'Mochilas y morrales con diseños disruptivos Shark.'),
('pantalonetas', 'Pantalonetas Urbanas', 'Jordan', 'Pantaloneta', 'Shorts deportivos y urbanos transpirables.'),
('gorras', 'Gorras New Era cerradas', 'New Era', 'Gorra', 'Gorras cerradas oficiales 59FIFTY.');

-- 2. INSERTAR MÉTODOS DE PAGO
INSERT INTO metodos_pago (id, nombre, tipo, numero_cuenta, titular, instrucciones, activo) VALUES
('nequi', 'Nequi', 'Billetera digital', '3001234567', 'Ghost Imports S.A.S', 'Transfiere al número Nequi y envía el comprobante por WhatsApp.', TRUE),
('bancolombia', 'Bancolombia', 'Cuenta de Ahorros', '12345678901', 'Ghost Imports S.A.S', 'Transferencia directa o QR Bancolombia.', TRUE);

-- 3. INSERTAR PRODUCTOS CON PRECIOS COMERCIALES
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

-- 4. INSERTAR INVENTARIO POR TALLA
INSERT INTO inventario_tallas (producto_id, talla, stock) VALUES
-- Hoodie h1 (Nike)
('h1', 'S', 3), ('h1', 'M', 5), ('h1', 'L', 4), ('h1', 'XL', 2),
-- Hoodie h2 (Supreme)
('h2', 'S', 2), ('h2', 'M', 4), ('h2', 'L', 2), ('h2', 'XL', 1),
-- Hoodie h3 (Undergold)
('h3', 'S', 1), ('h3', 'M', 3), ('h3', 'L', 5), ('h3', 'XL', 2),
-- Sneaker s1 (Jordan 3)
('s1', '39', 1), ('s1', '40', 2), ('s1', '41', 2), ('s1', '42', 3), ('s1', '43', 1),
-- Sneaker s2 (Jordan 4)
('s2', '39', 2), ('s2', '40', 3), ('s2', '41', 1), ('s2', '42', 4), ('s2', '43', 2), ('s2', '44', 1),
-- Morral b1 (Sprayground Shark in Paris)
('b1', 'Única', 5),
-- Morral b2 (Sprayground White Shark)
('b2', 'Única', 3),
-- Pantaloneta p1 (Jordan Diamond Roja)
('p1', 'S', 3), ('p1', 'M', 5), ('p1', 'L', 4), ('p1', 'XL', 2),
-- Pantaloneta p2 (Jordan Jumpman Negra)
('p2', 'S', 2), ('p2', 'M', 6), ('p2', 'L', 3), ('p2', 'XL', 1),
-- Gorra g1 (New Era LA)
('g1', '7 1/4', 3), ('g1', '7 3/8', 4), ('g1', '7 1/2', 2),
-- Gorra g2 (New Era NY)
('g2', '7 1/4', 2), ('g2', '7 3/8', 3), ('g2', '7 1/2', 2);

-- 5. CLIENTE DE EJEMPLO
INSERT INTO clientes (id, nombre_completo, correo, telefono, ciudad, direccion_entrega) VALUES
(1, 'Carlos Mendoza', 'carlos.mendoza@email.com', '3009876543', 'Medellín', 'Carrera 43A # 1-50, Poblado');

-- 6. PEDIDO DE EJEMPLO
INSERT INTO pedidos (id, codigo_pedido, cliente_id, metodo_pago_id, subtotal, costo_envio, total, estado, notas) VALUES
('ord_demo_001', 'GI-2026-8812', 1, 'nequi', 295000.00, 0.00, 295000.00, 'Pago verificado', 'Entregar en portería del edificio.');

INSERT INTO pedido_items (pedido_id, producto_id, nombre_producto, talla, precio_unitario, cantidad, subtotal) VALUES
('ord_demo_001', 'h1', 'Hoodie Nike Swoosh Club', 'M', 295000.00, 1, 295000.00);
