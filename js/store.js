/**
 * GHOST IMPORTS - TIENDA & CARRITO COMPARTIDO (STORE & UI)
 * Maneja el carrito en localStorage, el Drawer lateral, toasts y renderizado con imágenes reales.
 */

// Formateador de moneda colombiana
window.formatCOP = function (n) {
  const num = Number(n) || 0;
  return "$" + num.toLocaleString("es-CO") + " COP";
};

// Calcular stock total de un producto
window.calcTotalStock = function (p) {
  if (!p || !p.stock) return 0;
  return Object.values(p.stock).reduce((a, b) => a + Number(b), 0);
};

// Carrito y Favoritos en localStorage
window.ghostCart = [];
window.ghostFavs = [];

try {
  const rawCart = JSON.parse(localStorage.getItem("gi_cart") || "[]");
  if (Array.isArray(rawCart)) {
    window.ghostCart = rawCart.map(item => ({
      ...item,
      q: Math.max(1, parseInt(item.q, 10) || 1),
      price: Number(item.price) || 0
    }));
  }
  const rawFavs = JSON.parse(localStorage.getItem("gi_fav") || "[]");
  if (Array.isArray(rawFavs)) {
    window.ghostFavs = rawFavs;
  }
} catch (e) {
  window.ghostCart = [];
  window.ghostFavs = [];
}

window.saveCartAndFavs = function () {
  try {
    localStorage.setItem("gi_cart", JSON.stringify(window.ghostCart));
    localStorage.setItem("gi_fav", JSON.stringify(window.ghostFavs));
  } catch (e) {}
};

// Cache en memoria para agilizar verificación de stock
window._ghostProdsCache = null;
window.getGhostProductStockLimit = async function (productId, size) {
  try {
    if (!window._ghostProdsCache && window.GhostDB && typeof window.GhostDB.getProducts === "function") {
      window._ghostProdsCache = await window.GhostDB.getProducts();
    }
    const prods = window._ghostProdsCache || [];
    const p = prods.find((x) => String(x.id) === String(productId));
    if (p && p.stock && p.stock[size] != null) {
      const parsed = Number(p.stock[size]);
      return parsed > 0 ? parsed : 10;
    }
  } catch (err) {
    console.warn("Error consultando stock del producto:", err);
  }
  return 99; // Límite amplio por defecto si no está especificado
};

// Quitar producto del carrito
window.removeFromGhostCart = function (idx) {
  const i = Number(idx);
  if (isNaN(i) || i < 0 || i >= window.ghostCart.length) return;
  const removed = window.ghostCart.splice(i, 1)[0];
  window.updateCartUI();
  if (removed) {
    window.showToast(`Se quitó "${removed.name}" del carrito`);
  }
};

// Modificar cantidad (delta: +1 para subir, -1 para bajar)
window.changeGhostCartQty = async function (idx, delta) {
  const i = Number(idx);
  if (isNaN(i) || i < 0 || i >= window.ghostCart.length) return;
  const item = window.ghostCart[i];
  if (!item) return;

  const currentQ = Math.max(1, parseInt(item.q, 10) || 1);
  const targetQ = currentQ + delta;

  // Si baja a 0, quitar directamente del carrito
  if (targetQ <= 0) {
    window.removeFromGhostCart(i);
    return;
  }

  // Si sube cantidad, validar contra stock disponible
  if (delta > 0) {
    const limit = await window.getGhostProductStockLimit(item.id, item.s);
    if (currentQ >= limit && limit > 0) {
      window.showToast(`Límite alcanzado (${limit} unidades disponibles en talla ${item.s})`, true);
      return;
    }
  }

  item.q = targetQ;
  window.updateCartUI();
};

// Notificaciones Toast
window.showToast = function (message, isError = false) {
  let toastEl = document.getElementById("toast");
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.id = "toast";
    toastEl.className = "toast";
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.className = "toast on" + (isError ? " err" : "");
  clearTimeout(window.showToast._timer);
  window.showToast._timer = setTimeout(() => {
    toastEl.className = "toast";
  }, 2600);
};

