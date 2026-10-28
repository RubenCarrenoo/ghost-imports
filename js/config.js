/**
 * GHOST IMPORTS - CONFIGURACIÓN GENERAL
 * Configuración de métodos de pago, contacto y parámetros de la tienda.
 */

const CONFIG = {
  storeName: "Ghost Imports",
  currency: "COP",
  locale: "es-CO",

  // Número de WhatsApp para confirmación de pedidos (Formato internacional sin +, ej: 573001234567)
  whatsapp: "", // Completa con tu número real, ej: "573001234567"

  // Métodos de pago oficiales en Colombia (transferencias manuales)
  paymentMethods: {
    nequi: {
      name: "Nequi",
      number: "", // Ej: '3001234567'
      holder: "", // Ej: 'Juan Pérez'
      type: "Billetera digital"
    },
    bancolombia: {
      name: "Bancolombia",
      number: "", // Ej: '12345678901'
      holder: "", // Ej: 'Juan Pérez'
      type: "Ahorros" // 'Ahorros' o 'Corriente'
    }
  },

  // Envíos e información comercial
  shipping: {
    nationalNotice: "Envíos nacionales: condiciones por confirmar antes de publicar",
    citiesCovered: "Cobertura a nivel nacional en Colombia"
  },

  // Redes sociales y contacto
  social: {
    instagram: "@ghostimports",
    whatsappSupport: ""
  }
};

// Exportación global y modular
window.CONFIG = CONFIG;
if (typeof module !== "undefined" && module.exports) {
  module.exports = { CONFIG };
}
