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
  const mailSection = document.getElementById('mail-generator-section');

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
  "anschrift": {
    "strasse": "Straße und Hausnummer",
    "plz": "Postleitzahl",
    "ort": "Ort"
  },
  "kontakt": {
    "telefon": "Telefonnummer",
    "email": "E-Mail-Adresse",
    "website": "Website (falls vorhanden)"
  },
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

    if (!analysisResponse.ok) {
      throw new Error(`HTTP error! status: ${analysisResponse.status}`);
    }

    const analysisData = await analysisResponse.json();
    const parsedResponse = JSON.parse(analysisData.choices[0].message.content);
    
    // Füge den ursprünglichen Text hinzu
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

Lies dir den folgenden Text der Glaserei aufmerksam durch.

Schreibe **drei kurze, professionelle Einleitungsabschnitte** für eine E-Mail an diese Glaserei. Du willst ihnen deinen Konfigurator vorstellen.

WICHTIG: 
- Du bist der Anbieter, die Glaserei ist der potenzielle Kunde
- BEGINNE NICHT mit einer Anrede - die wird separat hinzugefügt
- Verwende den KORREKTEN Firmennamen und Inhaber-Namen
- Schreibe KURZ und PRÄGNANT (max. 3-4 Sätze pro Variante)
- KEINE redundanten Namenswiederholungen
- Professioneller, direkter Ton
- Fokus auf das Problem (Zeitaufwand bei kleinen Anfragen) und die Lösung
- JEDE Variante muss einen ÜBERGANG zu deiner Lösung enthalten
- Ende jede Variante mit einem Satz, der zu deiner Lösung überleitet

VARIANTE 1: Spezifische Merkmale aufgreifen
VARIANTE 2: Regionale/örtliche Verbindung  
VARIANTE 3: Leistungsfokus

Beispiel für professionelle Einleitungen MIT ÜBERGANG:
- "Als erfahrener Glasermeister wissen Sie, dass kleine Anfragen oft viel Zeit kosten. Mit Ihrem Wachstum steigen auch die Herausforderungen bei der Anfragenbearbeitung. Als jemand, der sich auf digitale Lösungen spezialisiert hat, habe ich ein Tool entwickelt, das genau dieses Problem löst."
- "In Ihrer Region sind Sie bekannt für Qualität und Service. Doch auch bei Ihnen können kleine Anfragen den Arbeitsalltag verlangsamen. Genau deshalb habe ich einen Konfigurator entwickelt, der Ihnen dabei helfen kann."
- "Mit zunehmender Kundenzahl wird die effiziente Bearbeitung von Anfragen zur Herausforderung. Besonders bei kleineren Aufträgen geht oft wertvolle Zeit verloren. Als Entwickler digitaler Werkzeuge habe ich eine Lösung erstellt, die diesen Prozess optimiert."

TEXT DER GLASEREI:
${impressumText}

${kundeninfoText}