// Abrir / Cerrar Drawer del Carrito
window.toggleCart = function (isOpen) {
  const drawer = document.getElementById("drawer");
  const shade = document.getElementById("shade");
  if (drawer) {
    drawer.classList.toggle("open", isOpen);
    drawer.setAttribute("aria-hidden", !isOpen);
  }
  if (shade) {
    shade.classList.toggle("on", isOpen);
  }
};

// Renderizar contenido del carrito con foto de cada prenda, subtotales y controles
window.updateCartUI = function () {
  const countEl = document.getElementById("cnt");
  const totEl = document.getElementById("tot");
  const goBtn = document.getElementById("go");
  const listEl = document.getElementById("cl");

  const totalCount = window.ghostCart.reduce((sum, item) => sum + (Number(item.q) || 0), 0);
  const totalAmount = window.ghostCart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.q) || 0), 0);

  if (countEl) countEl.textContent = totalCount;
  if (totEl) totEl.textContent = window.formatCOP(totalAmount);
  if (goBtn) goBtn.disabled = window.ghostCart.length === 0;

  if (listEl) {
    if (window.ghostCart.length > 0) {
      listEl.innerHTML = window.ghostCart
        .map(
          (item, idx) => `
          <div class="li" data-idx="${idx}">
            <div class="t">
              <img src="${item.image || 'assets/logo.webp'}" alt="${item.name}">
            </div>
            <div class="li-info">
              <div class="li-header">
                <b class="li-title">${item.name}</b>
                <button type="button" class="rm" data-action="cart-remove" data-idx="${idx}" title="Quitar prenda del carrito" aria-label="Quitar ${item.name}">
                  ✕ Quitar
                </button>
              </div>
              <div class="li-meta">
                <span class="br">Talla: <b>${item.s}</b></span> · <span>${window.formatCOP(item.price)} c/u</span>
              </div>
              <div class="li-bottom">
                <div class="qty" role="group" aria-label="Cantidad para ${item.name}">
                  <button type="button" class="qty-btn" data-action="cart-minus" data-idx="${idx}" aria-label="Bajar una unidad" title="Bajar cantidad">−</button>
                  <span class="qty-val" aria-live="polite">${item.q}</span>
                  <button type="button" class="qty-btn" data-action="cart-plus" data-idx="${idx}" aria-label="Subir una unidad" title="Subir cantidad">+</button>
                </div>
                <div class="li-subtotal">
                  <span>Total: </span><b>${window.formatCOP(item.price * item.q)}</b>
                </div>
              </div>
            </div>
          </div>
        `
        )
        .join("");
    } else {
      listEl.innerHTML = `
        <div class="empty" style="margin-top:20px;text-align:center;padding:24px 10px">
          <p style="margin-bottom:14px;color:var(--mut)">Tu carrito está vacío.</p>
          <a href="catalogo.html" class="btn g" style="font-size:12px;display:inline-block">Explorar Catálogo</a>
        </div>
      `;
    }
  }

  window.saveCartAndFavs();

  // Sincronizar automáticamente la pantalla de checkout si existe en la página actual
  if (typeof window.updateCheckoutSummary === "function") {
    try {
      window.updateCheckoutSummary();
    } catch (e) {
      console.warn("Error sincronizando checkout:", e);
    }
  }
};

// Agregar al carrito guardando la foto
window.addToGhostCart = async function (productId, size) {
  const prods = await window.GhostDB.getProducts();
  window._ghostProdsCache = prods;
  const product = prods.find((p) => String(p.id) === String(productId));

  if (!product) {
    window.showToast("Producto no encontrado", true);
    return false;
  }

  const stockLimit = (product.stock && product.stock[size] != null) ? Number(product.stock[size]) : 10;
  if (!size) {
    window.showToast("Elige una talla disponible", true);
    return false;
  }

  const existing = window.ghostCart.find((i) => String(i.id) === String(productId) && i.s === size);
  const currentQ = existing ? (parseInt(existing.q, 10) || 0) : 0;

  if (currentQ + 1 > stockLimit && stockLimit > 0) {
    window.showToast(`Solo quedan ${stockLimit} unidades disponibles en talla ${size}`, true);
    return false;
  }

  if (existing) {
    existing.q = currentQ + 1;
  } else {
    window.ghostCart.push({
      id: productId,
      name: product.name,
      price: Number(product.price) || 0,
      s: size,
      q: 1,
      brand: product.brand,
      cat: product.cat,
      image: product.image || "assets/logo.webp"
    });
  }

  window.updateCartUI();
  window.showToast(`Agregado al carrito: ${product.name} (Talla ${size})`);
  window.toggleCart(true);
  return true;
};

