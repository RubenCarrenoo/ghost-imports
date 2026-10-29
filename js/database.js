/**
 * GHOST IMPORTS - MOTOR DE DATOS LOCAL Y ENLACE MYSQL WORKBENCH
 * Gestión comercial de Productos, Categorías, Pedidos, Usuarios y Clientes.
 */

const DB_NAME = "GhostImports_DB";
const DB_VERSION = 4; // Versión 4: Soporte completo de Usuarios y Sesiones

// Categorías del catálogo
const INITIAL_CATEGORIES = {
  hoodies: {
    id: "hoodies",
    name: "Hoodies & Buzos",
    brand: "Nike / Supreme / Undergold",
    label: "Hoodie",
    image: "img/hoddie nike.png",
    0: "Hoodies & Buzos",
    1: "Nike / Supreme / Undergold",
    2: "Hoodie"
  },
  sneakers: {
    id: "sneakers",
    name: "Sneakers Jordan",
    brand: "Jordan",
    label: "Sneaker",
    image: "img/jordan 4 oreo.png",
    0: "Sneakers Jordan",
    1: "Jordan",
    2: "Sneaker"
  },
  bolsos: {
    id: "bolsos",
    name: "Morrales Sprayground",
    brand: "Sprayground",
    label: "Morral",
    image: "img/sprawground.png",
    0: "Morrales Sprayground",
    1: "Sprayground",
    2: "Morral"
  },
  pantalonetas: {
    id: "pantalonetas",
    name: "Pantalonetas Urbanas",
    brand: "Jordan",
    label: "Pantaloneta",
    image: "img/pantaloneta jordan roja.png",
    0: "Pantalonetas Urbanas",
    1: "Jordan",
    2: "Pantaloneta"
  },
  gorras: {
    id: "gorras",
    name: "Gorras New Era cerradas",
    brand: "New Era",
    label: "Gorra",
    image: "img/new era LA negra.png",
    0: "Gorras New Era cerradas",
    1: "New Era",
    2: "Gorra"
  }
};