Antworte NUR mit den 3 Einleitungsvarianten, ohne weitere Erklärungen.`
          }
        ],
        temperature: 0.5
      })
    });

    if (!einleitungResponse.ok) {
      throw new Error(`HTTP error! status: ${einleitungResponse.status}`);
    }

    const einleitungData = await einleitungResponse.json();
    const einleitungsText = einleitungData.choices[0].message.content.trim();
    
    // Parse die 3 Varianten
    const varianten = parseEinleitungsVarianten(einleitungsText);
    
    // Füge die 3 Varianten zu den Daten hinzu
    parsedResponse.einleitungsVarianten = varianten;
    parsedResponse.personalisierteEinleitung = varianten.variante1; // Standard: erste Variante
    
    // E-Mail-Text im Ausgabebereich anzeigen
    document.getElementById('mail-output').innerText = varianten.variante1;
    
    currentAnalysis = parsedResponse;
    
    // Anzeige der analysierten Daten
    displayAnalysis(parsedResponse);
    
    // E-Mail-Generator anzeigen
    showMailGenerator();
    
    // Zur Historie hinzufügen
    addToHistory(parsedResponse);

  } catch (error) {
    console.error('Fehler bei der Analyse:', error);
    output.innerHTML = `<p style="color: red;">Fehler bei der Analyse: ${error.message}</p>`;
  }
}

// Funktion zum Parsen der Einleitungsvarianten
function parseEinleitungsVarianten(einleitungsText) {
  const varianten = {
    variante1: '',
    variante2: '',
    variante3: ''
  };
  
  // Teile den Text in Abschnitte auf
  const sections = einleitungsText.split(/(?:VARIANTE \d+:)/);
  
  if (sections.length >= 4) {
    // Entferne leere Einträge und trimme
    const cleanSections = sections.filter(section => section.trim()).map(section => section.trim());
    
    if (cleanSections.length >= 3) {
      varianten.variante1 = cleanSections[0];
      varianten.variante2 = cleanSections[1];
      varianten.variante3 = cleanSections[2];
    }
  } else {
    // Fallback: Versuche es mit Zeilen-basiertem Parsing
    const lines = einleitungsText.split('\n');
    let currentVariante = '';
    let currentText = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('VARIANTE 1:') || trimmedLine.includes('VARIANTE 1')) {
        if (currentVariante && currentText) {
          varianten[currentVariante] = currentText.trim();
        }
        currentVariante = 'variante1';
        currentText = trimmedLine.replace(/VARIANTE 1:?\s*/, '').trim();
      } else if (trimmedLine.startsWith('VARIANTE 2:') || trimmedLine.includes('VARIANTE 2')) {
        if (currentVariante && currentText) {
          varianten[currentVariante] = currentText.trim();
        }
        currentVariante = 'variante2';
        currentText = trimmedLine.replace(/VARIANTE 2:?\s*/, '').trim();
      } else if (trimmedLine.startsWith('VARIANTE 3:') || trimmedLine.includes('VARIANTE 3')) {
        if (currentVariante && currentText) {
          varianten[currentVariante] = currentText.trim();
        }
        currentVariante = 'variante3';
        currentText = trimmedLine.replace(/VARIANTE 3:?\s*/, '').trim();
      } else if (currentVariante && trimmedLine) {
        currentText += ' ' + trimmedLine;
      }
    }
    
    // Letzte Variante speichern
    if (currentVariante && currentText) {
      varianten[currentVariante] = currentText.trim();
    }
  }
  
  // Fallback: Wenn keine Varianten gefunden wurden, erstelle Standard-Varianten
  if (!varianten.variante1 && !varianten.variante2 && !varianten.variante3) {
    varianten.variante1 = `Als erfahrener Glasermeister wissen Sie, dass kleine Anfragen oft viel Zeit kosten. Mit Ihrem Wachstum steigen auch die Herausforderungen bei der Anfragenbearbeitung. Als jemand, der sich auf digitale Lösungen spezialisiert hat, habe ich ein Tool entwickelt, das genau dieses Problem löst.`;
    varianten.variante2 = `In Ihrer Region sind Sie bekannt für Qualität und Service. Doch auch bei Ihnen können kleine Anfragen den Arbeitsalltag verlangsamen. Genau deshalb habe ich einen Konfigurator entwickelt, der Ihnen dabei helfen kann.`;
    varianten.variante3 = `Mit zunehmender Kundenzahl wird die effiziente Bearbeitung von Anfragen zur Herausforderung. Besonders bei kleineren Aufträgen geht oft wertvolle Zeit verloren. Als Entwickler digitaler Werkzeuge habe ich eine Lösung erstellt, die diesen Prozess optimiert.`;
  }
  
  return varianten;
}

// Anzeige der analysierten Daten
function displayAnalysis(data) {
    const output = document.getElementById('output');
    output.innerHTML = ''; // Leere vorherige Ausgabe

    // Hilfsfunktion zur Erstellung von Zeilen
    const createRow = (label, value) => {
        if (!value || value.length === 0) return '';
        let displayValue = value;
        if (Array.isArray(value)) {
            displayValue = `<ul>${value.map(item => `<li>${item}</li>`).join('')}</ul>`;
        } else if (typeof value === 'object' && value !== null) {
            displayValue = `<ul>${Object.entries(value).map(([key, val]) => `<li><strong>${key}:</strong> ${val}</li>`).join('')}</ul>`;
        }
        return `<tr>
                    <td><strong>${label}</strong></td>
                    <td>${displayValue}</td>
                </tr>`;
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

    // "Über uns"-Text anzeigen
    if (data.ueberUnsText) {
        tableContent += `
            <h4>Originaltext ("Über uns" / Impressum)</h4>
            <div class="original-text-box">${data.ueberUnsText}</div>
        `;
    }

    output.innerHTML = tableContent;
    document.getElementById('analysis-output-section').style.display = 'block';
}

// E-Mail-Generierung
async function generateMailWithSelectedEinleitung() {
  const selectedEinleitungRadio = document.querySelector('input[name="einleitung"]:checked');
  
  if (!selectedEinleitungRadio) {
    alert('Bitte wählen Sie eine Einleitungsvariante aus.');
    return;
  }

  if (!currentAnalysis) {
    alert('Bitte führen Sie zuerst eine Analyse durch.');
    return;
  }

  const selectedVariante = selectedEinleitungRadio.value;
  const einleitungText = currentAnalysis.einleitungsVarianten[selectedVariante];
  
  // Aktualisiere die ausgewählte Einleitung
  currentAnalysis.personalisierteEinleitung = einleitungText;
  
  // E-Mail generieren
  const mailOutput = document.getElementById('mail-output');
  mailOutput.innerHTML = '<p>🔄 Generiere E-Mail...</p>';

  // Anrede von den Radio-Buttons holen
  const anrede = getSelectedAnrede();
  
  const selectedVarianteKey = selectedEinleitungRadio.value;
  const roheEinleitung = currentAnalysis.einleitungsVarianten[selectedVarianteKey];

  // Die Einleitung enthält jetzt keine Anrede mehr, daher keine Bereinigung nötig
  const einleitungTextFinal = roheEinleitung.trim();
  
  // Ersten Buchstaben der Einleitung klein machen
  const einleitungTextKlein = einleitungTextFinal.charAt(0).toLowerCase() + einleitungTextFinal.slice(1);
    
  console.log('🔍 Debug - Einleitung:', einleitungTextKlein);

  const email = currentAnalysis.kontakt?.email || 'beispiel@email.de';
  const subject = `Anfrage zur Optimierung Ihrer Kundenanfragen – Konfigurator für ${currentAnalysis.firmenname}`;
  
  const personalisierteEinleitung = currentAnalysis.personalisierteEinleitung;

  // Anrede holen
  const anrede = getSelectedAnrede();

  const fullEmailBody = `
    <style>
      body {
        line-height: 1.4;
        font-family: Arial, sans-serif;
        font-size: 15px;
      }
      p {
        margin: 0 0 10px 0;
      }
      ul {
        margin: 10px 0;
        padding-left: 20px;
      }
      li {
        margin-bottom: 5px;
      }
    </style>
    <p>${anrede},</p>
    <p>${personalisierteEinleitung}</p>
    ${emailTemplate}
  `;

  document.getElementById('email-content-output').innerHTML = fullEmailBody;

  // Buttons für die weitere Verarbeitung anzeigen
  document.getElementById('previewMailBtn').style.display = 'inline-block';
  document.getElementById('copyMailBtn').style.display = 'inline-block';
  document.getElementById('sendMailBtn').style.display = 'inline-block';
  document.getElementById('configTestBtn').style.display = 'inline-block';
  
  // E-Mail-Daten für Vorschau speichern
  window.previewEmailData = {
    to: email,
    subject: subject,
    content: fullEmailBody
  };

  alert(`✅ Einleitung "${selectedVariante}" übernommen und E-Mail generiert!`);
  
  // E-Mail-Status in der Historie aktualisieren
  if (analysisHistory.length > 0) {
    // Den neuesten Eintrag (ersten in der Liste) als generiert markieren
    analysisHistory[0].emailGenerated = true;
    // In localStorage speichern
    saveHistoryToStorage();
    updateHistoryDisplay();
  }
}

// Funktion zum Abrufen der ausgewählten Anrede
function getSelectedAnrede() {
  const selected = document.querySelector('input[name="anrede-option"]:checked');
  if (!selected) return `Sehr geehrte Damen und Herren`;

  const anredeValue = selected.value;
  const inhaber = currentAnalysis.inhaber || '';
  const firma = currentAnalysis.firmenname || 'dem Team';

  switch (anredeValue) {
    case 'person':
      return `Sehr geehrte/r Herr/Frau ${inhaber}`;
    case 'firma':
      return `Sehr geehrte Damen und Herren der Firma ${firma}`;
    case 'allgemein':
      return `Sehr geehrte Damen und Herren`;
    default:
      return `Sehr geehrte Damen und Herren`;
  }
}

// E-Mail-Generator anzeigen
function showMailGenerator() {
  document.getElementById('impressum-input-section').style.display = 'none';
  document.getElementById('analysis-output-section').style.display = 'none';
  document.getElementById('history-section').style.display = 'none';
  document.getElementById('mail-generator-section').style.display = 'block';
  document.getElementById('email-content-section').style.display = 'none'; // Verstecke den finalen Mail-Inhalt erstmal

  // UI-Elemente für die Mail-Generierung füllen
  const data = currentAnalysis;
  if (!data) return;

  // Einleitungsvarianten anzeigen
  const variantenContainer = document.getElementById('einleitung-varianten');
  variantenContainer.innerHTML = '';
  for (const key in data.einleitungsVarianten) {
    if (data.einleitungsVarianten.hasOwnProperty(key)) {
      const variante = data.einleitungsVarianten[key];
      const radioId = `variante-${key}`;
      variantenContainer.innerHTML += `
        <div class="einleitung-variante">
          <input type="radio" id="${radioId}" name="einleitung-variante" value="${key}" ${key === 'variante1' ? 'checked' : ''}>
          <label for="${radioId}">${variante}</label>
        </div>
      `;
    }
  }
  
  // Event Listener für die Radio-Buttons hinzufügen
  document.querySelectorAll('input[name="einleitung-variante"]').forEach(radio => {
    radio.addEventListener('change', () => {
      // Die persönliche Einleitung bei Auswahl aktualisieren
      currentAnalysis.personalisierteEinleitung = currentAnalysis.einleitungsVarianten[radio.value];
    });
  });

  // Anrede-Optionen anzeigen
  const anredeContainer = document.getElementById('anrede-optionen');
  anredeContainer.innerHTML = `
    <div class="anrede-option">
      <input type="radio" id="anrede-person" name="anrede-option" value="person" checked>
      <label for="anrede-person">Person: Sehr geehrte/r Herr/Frau ${data.inhaber || '...'}</label>
    </div>
    <div class="anrede-option">
      <input type="radio" id="anrede-firma" name="anrede-option" value="firma">
      <label for="anrede-firma">Firma: Sehr geehrte Damen und Herren der Firma ${data.firmenname || '...'}</label>
    </div>
    <div class="anrede-option">
      <input type="radio" id="anrede-allgemein" name="anrede-option" value="allgemein">
      <label for="anrede-allgemein">Allgemein: Sehr geehrte Damen und Herren</label>
    </div>
  `;

  document.getElementById('generate-mail-button').style.display = 'inline-block';
}

// E-Mail-Vorschau anzeigen
function showPreview(inModal = true) {
  if (!currentAnalysis) return;

  // Sicherstellen, dass die aktuellste Einleitung verwendet wird
  const selectedEinleitungKey = document.querySelector('input[name="einleitung-variante"]:checked')?.value;
  if (!selectedEinleitungKey) {
    alert("Bitte wählen Sie zuerst eine Einleitungsvariante.");
    return;
  }
  const personalisierteEinleitung = currentAnalysis.einleitungsVarianten[selectedEinleitungKey];
  const anrede = getSelectedAnrede();

  const fullEmailBody = `
    <p>${anrede},</p>
    <p>${personalisierteEinleitung}</p>
    ${emailTemplate}
  `;

  if (inModal) {
    const modalBody = document.getElementById('preview-modal-body');
    modalBody.innerHTML = fullEmailBody;
    document.getElementById('preview-modal').style.display = 'block';
  } else {
    // Direkt im Hauptfenster aktualisieren (z.B. nach Anreden-Änderung)
    document.getElementById('email-content-output').innerHTML = fullEmailBody;
  }
}

// Vorschau-Modal schließen
function closePreviewModal() {
  document.getElementById('preview-modal').style.display = 'none';
}

// E-Mail in Zwischenablage kopieren
function copyToClipboard() {
  const emailContent = document.getElementById('email-content-output').innerText;
  navigator.clipboard.writeText(emailContent).then(() => {
    alert('E-Mail-Text in die Zwischenablage kopiert!');
  }, (err) => {
    console.error('Fehler beim Kopieren: ', err);
    alert('Fehler beim Kopieren.');
  });
}

// E-Mail senden (EmailJS)
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
  const subject = `Anfrage Konfigurator für ${currentAnalysis.firmenname || 'Ihren Betrieb'}`;
  const einleitung = currentAnalysis.personalisierteEinleitung;

  const fullEmailBody = `
    <p>${anrede},</p>
    <p>${einleitung}</p>
    ${emailTemplate}
  `;
  
  const templateParams = {
    to_name: anrede,
    to_email: currentAnalysis.kontakt.email,
    from_name: "Atakan Olcaysu",
    subject: subject,
    email_body: fullEmailBody,
    firmenname: currentAnalysis.firmenname,
    inhaber: currentAnalysis.inhaber
  };

  try {
    await emailjs.send(serviceID, templateID, templateParams, userID);
    alert('E-Mail erfolgreich gesendet!');
    // Markiere als gesendet in der Historie
    currentAnalysis.emailGesendet = true;
    updateHistoryDisplay();
    saveHistoryToStorage();
  } catch (error) {
    console.error('Fehler beim Senden der E-Mail:', error);
    alert(`Fehler beim Senden der E-Mail: ${JSON.stringify(error)}`);
  }
}

// Von Vorschau senden
function sendFromPreview() {
  sendEmail();
  closePreviewModal();
}

// EmailJS-Konfiguration testen
function testEmailJSConfig() {
  // Diese Funktion kann beibehalten werden, um die Konfiguration zu testen
  alert("Test-Funktion für EmailJS.");
}

// Zur Historie hinzufügen
function addToHistory(data) {
  // Eindeutige ID für den Eintrag erstellen
  data.id = `analyse-${Date.now()}`;
  data.timestamp = new Date().toLocaleString('de-DE');
  analysisHistory.unshift(data); // Oben einfügen
  updateHistoryDisplay();
  saveHistoryToStorage();
}

// Historie-Anzeige aktualisieren
function updateHistoryDisplay() {
  const historyList = document.getElementById('history-list');
  historyList.innerHTML = '';
  analysisHistory.forEach(item => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <strong>${item.firmenname || 'Unbekannte Firma'}</strong> (${item.timestamp})
      <span class="status">${item.emailGesendet ? '✓ Gesendet' : ''}</span>
    `;
    listItem.onclick = () => loadFromHistory(item.id);
    historyList.appendChild(listItem);
  });
}