// Generador de Tarjeta de Producto HTML con Imagen Real
window.renderProductCardHTML = function (p) {
  const stock = window.calcTotalStock(p);
  const isFav = window.ghostFavs.includes(p.id);
  const imgSrc = p.image || "assets/logo.webp";

  return `
    <article class="card">
      <a href="producto.html?id=${p.id}" class="card-img-box" aria-label="Ver ${p.name}">
        <img src="${imgSrc}" alt="${p.name}" loading="lazy">
        ${p.new ? '<span class="tag">NEW DROP</span>' : ""}
      </a>
      <button type="button" class="fav ${isFav ? "on" : ""}" data-fav="${p.id}" aria-pressed="${isFav}" aria-label="Favorito">
        ♥
      </button>
      <div class="cb">
        <span class="br">${p.brand}</span>
        <b>${p.name}</b>
        <span class="pr">${window.formatCOP(p.price)}</span>
        <span class="av ${stock > 0 ? "y" : "n"}">
          ${stock > 0 ? "Disponible (" + stock + " en stock)" : "Agotado"}
        </span>
        <div class="row">
          <a class="btn g" href="producto.html?id=${p.id}">VER DETALLES</a>
          <button type="button" class="btn" data-quick-add="${p.id}" ${stock > 0 ? "" : "disabled"}>
            AGREGAR
          </button>
        </div>
      </div>
    </article>
  `;
};

// Delegación global de eventos del carrito y menú
document.addEventListener("click", async (e) => {
  const target = e.target.closest("button, a");
  if (!target) return;

  // Abrir carrito
  if (target.id === "cbtn") {
    e.preventDefault();
    window.toggleCart(true);
    return;
  }

  // Cerrar carrito
  if (target.id === "cx") {
    e.preventDefault();
    window.toggleCart(false);
    return;
  }

  // Ir a pagar desde el carrito
  if (target.id === "go") {
    window.toggleCart(false);
    window.location.href = "pagar.html";
    return;
  }

  // Menú hamburguesa móvil (3 líneas)
  if (target.id === "burger" || target.closest("#burger")) {
    e.preventDefault();
    e.stopPropagation();
    window.toggleMobileNav();
    return;
  }

  // Acción rápida de agregar
  if (target.dataset.quickAdd) {
    e.preventDefault();
    const pid = target.dataset.quickAdd;
    const prods = await window.GhostDB.getProducts();
    const p = prods.find((x) => x.id === pid);
    if (!p) return;
    const avSizes = Object.keys(p.stock || {}).filter((s) => p.stock[s] > 0);
    if (avSizes.length === 1) {
      window.addToGhostCart(pid, avSizes[0]);
    } else {
      window.location.href = `producto.html?id=${pid}`;
    }
    return;
  }

  // Favoritos
  if (target.dataset.fav) {
    e.preventDefault();
    const fid = target.dataset.fav;
    const idx = window.ghostFavs.indexOf(fid);
    if (idx < 0) {
      window.ghostFavs.push(fid);
      target.classList.add("on");
      target.setAttribute("aria-pressed", "true");
      window.showToast("Guardado en favoritos");
    } else {
      window.ghostFavs.splice(idx, 1);
      target.classList.remove("on");
      target.setAttribute("aria-pressed", "false");
      window.showToast("Eliminado de favoritos");
    }
    window.saveCartAndFavs();
    return;
  }

  // Disminuir en carrito
  if (target.dataset.action === "cart-minus") {
    e.preventDefault();
    e.stopPropagation();
    const i = Number(target.dataset.idx);
    window.changeGhostCartQty(i, -1);
    return;
  }

  // Aumentar en carrito
  if (target.dataset.action === "cart-plus") {
    e.preventDefault();
    e.stopPropagation();
    const i = Number(target.dataset.idx);
    window.changeGhostCartQty(i, 1);
    return;
  }

  // Quitar del carrito
  if (target.dataset.action === "cart-remove") {
    e.preventDefault();
    e.stopPropagation();
    const i = Number(target.dataset.idx);
    window.removeFromGhostCart(i);
    return;
  }
});

