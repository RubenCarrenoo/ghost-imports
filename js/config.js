/**
 * GHOST IMPORTS - CONFIGURACIÓN GENERAL
 * Configuración de métodos de pago, contacto y parámetros de la tienda.
 */

const CONFIG = {
  storeName: "Ghost Imports",
  currency: "COP",
  locale: "es-CO",

  // Número de WhatsApp para confirmación de pedidos (Formato internacional sin +, ej: 573166045499)
  whatsapp: "573166045499",
  whatsappFormatted: "+57 316 6045499",

  // Métodos de pago oficiales en Colombia (transferencias manuales)
  paymentMethods: {
    nequi: {
      name: "Nequi",
      number: "316 604 5499",
      holder: "Ghost Imports",
      type: "Billetera digital"
    },
    bancolombia: {
      name: "Bancolombia",
      number: "07800043861",
      holder: "Ghost Imports",
      type: "Cuenta de Ahorros"
    }
  },

  // Envíos e información comercial
  shipping: {
    nationalNotice: "Envíos nacionales a toda Colombia con seguimiento por guía",
    citiesCovered: "Cobertura a nivel nacional en Colombia"
  },

  // Redes sociales y contacto
  social: {
    instagram: "@ghostimports",
    whatsappSupport: "573166045499"
  }
};

// Exportación global y modular
window.CONFIG = CONFIG;
if (typeof module !== "undefined" && module.exports) {
  module.exports = { CONFIG };
}
