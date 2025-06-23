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
  
  let html = '<h3>📊 Analysierte Daten:</h3>';
  html += '<div style="background: #f8f9fa; padding: 1rem; border-radius: 6px; margin: 1rem 0;">';
  
  if (data.firmenname) {
    html += `<p><strong>Firmenname:</strong> ${data.firmenname}</p>`;
  }
  
  if (data.anschrift) {
    html += `<p><strong>Adresse:</strong> ${data.anschrift.strasse || ''}, ${data.anschrift.plz || ''} ${data.anschrift.ort || ''}</p>`;
  }
  
  if (data.kontakt) {
    if (data.kontakt.telefon) html += `<p><strong>Telefon:</strong> ${data.kontakt.telefon}</p>`;
    if (data.kontakt.email) html += `<p><strong>E-Mail:</strong> ${data.kontakt.email}</p>`;
    if (data.kontakt.website) html += `<p><strong>Website:</strong> ${data.kontakt.website}</p>`;
  }
  
  if (data.inhaber) {
    html += `<p><strong>Inhaber:</strong> ${data.inhaber}</p>`;
  }
  
  if (data.gruendungsjahr) {
    html += `<p><strong>Gründungsjahr:</strong> ${data.gruendungsjahr}</p>`;
  }
  
  if (data.leistungen && data.leistungen.length > 0) {
    html += `<p><strong>Leistungen:</strong> ${data.leistungen.join(', ')}</p>`;
  }
  
  if (data.oeffnungszeiten) {
    html += `<p><strong>Öffnungszeiten:</strong> ${data.oeffnungszeiten}</p>`;
  }
  
  if (data.besonderheiten && data.besonderheiten.length > 0) {
    html += `<p><strong>Besonderheiten:</strong> ${data.besonderheiten.join(', ')}</p>`;
  }
  
  html += '</div>';
  
  // Einleitungsvarianten anzeigen
  if (data.einleitungsVarianten) {
    html += '<h3>📝 Einleitungsvarianten:</h3>';
    html += '<div style="background: #f8f9fa; padding: 1rem; border-radius: 6px; margin: 1rem 0;">';
    
    html += '<div style="margin-bottom: 1rem;">';
    html += '<label style="display: block; margin-bottom: 0.5rem;"><strong>Wählen Sie eine Einleitung:</strong></label>';
    
    // Radio-Buttons für alle 3 Varianten
    html += '<div style="margin-bottom: 1rem;">';
    html += '<label style="display: block; margin-bottom: 0.5rem;">';
    html += '<input type="radio" name="einleitung" value="variante1" checked style="margin-right: 0.5rem;">';
    html += '<strong>Variante 1:</strong> Spezifische Merkmale aufgreifen';
    html += '</label>';
    html += '<div style="background: white; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; margin: 0.5rem 0 1rem 1.5rem; font-style: italic; color: #666;">';
    html += `${data.einleitungsVarianten.variante1}`;
    html += '</div>';
    
    html += '<label style="display: block; margin-bottom: 0.5rem;">';
    html += '<input type="radio" name="einleitung" value="variante2" style="margin-right: 0.5rem;">';
    html += '<strong>Variante 2:</strong> Regionale/örtliche Verbindung';
    html += '</label>';
    html += '<div style="background: white; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; margin: 0.5rem 0 1rem 1.5rem; font-style: italic; color: #666;">';
    html += `${data.einleitungsVarianten.variante2}`;
    html += '</div>';
    
    html += '<label style="display: block; margin-bottom: 0.5rem;">';
    html += '<input type="radio" name="einleitung" value="variante3" style="margin-right: 0.5rem;">';
    html += '<strong>Variante 3:</strong> Leistungsfokus';
    html += '</label>';
    html += '<div style="background: white; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; margin: 0.5rem 0 1rem 1.5rem; font-style: italic; color: #666;">';
    html += `${data.einleitungsVarianten.variante3}`;
    html += '</div>';
    html += '</div>';
    
    // Anrede-Auswahl unter den Einleitungsvarianten
    html += '<hr style="margin: 2rem 0; border: 1px solid #ddd;">';
    html += '<div style="margin-bottom: 1rem;">';
    html += '<label style="display: block; margin-bottom: 0.5rem;"><strong>👤 Anrede auswählen:</strong></label>';

    const inhaber = data.inhaber || '';
    const firmenname = data.firmenname || '';
    
    if (inhaber) {
      const nameParts = inhaber.split(' ');
      const nachname = nameParts[nameParts.length - 1];
      
      html += `
        <label style="display: block; margin-bottom: 0.5rem;">
          <input type="radio" name="anrede" value="herr" checked style="margin-right: 0.5rem;">
          <strong>Sehr geehrter Herr ${nachname}</strong>
        </label>
        <label style="display: block; margin-bottom: 0.5rem;">
          <input type="radio" name="anrede" value="frau" style="margin-right: 0.5rem;">
          <strong>Sehr geehrte Frau ${nachname}</strong>
        </label>
        <label style="display: block; margin-bottom: 0.5rem;">
          <input type="radio" name="anrede" value="firma" style="margin-right: 0.5rem;">
          <strong>Sehr geehrte Damen und Herren der ${firmenname}</strong>
        </label>
      `;
    } else {
      html += `
        <label style="display: block; margin-bottom: 0.5rem;">
          <input type="radio" name="anrede" value="firma" checked style="margin-right: 0.5rem;">
          <strong>Sehr geehrte Damen und Herren der ${firmenname}</strong>
        </label>
        <label style="display: block; margin-bottom: 0.5rem;">
          <input type="radio" name="anrede" value="allgemein" style="margin-right: 0.5rem;">
          <strong>Sehr geehrte Damen und Herren</strong>
        </label>
      `;
    }
    html += '</div>';
    html += '</div>';
  }
  
  output.innerHTML = html;
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
  
  // E-Mail-Inhalt aus dynamischen Teilen und der Vorlage zusammensetzen
  const emailContent = `
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
    <p>${einleitungTextKlein}</p>
    ${emailTemplate}
  `;

  mailOutput.innerHTML = emailContent.trim();

  // Buttons für die weitere Verarbeitung anzeigen
  document.getElementById('previewMailBtn').style.display = 'inline-block';
  document.getElementById('copyMailBtn').style.display = 'inline-block';
  document.getElementById('sendMailBtn').style.display = 'inline-block';
  
  // E-Mail-Daten für Vorschau speichern
  window.previewEmailData = {
    to: email,
    subject: subject,
    content: emailContent
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
  const selectedRadio = document.querySelector('input[name="anrede"]:checked');
  if (!selectedRadio) {
    return 'Sehr geehrte Damen und Herren';
  }

  const inhaber = currentAnalysis.inhaber || '';
  const firmenname = currentAnalysis.firmenname || '';
  let anrede = 'Sehr geehrte Damen und Herren';
  
  if (inhaber) {
    const nameParts = inhaber.split(' ');
    const nachname = nameParts[nameParts.length - 1];
    
    switch(selectedRadio.value) {
      case 'herr':
        anrede = `Sehr geehrter Herr ${nachname}`;
        break;
      case 'frau':
        anrede = `Sehr geehrte Frau ${nachname}`;
        break;
      case 'firma':
        anrede = `Sehr geehrte Damen und Herren der ${firmenname}`;
        break;
    }
  } else {
    switch(selectedRadio.value) {
      case 'firma':
        anrede = `Sehr geehrte Damen und Herren der ${firmenname}`;
        break;
      case 'allgemein':
        anrede = 'Sehr geehrte Damen und Herren';
        break;
    }
  }
  return anrede;
}

