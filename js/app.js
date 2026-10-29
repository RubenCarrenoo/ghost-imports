/**
 * GHOST IMPORTS - APLICACIÓN PRINCIPAL
 * Lógica de interfaz, enrutador hash, carrito, catálogo y checkout conectado a Base de Datos.
 */

// Obtener dependencias desde el contexto global (compatible con Live Server y apertura directa)
const CONFIG = window.CONFIG || {
  storeName: "Ghost Imports",
  currency: "COP",
  locale: "es-CO",
  whatsapp: "573166045499",
  paymentMethods: {
    nequi: { name: "Nequi", number: "316 604 5499", holder: "Ghost Imports", type: "Billetera digital" },
    bancolombia: { name: "Bancolombia", number: "07800043861", holder: "Ghost Imports", type: "Cuenta de Ahorros" }
  }
};

const db = window.GhostDB;

// Ruta al logotipo local
const LOGO_SRC = "assets/logo.webp";

// Selectores auxiliares
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

// Formateador de moneda en pesos colombianos
const cop = (n) => "$" + Number(n).toLocaleString(CONFIG.locale) + " " + CONFIG.currency;

// Calcular stock total de un producto
const tot = (p) => Object.values(p.stock || {}).reduce((a, b) => a + b, 0);

// Estado de la aplicación
let products = [];
let categories = {};
let cart = [];
let favs = [];
let searchQuery = "";
let filterState = { brand: "", cat: "", size: "", max: "", avail: false, sort: "rel" };
let selectedSize = null;

// Cargar carrito y favoritos guardados
try {
  cart = JSON.parse(localStorage.getItem("gi_cart") || "[]");
  favs = JSON.parse(localStorage.getItem("gi_fav") || "[]");
} catch (e) {
  cart = [];
  favs = [];
}

const saveStorage = () => {
  try {
    localStorage.setItem("gi_cart", JSON.stringify(cart));
    localStorage.setItem("gi_fav", JSON.stringify(favs));
  } catch (e) {}
};

// ==============================================================================
// NOTIFICACIONES (TOAST)
// ==============================================================================
function toast(message, isError = false) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = message;
  t.className = "toast on" + (isError ? " err" : "");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    t.className = "toast";
  }, 2600);
}

// ==============================================================================
// RENDERIZADO DE COMPONENTES VISUALES
// ==============================================================================
const logoImg = (extraClass = "") =>
  `<img class="lg ${extraClass}" src="${LOGO_SRC}" alt="${CONFIG.storeName}">`;

const productImg = (p, showBadge = false) => {
  const catLabel = categories[p.cat] ? categories[p.cat][2] : "Prenda";
  return `
    <div class="img">
      ${catLabel}
      <span class="ph">Foto provisional</span>
      ${showBadge && p.new ? '<span class="tag">NEW DROP</span>' : ""}
    </div>
  `;
};

function productCard(p) {
  const stockCount = tot(p);
  const isFav = favs.includes(p.id);

  return `
    <article class="card">
      <a href="#p-${p.id}" aria-label="Ver ${p.name}">
        ${productImg(p, true)}
      </a>
      <button class="fav ${isFav ? "on" : ""}" data-fav="${p.id}" aria-pressed="${isFav}" aria-label="Favorito">
        ♥
      </button>
      <div class="cb">
        <span class="br">${p.brand}</span>
        <b>${p.name}</b>
        <span class="pr">${cop(p.price)} <i>precio demo</i></span>
        <span class="av ${stockCount > 0 ? "y" : "n"}">
          ${stockCount > 0 ? "Disponible" : "Agotado"}
        </span>
        <div class="row">
          <a class="btn g" href="#p-${p.id}">VER DETALLES</a>
          <button class="btn" data-quick="${p.id}" ${stockCount > 0 ? "" : "disabled"}>
            AGREGAR
          </button>
        </div>
      </div>
    </article>
  `;
}

