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
  const kundeninfoText = document.getElementById('kundeninfoText').value.trim();
  const output = document.getElementById('output');
  
  if (!apiKey) {
    output.innerHTML = '<p style="color: red;">Bitte geben Sie Ihren OpenAI API Key ein.</p>';
    return;
  }

  if (!impressumText && !kundeninfoText) {
    output.innerHTML = '<p style="color: red;">Bitte geben Sie mindestens Impressum oder Kundeninformationen ein.</p>';
    return;
  }

  output.innerHTML = '<p>🔍 Analysiere Daten...</p>';

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

${impressumText ? `IMPRESSUM:\n${impressumText}\n\n` : ''}
${kundeninfoText ? `KUNDENINFORMATIONEN:\n${kundeninfoText}\n\n` : ''}

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
    parsedResponse.ueberUnsText = kundeninfoText || impressumText;
    
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
            content: `Du bist ein Unternehmer, der einen Online-Konfigurator für Glas-Anfragen entwickelt hat. Du schreibst an eine Glaserei.

WICHTIGE DATEN DER GLASEREI:
- Firmenname: ${parsedResponse.firmenname || 'unbekannt'}
- Inhaber: ${parsedResponse.inhaber || 'unbekannt'}
- Standort: ${parsedResponse.anschrift?.ort || 'unbekannt'}

Lies dir den folgenden Text der Glaserei aufmerksam durch. Schreibe **drei kurze, professionelle Einleitungsabschnitte** für eine E-Mail an diese Glaserei.

WICHTIG: 
- BEGINNE NICHT mit einer Anrede.
- Verwende den KORREKTEN Firmennamen und Inhaber-Namen.
- Schreibe KURZ und PRÄGNANT (max. 3-4 Sätze pro Variante).
- JEDE Variante muss einen ÜBERGANG zu deiner Lösung enthalten.

VARIANTE 1: Spezifische Merkmale aufgreifen
VARIANTE 2: Regionale/örtliche Verbindung  
VARIANTE 3: Leistungsfokus

TEXT DER GLASEREI:
${impressumText}
${kundeninfoText}

Antworte NUR mit den 3 Einleitungsvarianten, ohne weitere Erklärungen.`
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
    parsedResponse.personalisierteEinleitung = varianten.variante1; 
    
    currentAnalysis = parsedResponse;
    
    displayAnalysis(parsedResponse);
    showMailGenerator();
    addToHistory(parsedResponse);

  } catch (error) {
    console.error('Fehler bei der Analyse:', error);
    output.innerHTML = `<p style="color: red;">Fehler bei der Analyse: ${error.message}</p>`;
  }
}

function parseEinleitungsVarianten(einleitungsText) {
  const varianten = { variante1: '', variante2: '', variante3: '' };
  const sections = einleitungsText.split(/(?:VARIANTE \d+:)/);
  if (sections.length >= 4) {
    varianten.variante1 = sections[1].trim();
    varianten.variante2 = sections[2].trim();
    varianten.variante3 = sections[3].trim();
  } else {
    varianten.variante1 = einleitungsText; // Fallback
  }
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

    if (data.ueberUnsText) {
        tableContent += `<h4>Originaltext ("Über uns" / Impressum)</h4><div class="original-text-box">${data.ueberUnsText}</div>`;
    }

    output.innerHTML = tableContent;
    document.getElementById('analysis-output-section').style.display = 'block';
}

function showMailGenerator() {
    document.getElementById('impressum-input-section').style.display = 'none';
    document.getElementById('analysis-output-section').style.display = 'none';
    document.getElementById('history-section').style.display = 'none';
    document.getElementById('mail-generator-section').style.display = 'block';
    document.getElementById('email-content-section').style.display = 'none';

    const data = currentAnalysis;
    if (!data) return;

    const variantenContainer = document.getElementById('einleitung-varianten');
    variantenContainer.innerHTML = '';
    for (const key in data.einleitungsVarianten) {
        if (data.einleitungsVarianten.hasOwnProperty(key)) {
            const variante = data.einleitungsVarianten[key];
            const radioId = `variante-${key}`;
            variantenContainer.innerHTML += `<div class="einleitung-variante"><input type="radio" id="${radioId}" name="einleitung-variante" value="${key}" ${key === 'variante1' ? 'checked' : ''}><label for="${radioId}">${variante}</label></div>`;
        }
    }
    
    document.querySelectorAll('input[name="einleitung-variante"]').forEach(radio => {
        radio.addEventListener('change', () => {
            currentAnalysis.personalisierteEinleitung = currentAnalysis.einleitungsVarianten[radio.value];
        });
    });

    const anredeContainer = document.getElementById('anrede-optionen');
    anredeContainer.innerHTML = `
        <div class="anrede-option"><input type="radio" id="anrede-person" name="anrede-option" value="person" checked><label for="anrede-person">Person: Sehr geehrte/r Herr/Frau ${data.inhaber || '...'}</label></div>
        <div class="anrede-option"><input type="radio" id="anrede-firma" name="anrede-option" value="firma"><label for="anrede-firma">Firma: Sehr geehrte Damen und Herren der Firma ${data.firmenname || '...'}</label></div>
        <div class="anrede-option"><input type="radio" id="anrede-allgemein" name="anrede-option" value="allgemein"><label for="anrede-allgemein">Allgemein: Sehr geehrte Damen und Herren</label></div>
    `;

    document.getElementById('generate-mail-button').style.display = 'inline-block';
}

