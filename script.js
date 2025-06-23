// Globale Variablen
let currentAnalysis = null;
let analysisHistory = [];

// E-Mail-Vorlage
const emailTemplate = `
  <p>Kennen Sie das?</p>
  <p>„Ich hätte gern eine ESG-Tischplatte als Ersatz – ca. 160 × 90 cm, 8 mm stark, Kanten geschliffen. Können Sie mir dafür ein Angebot machen?"</p>
  <p>Eigentlich eine kleine Anfrage – aber sie kostet jedes Mal Zeit: Maße notieren, Kunden anlegen, Preise raussuchen, Angebot schreiben, PDF erstellen, verschicken …</p>
  <p>Und währenddessen warten größere Projekte – Duschabtrennungen, Schaufenster, Aufmaßtermine.</p>
  <p>Genau dafür habe ich – gemeinsam mit einem Glasermeister – einen Konfigurator entwickelt, den Sie einfach auf Ihrer Website anbieten können.</p>
  <p>Damit können Anfragen direkt digital erfasst und in Sekunden als Angebot per Mail versendet werden – ohne Systemwechsel, ohne Papier, ohne Verzögerung.</p>
  <ul>
    <li>Maße, Glasart & Stärke eingeben</li>
    <li>Automatisch berechnetes PDF-Angebot per Mail</li>
    <li>Kopie geht direkt an Sie</li>
    <li>Auch intern nutzbar – z. B. am Telefon oder Tresen</li>
    <li>Lieferzuschläge, Monteurstunden, Rabatte mit drin (bei interner Nutzung)</li>
  </ul>
  <p><strong>Vorteile für Sie:</strong></p>
  <ul>
    <li>Ihre eigenen Preise, keine externen Systeme</li>
    <li>Keine lange Schulung – der Konfigurator ist selbsterklärend und sofort einsatzbereit</li>
    <li>Einsetzbar auf Website, im Büro oder unterwegs am Handy</li>
  </ul>
  <p>👉 <strong>Direkt ausprobieren:</strong><br>
  <a href="https://spiegel.lejaa.de" target="_blank">https://spiegel.lejaa.de</a><br>
  (Einfach Maße eingeben – das fertige PDF kommt sofort)</p>
  <p>Wäre das auch was für Ihren Betrieb?</p>
  <p>Ich zeige Ihnen das Ganze gern in 10 Minuten – persönlich, ohne Verpflichtung.</p>
  <p>📞 030 54 70 24 10<br>
  📧 <a href="mailto:office@lejaa.de">office@lejaa.de</a></p>
  <p>Glasklare Grüße</p>
  <p><strong>Atakan Olcaysu</strong><br>
  Inhaber<br>
  <strong>LEJAA MARKETINGAGENTUR</strong><br>
  Schönhauser Allee 163<br>
  10435 Berlin<br>
  <a href="mailto:office@lejaa.de">office@lejaa.de</a><br>
  <a href="https://lejaa.de" target="_blank">https://lejaa.de</a></p>
  <hr>
  <p style="font-size: 0.9em; color: #777;">
  Diese Nachricht wurde im Rahmen einer einmaligen, persönlich adressierten Kontaktaufnahme versendet. Ihre Kontaktdaten stammen aus einer öffentlich zugänglichen Quelle und wurden ausschließlich für dieses individuell erstellte Angebot verwendet.<br>
  Sie müssen nichts weiter tun – es erfolgt <strong>keine weitere Kontaktaufnahme</strong>, wenn Sie nicht reagieren.
  </p>
`;

// Historie aus localStorage laden
function loadHistoryFromStorage() {
  try {
    const savedHistory = localStorage.getItem('glasereiAnalysisHistory');
    if (savedHistory) {
      analysisHistory = JSON.parse(savedHistory);
    }
  } catch (error) {
    console.error('Fehler beim Laden der Historie:', error);
    analysisHistory = [];
  }
}

// Historie in localStorage speichern
function saveHistoryToStorage() {
  try {
    localStorage.setItem('glasereiAnalysisHistory', JSON.stringify(analysisHistory));
  } catch (error) {
    console.error('Fehler beim Speichern der Historie:', error);
  }
}