// ==============================================================================
// VISTA: INICIO (HOME)
// ==============================================================================
function homeView() {
  const newDrops = products.filter((p) => p.new);

  return `
    <div class="wrap hero">
      ${logoImg()}
      <h1>Lo que no se ve, se nota.</h1>
      <p>Hoodies, sneakers, bolsos y gorras seleccionados para quien viste con criterio propio.</p>
      <div class="row">
        <a class="btn" href="#catalogo">EXPLORAR COLECCIÓN</a>
        <a class="btn g" href="#novedades">VER NOVEDADES</a>
      </div>
    </div>

    <section>
      <div class="wrap">
        <h2>Colecciones</h2>
        <div class="cats">
          ${Object.entries(categories)
            .map(
              ([slug, data]) => `
              <a class="cat" href="#${slug}">
                <span class="ph">Foto provisional</span>
                <h3>${data[0]}</h3>
                <small>Explorar productos</small>
              </a>
            `
            )
            .join("")}
        </div>
      </div>
    </section>

    <section>
      <div class="wrap">
        <h2>Favoritos</h2>
        <div class="grid">
          ${products.slice(0, 4).map(productCard).join("")}
        </div>
      </div>
    </section>

    <div class="band">
      ${logoImg()}
      <p>Estilo personal, sin explicación.</p>
    </div>

    <section>
      <div class="wrap">
        <h2>Nuevos lanzamientos</h2>
        <div class="grid">
          ${newDrops.map(productCard).join("")}
        </div>
      </div>
    </section>

    <section>
      <div class="wrap two">
        <h2>Ghost Imports</h2>
        <p>Ghost Imports es una tienda de moda urbana en Colombia. Elegimos prendas y accesorios de marcas que marcan la calle, con foco en el estilo de quien los usa. Aquí encuentras hoodies, sneakers, bolsos, pantalonetas y gorras en un solo lugar.</p>
      </div>
    </section>

    ${trustSection()}
  `;
}