function generateAndShowEmailContent() {
    if (!currentAnalysis) return;

    const selectedEinleitungKey = document.querySelector('input[name="einleitung-variante"]:checked')?.value;
    currentAnalysis.personalisierteEinleitung = currentAnalysis.einleitungsVarianten[selectedEinleitungKey || 'variante1'];
    
    const anrede = getSelectedAnrede();
    const personalisierteEinleitung = currentAnalysis.personalisierteEinleitung;

    const fullEmailBody = `<p>${anrede},</p><p>${personalisierteEinleitung}</p>${emailTemplate}`;

    document.getElementById('email-content-output').innerHTML = fullEmailBody;
    document.getElementById('mail-generator-section').style.display = 'none';
    document.getElementById('email-content-section').style.display = 'block';
}

function getSelectedAnrede() {
    const selected = document.querySelector('input[name="anrede-option"]:checked');
    if (!selected) return `Sehr geehrte Damen und Herren`;

    const anredeValue = selected.value;
    const inhaber = currentAnalysis.inhaber || '';
    const firma = currentAnalysis.firmenname || 'dem Team';

    switch (anredeValue) {
        case 'person': return `Sehr geehrte/r Herr/Frau ${inhaber}`;
        case 'firma': return `Sehr geehrte Damen und Herren der Firma ${firma}`;
        case 'allgemein': return `Sehr geehrte Damen und Herren`;
        default: return `Sehr geehrte Damen und Herren`;
    }
}

function showPreview() {
    if (!currentAnalysis) return;
    
    const anrede = getSelectedAnrede();
    const personalisierteEinleitung = currentAnalysis.personalisierteEinleitung;
    const fullEmailBody = `<p>${anrede},</p><p>${personalisierteEinleitung}</p>${emailTemplate}`;
    
    document.getElementById('preview-modal-body').innerHTML = fullEmailBody;
    document.getElementById('preview-modal').style.display = 'block';
}

function closePreviewModal() {
    document.getElementById('preview-modal').style.display = 'none';
}

function copyToClipboard() {
    const emailContent = document.getElementById('email-content-output').innerText;
    navigator.clipboard.writeText(emailContent).then(() => alert('E-Mail-Text in die Zwischenablage kopiert!'));
}

async function sendEmail() {
    const serviceID = document.getElementById('emailjsServiceID').value;
    const templateID = document.getElementById('emailjsTemplateID').value;
    const userID = document.getElementById('emailjsUserID').value;

    if (!serviceID || !templateID || !userID) {
        alert('Bitte füllen Sie alle EmailJS Konfigurationsfelder aus.');
        return;
    }
    if (!currentAnalysis || !currentAnalysis.kontakt.email) {
        alert('Keine E-Mail-Adresse für den Versand gefunden.');
        return;
    }

    const anrede = getSelectedAnrede();
    const einleitung = currentAnalysis.personalisierteEinleitung;
    const fullEmailBody = `<p>${anrede},</p><p>${einleitung}</p>${emailTemplate}`;
    
    const templateParams = {
        to_name: anrede,
        to_email: currentAnalysis.kontakt.email,
        from_name: "Atakan Olcaysu",
        subject: `Anfrage Konfigurator für ${currentAnalysis.firmenname || 'Ihren Betrieb'}`,
        email_body: fullEmailBody,
        firmenname: currentAnalysis.firmenname,
        inhaber: currentAnalysis.inhaber
    };

    try {
        await emailjs.send(serviceID, templateID, templateParams, userID);
        alert('E-Mail erfolgreich gesendet!');
        currentAnalysis.emailGesendet = true;
        updateHistoryDisplay();
        saveHistoryToStorage();
    } catch (error) {
        alert(`Fehler beim Senden der E-Mail: ${JSON.stringify(error)}`);
    }
}

function sendFromPreview() {
    sendEmail();
    closePreviewModal();
}

function addToHistory(data) {
    data.id = `analyse-${Date.now()}`;
    data.timestamp = new Date().toLocaleString('de-DE');
    analysisHistory.unshift(data);
    updateHistoryDisplay();
    saveHistoryToStorage();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    analysisHistory.forEach(item => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<strong>${item.firmenname || 'Unbekannte Firma'}</strong> (${item.timestamp}) <span class="status">${item.emailGesendet ? '✓ Gesendet' : ''}</span>`;
        listItem.onclick = () => loadFromHistory(item.id);
        historyList.appendChild(listItem);
    });
}

function loadFromHistory(id) {
    const item = analysisHistory.find(entry => entry.id === id);
    if (item) {
        currentAnalysis = item;
        displayAnalysis(item);
        showMailGenerator();
    }
}

function clearHistory() {
    if (confirm('Möchten Sie wirklich die gesamte Historie löschen?')) {
        analysisHistory = [];
        localStorage.removeItem('glasereiAnalysisHistory');
        updateHistoryDisplay();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    ['openaiApiKey', 'emailjsServiceID', 'emailjsTemplateID', 'emailjsUserID'].forEach(id => {
        const element = document.getElementById(id);
        element.value = localStorage.getItem(id) || '';
        element.addEventListener('input', (e) => localStorage.setItem(id, e.target.value));
    });

    loadHistoryFromStorage();
    updateHistoryDisplay();
}); 