// Hauptfunktion für die Datenanalyse
async function analyseGlasereiDaten() {
  const apiKey = document.getElementById('openaiApiKey').value.trim();
  const impressumText = document.getElementById('impressumText').value.trim();
  const ueberUnsText = document.getElementById('ueberUnsText').value.trim();
  const output = document.getElementById('output');
  
  if (!apiKey) {
    output.innerHTML = '<p style="color: red;">Bitte geben Sie Ihren OpenAI API Key ein.</p>';
    return;
  }

  if (!impressumText && !ueberUnsText) {
    output.innerHTML = '<p style="color: red;">Bitte geben Sie mindestens Impressum- oder "Über uns"-Text ein.</p>';
    return;
  }

  const combinedText = `${impressumText}\n\n${ueberUnsText}`.trim();

  output.innerHTML = '<p>🔍 Analysiere Daten...</p>';
  document.getElementById('analysis-output-section').style.display = 'block';

  try {
    // Erste API-Anfrage für Datenanalyse
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Du bist ein Experte für die Analyse von Glaserei-Daten. Antworte nur mit gültigem JSON."
          },
          {
            role: "user",
            content: `Analysiere die folgenden Glaserei-Daten und extrahiere strukturierte Informationen:

${combinedText}

Extrahiere folgende Informationen im JSON-Format:
{
  "firmenname": "Name der Firma",
  "anschrift": { "strasse": "Straße und Hausnummer", "plz": "Postleitzahl", "ort": "Ort" },
  "kontakt": { "telefon": "Telefonnummer", "email": "E-Mail-Adresse", "website": "Website (falls vorhanden)" },
  "inhaber": "Name des Inhabers/Geschäftsführers",
  "gruendungsjahr": "Gründungsjahr (falls angegeben)",
  "leistungen": ["Liste der angebotenen Leistungen"],
  "oeffnungszeiten": "Öffnungszeiten (falls angegeben)",
  "besonderheiten": ["Besondere Merkmale oder Spezialisierungen"]
}

Antworte nur mit dem JSON-Objekt, ohne zusätzlichen Text.`
          }
        ],
        temperature: 0.1
      })
    });

    if (!analysisResponse.ok) throw new Error(`HTTP error! status: ${analysisResponse.status}`);
    const analysisData = await analysisResponse.json();
    const parsedResponse = JSON.parse(analysisData.choices[0].message.content);
    parsedResponse.originalText = combinedText;
    
    // Zweite API-Anfrage für Einleitungsvarianten
    const einleitungResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `Du bist ein Unternehmer, der einen Online-Konfigurator für Glas-Anfragen anbietet. Schreibe 3 kurze, professionelle Einleitungsabschnitte für eine E-Mail an eine Glaserei.

WICHTIGE DATEN DER GLASEREI:
- Firmenname: ${parsedResponse.firmenname || 'unbekannt'}
- Inhaber: ${parsedResponse.inhaber || 'unbekannt'}
- Standort: ${parsedResponse.anschrift?.ort || 'unbekannt'}

TEXT DER GLASEREI:
${combinedText}

WICHTIG: 
- Beginne NICHT mit einer Anrede.
- Schreibe KURZ und PRÄGNANT (max. 2-3 Sätze pro Variante).
- JEDE Variante muss einen ÜBERGANG zu deiner Lösung enthalten (Konfigurator für Glas-Anfragen).
- Formuliere professionell, aber nicht zu steif.

Antworte NUR mit den 3 Einleitungsvarianten (Variante 1, Variante 2, Variante 3), ohne weitere Erklärungen.`
          }
        ],
        temperature: 0.5
      })
    });

    if (!einleitungResponse.ok) throw new Error(`HTTP error! status: ${einleitungResponse.status}`);
    const einleitungData = await einleitungResponse.json();
    const einleitungsText = einleitungData.choices[0].message.content.trim();
    
    const varianten = parseEinleitungsVarianten(einleitungsText);
    parsedResponse.einleitungsVarianten = varianten;
    parsedResponse.personalisierteEinleitung = varianten.length > 0 ? varianten[0] : ''; 
    
    currentAnalysis = parsedResponse;
    
    displayAnalysis(parsedResponse);
    showMailGenerator();
    addToHistory(parsedResponse);

  } catch (error) {
    console.error('Fehler bei der Analyse:', error);
    output.innerHTML = `<p style="color: red;">Fehler bei der Analyse: ${error.message}</p>`;
  }
}