function trustSection() {
  const items = [
    ["Pagos", "Aceptamos transferencias Nequi y Bancolombia."],
    ["Envíos nacionales", "Cobertura a nivel nacional en Colombia con entrega asegurada."],
    ["Cambios y devoluciones", "Garantía de satisfacción y cambios por talla disponibles."],
    ["Autenticidad", "Prendas e importaciones seleccionadas bajo estrictos filtros de calidad."],
    ["Atención directa", "Asesoría personalizada y seguimiento por WhatsApp."],
    ["Base de datos local", "Control de pedidos e inventario activo en tiempo real."]
  ];

  return `
    <section id="servicio">
      <div class="wrap">
        <h2>Confianza y servicio</h2>
        <div class="trust">
          ${items
            .map(
              ([title, desc]) => `
              <div class="tr">
                <h3>${title}</h3>
                <p class="pend">${desc}</p>
              </div>
            `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

// ==============================================================================
// VISTA: CATÁLOGO Y FILTROS
// ==============================================================================
function filterProducts(categoryBase) {
  let list = products.filter((p) => {
    const matchCategory = !categoryBase || p.cat === categoryBase;
    const matchBrandFilter = !filterState.brand || p.brand === filterState.brand;
    const matchCatFilter = !filterState.cat || p.cat === filterState.cat;
    const matchSizeFilter = !filterState.size || (p.stock[filterState.size] || 0) > 0;
    const matchMaxPrice = !filterState.max || p.price <= Number(filterState.max);
    const matchAvailability = !filterState.avail || tot(p) > 0;
    return (
      matchCategory &&
      matchBrandFilter &&
      matchCatFilter &&
      matchSizeFilter &&
      matchMaxPrice &&
      matchAvailability
    );
  });

  const query = searchQuery.trim().toLowerCase();
  if (query) {
    list = list.filter((p) => {
      const catName = categories[p.cat] ? categories[p.cat][0] : "";
      return (p.name + p.brand + catName).toLowerCase().includes(query);
    });
  }

  if (filterState.sort === "lo") list.sort((a, b) => a.price - b.price);
  if (filterState.sort === "hi") list.sort((a, b) => b.price - a.price);
  if (filterState.sort === "new") list.sort((a, b) => Number(b.new) - Number(a.new));

  return list;
}

function catalogView(categoryBase) {
  const isNovelties = categoryBase === "novedades";
  const title = isNovelties
    ? "Novedades"
    : categoryBase && categories[categoryBase]
    ? categories[categoryBase][0]
    : "Catálogo";

  const allSizes = [...new Set(products.flatMap((p) => Object.keys(p.stock || {})))];
  const allBrands = [...new Set(products.map((p) => p.brand))];

  return `
    <div class="wrap" style="padding-top:36px;padding-bottom:64px">
      <h2>${title}</h2>
      <div class="cat-top">
        <form class="filters" id="filterForm" role="search">
          <label for="filterQuery">Buscar</label>
          <input type="search" id="filterQuery" placeholder="Buscar producto o marca..." value="${searchQuery}">

          <label for="filterBrand">Marca</label>
          <select id="filterBrand">
            <option value="">Todas</option>
            ${allBrands
              .map(
                (brand) => `
                <option value="${brand}" ${filterState.brand === brand ? "selected" : ""}>${brand}</option>
              `
              )
              .join("")}
          </select>

          ${
            categoryBase && !isNovelties
              ? ""
              : `
            <label for="filterCat">Categoría</label>
            <select id="filterCat">
              <option value="">Todas</option>
              ${Object.entries(categories)
                .map(
                  ([slug, data]) => `
                  <option value="${slug}" ${filterState.cat === slug ? "selected" : ""}>${data[0]}</option>
                `
                )
                .join("")}
            </select>
          `
          }

          <label for="filterSize">Talla</label>
          <select id="filterSize">
            <option value="">Todas</option>
            ${allSizes
              .map(
                (size) => `
                <option value="${size}" ${filterState.size === size ? "selected" : ""}>${size}</option>
              `
              )
              .join("")}
          </select>

          <label for="filterMax">Precio máximo (COP)</label>
          <input type="number" id="filterMax" min="0" step="10000" placeholder="Ej: 300000" value="${filterState.max}">

          <label class="chk">
            <input type="checkbox" id="filterAvail" ${filterState.avail ? "checked" : ""}>
            Solo disponibles
          </label>

          <label for="filterSort">Ordenar por</label>
          <select id="filterSort">
            <option value="rel">Relevancia</option>
            <option value="new" ${filterState.sort === "new" ? "selected" : ""}>Novedades (New Drops)</option>
            <option value="lo" ${filterState.sort === "lo" ? "selected" : ""}>Precio: menor a mayor</option>
            <option value="hi" ${filterState.sort === "hi" ? "selected" : ""}>Precio: mayor a menor</option>
          </select>
        </form>

        <div class="res" id="catalogResults"></div>
      </div>
    </div>
  `;
}

function renderCatalogResults(categoryBase) {
  const container = $("#catalogResults");
  if (!container) return;

  const base = categoryBase === "novedades" ? "" : categoryBase;
  let results = filterProducts(base);

  if (categoryBase === "novedades") {
    results = results.filter((p) => p.new);
  }

  if (results.length > 0) {
    container.innerHTML = `<div class="grid">${results.map(productCard).join("")}</div>`;
  } else {
    container.innerHTML = `<div class="empty">Sin resultados. Cambia o quita algún filtro para ver más productos.</div>`;
  }
}

// ==============================================================================
// VISTA: DETALLE DE PRODUCTO
// ==============================================================================
function productDetailView(productId) {
  const p = products.find((x) => x.id === productId);
  if (!p) {
    return `
      <div class="wrap">
        <div class="empty" style="margin:60px 0">
          Producto no encontrado. <a href="#catalogo"><u>Volver al catálogo</u></a>
        </div>
      </div>
    `;
  }

  selectedSize = null;
  const related = products.filter((x) => x.cat === p.cat && x.id !== productId);
  const totalStock = tot(p);
  const catName = categories[p.cat] ? categories[p.cat][0] : "Categoría";

  return `
    <div class="wrap" style="padding-top:28px;padding-bottom:64px">
      <div class="crumb">
        <a href="#catalogo">Catálogo</a> / <a href="#${p.cat}">${catName}</a>
      </div>

      <div class="pd">
        ${productImg(p, true)}
        <div>
          <span class="br">${p.brand}</span>
          <h2 style="margin:6px 0 12px">${p.name}</h2>
          <p class="pr" style="font-size:22px">${cop(p.price)} <i>precio oficial</i></p>
          <p style="color:var(--mut);line-height:1.6">
            ${p.description || "Prenda streetwear original seleccionada para Ghost Imports. Calidad garantizada."}
          </p>

          <b>Talla</b>
          <div class="sz" id="sizeSelector">
            ${Object.entries(p.stock || {})
              .map(
                ([size, count]) => `
                <button data-s="${size}" ${count > 0 ? "" : "disabled"} aria-label="Talla ${size}${count > 0 ? "" : " agotada"}">
                  ${size}
                </button>
              `
              )
              .join("")}
          </div>

          <p class="av" id="availabilityNotice" aria-live="polite">
            ${totalStock > 0 ? "Elige una talla para continuar" : '<span class="n">Agotado en todas las tallas</span>'}
          </p>

          <div class="row" style="margin-top:20px">
            <button class="btn" id="addToCartBtn" ${totalStock > 0 ? "" : "disabled"}>
              AGREGAR AL CARRITO
            </button>
            <button class="btn g" id="buyNowBtn" ${totalStock > 0 ? "" : "disabled"}>
              COMPRAR AHORA
            </button>
          </div>

          <p class="pend" style="font-size:13px;margin-top:24px">
            Envíos a todo el país. Pagos seguros por transferencia Nequi o Bancolombia.
          </p>
        </div>
      </div>

      ${
        related.length > 0
          ? `
        <h2 style="margin-top:56px">También te puede gustar</h2>
        <div class="grid">${related.slice(0, 4).map(productCard).join("")}</div>
      `
          : ""
      }
    </div>
  `;
}

// ==============================================================================
// VISTA: CHECKOUT (FINALIZAR COMPRA)
// ==============================================================================
const getCartTotal = () => cart.reduce((acc, item) => acc + item.price * item.q, 0);

function checkoutView() {
  const methods = CONFIG.paymentMethods;

  return `
    <div class="wrap co" style="padding:36px 20px 64px">
      <h2>Finalizar Pedido</h2>
      <p style="color:var(--mut);margin-bottom:20px">
        Ingresa tus datos de envío para registrar tu compra en la base de datos de Ghost Imports.
      </p>

      <form id="checkoutForm" novalidate>
        <label for="c_name">Nombre completo</label>
        <input type="text" id="c_name" placeholder="Ej: Santiago Ruiz" autocomplete="name">
        <div class="er"></div>

        <label for="c_email">Correo electrónico</label>
        <input type="email" id="c_email" placeholder="ejemplo@correo.com" autocomplete="email">
        <div class="er"></div>

        <label for="c_phone">Celular (WhatsApp)</label>
        <input type="tel" id="c_phone" placeholder="Ej: 316 604 5499" autocomplete="tel">
        <div class="er"></div>

        <label for="c_city">Ciudad / Municipio</label>
        <input type="text" id="c_city" placeholder="Ej: Medellín, Bogotá, Cali..." autocomplete="address-level2">
        <div class="er"></div>

        <label for="c_address">Dirección de entrega completa</label>
        <input type="text" id="c_address" placeholder="Calle / Carrera, Torre, Apto..." autocomplete="street-address">
        <div class="er"></div>

        <fieldset class="pm">
          <legend>Método de Pago</legend>
          ${Object.entries(methods)
            .map(
              ([key, data], index) => `
              <label class="pmo">
                <input type="radio" name="paymentRadio" value="${key}" ${index === 0 ? "checked" : ""}>
                <span>${data.name}</span>
              </label>
            `
            )
            .join("")}
        </fieldset>

        <div class="note" id="paymentInstructions" aria-live="polite"></div>

        <p style="font-size:18px;margin:24px 0 16px">
          <b>Total a pagar: ${cop(getCartTotal())}</b>
        </p>

        <button class="btn" type="submit" style="width:100%">
          CONFIRMAR Y REGISTRAR PEDIDO
        </button>
      </form>

      <div id="checkoutSuccess"></div>
    </div>
  `;
}

function getPaymentInfoHTML(methodKey) {
  const method = CONFIG.paymentMethods[methodKey];
  if (!method) return "";
  const fallback = '<span class="pend">por configurar en js/config.js</span>';

  return `
    <b>Instrucciones de pago con ${method.name}</b><br>
    ${
      methodKey === "bancolombia"
        ? `Cuenta de ${method.type}: <b>${method.number || fallback}</b>`
        : `Número Nequi: <b>${method.number || fallback}</b>`
    }<br>
    Titular: <b>${method.holder || fallback}</b><br>
    <small style="color:var(--mut);display:block;margin-top:6px">
      Al confirmar, tu pedido quedará guardado y podrás enviar tu comprobante directamente por WhatsApp.
    </small>
  `;
}

function bindCheckoutEvents() {
  const form = $("#checkoutForm");
  if (!form) return;

  const updateInstructions = () => {
    const checked = document.querySelector("input[name=paymentRadio]:checked");
    if (checked) {
      $("#paymentInstructions").innerHTML = getPaymentInfoHTML(checked.value);
    }
  };

  $$("input[name=paymentRadio]").forEach((radio) => {
    radio.addEventListener("change", updateInstructions);
  });
  updateInstructions();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!cart.length) {
      toast("Tu carrito está vacío", true);
      return;
    }

    const validations = {
      c_name: (v) => v.trim().length >= 3 || "Escribe tu nombre completo",
      c_email: (v) => /^\S+@\S+\.\S+$/.test(v) || "Escribe un correo electrónico válido",
      c_phone: (v) => /^\d{10}$/.test(v.replace(/\D/g, "")) || "Número celular de 10 dígitos requerido",
      c_city: (v) => v.trim().length >= 2 || "Escribe tu ciudad",
      c_address: (v) => v.trim().length >= 6 || "Escribe la dirección de entrega completa"
    };

    let isValid = true;
    Object.keys(validations).forEach((fieldId) => {
      const input = $("#" + fieldId);
      const result = validations[fieldId](input.value);
      const errorDiv = input.nextElementSibling;
      if (result === true) {
        errorDiv.textContent = "";
      } else {
        errorDiv.textContent = result;
        isValid = false;
      }
    });

    if (!isValid) {
      toast("Revisa los campos señalados", true);
      return;
    }

    const selectedMethodKey = document.querySelector("input[name=paymentRadio]:checked").value;
    const selectedMethod = CONFIG.paymentMethods[selectedMethodKey];
    const cartSum = getCartTotal();

    const customerData = {
      name: $("#c_name").value.trim(),
      email: $("#c_email").value.trim(),
      phone: $("#c_phone").value.trim(),
      city: $("#c_city").value.trim(),
      address: $("#c_address").value.trim()
    };

    try {
      // REGISTRO EN LA BASE DE DATOS
      const registeredOrder = await db.createOrder({
        customer: customerData,
        paymentMethod: selectedMethodKey,
        items: [...cart],
        total: cartSum
      });

      // Recargar catálogo actualizado de la base de datos
      products = await db.getProducts();

      // Vaciar carrito
      cart = [];
      drawCart();

      // Ocultar formulario y mostrar comprobante exitoso
      form.style.display = "none";

      // Renderizar comprobante oficial digital completo
      if (typeof window.renderOrderReceiptHTML === "function") {
        $("#checkoutSuccess").innerHTML = window.renderOrderReceiptHTML(registeredOrder);
      } else {
        const waPhone = CONFIG.whatsapp || "573166045499";
        const waMessage = encodeURIComponent(
          `¡Hola Ghost Imports! Registré el pedido #${registeredOrder.orderCode} por valor de ${cop(
            cartSum
          )} a nombre de ${customerData.name}. Pagado con ${selectedMethod.name}. Adjunto mi comprobante:`
        );
        $("#checkoutSuccess").innerHTML = `
          <div class="note" style="border-color:var(--ok);background:#07140a">
            <h3 style="margin-bottom:10px;color:var(--ok)">✓ Pedido Registrado en Base de Datos</h3>
            Código de Pedido: <b>${registeredOrder.orderCode}</b><br>
            Total a pagar: <b>${cop(cartSum)}</b><br><br>
            ${getPaymentInfoHTML(selectedMethodKey)}
            <br><br>
            <a class="btn btn-wa-send" href="https://wa.me/${waPhone}?text=${waMessage}" target="_blank" rel="noopener">
              ENVIAR COMPROBANTE AL WHATSAPP (+57 316 6045499)
            </a>
          </div>
        `;
      }

      // Abrir WhatsApp automáticamente con comprobante
      const waReceipt = typeof window.formatOrderReceiptText === "function"
        ? window.formatOrderReceiptText(registeredOrder)
        : `Pedido #${registeredOrder.orderCode} - ${cop(cartSum)} - ${customerData.name}`;
      const waUrl = `https://wa.me/${CONFIG.whatsapp || "573166045499"}?text=${encodeURIComponent(waReceipt)}`;
      setTimeout(() => {
        try { window.open(waUrl, "_blank"); } catch(e) {}
      }, 600);

      toast("¡Pedido registrado! Envía tu comprobante a WhatsApp.");
    } catch (err) {
      console.error(err);
      toast("Error al guardar el pedido: " + err.message, true);
    }
  });
}

