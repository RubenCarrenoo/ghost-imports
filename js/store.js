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
  window.ghostCart = JSON.parse(localStorage.getItem("gi_cart") || "[]");
  window.ghostFavs = JSON.parse(localStorage.getItem("gi_fav") || "[]");
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

// Renderizar contenido del carrito con foto de cada prenda
window.updateCartUI = function () {
  const countEl = document.getElementById("cnt");
  const totEl = document.getElementById("tot");
  const goBtn = document.getElementById("go");
  const listEl = document.getElementById("cl");

  const totalCount = window.ghostCart.reduce((sum, item) => sum + item.q, 0);
  const totalAmount = window.ghostCart.reduce((sum, item) => sum + item.price * item.q, 0);

  if (countEl) countEl.textContent = totalCount;
  if (totEl) totEl.textContent = window.formatCOP(totalAmount);
  if (goBtn) goBtn.disabled = window.ghostCart.length === 0;

  if (listEl) {
    if (window.ghostCart.length > 0) {
      listEl.innerHTML = window.ghostCart
        .map(
          (item, idx) => `
          <div class="li">
            <div class="t">
              <img src="${item.image || 'assets/logo.webp'}" alt="${item.name}" style="width:100%;height:100%;object-fit:contain">
            </div>
            <div>
              <b>${item.name}</b><br>
              <span class="br">Talla ${item.s} · ${window.formatCOP(item.price)}</span><br>
              <span class="qty">
                <button type="button" data-action="cart-minus" data-idx="${idx}" aria-label="Menos unidades">−</button>
                <span>${item.q}</span>
                <button type="button" data-action="cart-plus" data-idx="${idx}" aria-label="Más unidades">+</button>
              </span>
              <button type="button" class="rm" data-action="cart-remove" data-idx="${idx}">Quitar</button>
            </div>
          </div>
        `
        )
        .join("");
    } else {
      listEl.innerHTML = `
        <div class="empty" style="margin-top:20px">
          Tu carrito está vacío. Agrega prendas desde el catálogo.
        </div>
      `;
    }
  }

  window.saveCartAndFavs();
};

// Agregar al carrito guardando la foto
window.addToGhostCart = async function (productId, size) {
  const prods = await window.GhostDB.getProducts();
  const product = prods.find((p) => p.id === productId);

  if (!product) {
    window.showToast("Producto no encontrado", true);
    return false;
  }

  const stockLimit = (product.stock && product.stock[size]) || 0;
  if (!size || stockLimit <= 0) {
    window.showToast("Elige una talla disponible", true);
    return false;
  }

  const existing = window.ghostCart.find((i) => i.id === productId && i.s === size);
  const currentQ = existing ? existing.q : 0;

  if (currentQ + 1 > stockLimit) {
    window.showToast(`Solo quedan ${stockLimit} unidades disponibles en talla ${size}`, true);
    return false;
  }

  if (existing) {
    existing.q += 1;
  } else {
    window.ghostCart.push({
      id: productId,
      name: product.name,
      price: product.price,
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

  // Menú hamburguesa móvil
  if (target.id === "burger") {
    const nav = document.getElementById("nav");
    if (nav) {
      const isOpen = nav.classList.toggle("open");
      target.setAttribute("aria-expanded", isOpen);
    }
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
    const i = Number(target.dataset.idx);
    if (window.ghostCart[i]) {
      window.ghostCart[i].q -= 1;
      if (window.ghostCart[i].q <= 0) window.ghostCart.splice(i, 1);
      window.updateCartUI();
    }
    return;
  }

  // Aumentar en carrito
  if (target.dataset.action === "cart-plus") {
    e.preventDefault();
    const i = Number(target.dataset.idx);
    const item = window.ghostCart[i];
    if (item) {
      const prods = await window.GhostDB.getProducts();
      const p = prods.find((x) => x.id === item.id);
      const limit = (p && p.stock && p.stock[item.s]) || 0;
      if (item.q < limit) {
        item.q += 1;
        window.updateCartUI();
      } else {
        window.showToast(`Límite alcanzado (${limit} unidades disponibles)`, true);
      }
    }
    return;
  }

  // Quitar del carrito
  if (target.dataset.action === "cart-remove") {
    e.preventDefault();
    const i = Number(target.dataset.idx);
    window.ghostCart.splice(i, 1);
    window.updateCartUI();
    return;
  }
});

// Cerrar carrito al hacer clic en sombra
document.addEventListener("DOMContentLoaded", () => {
  const shade = document.getElementById("shade");
  if (shade) {
    shade.onclick = () => window.toggleCart(false);
  }

  // Año dinámico en footer
  const yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  // Actualizar UI del carrito
  window.updateCartUI();
});

// Cerrar con Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") window.toggleCart(false);
});