function parseEinleitungsVarianten(text) {
  if (!text) return [];
  // Teilt den Text bei "Variante 1:", "Variante 2:", etc. (Groß-/Kleinschreibung wird ignoriert)
  // und filtert leere Ergebnisse heraus.
  const varianten = text.split(/Variante\s\d:/i).map(v => v.trim()).filter(Boolean);
  return varianten;
}

function displayAnalysis(data) {
    const output = document.getElementById('output');
    output.innerHTML = '';

    const createRow = (label, value) => {
        if (!value || value.length === 0) return '';
        let displayValue = value;
        if (Array.isArray(value)) {
            displayValue = `<ul>${value.map(item => `<li>${item}</li>`).join('')}</ul>`;
        } else if (typeof value === 'object' && value !== null) {
            displayValue = `<ul>${Object.entries(value).map(([key, val]) => `<li><strong>${key}:</strong> ${val}</li>`).join('')}</ul>`;
        }
        return `<tr><td><strong>${label}</strong></td><td>${displayValue}</td></tr>`;
    };

    let tableContent = '<table class="analysis-table">';
    tableContent += createRow('Firmenname', data.firmenname);
    tableContent += createRow('Inhaber', data.inhaber);
    tableContent += createRow('Anschrift', data.anschrift);
    tableContent += createRow('Kontakt', data.kontakt);
    tableContent += createRow('Gründungsjahr', data.gruendungsjahr);
    tableContent += createRow('Leistungen', data.leistungen);
    tableContent += createRow('Öffnungszeiten', data.oeffnungszeiten);
    tableContent += createRow('Besonderheiten', data.besonderheiten);
    tableContent += '</table>';

    if (data.originalText) {
        tableContent += `<h4>Originaltext (Impressum / Über uns)</h4><div class="original-text-box">${data.originalText}</div>`;
    }

    output.innerHTML = tableContent;

    // Einleitungsvarianten anzeigen
    const variantenContainer = document.getElementById('einleitung-varianten');
    variantenContainer.innerHTML = data.einleitungsVarianten.map((variante, index) => `
        <div class="einleitung-variante">
            <input type="radio" id="variante-${index}" name="einleitung-variante" value="${index}" ${index === 0 ? 'checked' : ''} onchange="generateAndShowEmailContent()">
            <label for="variante-${index}">${variante}</label>
        </div>
    `).join('');

    // Anrede-Optionen anzeigen
    const anredeContainer = document.getElementById('anrede-optionen');
    anredeContainer.innerHTML = '';
    if (data.inhaber) {
        anredeContainer.innerHTML += `
            <div class="anrede-option">
                <input type="radio" id="anrede-person" name="anrede-option" value="person" checked onchange="generateAndShowEmailContent()">
                <label for="anrede-person">Person: Sehr geehrte/r Herr/Frau ${data.inhaber}</label>
            </div>`;
    }
    if (data.firmenname) {
        anredeContainer.innerHTML += `
            <div class="anrede-option">
                <input type="radio" id="anrede-firma" name="anrede-option" value="firma" ${!data.inhaber ? 'checked' : ''} onchange="generateAndShowEmailContent()">
                <label for="anrede-firma">Firma: Sehr geehrte Damen und Herren der Firma ${data.firmenname}</label>
            </div>`;
    }
     anredeContainer.innerHTML += `
        <div class="anrede-option">
            <input type="radio" id="anrede-allgemein" name="anrede-option" value="allgemein" ${!data.inhaber && !data.firmenname ? 'checked' : ''} onchange="generateAndShowEmailContent()">
            <label for="anrede-allgemein">Allgemein: Sehr geehrte Damen und Herren</label>
        </div>`;
}