// Control universal y robusto del menú hamburguesa móvil
window.toggleMobileNav = function (force) {
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const header = document.querySelector("header");
  if (!nav) return;

  const isOpen = typeof force === "boolean" ? force : !nav.classList.contains("open");

  if (isOpen) {
    nav.classList.add("open");
    document.body.classList.add("menu-open");
    if (header) header.classList.add("menu-open");
    if (burger) {
      burger.setAttribute("aria-expanded", "true");
      burger.innerHTML = "✕";
    }
  } else {
    nav.classList.remove("open");
    document.body.classList.remove("menu-open");
    if (header) header.classList.remove("menu-open");
    if (burger) {
      burger.setAttribute("aria-expanded", "false");
      burger.innerHTML = "☰";
    }
  }
};

// ==============================================================================
// GESTIÓN DE COMPROBANTES DE PEDIDO & ENVÍO OBLIGATORIO A WHATSAPP (+57 316 6045499)
// ==============================================================================

window._waSentOrders = {};

// Verificar si una orden ya fue enviada por WhatsApp
window.isOrderWaSent = function (code) {
  if (window._waSentOrders && window._waSentOrders[code]) return true;
  try {
    return sessionStorage.getItem("gi_wa_sent_" + code) === "true";
  } catch (e) {
    return false;
  }
};

// Manejador al presionar el botón obligatorio de WhatsApp
window.markWhatsAppSent = function (code) {
  window._waSentOrders[code] = true;
  try {
    sessionStorage.setItem("gi_wa_sent_" + code, "true");
  } catch (e) {}

  // Actualizar el aviso de paso obligatorio a completado
  const noticeBox = document.getElementById("waNoticeBox-" + code);
  if (noticeBox) {
    noticeBox.className = "comprobante-mandatory-box completed";
    noticeBox.innerHTML = `
      <div class="comprobante-mandatory-header" style="color:var(--ok)">
        <span class="notice-check">✓</span>
        <b>¡PASO COMPLETADO! COMPROBANTE ENVIADO A WHATSAPP</b>
      </div>
      <p style="color:var(--sil);margin:0">
        Tu pedido <b>#${code}</b> ya fue notificado a nuestro equipo por WhatsApp (+57 316 604 5499). La navegación y tu cuenta han sido desbloqueadas.
      </p>
    `;
  }

  // Actualizar el botón de WhatsApp a estado confirmado
  const btn = document.getElementById("btnSendWA-" + code);
  const btnText = document.getElementById("btnSendWAText-" + code);
  if (btn) {
    btn.classList.remove("btn-wa-required");
    btn.classList.add("btn-wa-completed");
  }
  if (btnText) {
    btnText.textContent = "✓ COMPROBANTE ENVIADO (Toca para volver a abrir WhatsApp)";
  }

  // Desbloquear botones de cuenta y catálogo
  const lnkCuenta = document.getElementById("lnkCuenta-" + code);
  const lnkCatalogo = document.getElementById("lnkCatalogo-" + code);
  if (lnkCuenta) {
    lnkCuenta.classList.remove("btn-locked");
    lnkCuenta.innerHTML = "VER ESTADO EN MI CUENTA";
    lnkCuenta.title = "";
  }
  if (lnkCatalogo) {
    lnkCatalogo.classList.remove("btn-locked");
    lnkCatalogo.innerHTML = "SEGUIR COMPRANDO";
    lnkCatalogo.title = "";
  }

  window.showToast("✓ ¡Paso obligatorio completado! Gracias por enviar tu comprobante.");
};

