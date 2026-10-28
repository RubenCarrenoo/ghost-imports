# Ghost Imports - Base de Datos

Este directorio contiene la estructura y datos de la base de datos para la tienda **Ghost Imports** (Streetwear Colombia).

---

## 📁 Archivos Disponibles

1. **`ghost_imports.sql`**: Script SQL completo y listo para importar (crea la base de datos `ghost_imports`, todas las tablas con claves foráneas, índices de optimización y datos iniciales de catálogo).
2. **`schema.sql`**: Definición técnica de las 7 tablas relacionales y sus restricciones.
3. **`seed_data.sql`**: Datos iniciales para sembrar el catálogo de productos, inventario por talla, métodos de pago colombianos (Nequi y Bancolombia) y pedido de demostración.

---

## 🗄️ Estructura Relacional de Tablas

| Tabla | Descripción |
|---|---|
| **`categorias`** | Categorías principales (`hoodies`, `sneakers`, `bolsos`, `pantalonetas`, `gorras`). |
| **`productos`** | Catálogo con nombre, marca, precio en COP, descripción, novedad y estado. |
| **`inventario_tallas`** | Stock granular por talla (ej: S, M, L, XL, tallas de calzado 38-44 o gorras 59FIFTY). |
| **`metodos_pago`** | Cuentas de Nequi y Bancolombia con titulares e instrucciones. |
| **`clientes`** | Registro de compradores con nombre, teléfono, ciudad y dirección. |
| **`pedidos`** | Órdenes de compra con código único (ej: `GI-2026-8812`), estado, total y fecha. |
| **`pedido_items`** | Desglose de cada prenda comprada, talla y precio congelado al comprar. |

---

## 🚀 Cómo Usar en un Servidor (XAMPP, MySQL, phpMyAdmin, DBeaver)

### Opción A: Desde phpMyAdmin (XAMPP / WampServer)
1. Abre phpMyAdmin (`http://localhost/phpmyadmin`).
2. Haz clic en la pestaña **Importar** en la barra superior.
3. Selecciona el archivo `database/ghost_imports.sql`.
4. Haz clic en **Continuar / Importar**.
5. ¡Listo! La base de datos `ghost_imports` quedará creada con todas sus tablas y datos.

### Opción B: Desde la Consola de MySQL
```bash
mysql -u root -p < database/ghost_imports.sql
```

### Opción C: En la Nube (Supabase, Railway, PlanetScale, Render)
Copia el contenido de `database/schema.sql` y `database/seed_data.sql` en el editor SQL de tu panel en la nube.

---

## ⚡ Base de Datos Local en el Navegador (IndexedDB)
Además del archivo SQL, la aplicación web cuenta con un motor de base de datos integrado en `js/database.js` usando **IndexedDB**:
- Funciona directamente en cualquier navegador y con Live Server sin necesidad de configurar servidores externos.
- Guarda los pedidos generados en el checkout.
- Descuenta automáticamente el stock de la talla comprada.
- Permite consultar estadísticas y pedidos desde el botón de cuenta en la cabecera.