// Catálogo con precios de mercado en Colombia para margen de ganancia comercial
const INITIAL_PRODUCTS = [
  {
    id: "h1",
    cat: "hoodies",
    name: "Hoodie Nike Swoosh Club",
    brand: "Nike",
    price: 295000,
    image: "img/hoddie nike.png",
    stock: { S: 10, M: 15, L: 12, XL: 8 },
    new: true,
    description: "Hoodie Nike confeccionado en algodón fleece pesado de alta densidad con forro térmico suave. Logotipo Swoosh bordado en el pecho, corte oversize urbano y bolsillo canguro frontal."
  },
  {
    id: "h2",
    cat: "hoodies",
    name: "Hoodie Supreme Box Logo",
    brand: "Supreme",
    price: 450000,
    image: "img/hoddie supreme.png",
    stock: { S: 8, M: 12, L: 10, XL: 6 },
    new: true,
    description: "Sudadera icónica Supreme Box Logo en algodón peinado premium. Bordado frontal de alta definición en relieve, costuras reforzadas y capucha estructurada con cordón grueso."
  },
  {
    id: "h3",
    cat: "hoodies",
    name: "Hoodie Undergold Oversize",
    brand: "Undergold",
    price: 395000,
    image: "img/hoddie undergold.png",
    stock: { S: 6, M: 10, L: 14, XL: 8 },
    new: false,
    description: "Buzo Undergold de silueta holgada y hombros caídos. Fabricado en algodón pesado con diseño minimalista contemporáneo para amantes de la cultura callejera."
  },
  {
    id: "s1",
    cat: "sneakers",
    name: "Air Jordan 3 Retro Black Cement",
    brand: "Jordan",
    price: 890000,
    image: "img/jordan 3 negras.png",
    stock: { "39": 8, "40": 10, "41": 10, "42": 12, "43": 8 },
    new: true,
    description: "El legendario Air Jordan 3 Retro Black Cement con el característico estampado Elephant Print, cuero genuino granulado y cápsula Air-Sole visible en el talón."
  },
  {
    id: "s2",
    cat: "sneakers",
    name: "Air Jordan 4 Retro White Oreo",
    brand: "Jordan",
    price: 960000,
    image: "img/jordan 4 oreo.png",
    stock: { "39": 8, "40": 10, "41": 8, "42": 12, "43": 8, "44": 6 },
    new: true,
    description: "Silueta Jordan 4 White Oreo elaborada en piel prémium blanca con detalles moteados en gris cemento y el emblemático Jumpman en rojo fuego sobre la lengüeta."
  },
  {
    id: "b1",
    cat: "bolsos",
    name: "Morral Sprayground Shark in Paris",
    brand: "Sprayground",
    price: 580000,
    image: "img/sprawground.png",
    stock: { "Única": 15 },
    new: true,
    description: "Mochila Sprayground de edición exclusiva con el gráfico Shark Mouth y estampado a cuadros en tonos tierra. Tejido impermeable duradero y funda aterciopelada para laptop de 15\"."
  },
  {
    id: "b2",
    cat: "bolsos",
    name: "Morral Sprayground White Shark",
    brand: "Sprayground",
    price: 590000,
    image: "img/sprawground blanco.png",
    stock: { "Única": 12 },
    new: false,
    description: "Morral Sprayground blanco puro con diseño Shark reflectivo, bolsillo ergonómico con cremallera oculta, espaldar acolchado de malla y correas ajustables ergonómicas."
  },
  {
    id: "p1",
    cat: "pantalonetas",
    name: "Pantaloneta Jordan Diamond Roja",
    brand: "Jordan",
    price: 210000,
    image: "img/pantaloneta jordan roja.png",
    stock: { S: 10, M: 15, L: 12, XL: 8 },
    new: true,
    description: "Pantaloneta deportiva Jordan en tono rojo intenso inspirada en el uniforme profesional de Michael Jordan. Confeccionada en malla transpirable con detalles en diamante."
  },
  {
    id: "p2",
    cat: "pantalonetas",
    name: "Pantaloneta Jordan Jumpman Negra",
    brand: "Jordan",
    price: 195000,
    image: "img/pantaloneta negra jordan.png",
    stock: { S: 8, M: 16, L: 12, XL: 6 },
    new: false,
    description: "Short streetwear Jordan negro total con bolsillos laterales, pretina elástica con cordón de ajuste y logotipo Jumpman en contraste blanco."
  },
  {
    id: "g1",
    cat: "gorras",
    name: "Gorra New Era 59FIFTY LA Dodgers Negra",
    brand: "New Era",
    price: 245000,
    image: "img/new era LA negra.png",
    stock: { "7 1/4": 10, "7 3/8": 12, "7 1/2": 8 },
    new: true,
    description: "Gorra oficial 59FIFTY cerrada de Los Angeles Dodgers en colorway negro con corona alta estructurada, visera plana y bordado en 3D de alta precisión."
  },
  {
    id: "g2",
    cat: "gorras",
    name: "Gorra New Era 59FIFTY NY Yankees Bicolor",
    brand: "New Era",
    price: 235000,
    image: "img/new era negra con blanco.png",
    stock: { "7 1/4": 8, "7 3/8": 10, "7 1/2": 8 },
    new: false,
    description: "Gorra cerrada New Era 59FIFTY de los New York Yankees con corona negra, visera blanca en contraste y logo bordado oficial de la MLB."
  }
];

// Usuarios iniciales registrados (coincidentes con MySQL Workbench)
const INITIAL_USERS = [
  {
    id: 1,
    nombre: "Administrador Ghost Imports",
    email: "admin@ghostimports.com",
    password: "admin123",
    telefono: "3105550000",
    ciudad: "Bogotá D.C.",
    direccion: "Oficina Principal Ghost Imports Calle 93 # 11-20",
    rol: "admin",
    fecha_registro: "2026-10-28T10:00:00.000Z"
  },
  {
    id: 2,
    nombre: "Carlos Mendoza",
    email: "carlos.mendoza@email.com",
    password: "cliente123",
    telefono: "3009876543",
    ciudad: "Medellín",
    direccion: "Carrera 43A # 1-50, Poblado",
    rol: "cliente",
    fecha_registro: "2026-10-28T10:15:00.000Z"
  },
  {
    id: 3,
    nombre: "Valentina Gómez",
    email: "valentina.gomez@email.com",
    password: "cliente123",
    telefono: "3157891234",
    ciudad: "Bogotá D.C.",
    direccion: "Calle 127 # 15-40, Usaquén",
    rol: "cliente",
    fecha_registro: "2026-10-28T10:30:00.000Z"
  },
  {
    id: 4,
    nombre: "Mateo Restrepo",
    email: "mateo.restrepo@email.com",
    password: "cliente123",
    telefono: "3204567890",
    ciudad: "Cali",
    direccion: "Avenida 6N # 24N-12, Granada",
    rol: "cliente",
    fecha_registro: "2026-10-28T11:00:00.000Z"
  }
];

