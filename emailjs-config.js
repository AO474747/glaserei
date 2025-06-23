// EmailJS Konfiguration für Glaserei-Daten-Extraktor
// Diese Datei enthält die EmailJS-Konfigurationsdaten
// WICHTIG: Diese Datei nicht löschen oder überschreiben!

const EMAILJS_CONFIG = {
  // Public Key (User ID) - wird in index.html initialisiert
  publicKey: 'ia3YBTzlRJq2D9Bgx',
  
  // Service ID - für den E-Mail-Service (z.B. Gmail)
  serviceID: 'service_t0x6h2t',
  
  // Template ID - für das E-Mail-Template
  templateID: 'template_4yzhd0q'
};

// Export für Node.js (falls benötigt)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EMAILJS_CONFIG;
}

// Für Browser-Verwendung
if (typeof window !== 'undefined') {
  window.EMAILJS_CONFIG = EMAILJS_CONFIG;
}

console.log('📧 EmailJS-Konfiguration geladen:', EMAILJS_CONFIG); 