// E-Mail-Generator anzeigen
function showMailGenerator() {
  const mailSection = document.getElementById('mail-generator-section');
  const changeAnredeBtn = document.getElementById('changeAnredeBtn');
  const previewBtn = document.getElementById('previewMailBtn');
  const copyBtn = document.getElementById('copyMailBtn');
  const sendBtn = document.getElementById('sendMailBtn');
  const configTestBtn = document.getElementById('configTestBtn');
  
  mailSection.style.display = 'block';
  changeAnredeBtn.style.display = 'none'; // Button ausblenden
  previewBtn.style.display = 'inline-block';
  copyBtn.style.display = 'inline-block';
  sendBtn.style.display = 'inline-block';
  configTestBtn.style.display = 'inline-block';
}

// E-Mail-Vorschau anzeigen
function showPreview() {
  if (!window.previewEmailData) {
    alert('Bitte generieren Sie zuerst eine E-Mail.');
    return;
  }

  const modal = document.getElementById('previewModal');
  const previewTo = document.getElementById('preview-to');
  const previewSubject = document.getElementById('preview-subject');
  const previewContent = document.getElementById('preview-content');

  previewTo.textContent = window.previewEmailData.to;
  previewSubject.textContent = window.previewEmailData.subject;
  previewContent.innerHTML = window.previewEmailData.content.replace(/\n/g, '<br>');

  modal.style.display = 'block';
}