function showMailGenerator() {
    document.getElementById('mail-generator-section').style.display = 'block';
    generateAndShowEmailContent();
}

function generateAndShowEmailContent() {
    if (!currentAnalysis) return;

    const anrede = getSelectedAnrede();
    
    const selectedVarianteInput = document.querySelector('input[name="einleitung-variante"]:checked');
    if (selectedVarianteInput) {
        const selectedIndex = parseInt(selectedVarianteInput.value, 10);
        currentAnalysis.personalisierteEinleitung = currentAnalysis.einleitungsVarianten[selectedIndex];
    }

    const fullEmailBody = `
        <p>${anrede},</p>
        <p>${currentAnalysis.personalisierteEinleitung}</p>
        ${emailTemplate}
    `;

    document.getElementById('email-content-output').innerHTML = fullEmailBody;
    document.getElementById('email-content-section').style.display = 'block';
}

function getSelectedAnrede() {
    const selected = document.querySelector('input[name="anrede-option"]:checked')?.value;
    if (selected === 'person' && currentAnalysis.inhaber) {
        return `Sehr geehrte/r Herr/Frau ${currentAnalysis.inhaber}`;
    }
    if (selected === 'firma' && currentAnalysis.firmenname) {
        return `Sehr geehrte Damen und Herren der Firma ${currentAnalysis.firmenname}`;
    }
    return `Sehr geehrte Damen und Herren`;
}

function showPreview() {
    if (!currentAnalysis) return;
    const previewContent = document.getElementById('email-preview-content');
    const anrede = getSelectedAnrede();
    const einleitung = currentAnalysis.personalisierteEinleitung;
    previewContent.innerHTML = `<p>${anrede},</p><p>${einleitung}</p>${emailTemplate}`;
    document.getElementById('email-preview-modal').style.display = 'flex';
}

function closePreviewModal() {
    document.getElementById('email-preview-modal').style.display = 'none';
}

function copyToClipboard() {
  const content = document.getElementById('email-content-output').innerHTML;
  navigator.clipboard.writeText(content.replace(/<[^>]*>/g, '')); 
  alert('E-Mail-Text in die Zwischenablage kopiert!');
}

async function sendEmail() {
    if (!currentAnalysis || !currentAnalysis.kontakt.email) {
        alert('Keine E-Mail-Adresse für den Versand gefunden.');
        return;
    }

    // Diese Werte sollten mit deinem EmailJS-Konto übereinstimmen
    const serviceID = 'service_t0x6h2t'; // Ersetzen Sie dies mit Ihrer Service-ID von EmailJS
    const templateID = 'template_4yzhd0q'; // Ersetzen Sie dies mit Ihrer Template-ID von EmailJS
    const publicKey = 'N-WiC9QPXh158LTC7';    // Ersetzen Sie dies mit Ihrem Public Key von https://dashboard.emailjs.com/admin/account

    console.log('=== EmailJS Debug Info ===');
    console.log('EmailJS verfügbar:', typeof emailjs !== 'undefined');
    if (typeof emailjs !== 'undefined') {
        console.log('EmailJS Version:', emailjs.version);
    }
    console.log('Service ID:', serviceID);
    console.log('Template ID:', templateID);
    console.log('Public Key:', publicKey);

    const anrede = getSelectedAnrede();
    const einleitung = currentAnalysis.personalisierteEinleitung;
    
    // Erstelle den vollständigen HTML-Body für die Vorlage
    // Dieser ganze Block wird in die {{message}} Variable im EmailJS-Template eingefügt
    const emailBody = `
        <p>${anrede},</p>
        <p>${einleitung}</p>
        ${emailTemplate}
    `;

    const templateParams = {
        // Der 'to_email' wird direkt im EmailJS Dashboard konfiguriert (Reply-To)
        // oder kann hier übergeben werden, wenn die Vorlage es erwartet.
        // In unserem Fall wird die Empfänger-Mail im Dashboard oder der API festgelegt.
        
        // Der Betreff wird im EmailJS Template definiert. Wir können ihn hier dynamisch übergeben.
        betreff: `Ihr Online-Konfigurator für Glas-Anfragen | ${currentAnalysis.firmenname || 'Ihr Betrieb'}`,
        
        // Der wichtigste Teil: Der gesamte HTML-Inhalt wird an die 'message' Variable gesendet
        message: emailBody,
        
        // Wir fügen auch die Ziel-E-Mail hinzu, falls sie im Template verwendet wird (z.B. für "Senden an")
        to_email: currentAnalysis.kontakt.email
    };

    console.log('Template Parameters:', templateParams);

    try {
        // EmailJS ist bereits in index.html initialisiert
        console.log('Sende E-Mail mit folgenden Parametern:', {
            serviceID,
            templateID,
            templateParams
        });
        
        const result = await emailjs.send(serviceID, templateID, templateParams);
        console.log('EmailJS Antwort:', result);
        
        alert('E-Mail erfolgreich gesendet!');
        
    } catch (error) {
        console.error('Fehler beim Senden der E-Mail:', error);
        console.error('Error Details:', {
            status: error.status,
            text: error.text,
            response: error.response,
            message: error.message
        });
        alert(`Fehler beim Senden der E-Mail: ${error.text || error.message || JSON.stringify(error)}`);
    }
}