// ==============================================================================
// VISTA: MONITOR DE BASE DE DATOS & PEDIDOS
// ==============================================================================
async function ordersDatabaseView() {
  const orders = await db.getOrders();
  const stats = await db.getStats();

  return `
    <div class="wrap" style="padding:36px 20px 64px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:24px">
        <div>
          <h2>Gestión de Base de Datos</h2>
          <p style="color:var(--mut);margin-top:4px">
            Motor local IndexedDB / SQLite Schema para pedidos e inventario de Ghost Imports.
          </p>
        </div>
        <div class="row">
          <button class="btn g" id="btnResetDB" style="font-size:12px">RESETEAR A DEMO</button>
          <a href="#catalogo" class="btn" style="font-size:12px">IR A LA TIENDA</a>
        </div>
      </div>

      <!-- TARJETAS DE ESTADÍSTICAS -->
      <div class="db-stat-grid">
        <div class="db-stat-card">
          <span>Pedidos Registrados</span>
          <b>${stats.totalOrders}</b>
        </div>
        <div class="db-stat-card">
          <span>Ingresos Registrados</span>
          <b>${cop(stats.totalRevenue)}</b>
        </div>
        <div class="db-stat-card">
          <span>Productos Activos</span>
          <b>${stats.totalProducts}</b>
        </div>
        <div class="db-stat-card">
          <span>Unidades en Inventario</span>
          <b>${stats.totalStockUnits}</b>
        </div>
      </div>

      <!-- LISTA DE PEDIDOS -->
      <div class="db-panel">
        <h3 style="margin-bottom:12px">Historial de Pedidos en Base de Datos</h3>
        ${
          orders.length > 0
            ? `
          <div style="overflow-x:auto">
            <table class="db-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Ciudad</th>
                  <th>Método</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${orders
                  .map(
                    (o) => `
                  <tr>
                    <td><b>${o.orderCode}</b></td>
                    <td>${new Date(o.date).toLocaleDateString("es-CO", { hour: "2-digit", minute: "2-digit" })}</td>
                    <td>${o.customer ? o.customer.name : "Anónimo"}</td>
                    <td>${o.customer ? o.customer.city : "N/A"}</td>
                    <td><span style="text-transform:capitalize">${o.paymentMethod}</span></td>
                    <td><b>${cop(o.total)}</b></td>
                    <td><span class="db-badge ${o.status.includes("verificado") ? "ok" : "pending"}">${o.status}</span></td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `
            : `
          <div class="empty">
            No hay pedidos registrados aún. Haz una compra de prueba en el catálogo para ver el registro aquí.
          </div>
        `
        }
      </div>

      <!-- INFORMACIÓN TÉCNICA DEL ESQUEMA SQL -->
      <div class="db-panel" style="margin-top:24px">
        <h3 style="margin-bottom:8px">Archivos SQL para Producción</h3>
        <p style="color:var(--mut);font-size:14px;line-height:1.6">
          Los archivos relacionales listos para MySQL, MariaDB, PostgreSQL o SQLite se encuentran en la carpeta 
          <code>database/</code>:
        </p>
        <ul style="color:var(--mut);font-size:14px;line-height:1.8">
          <li><b><code>database/ghost_imports.sql</code></b>: Esquema completo + datos iniciales en un solo archivo importable.</li>
          <li><b><code>database/schema.sql</code></b>: Definición de las 7 tablas (categorias, productos, inventario_tallas, clientes, pedidos, items).</li>
          <li><b><code>database/seed_data.sql</code></b>: Datos de prueba y catálogo.</li>
          <li><b><code>database/README.md</code></b>: Instrucciones detalladas de importación para XAMPP, phpMyAdmin o terminal.</li>
        </ul>
      </div>
    </div>
  `;
}

// ==============================================================================
// GESTIÓN DEL CARRITO
// ==============================================================================
function drawCart() {
  const countBadge = $("#cnt");
  const totalDisplay = $("#tot");
  const checkoutBtn = $("#go");
  const cartList = $("#cl");

  const totalItems = cart.reduce((acc, item) => acc + item.q, 0);
  const cartTotal = getCartTotal();

  if (countBadge) countBadge.textContent = totalItems;
  if (totalDisplay) totalDisplay.textContent = cop(cartTotal);
  if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;

  if (cartList) {
    if (cart.length > 0) {
      cartList.innerHTML = cart
        .map(
          (item, idx) => `
          <div class="li">
            <div class="t">Prenda</div>
            <div>
              <b>${item.name}</b><br>
              <span class="br">Talla ${item.s} · ${cop(item.price)}</span><br>
              <span class="qty">
                <button data-minus="${idx}" aria-label="Menos unidades">−</button>
                <span>${item.q}</span>
                <button data-plus="${idx}" aria-label="Más unidades">+</button>
              </span>
              <button class="rm" data-remove="${idx}">Quitar</button>
            </div>
          </div>
        `
        )
        .join("");
    } else {
      cartList.innerHTML = `
        <div class="empty" style="margin-top:20px">
          Tu carrito está vacío. Agrega un producto desde el catálogo.
        </div>
      `;
    }
  }

  saveStorage();
}

function addToCart(productId, size) {
  const p = products.find((x) => x.id === productId);
  if (!p) return false;

  const maxStock = (p.stock && p.stock[size]) || 0;
  if (!size || maxStock <= 0) {
    toast("Elige una talla disponible", true);
    return false;
  }

  const existing = cart.find((item) => item.id === productId && item.s === size);
  const currentQuantity = existing ? existing.q : 0;

  if (currentQuantity + 1 > maxStock) {
    toast(`Solo hay ${maxStock} unidades en esa talla`, true);
    return false;
  }

  if (existing) {
    existing.q += 1;
  } else {
    cart.push({
      id: productId,
      s: size,
      q: 1,
      name: p.name,
      price: p.price,
      brand: p.brand
    });
  }

  drawCart();
  toast("Agregado al carrito: " + p.name);
  return true;
}

function toggleCartDrawer(isOpen) {
  const drawer = $("#drawer");
  const shade = $("#shade");
  if (drawer && shade) {
    drawer.classList.toggle("open", isOpen);
    shade.classList.toggle("on", isOpen);
    drawer.setAttribute("aria-hidden", !isOpen);
  }
}

// ==============================================================================
// ENRUTADOR PRINCIPAL (HASH ROUTING)
// ==============================================================================
async function router() {
  const hash = (location.hash || "#inicio").slice(1);
  const app = $("#app");
  if (!app) return;

  // Actualizar estado activo en navegación
  $$("nav a").forEach((link) => {
    link.classList.toggle("on", link.getAttribute("href") === "#" + hash);
  });

  const nav = $("#nav");
  if (nav) nav.classList.remove("open");

  if (hash === "pagar") {
    app.innerHTML = checkoutView();
    bindCheckoutEvents();
  } else if (hash === "pedidos" || hash === "admin") {
    app.innerHTML = await ordersDatabaseView();
    const btnReset = $("#btnResetDB");
    if (btnReset) {
      btnReset.onclick = async () => {
        if (confirm("¿Deseas reiniciar la base de datos a sus valores iniciales?")) {
          await db.resetDatabase();
          products = await db.getProducts();
          categories = await db.getCategories();
          toast("Base de datos reiniciada");
          router();
        }
      };
    }
  } else if (hash.startsWith("p-")) {
    const prodId = hash.slice(2);
    app.innerHTML = productDetailView(prodId);
  } else if (hash === "catalogo" || hash === "novedades" || categories[hash]) {
    filterState = {
      brand: "",
      cat: "",
      size: "",
      max: "",
      avail: false,
      sort: hash === "novedades" ? "new" : "rel"
    };

    app.innerHTML = catalogView(hash);
    renderCatalogResults(hash);

    const filterForm = $("#filterForm");
    if (filterForm) {
      filterForm.addEventListener("input", () => {
        searchQuery = $("#filterQuery").value;
        filterState.brand = $("#filterBrand").value;
        filterState.cat = $("#filterCat") ? $("#filterCat").value : "";
        filterState.size = $("#filterSize").value;
        filterState.max = $("#filterMax").value;
        filterState.avail = $("#filterAvail").checked;
        filterState.sort = $("#filterSort").value;
        renderCatalogResults(hash);
      });
      filterForm.addEventListener("submit", (e) => e.preventDefault());
    }
  } else {
    app.innerHTML = homeView();
  }

  // Asignar logos en imágenes marcadas
  $$("[data-logo]").forEach((img) => (img.src = LOGO_SRC));
  scrollTo(0, 0);
}

// ==============================================================================
// GESTIÓN DE EVENTOS GLOBALES
// ==============================================================================
document.addEventListener("click", (e) => {
  const target = e.target.closest("button, a");
  if (!target) return;

  // Favoritos
  if (target.dataset.fav) {
    const id = target.dataset.fav;
    const index = favs.indexOf(id);
    if (index < 0) {
      favs.push(id);
      toast("Guardado en favoritos");
    } else {
      favs.splice(index, 1);
      toast("Eliminado de favoritos");
    }
    saveStorage();
    target.classList.toggle("on", index < 0);
    target.setAttribute("aria-pressed", index < 0);
  }

  // Agregar rápido
  else if (target.dataset.quick) {
    const p = products.find((x) => x.id === target.dataset.quick);
    if (!p) return;
    const availableSizes = Object.keys(p.stock || {}).filter((s) => p.stock[s] > 0);
    if (availableSizes.length === 1) {
      addToCart(p.id, availableSizes[0]);
    } else {
      location.hash = "p-" + p.id;
      toast("Elige tu talla");
    }
  }

  // Selector de talla
  else if (target.dataset.s) {
    $$("#sizeSelector button").forEach((b) => b.classList.remove("on"));
    target.classList.add("on");
    selectedSize = target.dataset.s;

    const currentProdId = location.hash.slice(3);
    const prod = products.find((x) => x.id === currentProdId);
    if (prod) {
      const units = prod.stock[selectedSize];
      $("#availabilityNotice").innerHTML = `<span class="y">${units} ${
        units === 1 ? "unidad disponible" : "unidades disponibles"
      }</span>`;
    }
  }

  // Botón Agregar al Carrito en Detalle
  else if (target.id === "addToCartBtn") {
    const currentProdId = location.hash.slice(3);
    addToCart(currentProdId, selectedSize);
  }

  // Botón Comprar Ahora en Detalle
  else if (target.id === "buyNowBtn") {
    const currentProdId = location.hash.slice(3);
    if (addToCart(currentProdId, selectedSize)) {
      location.hash = "pagar";
    }
  }

  // Disminuir cantidad en carrito
  else if (target.dataset.minus !== undefined) {
    const itemIndex = Number(target.dataset.minus);
    const item = cart[itemIndex];
    if (item) {
      item.q -= 1;
      if (item.q < 1) cart.splice(itemIndex, 1);
      drawCart();
    }
  }

  // Aumentar cantidad en carrito
  else if (target.dataset.plus !== undefined) {
    const itemIndex = Number(target.dataset.plus);
    const item = cart[itemIndex];
    if (item) {
      const prod = products.find((x) => x.id === item.id);
      const stockLimit = (prod && prod.stock && prod.stock[item.s]) || 0;
      if (item.q < stockLimit) {
        item.q += 1;
        drawCart();
      } else {
        toast("Sin más unidades disponibles en esa talla", true);
      }
    }
  }

  // Quitar producto de carrito
  else if (target.dataset.remove !== undefined) {
    const itemIndex = Number(target.dataset.remove);
    cart.splice(itemIndex, 1);
    drawCart();
  }

  // Abrir / Cerrar Drawer del Carrito
  else if (target.id === "cbtn") toggleCartDrawer(true);
  else if (target.id === "cx") toggleCartDrawer(false);

  // Ir a Pagar desde el Carrito
  else if (target.id === "go") {
    toggleCartDrawer(false);
    location.hash = "pagar";
  }

  // Menú móvil hamburguesa
  else if (target.id === "burger") {
    const isOpen = $("#nav").classList.toggle("open");
    target.setAttribute("aria-expanded", isOpen);
  }

  // Botón de búsqueda en cabecera
  else if (target.id === "sbtn") {
    location.hash = "catalogo";
    setTimeout(() => {
      const qInput = $("#filterQuery");
      if (qInput) qInput.focus();
    }, 60);
  }

  // Botón de Cuenta / Pedidos / Base de datos en cabecera
  else if (target.id === "acc") {
    location.hash = "pedidos";
  }
});

// Cerrar carrito al hacer clic en el fondo oscuro
const shadeEl = $("#shade");
if (shadeEl) shadeEl.onclick = () => toggleCartDrawer(false);

// Cerrar con tecla Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") toggleCartDrawer(false);
});

// ==============================================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ==============================================================================
async function initApp() {
  try {
    // 1. Iniciar Base de Datos IndexedDB
    await db.init();
    products = await db.getProducts();
    categories = await db.getCategories();
  } catch (e) {
    console.error("Error inicializando datos:", e);
  }

  // 2. Establecer año dinámico en el footer
  const yearEl = $("#yr");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 3. Pintar carrito inicial
  drawCart();

  // 4. Iniciar enrutador
  window.addEventListener("hashchange", router);
  router();
}

// Iniciar al cargar el DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