// Vorschau-Modal schließen
function closePreviewModal() {
  const modal = document.getElementById('previewModal');
  modal.style.display = 'none';
}

// E-Mail in Zwischenablage kopieren
function copyToClipboard() {
  const mailOutput = document.getElementById('mail-output');
  
  if (mailOutput.textContent.trim() === '') {
    alert('Keine E-Mail zum Kopieren verfügbar.');
    return;
  }

  navigator.clipboard.writeText(mailOutput.textContent).then(() => {
    alert('E-Mail wurde in die Zwischenablage kopiert!');
  }).catch(err => {
    console.error('Fehler beim Kopieren:', err);
    alert('Fehler beim Kopieren in die Zwischenablage.');
  });
}

// E-Mail senden (EmailJS)
function sendEmail() {
  if (!window.previewEmailData) {
    alert('Bitte generieren Sie zuerst eine E-Mail.');
    return;
  }

  // Anrede und Einleitung korrekt holen
  const anrede = getSelectedAnrede();
  const selectedEinleitungRadio = document.querySelector('input[name="einleitung"]:checked');
  
  if (!selectedEinleitungRadio) {
    alert('Bitte wählen Sie eine Einleitungsvariante aus.');
    return;
  }
  
  const selectedVarianteKey = selectedEinleitungRadio.value;
  const roheEinleitung = currentAnalysis.einleitungsVarianten[selectedVarianteKey];

  // Die Einleitung enthält jetzt keine Anrede mehr, daher keine Bereinigung nötig
  const einleitungText = roheEinleitung.trim();
  
  // Ersten Buchstaben der Einleitung klein machen
  const einleitungTextKlein = einleitungText.charAt(0).toLowerCase() + einleitungText.slice(1);

  // Erstelle die E-Mail-Nachricht mit nur Anrede und Einleitung
  const message = `${anrede}\n\n${einleitungTextKlein}`;

  // EmailJS-Konfiguration laden
  if (!window.EMAILJS_CONFIG) {
    alert('EmailJS-Konfiguration nicht gefunden. Bitte laden Sie die Seite neu.');
    return;
  }

  const { serviceID, templateID, publicKey } = window.EMAILJS_CONFIG;

  console.log('📧 Sende E-Mail mit folgender Konfiguration:', {
    serviceID,
    templateID,
    subject: 'Kleine Glas-Anfragen schnell abwickeln – Wie ein Mini-Onlineshop',
    message: message.substring(0, 100) + '...'
  });

  // E-Mail senden
  emailjs.send(serviceID, templateID, {
    subject: 'Kleine Glas-Anfragen schnell abwickeln – Wie ein Mini-Onlineshop',
    message: message
  }, publicKey)
  .then(function(response) {
    console.log('E-Mail erfolgreich gesendet:', response);
    alert('E-Mail wurde erfolgreich gesendet!');
  })
  .catch(function(error) {
    console.error('Fehler beim Senden der E-Mail:', error);
    alert('Fehler beim Senden der E-Mail: ' + (error.text || error.message || 'Unbekannter Fehler'));
  });
}

// Von Vorschau senden
function sendFromPreview() {
  sendEmail();
  closePreviewModal();
}

// EmailJS-Konfiguration testen
function testEmailJSConfig() {
  const mailOutput = document.getElementById('mail-output');
  mailOutput.textContent = '🔧 Teste EmailJS-Konfiguration...\n\n';
  
  // Hier können Sie Ihre EmailJS-Konfiguration testen
  mailOutput.textContent += 'EmailJS ist initialisiert mit ID: ia3YBTzlRJq2D9Bgx\n';
  mailOutput.textContent += 'Bitte konfigurieren Sie Ihre Service-ID und Template-ID in der sendEmail-Funktion.';
}

