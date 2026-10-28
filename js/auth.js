/**
 * GHOST IMPORTS - SISTEMA DE AUTENTICACIÓN Y ROLES (CLIENTE & ADMINISTRADOR)
 * Control de sesiones, registro, inicio de sesión y enlace con base de datos.
 */

const SESSION_KEY = "gi_session";

window.GhostAuth = {
  // Obtener sesión activa
  getCurrentUser() {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  // Saber si hay usuario autenticado
  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },

  // Saber si el usuario activo es Administrador
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.rol === "admin";
  },

  // Iniciar Sesión (Cliente o Administrador)
  async login(email, password) {
    if (!email || !password) {
      throw new Error("Ingresa correo y contraseña.");
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = await window.GhostDB.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      throw new Error("No existe una cuenta registrada con este correo.");
    }

    if (found.password !== password) {
      throw new Error("Contraseña incorrecta. Por favor verifica.");
    }

    // Guardar sesión activa
    const sessionData = {
      id: found.id,
      nombre: found.nombre,
      email: found.email,
      telefono: found.telefono || "",
      ciudad: found.ciudad || "",
      direccion: found.direccion || "",
      rol: found.rol || "cliente"
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    this.updateNavUI();
    return sessionData;
  },

  // Registro de nuevo Cliente
  async register(data) {
    if (!data.nombre || data.nombre.trim().length < 3) {
      throw new Error("Ingresa tu nombre completo.");
    }
    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
      throw new Error("Ingresa un correo electrónico válido.");
    }
    if (!data.password || data.password.length < 4) {
      throw new Error("La contraseña debe tener al menos 4 caracteres.");
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const users = await window.GhostDB.getUsers();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error("Ya existe una cuenta con este correo electrónico. Por favor inicia sesión.");
    }

    const newUser = {
      id: Date.now(),
      nombre: data.nombre.trim(),
      email: cleanEmail,
      password: data.password,
      telefono: (data.telefono || "").trim(),
      ciudad: (data.ciudad || "").trim(),
      direccion: (data.direccion || "").trim(),
      rol: data.rol || "cliente",
      fecha_registro: new Date().toISOString()
    };

    // Guardar en la base de datos local
    await window.GhostDB.saveUser(newUser);

    // Sincronizar en tiempo real con MySQL Server / Workbench
    try {
      fetch("http://localhost:3307/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      }).catch(() => {});
    } catch (e) {}

    // Iniciar sesión automáticamente
    const sessionData = {
      id: newUser.id,
      nombre: newUser.nombre,
      email: newUser.email,
      telefono: newUser.telefono,
      ciudad: newUser.ciudad,
      direccion: newUser.direccion,
      rol: newUser.rol
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    this.updateNavUI();
    return sessionData;
  },

  // Actualizar datos del usuario actual
  async updateProfile(updates) {
    const current = this.getCurrentUser();
    if (!current) throw new Error("No hay sesión activa");

    const updated = {
      ...current,
      ...updates
    };

    await window.GhostDB.saveUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));

    // Sincronizar con MySQL
    try {
      fetch("http://localhost:3307/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      }).catch(() => {});
    } catch (e) {}

    this.updateNavUI();
    return updated;
  },

  // Cerrar Sesión
  logout() {
    localStorage.removeItem(SESSION_KEY);
    this.updateNavUI();
    window.location.href = "cuenta.html";
  },

  // Actualizar botones de navegación en cualquier página
  updateNavUI() {
    const user = this.getCurrentUser();
    const userBtn = document.getElementById("userBtn");

    if (userBtn) {
      if (user) {
        const firstName = user.nombre.split(" ")[0];
        if (user.rol === "admin") {
          userBtn.innerHTML = `👤 Admin`;
          userBtn.title = "Panel de Gestión Ghost Imports";
          userBtn.style.color = "var(--ink)";
          userBtn.style.borderColor = "var(--ink)";
        } else {
          userBtn.innerHTML = `👤 ${firstName}`;
          userBtn.title = `Mi Cuenta (${user.nombre})`;
          userBtn.style.color = "var(--ink)";
        }
      } else {
        userBtn.innerHTML = `👤`;
        userBtn.title = "Iniciar Sesión / Mi Cuenta";
        userBtn.style.color = "";
        userBtn.style.borderColor = "";
      }
    }
  }
};

// Actualizar barra de navegación al cargar
document.addEventListener("DOMContentLoaded", () => {
  window.GhostAuth.updateNavUI();
});