// Pedidos iniciales (coincidentes con MySQL Workbench)
const INITIAL_ORDERS = [
  {
    id: "ord_001",
    orderCode: "GI-2026-8812",
    userId: 2,
    date: new Date(Date.now() - 3600000 * 4).toISOString(),
    customer: {
      name: "Carlos Mendoza",
      email: "carlos.mendoza@email.com",
      phone: "3009876543",
      city: "Medellín",
      address: "Carrera 43A # 1-50, Poblado"
    },
    paymentMethod: "Nequi",
    items: [
      {
        id: "h1",
        name: "Hoodie Nike Swoosh Club",
        brand: "Nike",
        s: "M",
        price: 295000,
        q: 1,
        image: "img/hoddie nike.png"
      }
    ],
    subtotal: 295000,
    total: 295000,
    status: "En preparación",
    notes: "Entregar en portería del edificio."
  },
  {
    id: "ord_002",
    orderCode: "GI-2026-9045",
    userId: 3,
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    customer: {
      name: "Valentina Gómez",
      email: "valentina.gomez@email.com",
      phone: "3157891234",
      city: "Bogotá D.C.",
      address: "Calle 127 # 15-40, Usaquén"
    },
    paymentMethod: "Bancolombia",
    items: [
      {
        id: "s2",
        name: "Air Jordan 4 Retro White Oreo",
        brand: "Jordan",
        s: "40",
        price: 960000,
        q: 1,
        image: "img/jordan 4 oreo.png"
      }
    ],
    subtotal: 960000,
    total: 960000,
    status: "Pago verificado",
    notes: "Llamar antes de entregar por favor."
  },
  {
    id: "ord_003",
    orderCode: "GI-2026-9210",
    userId: 4,
    date: new Date(Date.now() - 3600000 * 1).toISOString(),
    customer: {
      name: "Mateo Restrepo",
      email: "mateo.restrepo@email.com",
      phone: "3204567890",
      city: "Cali",
      address: "Avenida 6N # 24N-12, Granada"
    },
    paymentMethod: "Nequi",
    items: [
      {
        id: "h2",
        name: "Hoodie Supreme Box Logo",
        brand: "Supreme",
        s: "L",
        price: 450000,
        q: 1,
        image: "img/hoddie supreme.png"
      }
    ],
    subtotal: 450000,
    total: 450000,
    status: "Enviado",
    notes: "Guía Interrapidísimo # 700291823"
  }
];

class GhostDatabase {
  constructor() {
    this.db = null;
    this.isReady = false;
    this.useLocalStorageFallback = false;
    this._initPromise = null;
  }