function loadFromHistory(id) {
  const item = analysisHistory.find(entry => entry.id === id);
  if (item) {
    currentAnalysis = item;
    displayAnalysis(item);
    showMailGenerator(); // Direkt zum Mail-Generator gehen
  }
}

function clearHistory() {
  if (confirm('Möchten Sie wirklich die gesamte Historie löschen?')) {
    analysisHistory = [];
    localStorage.removeItem('glasereiAnalysisHistory');
    updateHistoryDisplay();
  }
}

// Event Listeners und Initialisierung
document.addEventListener('DOMContentLoaded', () => {
  // Lade Konfiguration aus localStorage
  document.getElementById('openaiApiKey').value = localStorage.getItem('openaiApiKey') || '';
  document.getElementById('emailjsServiceID').value = localStorage.getItem('emailjsServiceID') || '';
  document.getElementById('emailjsTemplateID').value = localStorage.getItem('emailjsTemplateID') || '';
  document.getElementById('emailjsUserID').value = localStorage.getItem('emailjsUserID') || '';

  // Speichere Konfiguration bei Änderung
  document.getElementById('openaiApiKey').addEventListener('input', (e) => localStorage.setItem('openaiApiKey', e.target.value));
  document.getElementById('emailjsServiceID').addEventListener('input', (e) => localStorage.setItem('emailjsServiceID', e.target.value));
  document.getElementById('emailjsTemplateID').addEventListener('input', (e) => localStorage.setItem('emailjsTemplateID', e.target.value));
  document.getElementById('emailjsUserID').addEventListener('input', (e) => localStorage.setItem('emailjsUserID', e.target.value));

  // Lade Historie
  loadHistoryFromStorage();
  updateHistoryDisplay();
});