// Zur Historie hinzufügen
function addToHistory(data) {
  const historyEntry = {
    timestamp: new Date().toLocaleString('de-DE'),
    firmenname: data.firmenname || 'Unbekannt',
    email: data.kontakt?.email || 'Keine E-Mail',
    telefon: data.kontakt?.telefon || 'Keine Telefonnummer',
    emailGenerated: false // Wird auf true gesetzt, wenn E-Mail generiert wird
  };
  
  analysisHistory.unshift(historyEntry);
  
  // Nur die letzten 20 Einträge behalten (erhöht für bessere Übersicht)
  if (analysisHistory.length > 20) {
    analysisHistory = analysisHistory.slice(0, 20);
  }
  
  // In localStorage speichern
  saveHistoryToStorage();
  
  updateHistoryDisplay();
}

// Historie-Anzeige aktualisieren
function updateHistoryDisplay() {
  const historyOutput = document.getElementById('history-output');
  
  if (analysisHistory.length === 0) {
    historyOutput.innerHTML = '<p>Bisher keine Einträge vorhanden.</p>';
    return;
  }
  
  let html = `
    <div class="history-container">
      <table class="history-table">
        <thead>
          <tr>
            <th>Datum/Zeit</th>
            <th>Firmenname</th>
            <th>E-Mail</th>
            <th>Telefon</th>
            <th style="text-align: center;">E-Mail Status</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  analysisHistory.forEach((entry, index) => {
    const emailStatusClass = entry.emailGenerated ? 'email-status-generated' : 'email-status-pending';
    const emailStatusText = entry.emailGenerated ? '✓ Generiert' : '⏳ Ausstehend';
    
    html += `
      <tr>
        <td style="font-family: monospace; font-size: 13px;">${entry.timestamp}</td>
        <td style="font-weight: 500;">${entry.firmenname}</td>
        <td>
          ${entry.email !== 'Keine E-Mail' ? `<a href="mailto:${entry.email}" style="color: #007bff; text-decoration: none;">${entry.email}</a>` : entry.email}
        </td>
        <td>
          ${entry.telefon !== 'Keine Telefonnummer' ? `<a href="tel:${entry.telefon}" style="color: #007bff; text-decoration: none;">${entry.telefon}</a>` : entry.telefon}
        </td>
        <td style="text-align: center;" class="${emailStatusClass}">${emailStatusText}</td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
    </div>
    <div class="history-info">
      Zeigt die letzten ${analysisHistory.length} Einträge (neueste zuerst)
    </div>
  `;
  
  historyOutput.innerHTML = html;
}

// Event-Listener für Buttons
document.addEventListener('DOMContentLoaded', function() {
  // Historie beim Laden aus localStorage laden
  loadHistoryFromStorage();
  
  // E-Mail-Generator Buttons
  const generateBtn = document.getElementById('generateMailBtn');
  const changeAnredeBtn = document.getElementById('changeAnredeBtn');
  const previewBtn = document.getElementById('previewMailBtn');
  const copyBtn = document.getElementById('copyMailBtn');
  const sendBtn = document.getElementById('sendMailBtn');
  const configTestBtn = document.getElementById('configTestBtn');
  
  if (generateBtn) generateBtn.addEventListener('click', generateMailWithSelectedEinleitung);
  if (changeAnredeBtn) changeAnredeBtn.addEventListener('click', changeAnrede);
  if (previewBtn) previewBtn.addEventListener('click', showPreview);
  if (copyBtn) copyBtn.addEventListener('click', copyToClipboard);
  if (sendBtn) sendBtn.addEventListener('click', sendEmail);
  if (configTestBtn) configTestBtn.addEventListener('click', testEmailJSConfig);
  
  // Historie beim Laden anzeigen
  updateHistoryDisplay();
});

// Funktion zum manuellen Ändern der Anrede (wird nicht mehr verwendet, kann entfernt werden)
function changeAnrede() {
  // Diese Funktion ist veraltet
  alert("Die Anrede kann jetzt direkt über die Radio-Buttons geändert werden.");
} 