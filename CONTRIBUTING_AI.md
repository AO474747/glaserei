# 🧠 Ziel: Sicheres, kontrolliertes Arbeiten mit dem Cursor-Agent

Diese Regeln gelten für alle GPT-gestützten Änderungen in diesem Projekt – insbesondere bei Arbeit mit bestehenden Dateien, HTML-Komponenten, Mailtexten oder Konfigurator-Logik.

---

## 🔒 Verhaltensregeln für den Agenten

1. **Nur gezielte Änderungen**
   - Nimm ausschließlich Änderungen an den konkret beschriebenen Stellen vor.
   - Greife keine weiteren Abschnitte, Funktionen oder Styles an – auch nicht zur „Optimierung“.

2. **Keine automatischen Refactorings**
   - Führe keine Namensänderungen, Vereinfachungen oder Umstrukturierungen durch, wenn dies nicht ausdrücklich beauftragt wurde.

3. **Kein Eingriff in funktionierende Logik**
   - Wenn eine Funktion sichtbar korrekt arbeitet, darf sie **nicht angepasst, ersetzt oder erweitert** werden – es sei denn, dies ist explizit gewünscht.

4. **Negative Anweisungen beachten**
   - Wenn eine Anweisung enthält, was *nicht* verändert werden soll (z. B. „Fasse nur CSS an, nicht HTML“), ist das bindend.

---

## 🔁 Empfohlenes Vorgehen

- Änderungen in kleinen, separaten Schritten
- Bei Abhängigkeiten anderer Dateien: vorher Bestätigung einholen
- Immer den ursprünglichen Funktionskontext respektieren

---

## ✅ Beispiel

**Richtig:**

> „Ändere in `style.css` nur die Höhe von `#kontaktText` auf `160px` – alles andere bleibt wie es ist.“

**Falsch:**

> „Ich habe den ganzen Bereich etwas umstrukturiert und optimiert.“

---

## 🤖 Verpflichtung des Agenten

> *„Ich werde Änderungen nur auf das beziehen, was konkret verlangt wurde. Bestehende Logik bleibt unberührt, und ich werde keine automatischen Umstrukturierungen durchführen. Bei Unsicherheit frage ich vorher nach.“* 