// Validar si el usuario intenta salir o navegar sin haber presionado el botón de WhatsApp
window.checkWaRequired = function (e, code) {
  if (window.isOrderWaSent(code)) {
    return true;
  }

  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const btn = document.getElementById("btnSendWA-" + code);
  if (btn) {
    btn.classList.add("btn-shake");
    setTimeout(() => btn.classList.remove("btn-shake"), 700);
    btn.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  window.showToast("⚠️ ¡Acción obligatoria! Debes presionar 'ENVIAR COMPROBANTE AL WHATSAPP' para despachar tu pedido.", true);
  return false;
};

// Generar texto estructurado del comprobante para WhatsApp y Portapapeles
window.formatOrderReceiptText = function (order) {
  if (!order) return "";
  const code = order.orderCode || ("GH-" + String(order.id || Date.now()).slice(-5));
  const dateStr = order.date
    ? new Date(order.date).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })
    : new Date().toLocaleString("es-CO");
  const c = order.customer || {};
  const totalStr = window.formatCOP(order.total || 0);
  const pmRaw = (order.paymentMethod || "Nequi").toLowerCase();
  const isBancolombia = pmRaw.includes("banco");
  const pmName = isBancolombia ? "BANCOLOMBIA" : "NEQUI";
  const destAccount = isBancolombia ? "Cuenta de Ahorros: 07800043861" : "Nequi: 316 604 5499";

  let itemsList = "";
  if (Array.isArray(order.items) && order.items.length > 0) {
    itemsList = order.items
      .map((it) => `• ${it.q}x ${it.name} (Talla: ${it.s}) - ${window.formatCOP(it.price * it.q)}`)
      .join("\n");
  } else {
    itemsList = "• Prendas seleccionadas de la tienda";
  }

  return `🧾 *COMPROBANTE OFICIAL DE PEDIDO - GHOST IMPORTS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 *Código de Pedido:* #${code}
📅 *Fecha:* ${dateStr}
🔖 *Estado:* Pendiente de verificación de pago

👤 *DATOS DEL CLIENTE:*
• *Nombre:* ${c.name || "Cliente"}
• *Celular:* ${c.phone || "No registrado"}
• *Ciudad:* ${c.city || "Colombia"}
• *Dirección:* ${c.address || "Dirección de entrega"}
${c.email ? `• *Email:* ${c.email}\n` : ""}━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛍️ *DETALLE DE PRODUCTOS:*
${itemsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL A PAGAR:* ${totalStr}
🚚 *Envío:* Nacional asegurado a toda Colombia
💳 *Método de Pago:* ${pmName}
🏦 *Destino de Pago:* ${destAccount} (Ghost Imports)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ *Adjunto este comprobante oficial y la captura de la transferencia para proceder con el despacho inmediato de mi paquete.*`;
};

// Copiar texto del comprobante al portapapeles
window.copyOrderReceiptText = async function (receiptText, btnEl) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(receiptText);
    } else {
      const ta = document.createElement("textarea");
      ta.value = receiptText;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    window.showToast("✓ ¡Comprobante copiado al portapapeles!");
    if (btnEl) {
      const orig = btnEl.innerHTML;
      btnEl.innerHTML = "✓ ¡COPIADO!";
      btnEl.classList.add("btn-copied");
      setTimeout(() => {
        btnEl.innerHTML = orig;
        btnEl.classList.remove("btn-copied");
      }, 2500);
    }
  } catch (err) {
    console.error("Error copiando comprobante:", err);
    window.showToast("No se pudo copiar automáticamente. Por favor selecciónalo manualmente.", true);
  }
};

