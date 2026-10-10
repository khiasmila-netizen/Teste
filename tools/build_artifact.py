#!/usr/bin/env python3
"""Gera a versão "artefacto do claude.ai" da app num único ficheiro HTML.

Uso: python3 tools/build_artifact.py <ficheiro-de-saída.html>

Diferenças em relação à app instalável:
- tudo num só ficheiro (CSS e JS embutidos), sem service worker nem manifesto;
- os dados ficam guardados na conta do Claude (capacidade "db"), com cópia no browser;
- sem leitura de código de barras (o claude.ai não deixa usar a câmara nem o Open Food Facts);
- confirmação de "apagar tudo" dentro da página (o claude.ai bloqueia confirm()).
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent


def must_replace(text, old, new):
    if old not in text:
        raise SystemExit(f"Não encontrei o trecho a substituir:\n{old[:120]}")
    return text.replace(old, new)


html = (ROOT / "index.html").read_text()
css = (ROOT / "style.css").read_text()
js = (ROOT / "app.js").read_text()
foods = (ROOT / "foods.js").read_text()
plano = (ROOT / "plano.js").read_text()

body = html.split("<body>")[1].split('<script src="foods.js">')[0].strip()

# ---------- CSS: tokens para os três estados de tema ----------
light = re.search(r":root \{(.*?)\n\}", css, re.S).group(1)
dark = re.search(r"@media \(prefers-color-scheme: dark\) \{\s*:root \{(.*?)\n  \}\n\}", css, re.S).group(1)
dark_block = dark.rstrip() + "\n    --on-accent: #0d1a12;\n    color-scheme: dark;"
rest = css[css.index("* { box-sizing"):]
css = (
    "[hidden] { display: none !important; }\n"
    ":root {" + light + "\n  --on-accent: #ffffff;\n"
    '  --font-display: "Bricolage Grotesque", "Segoe UI", system-ui, sans-serif;\n'
    '  --font-body: "Manrope", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;\n}\n'
    '@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {' + dark_block + "\n  }\n}\n"
    ':root[data-theme="dark"] {' + dark_block + "\n}\n" + rest
)
css = must_replace(css, 'font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;', "font-family: var(--font-body);")
css = must_replace(css, "position: sticky; top: 0; z-index: 2;", "position: sticky; top: env(safe-area-inset-top, 0px); z-index: 2;")
css = css.replace("color: #fff;", "color: var(--on-accent);")
css += "\nh1, h2, .equation strong, .target strong, .food-title { font-family: var(--font-display); }\n"
css += ".status { font-size: .72rem; color: var(--muted); font-weight: normal; margin-left: 6px; font-family: var(--font-body); }\n"

# ---------- HTML ----------
body = must_replace(body, "<h1>🥗 Dieta Katia</h1>", '<h1>🥗 Dieta Katia <span id="syncStatus" class="status"></span></h1>')
body = must_replace(
    body,
    '<button id="resetBtn" class="danger">Apagar todos os dados</button>',
    '<button id="resetBtn" class="danger">Apagar todos os dados</button>\n        <button id="resetCancel" hidden>Cancelar</button>',
)

# ---------- JS ----------
# Guardar na conta do Claude, com cópia no browser
js = must_replace(js, """function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
}""", """let cloudRef = null, saveTimer = null, saving = false, dirty = false;
function setStatus(t) { const el = document.getElementById("syncStatus"); if (el) el.textContent = t; }
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
  if (!cloudRef) return;
  dirty = true;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 800);
}
async function flush() {
  if (saving || !dirty || !cloudRef) return;
  saving = true; dirty = false;
  setStatus("a guardar…");
  try {
    await cloudRef.set({ json: JSON.stringify(state) });
    setStatus("guardado na conta");
  } catch (e) {
    const code = e && e.code;
    setStatus(code === "invalid_argument" ? "guardado só neste browser" : "erro ao guardar");
    if (code === "invalid_argument") cloudRef = null;
  }
  saving = false;
  if (dirty) flush();
}
async function initCloud() {
  if (!window.claude || !window.claude.use) return;
  try {
    const [db, user] = await Promise.all([claude.use("db"), claude.use("user")]);
    if (!db || !user) return;
    const id = await user.id();
    if (!id) return;
    const ref = db.doc("data/users/" + id + "/dieta");
    const snap = await ref.get();
    if (snap.exists && snap.data().json) {
      try { localStorage.setItem(STORE_KEY, snap.data().json); } catch {}
      state = load(snap.data().json);
      renderAll();
    }
    cloudRef = ref;
    setStatus("guardado na conta");
    if (!snap.exists) { dirty = true; flush(); }
  } catch {}
}""")
# load() aceita os dados vindos da conta
js = must_replace(js, "function load() {", "function load(raw) {")
js = must_replace(js, "JSON.parse(localStorage.getItem(STORE_KEY))", "JSON.parse(raw ?? localStorage.getItem(STORE_KEY))")

# Sem câmara / Open Food Facts no claude.ai
js = must_replace(js, '        <button class="chip" id="goScan">▥ Código de barras</button>\n', "")
js = must_replace(js, '    $("#goScan").onclick = () => showView({ view: "scan" });\n', "")

# Sem histórico do browser (o artefacto corre dentro do claude.ai)
js = must_replace(js, '  history.pushState({ sheet: 1 }, ""); // para o botão "voltar" do Android fechar este ecrã\n', "")
js = must_replace(js, "  if (history.state?.sheet) history.back();\n", "")
js = must_replace(js, 'window.addEventListener("popstate", () => closeSheet());\n', "")

# Confirmação de "apagar tudo" dentro da página
js = must_replace(js, """$("#resetBtn").onclick = () => {
  if (!confirm("Apagar todos os dados? Esta ação não pode ser desfeita.")) return;
  state = structuredClone(defaultState);""", """let resetArmed = false;
function disarmReset() {
  resetArmed = false;
  $("#resetBtn").textContent = "Apagar todos os dados";
  $("#resetCancel").hidden = true;
}
$("#resetCancel").onclick = disarmReset;
$("#resetBtn").onclick = () => {
  if (!resetArmed) {
    resetArmed = true;
    $("#resetBtn").textContent = "Confirmar: apagar tudo";
    $("#resetCancel").hidden = false;
    return;
  }
  disarmReset();
  state = structuredClone(defaultState);""")

# Sem service worker; arranca a ligação à conta
sw = js.index("// Permite instalar como app")
js = js[:sw] + "initCloud();\n"

for bad in ("confirm(", "alert(", "serviceWorker", "pushState"):
    if bad in js:
        raise SystemExit(f"Ainda há '{bad}' no JS do artefacto")

out = f"""<title>Dieta Katia</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=Manrope:wght@400;500;600&display=swap">
<style>
{css}</style>
{body}
<script>
{foods}
{plano}
{js}</script>
"""
pathlib.Path(sys.argv[1]).write_text(out)
print("Gerado:", sys.argv[1])