  async init() {
    if (this._initPromise) return this._initPromise;

    this._initPromise = new Promise((resolve) => {
      if (!window.indexedDB) {
        this.useLocalStorageFallback = true;
        this.isReady = true;
        this._seedLocalStorageIfNeeded();
        resolve(this);
        return;
      }

      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (db.objectStoreNames.contains("products")) {
            db.deleteObjectStore("products");
          }
          if (db.objectStoreNames.contains("categories")) {
            db.deleteObjectStore("categories");
          }
          if (!db.objectStoreNames.contains("orders")) {
            const orderStore = db.createObjectStore("orders", { keyPath: "id" });
            orderStore.createIndex("orderCode", "orderCode", { unique: true });
            orderStore.createIndex("userId", "userId", { unique: false });
          }
          if (!db.objectStoreNames.contains("users")) {
            const userStore = db.createObjectStore("users", { keyPath: "id" });
            userStore.createIndex("email", "email", { unique: true });
          }

          const productStore = db.createObjectStore("products", { keyPath: "id" });
          productStore.createIndex("cat", "cat", { unique: false });
          productStore.createIndex("brand", "brand", { unique: false });

          db.createObjectStore("categories", { keyPath: "id" });
        };

        request.onsuccess = async (event) => {
          this.db = event.target.result;
          this.isReady = true;
          try {
            await this._seedIfNeeded();
          } catch (e) {
            console.warn("Sembrado DB:", e);
          }
          resolve(this);
        };

        request.onerror = () => {
          this.useLocalStorageFallback = true;
          this.isReady = true;
          this._seedLocalStorageIfNeeded();
          resolve(this);
        };
      } catch (err) {
        this.useLocalStorageFallback = true;
        this.isReady = true;
        this._seedLocalStorageIfNeeded();
        resolve(this);
      }
    });

    return this._initPromise;
  }

  _seedLocalStorageIfNeeded() {
    if (!localStorage.getItem("gi_db_products")) {
      localStorage.setItem("gi_db_products", JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem("gi_db_users")) {
      localStorage.setItem("gi_db_users", JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem("gi_db_orders")) {
      localStorage.setItem("gi_db_orders", JSON.stringify(INITIAL_ORDERS));
    }
  }

  async _seedIfNeeded() {
    const prods = await this._getAll("products");
    if (!prods || prods.length < INITIAL_PRODUCTS.length) {
      for (const cat of Object.values(INITIAL_CATEGORIES)) {
        await this._put("categories", cat);
      }
      for (const p of INITIAL_PRODUCTS) {
        await this._put("products", p);
      }
    }

    const users = await this._getAll("users");
    if (!users || users.length === 0) {
      for (const u of INITIAL_USERS) {
        await this._put("users", u);
      }
    }

    const orders = await this._getAll("orders");
    if (!orders || orders.length === 0) {
      for (const o of INITIAL_ORDERS) {
        await this._put("orders", o);
      }
    }
  }

  _getAll(storeName) {
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction([storeName], "readonly");
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      } catch (e) {
        reject(e);
      }
    });
  }

  _put(storeName, value) {
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction([storeName], "readwrite");
        const store = tx.objectStore(storeName);
        const req = store.put(value);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      } catch (e) {
        reject(e);
      }
    });
  }

  // PRODUCTOS
  async getProducts() {
    await this.init();
    if (this.useLocalStorageFallback || !this.db) {
      const stored = localStorage.getItem("gi_db_products");
      let prods = stored ? JSON.parse(stored) : null;
      if (!prods) {
        prods = INITIAL_PRODUCTS;
        localStorage.setItem("gi_db_products", JSON.stringify(prods));
      }
      return prods;
    }
    try {
      const prods = await this._getAll("products");
      if (!prods || prods.length < INITIAL_PRODUCTS.length) {
        await this._seedIfNeeded();
        return INITIAL_PRODUCTS;
      }
      return prods;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  }

  async getProductById(id) {
    const prods = await this.getProducts();
    return prods.find((p) => p.id === id) || null;
  }

  async saveProduct(product) {
    await this.init();
    if (this.useLocalStorageFallback || !this.db) {
      const prods = await this.getProducts();
      const idx = prods.findIndex((p) => p.id === product.id);
      if (idx >= 0) prods[idx] = product;
      else prods.push(product);
      localStorage.setItem("gi_db_products", JSON.stringify(prods));
      return product.id;
    }
    return this._put("products", product);
  }

  async updateStock(productId, size, quantityPurchased) {
    const product = await this.getProductById(productId);
    if (!product) throw new Error("Producto no encontrado");

    if (product.stock && typeof product.stock[size] === "number") {
      const current = product.stock[size];
      if (current < quantityPurchased) {
        throw new Error(`Stock insuficiente en talla ${size}. Disponible: ${current}`);
      }
      product.stock[size] = current - quantityPurchased;
      await this.saveProduct(product);
      return product;
    }
    throw new Error(`La talla ${size} no existe para este producto`);
  }

  async getCategories() {
    await this.init();
    if (this.useLocalStorageFallback || !this.db) {
      return INITIAL_CATEGORIES;
    }
    try {
      const list = await this._getAll("categories");
      if (!list || list.length === 0) return INITIAL_CATEGORIES;
      const map = {};
      list.forEach((c) => {
        map[c.id] = {
          id: c.id,
          name: c.name,
          brand: c.brand,
          label: c.label,
          image: c.image || "assets/logo.webp",
          0: c.name,
          1: c.brand,
          2: c.label
        };
      });
      return map;
    } catch (e) {
      return INITIAL_CATEGORIES;
    }
  }

  // USUARIOS
  async getUsers() {
    await this.init();
    let users = [];
    if (this.useLocalStorageFallback || !this.db) {
      const stored = localStorage.getItem("gi_db_users");
      users = stored ? JSON.parse(stored) : INITIAL_USERS;
    } else {
      try {
        users = await this._getAll("users");
        if (!users || users.length === 0) {
          users = INITIAL_USERS;
        }
      } catch (e) {
        users = INITIAL_USERS;
      }
    }
    return users;
  }

  async getUserById(id) {
    const users = await this.getUsers();
    return users.find((u) => u.id === id || String(u.id) === String(id)) || null;
  }

  async getUserByEmail(email) {
    if (!email) return null;
    const users = await this.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
  }

  async saveUser(user) {
    await this.init();
    const users = await this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem("gi_db_users", JSON.stringify(users));

    if (this.db) {
      try {
        await this._put("users", user);
      } catch (e) {}
    }
    return user;
  }

  // PEDIDOS
  async createOrder(orderData) {
    await this.init();

    const timestamp = Date.now().toString().slice(-4);
    const randomHex = Math.floor(Math.random() * 900 + 100);
    const orderCode = `GI-${timestamp}-${randomHex}`;

    const order = {
      id: "ord_" + Date.now(),
      orderCode,
      userId: orderData.userId || null,
      date: new Date().toISOString(),
      customer: orderData.customer,
      paymentMethod: orderData.paymentMethod,
      items: orderData.items,
      subtotal: orderData.total,
      total: orderData.total,
      status: "Pendiente de comprobante",
      notes: orderData.notes || ""
    };

    // Actualizar inventario local
    for (const item of order.items) {
      try {
        await this.updateStock(item.id, item.s, item.q);
      } catch (e) {
        console.warn(`Stock update warn para ${item.id}:`, e.message);
      }
    }

    // Guardar en storage local
    const orders = await this.getOrders();
    orders.unshift(order);
    localStorage.setItem("gi_db_orders", JSON.stringify(orders));

    if (this.db) {
      try {
        await this._put("orders", order);
      } catch (e) {}
    }

    // Sincronizar automáticamente con MySQL Server 8.0 / Workbench
    try {
      const mysqlPayload = {
        id: order.id,
        codigo_pedido: order.orderCode,
        usuario_id: order.userId || null,
        cliente_nombre: order.customer.name,
        cliente_email: order.customer.email,
        cliente_telefono: order.customer.phone,
        cliente_ciudad: order.customer.city,
        cliente_direccion: order.customer.address,
        metodo_pago: order.paymentMethod,
        subtotal: order.subtotal,
        total: order.total,
        estado: order.status,
        notas: order.notes,
        items: order.items
      };

      fetch("http://localhost:3307/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mysqlPayload)
      }).catch(() => {});
    } catch (e) {}

    return order;
  }

  async getOrders() {
    await this.init();
    let orders = [];
    if (this.useLocalStorageFallback || !this.db) {
      const stored = localStorage.getItem("gi_db_orders");
      orders = stored ? JSON.parse(stored) : INITIAL_ORDERS;
    } else {
      try {
        orders = await this._getAll("orders");
        if (!orders || orders.length === 0) {
          orders = INITIAL_ORDERS;
        }
      } catch (e) {
        orders = INITIAL_ORDERS;
      }
    }
    return orders.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getOrdersByUser(userId, userEmail) {
    const orders = await this.getOrders();
    return orders.filter((o) => {
      if (userId && o.userId && String(o.userId) === String(userId)) return true;
      if (userEmail && o.customer && o.customer.email && o.customer.email.toLowerCase() === userEmail.toLowerCase()) return true;
      return false;
    });
  }

  async updateOrderStatus(orderId, newStatus) {
    await this.init();
    const orders = await this.getOrders();
    const found = orders.find((o) => o.id === orderId || o.orderCode === orderId);
    if (!found) throw new Error("Pedido no encontrado");

    found.status = newStatus;
    localStorage.setItem("gi_db_orders", JSON.stringify(orders));

    if (this.db) {
      try {
        await this._put("orders", found);
      } catch (e) {}
    }

    // Sincronizar actualización con MySQL Workbench
    try {
      fetch("http://localhost:3307/api/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus })
      }).catch(() => {});
    } catch (e) {}

    return found;
  }

  async getStats() {
    const products = await this.getProducts();
    const orders = await this.getOrders();
    const users = await this.getUsers();

    const totalStock = products.reduce((acc, p) => {
      return acc + Object.values(p.stock || {}).reduce((a, b) => a + b, 0);
    }, 0);

    const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
    const clientsCount = users.filter((u) => u.rol !== "admin").length;

    return {
      totalProducts: products.length,
      totalStockUnits: totalStock,
      totalOrders: orders.length,
      totalRevenue: totalRevenue,
      totalClients: clientsCount
    };
  }
}

// Instancia singleton universal
const db = new GhostDatabase();
window.GhostDB = db;
window.INITIAL_PRODUCTS = INITIAL_PRODUCTS;
window.INITIAL_CATEGORIES = INITIAL_CATEGORIES;