// Die folgenden Funktionen sind veraltet oder wurden ersetzt und sollten entfernt werden, 
// falls sie noch irgendwo im Code existieren.
// Die Logik ist jetzt in generateAndShowEmailContent und showMailGenerator integriert.

function changeAnrede() {
  // Diese Funktion ist veraltet, da die Anrede jetzt dynamisch in der Vorschau und Mail gerendert wird.
  alert("Die Anrede kann jetzt direkt über die Radio-Buttons geändert werden.");
}

// Initialer Ladevorgang
loadHistoryFromStorage();
updateHistoryDisplay();

function generateAndShowEmailContent() {
    if (!currentAnalysis) {
        console.error('Keine Analyse zum Generieren der Mail vorhanden.');
        return;
    }

    // Sicherstellen, dass die aktuellste Einleitung verwendet wird
    const selectedEinleitungKey = document.querySelector('input[name="einleitung-variante"]:checked')?.value;
    if (!selectedEinleitungKey) {
        // Fallback, falls nichts ausgewählt ist, obwohl das nicht passieren sollte
        currentAnalysis.personalisierteEinleitung = currentAnalysis.einleitungsVarianten.variante1;
    } else {
        currentAnalysis.personalisierteEinleitung = currentAnalysis.einleitungsVarianten[selectedEinleitungKey];
    }
    const personalisierteEinleitung = currentAnalysis.personalisierteEinleitung;

    // Anrede holen
    const anrede = getSelectedAnrede();

    const fullEmailBody = `
        <p>${anrede},</p>
        <p>${personalisierteEinleitung}</p>
        ${emailTemplate}
    `;

    document.getElementById('email-content-output').innerHTML = fullEmailBody;

    // UI aktualisieren
    document.getElementById('mail-generator-section').style.display = 'none';
    document.getElementById('email-content-section').style.display = 'block';
} 