function sendFromPreview() {
    sendEmail();
    closePreviewModal();
}

function addToHistory(data) {
    const timestamp = new Date().toISOString();
    const id = `analysis-${Date.now()}`;
    const historyEntry = { id, timestamp, ...data };
    
    analysisHistory.unshift(historyEntry);
    if (analysisHistory.length > 50) { 
        analysisHistory.pop();
    }
    saveHistoryToStorage();
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    historyList.innerHTML = '';
    analysisHistory.forEach(entry => {
        const item = document.createElement('li');
        item.textContent = `${new Date(entry.timestamp).toLocaleString('de-DE')}: ${entry.firmenname || 'Unbekannte Analyse'}`;
        item.onclick = () => loadFromHistory(entry.id);
        historyList.appendChild(item);
    });
}

function loadFromHistory(id) {
    const selectedAnalysis = analysisHistory.find(entry => entry.id === id);
    if (selectedAnalysis) {
        currentAnalysis = selectedAnalysis;
        displayAnalysis(currentAnalysis);
        showMailGenerator();
        const textParts = selectedAnalysis.originalText.split('\n\n');
        document.getElementById('impressumText').value = textParts[0] || '';
        document.getElementById('ueberUnsText').value = textParts[1] || '';
    }
}

function clearHistory() {
    if (confirm('Möchten Sie den gesamten Verlauf wirklich löschen?')) {
        analysisHistory = [];
        saveHistoryToStorage();
        updateHistoryDisplay();
    }
}

// Event Listener
document.addEventListener('DOMContentLoaded', () => {
    loadHistoryFromStorage();
    updateHistoryDisplay();
    const clearButton = document.querySelector('.clear-history-btn');
    if (clearButton) {
      clearButton.addEventListener('click', clearHistory);
    }
});

// Test-Funktion für EmailJS-Konfiguration
async function testEmailJS() {
    console.log('Teste EmailJS-Konfiguration...');
    
    try {
        // Prüfe ob EmailJS geladen ist
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS ist nicht geladen');
        }
        
        console.log('EmailJS ist verfügbar');
        console.log('EmailJS Version:', emailjs.version);
        
        // Teste die Initialisierung
        const testPublicKey = 'N-WiC9QPXh158LTC7';
        emailjs.init({ publicKey: testPublicKey });
        
        console.log('EmailJS wurde initialisiert');
        
        // Teste einen einfachen API-Aufruf
        const testParams = {
            message: 'Test E-Mail'
        };
        
        console.log('Sende Test-E-Mail...');
        const result = await emailjs.send('service_t0x6h2t', 'template_4yzhd0q', testParams);
        console.log('Test erfolgreich:', result);
        
        alert('EmailJS-Test erfolgreich!');
        
    } catch (error) {
        console.error('EmailJS-Test fehlgeschlagen:', error);
        alert(`EmailJS-Test fehlgeschlagen: ${error.text || error.message}`);
    }
}