// Generar HTML del Comprobante Oficial Digital de Ghost Imports
window.renderOrderReceiptHTML = function (order) {
  if (!order) return "";
  const code = order.orderCode || ("GH-" + String(order.id || Date.now()).slice(-5));
  const dateStr = order.date
    ? new Date(order.date).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })
    : new Date().toLocaleString("es-CO");
  const c = order.customer || {};
  const totalStr = window.formatCOP(order.total || 0);
  const pmRaw = (order.paymentMethod || "Nequi").toLowerCase();
  const isBancolombia = pmRaw.includes("banco");
  const pmName = isBancolombia ? "Bancolombia" : "Nequi";
  const pmNumber = isBancolombia ? "07800043861" : "316 604 5499";
  const pmType = isBancolombia ? "Cuenta de Ahorros" : "Billetera digital";
  const waTarget = "573166045499";
  const waFormatted = "+57 316 6045499";
  const receiptText = window.formatOrderReceiptText(order);
  const waUrl = `https://wa.me/${waTarget}?text=${encodeURIComponent(receiptText)}`;
  const alreadySent = window.isOrderWaSent(code);

  const itemsRows = (order.items || [])
    .map(
      (it) => `
      <div class="comprobante-item">
        <div class="comprobante-item-img">
          <img src="${it.image || 'assets/logo.webp'}" alt="${it.name}">
        </div>
        <div class="comprobante-item-info">
          <b>${it.name}</b>
          <span class="comprobante-meta">Talla: <b>${it.s}</b> · Cantidad: <b>${it.q}</b> · ${window.formatCOP(it.price)} c/u</span>
        </div>
        <div class="comprobante-item-total">
          <b>${window.formatCOP(it.price * it.q)}</b>
        </div>
      </div>
    `
    )
    .join("");

  return `
    <div class="comprobante-card" id="comprobante-${code}">
      <!-- Cabecera del Comprobante -->
      <div class="comprobante-header">
        <div class="comprobante-brand">
          <img src="assets/logo.webp" alt="Ghost Imports" class="comprobante-logo">
          <div>
            <h3>GHOST IMPORTS</h3>
            <span class="comprobante-tag">COMPROBANTE OFICIAL DE PEDIDO</span>
          </div>
        </div>
        <div class="comprobante-badge-status">
          <span class="status-badge ok">✓ PEDIDO REGISTRADO</span>
        </div>
      </div>

      <!-- Resumen Clave -->
      <div class="comprobante-summary-grid">
        <div class="comprobante-box">
          <small>NÚMERO DE PEDIDO</small>
          <b class="comprobante-highlight">#${code}</b>
        </div>
        <div class="comprobante-box">
          <small>FECHA Y HORA</small>
          <b>${dateStr}</b>
        </div>
        <div class="comprobante-box">
          <small>TOTAL A TRANSFERIR</small>
          <b class="comprobante-price">${totalStr}</b>
        </div>
        <div class="comprobante-box">
          <small>MÉTODO DE PAGO</small>
          <b>${pmName.toUpperCase()}</b>
        </div>
      </div>

      <!-- Datos del Cliente y Envío -->
      <div class="comprobante-section">
        <h4>Datos de Entrega y Contacto</h4>
        <div class="comprobante-client-grid">
          <div><span>Cliente:</span> <b>${c.name || "Cliente"}</b></div>
          <div><span>Celular:</span> <b>${c.phone || "No especificado"}</b></div>
          <div><span>Ciudad / Depto:</span> <b>${c.city || "Colombia"}</b></div>
          <div><span>Dirección:</span> <b>${c.address || "Dirección de entrega"}</b></div>
          ${c.email ? `<div><span>Email:</span> <b>${c.email}</b></div>` : ""}
        </div>
      </div>

      <!-- Detalle de Productos -->
      <div class="comprobante-section">
        <h4>Prendas y Accesorios Adquiridos</h4>
        <div class="comprobante-items-list">
          ${itemsRows}
        </div>
        <div class="comprobante-totals-row">
          <span>Envío Nacional Asegurado:</span>
          <b style="color:var(--ok)">INCLUIDO / GRATIS</b>
        </div>
        <div class="comprobante-totals-row final">
          <span>TOTAL A TRANSFERIR:</span>
          <b>${totalStr}</b>
        </div>
      </div>

      <!-- Instrucciones de Transferencia Bancaria -->
      <div class="comprobante-bank-card">
        <div class="comprobante-bank-title">
          🏦 Instrucciones de Transferencia para Despacho Inmediato
        </div>
        <div class="comprobante-bank-details">
          <div>Entidad: <b>${pmName}</b></div>
          <div>Tipo: <b>${pmType}</b></div>
          <div>Número de Transferencia: <b class="comprobante-acc-number">${pmNumber}</b></div>
          <div>Titular: <b>Ghost Imports</b></div>
          <div>Referencia: <b>#${code}</b></div>
        </div>
        <p class="comprobante-bank-note">
          Transfiere el valor exacto de <b>${totalStr}</b> a la cuenta indicada. A continuación, <b>es obligatorio presionar el botón verde</b> para enviar el comprobante directamente a nuestro WhatsApp oficial y proceder con el empaque y despacho de tu paquete.
        </p>
      </div>

      <!-- AVISO DE PASO OBLIGATORIO -->
      <div class="comprobante-mandatory-box ${alreadySent ? "completed" : ""}" id="waNoticeBox-${code}">
        <div class="comprobante-mandatory-header" style="${alreadySent ? "color:var(--ok)" : ""}">
          ${alreadySent ? '<span class="notice-check">✓</span>' : '<span class="mandatory-pulse-dot"></span>'}
          <b>${alreadySent ? "¡PASO COMPLETADO! COMPROBANTE ENVIADO A WHATSAPP" : "PASO FINAL OBLIGATORIO PARA AUTORIZAR DESPACHO"}</b>
        </div>
        <p>
          ${alreadySent 
            ? `Tu pedido <b>#${code}</b> ya ha sido notificado a nuestro equipo por WhatsApp (+57 316 604 5499). La navegación y tu cuenta están activas.` 
            : `Tu compra quedó registrada en la base de datos, pero <b>NO será despachada hasta que presiones el botón verde</b> y envíes el comprobante a nuestro WhatsApp oficial (+57 316 604 5499).`}
        </p>
      </div>

      <!-- ACCIONES PRINCIPALES: ENVÍO A WHATSAPP Y GESTIÓN -->
      <div class="comprobante-actions" id="compActions-${code}">
        <!-- BOTÓN PRINCIPAL A WHATSAPP: OBLIGATORIO -->
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-wa-send ${alreadySent ? "btn-wa-completed" : "btn-wa-required"}" id="btnSendWA-${code}" onclick="window.markWhatsAppSent('${code}')">
          <svg viewBox="0 0 32 32" width="24" height="24" fill="currentColor" style="vertical-align:middle;margin-right:8px">
            <path d="M16 2a13.9 13.9 0 0 0-12 21L2 30l7.2-1.9A14 14 0 1 0 16 2zm0 25.5a11.6 11.6 0 0 1-5.9-1.6l-.4-.3-4.4 1.2 1.2-4.3-.3-.5A11.6 11.6 0 1 1 16 27.5zm6.4-8.7c-.3-.2-2-.1-2.3 0-.3.2-.6.3-.8.7-.3.3-.6.4-1.2.1a14.8 14.8 0 0 1-4.4-3.9c-.6-.7-.1-.7.4-1.4.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5l-.7-1.8c-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.7.1-1 .5-.4.4-1.4 1.4-1.4 3.4s1.5 3.9 1.7 4.1c.2.3 2.9 4.4 7 6.2 1 .4 1.7.7 2.3.9 1 .3 1.9.3 2.6.2.8-.1 2.4-1 2.8-1.9.3-1 .3-1.8.2-2 0-.2-.3-.3-.6-.5z"/>
          </svg>
          <span id="btnSendWAText-${code}">${alreadySent ? "✓ COMPROBANTE ENVIADO (Toca para volver a abrir WhatsApp)" : "📲 ENVIAR COMPROBANTE AL WHATSAPP (PASO OBLIGATORIO)"}</span>
        </a>

        <!-- Botones secundarios -->
        <div class="comprobante-subactions">
          <button type="button" class="btn g" onclick='window.copyOrderReceiptText(${JSON.stringify(receiptText)}, this)'>
            📋 COPIAR COMPROBANTE
          </button>
          <button type="button" class="btn g" onclick="window.print()">
            🖨️ IMPRIMIR / GUARDAR PDF
          </button>
        </div>

        <!-- Enlaces de navegación con bloqueo obligatorio -->
        <div class="comprobante-links" id="compLinks-${code}">
          <a href="cuenta.html" class="btn g ${alreadySent ? "" : "btn-locked"}" id="lnkCuenta-${code}" onclick="return window.checkWaRequired(event, '${code}')" title="${alreadySent ? "" : "Bloqueado hasta presionar el botón de WhatsApp"}">
            ${alreadySent ? "VER ESTADO EN MI CUENTA" : "🔒 VER ESTADO EN MI CUENTA"}
          </a>
          <a href="catalogo.html" class="btn g ${alreadySent ? "" : "btn-locked"}" id="lnkCatalogo-${code}" onclick="return window.checkWaRequired(event, '${code}')" title="${alreadySent ? "" : "Bloqueado hasta presionar el botón de WhatsApp"}">
            ${alreadySent ? "SEGUIR COMPRANDO" : "🔒 SEGUIR COMPRANDO"}
          </a>
        </div>
      </div>
    </div>
  `;
};

// Interceptar navegación general de la cabecera si hay un pedido pendiente de envío obligatorio a WhatsApp
document.addEventListener("click", (e) => {
  const navLink = e.target.closest("header nav a, header .bar a");
  if (!navLink) return;

  const pendingNotice = document.querySelector(".comprobante-mandatory-box:not(.completed)");
  if (pendingNotice) {
    const codeMatch = pendingNotice.id && pendingNotice.id.replace("waNoticeBox-", "");
    if (codeMatch && !window.isOrderWaSent(codeMatch)) {
      e.preventDefault();
      e.stopPropagation();
      window.checkWaRequired(null, codeMatch);
    }
  }
}, true);

// Alerta preventiva si intenta cerrar o recargar la pestaña antes de presionar el botón obligatorio de WhatsApp
window.addEventListener("beforeunload", (e) => {
  const pendingNotice = document.querySelector(".comprobante-mandatory-box:not(.completed)");
  if (pendingNotice) {
    const codeMatch = pendingNotice.id && pendingNotice.id.replace("waNoticeBox-", "");
    if (codeMatch && !window.isOrderWaSent(codeMatch)) {
      e.preventDefault();
      e.returnValue = "¡Tienes un comprobante pendiente de enviar a WhatsApp para autorizar el despacho de tu pedido!";
      return e.returnValue;
    }
  }
});

// Cerrar carrito al hacer clic en sombra
document.addEventListener("DOMContentLoaded", () => {
  const shade = document.getElementById("shade");
  if (shade) {
    shade.onclick = () => window.toggleCart(false);
  }

  // El menú hamburguesa se gestiona por delegación global sin colisión de eventos

  // Cerrar menú al hacer clic en cualquier enlace interno
  const nav = document.getElementById("nav");
  if (nav) {
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        window.toggleMobileNav(false);
      });
    });
  }

  // Cerrar menú al hacer clic fuera del menú
  document.addEventListener("click", (e) => {
    const navEl = document.getElementById("nav");
    const burgerEl = document.getElementById("burger");
    if (navEl && navEl.classList.contains("open")) {
      if (burgerEl && (burgerEl === e.target || burgerEl.contains(e.target))) {
        return;
      }
      if (!navEl.contains(e.target)) {
        window.toggleMobileNav(false);
      }
    }
  });

  // Año dinámico en footer
  const yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  // Actualizar UI del carrito
  window.updateCartUI();
});

// Cerrar con Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    window.toggleCart(false);
    window.toggleMobileNav(false);
  }
});
