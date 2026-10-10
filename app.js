// ---------- Estado / armazenamento ----------
const STORE_KEY = "dietaTeste.v1";

const REFEICOES = ["Pequeno-almoço", "Lanche da manhã", "Almoço", "Lanche da tarde", "Jantar"];
const RENOMEAR = { "Lanche": "Lanche da tarde", "Ceia": "Jantar" }; // nomes antigos

const defaultState = {
  perfil: null,             // { sexo, idade, altura, peso, atividade, objetivo, modoKcal, kcalManual }
  meta: { pesoInicial: null, pesoMeta: null },
  dias: {},                 // { "2026-10-10": { itens: [...], agua: 0 } }
  pesos: [],                // [{ data, kg }]
  alimentosExtra: [],       // alimentos criados pelo utilizador ou lidos por código de barras
  recentes: [],             // nomes dos últimos alimentos usados
  refeicoesGuardadas: [],   // [{ nome, itens: [...] }]
};

function load() {
  let s;
  try {
    s = { ...structuredClone(defaultState), ...JSON.parse(localStorage.getItem(STORE_KEY)) };
  } catch {
    s = structuredClone(defaultState);
  }
  s.meta ||= { pesoInicial: null, pesoMeta: null };
  // Migra refeições antigas para os nomes novos
  for (const dia of Object.values(s.dias)) {
    for (const it of dia.itens) if (RENOMEAR[it.refeicao]) it.refeicao = RENOMEAR[it.refeicao];
  }
  return s;
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
}

let state = load();
let currentDay = todayISO();

// ---------- Utilitários ----------
function todayISO(d = new Date()) {
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d - off).toISOString().slice(0, 10);
}
function shiftDay(iso, n) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return todayISO(d);
}
const $ = (s) => document.querySelector(s);
const round = (n) => Math.round(n);
const fmtKg = (n) => (Math.round(n * 10) / 10).toLocaleString("pt-PT") + " kg";
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const allFoods = () => [...state.alimentosExtra, ...FOODS];
const findFood = (nome) => allFoods().find((f) => f.nome === nome);
function getDay(iso) {
  if (!state.dias[iso]) state.dias[iso] = { itens: [], agua: 0 };
  return state.dias[iso];
}
function pesoAtual() {
  const ult = [...state.pesos].sort((a, b) => a.data.localeCompare(b.data)).at(-1);
  return ult ? ult.kg : state.perfil?.peso ?? null;
}
function pesoInicial() {
  if (state.meta.pesoInicial) return state.meta.pesoInicial;
  const prim = [...state.pesos].sort((a, b) => a.data.localeCompare(b.data))[0];
  return prim ? prim.kg : state.perfil?.peso ?? null;
}

// ---------- Cálculos ----------
// Mifflin-St Jeor
function calcTargets(p) {
  if (!p) return null;
  const tmb = 10 * p.peso + 6.25 * p.altura - 5 * p.idade + (p.sexo === "m" ? 5 : -161);
  const tdee = tmb * Number(p.atividade);
  const auto = Math.max(1200, tdee + Number(p.objetivo));
  const kcal = p.modoKcal === "manual" && p.kcalManual ? Number(p.kcalManual) : auto;
  const prot = Math.min(p.peso * 1.8, (kcal * 0.35) / 4); // g
  const gord = (kcal * 0.25) / 9;                         // g
  const hidr = (kcal - prot * 4 - gord * 9) / 4;
  return { tmb, tdee, auto, kcal, p: prot, c: Math.max(0, hidr), g: gord, agua: Math.round(p.peso * 35 / 250) };
}
const DEFAULT_TARGETS = { kcal: 2000, p: 100, c: 250, g: 65, agua: 8 };

function totals(itens) {
  return itens.reduce(
    (t, i) => ({ kcal: t.kcal + i.kcal, p: t.p + i.p, c: t.c + i.c, g: t.g + i.g }),
    { kcal: 0, p: 0, c: 0, g: 0 }
  );
}
function makeItem(food, gramas, refeicao) {
  const k = gramas / 100;
  return {
    refeicao, nome: food.nome, gramas,
    kcal: food.kcal * k, p: food.p * k, c: food.c * k, g: food.g * k,
  };
}
function addRecente(nome) {
  state.recentes = [nome, ...state.recentes.filter((n) => n !== nome)].slice(0, 25);
}

// ---------- Render: Diário ----------
function renderDiario() {
  $("#dayPicker").value = currentDay;
  const dia = getDay(currentDay);
  const tgt = calcTargets(state.perfil) || DEFAULT_TARGETS;
  const tot = totals(dia.itens);

  // Meta − Alimentos = Restantes
  const left = tgt.kcal - tot.kcal;
  $("#eqMeta").textContent = round(tgt.kcal);
  $("#eqFood").textContent = round(tot.kcal);
  $("#eqLeft").textContent = round(left);
  $("#eqLeft").parentElement.classList.toggle("over", left < 0);
  $("#eqLeftLabel").textContent = left < 0 ? "Acima" : "Restantes";
  const kb = $("#barKcal");
  kb.style.width = Math.min(100, (tot.kcal / tgt.kcal) * 100) + "%";
  kb.classList.toggle("over", left < 0);

  for (const k of ["p", "c", "g"]) {
    $("#bar" + k.toUpperCase()).style.width = Math.min(100, (tot[k] / tgt[k]) * 100) + "%";
    $("#txt" + k.toUpperCase()).textContent = `${round(tot[k])} / ${round(tgt[k])} g`;
  }

  // Refeições
  const meals = $("#meals");
  meals.innerHTML = "";
  for (const ref of REFEICOES) {
    const itens = dia.itens.map((it, idx) => ({ ...it, idx })).filter((it) => it.refeicao === ref);
    const t = totals(itens);
    const card = document.createElement("div");
    card.className = "card meal";
    card.innerHTML = `
      <div class="meal-head"><h2>${ref}</h2><strong>${round(t.kcal)} kcal</strong></div>
      <ul class="list"></ul>
      <div class="meal-actions">
        <button class="link add">+ Adicionar alimento</button>
        <button class="link more" aria-label="Mais opções">⋯</button>
      </div>
      <div class="meal-menu" hidden>
        <button class="link copy">Copiar de ontem</button>
        <button class="link savemeal" ${itens.length ? "" : "disabled"}>Guardar como refeição</button>
      </div>`;
    const ul = card.querySelector("ul");
    for (const it of itens) {
      const li = document.createElement("li");
      li.className = "tap";
      li.innerHTML = `<div><div class="name"></div><div class="meta">${esc(it.porcaoTxt || it.gramas + " g")} · P ${round(it.p)} · H ${round(it.c)} · G ${round(it.g)}</div></div>
        <div class="kcal">${round(it.kcal)}</div>`;
      li.querySelector(".name").textContent = it.nome;
      li.onclick = () => openSheet(ref, { view: "detail", food: findFood(it.nome) || itemAsFood(it), editIdx: it.idx });
      ul.appendChild(li);
    }
    card.querySelector(".add").onclick = () => openSheet(ref, { view: "search" });
    card.querySelector(".more").onclick = () => {
      const m = card.querySelector(".meal-menu");
      m.hidden = !m.hidden;
    };
    card.querySelector(".copy").onclick = () => copyFromYesterday(ref);
    card.querySelector(".savemeal").onclick = () => openSheet(ref, { view: "saveMeal" });
    meals.appendChild(card);
  }

  // Água
  const nCopos = Math.max(tgt.agua, dia.agua);
  const w = $("#water");
  w.innerHTML = "";
  for (let i = 0; i < nCopos; i++) {
    const b = document.createElement("button");
    b.textContent = "💧";
    b.className = i < dia.agua ? "full" : "";
    b.onclick = () => { dia.agua = i < dia.agua ? i : i + 1; save(); renderDiario(); };
    w.appendChild(b);
  }
  $("#waterTxt").textContent = `${dia.agua} de ${tgt.agua} copos (250 ml)`;
}

// Converte um item registado num "alimento" (por 100 g), caso já não exista na base
function itemAsFood(it) {
  const k = 100 / it.gramas;
  return { nome: it.nome, kcal: it.kcal * k, p: it.p * k, c: it.c * k, g: it.g * k };
}

function copyFromYesterday(ref) {
  const ontem = state.dias[shiftDay(currentDay, -1)];
  const itens = ontem ? ontem.itens.filter((i) => i.refeicao === ref) : [];
  if (!itens.length) { toast(`Não há ${ref.toLowerCase()} registado ontem.`); return; }
  getDay(currentDay).itens.push(...itens.map((i) => ({ ...i })));
  save(); renderDiario();
  toast(`${itens.length} alimento(s) copiados de ontem.`);
}

// ---------- Ecrã de alimentos (sheet) ----------
let sheetRef = null;     // refeição a que se está a adicionar
let sheetStack = [];     // histórico de vistas para o botão "voltar"
let scanStop = null;     // para desligar a câmara

function openSheet(ref, view) {
  history.pushState({ sheet: 1 }, ""); // para o botão "voltar" do Android fechar este ecrã
  sheetRef = ref;
  sheetStack = [];
  $("#sheet").hidden = false;
  document.body.classList.add("noscroll");
  showView(view);
}
function closeSheet() {
  stopScan();
  if ($("#sheet").hidden) return;
  $("#sheet").hidden = true;
  document.body.classList.remove("noscroll");
  if (history.state?.sheet) history.back();
}
function showView(view, push = true) {
  stopScan();
  if (push) sheetStack.push(view);
  $("#sheetBack").style.visibility = sheetStack.length > 1 ? "visible" : "hidden";
  const body = $("#sheetBody");
  body.innerHTML = "";
  body.scrollTop = 0;
  VIEWS[view.view](body, view);
}
function goBack() {
  if (sheetStack.length > 1) { sheetStack.pop(); showView(sheetStack.at(-1), false); }
  else closeSheet();
}
$("#sheetBack").onclick = goBack;
$("#sheetClose").onclick = () => closeSheet();

const VIEWS = {
  // Pesquisa + recentes
  search(body, view) {
    $("#sheetTitle").textContent = sheetRef;
    body.innerHTML = `
      <input type="search" id="q" placeholder="Pesquisar alimento…" autocomplete="off">
      <div class="quick">
        <button class="chip" id="goScan">▥ Código de barras</button>
        <button class="chip" id="goSaved">★ Refeições guardadas</button>
        <button class="chip" id="goNew">+ Criar alimento</button>
      </div>
      <ul class="list" id="results"></ul>`;
    const q = $("#q");
    const draw = () => {
      const term = norm(q.value.trim());
      const ul = $("#results");
      ul.innerHTML = "";
      const addRows = (foods) => {
        for (const f of foods) {
          const li = document.createElement("li");
          li.className = "tap";
          const porc = f.porcao ? `${f.porcao} (${f.porcaoG} g) · ${round(f.kcal * f.porcaoG / 100)} kcal` : `100 g · ${round(f.kcal)} kcal`;
          li.innerHTML = `<div><div class="name"></div><div class="meta">${esc(porc)}</div></div><div class="plus">+</div>`;
          li.querySelector(".name").textContent = f.nome;
          li.onclick = () => showView({ view: "detail", food: f });
          ul.appendChild(li);
        }
      };
      const header = (txt) => {
        const li = document.createElement("li");
        li.className = "list-head";
        li.textContent = txt;
        ul.appendChild(li);
      };
      if (!term) {
        const rec = state.recentes.map(findFood).filter(Boolean);
        if (rec.length) { header("Recentes"); addRows(rec); }
        header("Todos os alimentos");
        addRows(allFoods().filter((f) => !rec.includes(f)).sort((a, b) => a.nome.localeCompare(b.nome, "pt")));
      } else {
        const words = term.split(/\s+/);
        const foods = allFoods().filter((f) => words.every((w) => norm(f.nome).includes(w)));
        foods.sort((a, b) => norm(a.nome).indexOf(words[0]) - norm(b.nome).indexOf(words[0]));
        header(foods.length ? "Resultados" : "Sem resultados — cria o alimento ou lê o código de barras");
        addRows(foods.slice(0, 80));
      }
    };
    q.oninput = draw;
    draw();
    $("#goScan").onclick = () => showView({ view: "scan" });
    $("#goSaved").onclick = () => showView({ view: "saved" });
    $("#goNew").onclick = () => showView({ view: "newFood", nome: q.value.trim() });
  },

  // Quantidade + confirmar (também serve para editar)
  detail(body, { food, editIdx, code }) {
    const editing = editIdx != null;
    const item = editing ? getDay(currentDay).itens[editIdx] : null;
    $("#sheetTitle").textContent = editing ? "Editar alimento" : "Adicionar alimento";
    const temPorcao = !!food.porcao;
    body.innerHTML = `
      <div class="food-title"></div>
      <div class="qty">
        <label>Quantidade <input type="number" id="qtd" min="0" step="any" inputmode="decimal"></label>
        <label>Unidade
          <select id="unid">
            ${temPorcao ? `<option value="p">${esc(food.porcao)} (${food.porcaoG} g)</option>` : ""}
            <option value="g">gramas (g)</option>
          </select>
        </label>
      </div>
      ${editing ? "" : `<label class="qty-meal">Refeição <select id="refSel">${REFEICOES.map((r) => `<option ${r === sheetRef ? "selected" : ""}>${r}</option>`).join("")}</select></label>`}
      <div class="preview">
        <div class="kcal-big"><strong id="pvK">0</strong><span>kcal</span></div>
        <div class="pv"><strong id="pvP">0</strong><span>Proteína</span></div>
        <div class="pv"><strong id="pvC">0</strong><span>Hidratos</span></div>
        <div class="pv"><strong id="pvG">0</strong><span>Gordura</span></div>
      </div>
      <button type="button" class="primary block" id="confirm">${editing ? "Guardar alterações" : "Adicionar"}</button>
      ${editing ? `<button type="button" class="danger-link block" id="remove">Remover do diário</button>` : ""}`;
    body.querySelector(".food-title").textContent = food.nome;
    const qtd = $("#qtd"), unid = $("#unid");
    if (item) {
      if (temPorcao && item.porcoes) { unid.value = "p"; qtd.value = item.porcoes; }
      else { unid.value = "g"; qtd.value = item.gramas; }
    } else {
      qtd.value = temPorcao ? 1 : 100;
    }
    const grams = () => (Number(qtd.value) || 0) * (unid.value === "p" ? food.porcaoG : 1);
    const upd = () => {
      const k = grams() / 100;
      $("#pvK").textContent = round(food.kcal * k);
      $("#pvP").textContent = round(food.p * k) + " g";
      $("#pvC").textContent = round(food.c * k) + " g";
      $("#pvG").textContent = round(food.g * k) + " g";
    };
    qtd.oninput = upd;
    unid.onchange = () => {
      qtd.value = unid.value === "p" ? 1 : food.porcaoG || 100;
      upd();
    };
    upd();
    $("#confirm").onclick = () => {
      const g = grams();
      if (g <= 0) { qtd.focus(); return; }
      const ref = editing ? item.refeicao : $("#refSel").value;
      const novo = makeItem(food, g, ref);
      if (unid.value === "p") {
        novo.porcoes = Number(qtd.value);
        novo.porcaoTxt = novo.porcoes === 1 ? food.porcao : `${novo.porcoes} × ${food.porcao}`;
      }
      if (code) novo.code = code;
      const itens = getDay(currentDay).itens;
      if (editing) itens[editIdx] = novo; else itens.push(novo);
      addRecente(food.nome);
      save(); renderDiario(); closeSheet();
      toast(editing ? "Alterações guardadas." : `Adicionado a ${ref}.`);
    };
    if (editing) $("#remove").onclick = () => {
      getDay(currentDay).itens.splice(editIdx, 1);
      save(); renderDiario(); closeSheet();
      toast("Removido.");
    };
  },

  // Criar alimento manualmente (ou completar um lido por código de barras)
  newFood(body, { nome = "", code = "", base = {} }) {
    $("#sheetTitle").textContent = "Criar alimento";
    body.innerHTML = `
      <form id="nf" class="grid-form">
        <label class="full">Nome <input id="nfNome" required></label>
        <label>kcal por 100 g <input type="number" id="nfK" min="0" step="any" required></label>
        <label>Proteína (g/100 g) <input type="number" id="nfP" min="0" step="any" value="0"></label>
        <label>Hidratos (g/100 g) <input type="number" id="nfC" min="0" step="any" value="0"></label>
        <label>Gordura (g/100 g) <input type="number" id="nfG" min="0" step="any" value="0"></label>
        <label>Porção (opcional) <input id="nfPor" placeholder="ex.: 1 iogurte"></label>
        <label>Gramas da porção <input type="number" id="nfPorG" min="0" step="any"></label>
        <button type="submit">Guardar e continuar</button>
      </form>
      <p class="muted small">Encontras estes valores na tabela nutricional da embalagem (coluna "por 100 g").</p>`;
    $("#nfNome").value = nome || base.nome || "";
    for (const [id, k] of [["nfK", "kcal"], ["nfP", "p"], ["nfC", "c"], ["nfG", "g"]]) if (base[k] != null) $("#" + id).value = base[k];
    $("#nf").onsubmit = (e) => {
      e.preventDefault();
      const f = {
        nome: $("#nfNome").value.trim(),
        kcal: Number($("#nfK").value), p: Number($("#nfP").value) || 0,
        c: Number($("#nfC").value) || 0, g: Number($("#nfG").value) || 0,
      };
      const por = $("#nfPor").value.trim(), porG = Number($("#nfPorG").value);
      if (por && porG > 0) { f.porcao = por; f.porcaoG = porG; }
      if (code) f.code = code;
      state.alimentosExtra = state.alimentosExtra.filter((x) => x.nome !== f.nome && (!code || x.code !== code)).concat(f);
      save();
      showView({ view: "detail", food: f, code });
    };
  },

  // Refeições guardadas
  saved(body) {
    $("#sheetTitle").textContent = "Refeições guardadas";
    if (!state.refeicoesGuardadas.length) {
      body.innerHTML = `<p class="empty">Ainda não tens refeições guardadas.<br>No diário, toca em <b>⋯</b> numa refeição e escolhe <b>Guardar como refeição</b>.</p>`;
      return;
    }
    body.innerHTML = `<p class="muted small">Toca numa refeição para a adicionar a <b>${esc(sheetRef)}</b>.</p><ul class="list" id="savedList"></ul>`;
    const ul = $("#savedList");
    state.refeicoesGuardadas.forEach((r, i) => {
      const t = totals(r.itens);
      const li = document.createElement("li");
      li.className = "tap";
      li.innerHTML = `<div><div class="name"></div><div class="meta"></div></div>
        <div class="row-actions"><span class="kcal">${round(t.kcal)}</span><button class="del" aria-label="Apagar">✕</button></div>`;
      li.querySelector(".name").textContent = r.nome;
      li.querySelector(".meta").textContent = r.itens.map((x) => x.nome).join(", ");
      li.onclick = () => {
        getDay(currentDay).itens.push(...r.itens.map((x) => ({ ...x, refeicao: sheetRef })));
        r.itens.forEach((x) => addRecente(x.nome));
        save(); renderDiario(); closeSheet();
        toast(`"${r.nome}" adicionada a ${sheetRef}.`);
      };
      li.querySelector(".del").onclick = (e) => {
        e.stopPropagation();
        state.refeicoesGuardadas.splice(i, 1);
        save(); showView({ view: "saved" }, false);
      };
      ul.appendChild(li);
    });
  },

  // Guardar a refeição atual com um nome
  saveMeal(body) {
    $("#sheetTitle").textContent = "Guardar refeição";
    const itens = getDay(currentDay).itens.filter((i) => i.refeicao === sheetRef);
    body.innerHTML = `
      <form id="sm" class="grid-form">
        <label class="full">Nome da refeição <input id="smNome" required></label>
        <button type="submit">Guardar</button>
      </form>
      <h3>Inclui</h3>
      <ul class="list">${itens.map((i) => `<li><span>${esc(i.nome)}</span><span class="kcal">${round(i.kcal)}</span></li>`).join("")}</ul>`;
    $("#smNome").value = `${sheetRef} habitual`;
    $("#sm").onsubmit = (e) => {
      e.preventDefault();
      const nome = $("#smNome").value.trim();
      const limpos = itens.map(({ refeicao, ...x }) => x);
      state.refeicoesGuardadas = state.refeicoesGuardadas.filter((r) => r.nome !== nome).concat({ nome, itens: limpos });
      save(); closeSheet();
      toast(`Refeição "${nome}" guardada.`);
    };
  },

  // Código de barras
  scan(body) {
    $("#sheetTitle").textContent = "Código de barras";
    const temDetector = "BarcodeDetector" in window && navigator.mediaDevices?.getUserMedia;
    body.innerHTML = `
      ${temDetector ? `<div class="scan-box"><video id="cam" playsinline muted></video><div class="scan-line"></div></div>
      <p class="muted small" id="scanMsg">Aponta a câmara para o código de barras.</p>` :
      `<p class="muted small">Este telemóvel não permite ler códigos com a câmara aqui. Escreve os números do código de barras.</p>`}
      <form id="codeForm" class="add-form">
        <input id="codeIn" inputmode="numeric" placeholder="Ou escreve o código (ex.: 5601234567890)" pattern="[0-9]{6,14}">
        <button type="submit">Procurar</button>
      </form>`;
    $("#codeForm").onsubmit = (e) => { e.preventDefault(); const c = $("#codeIn").value.trim(); if (c) lookupBarcode(c); };
    if (temDetector) startScan();
  },

  loading(body, { msg }) {
    body.innerHTML = `<p class="empty">${esc(msg)}</p>`;
  },
};

async function startScan() {
  const video = $("#cam");
  let stream, raf, stopped = false;
  scanStop = () => {
    stopped = true;
    cancelAnimationFrame(raf);
    stream?.getTracks().forEach((t) => t.stop());
  };
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    if (stopped) { stream.getTracks().forEach((t) => t.stop()); return; }
    video.srcObject = stream;
    await video.play();
    const detector = new BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e"] });
    const tick = async () => {
      if (stopped) return;
      try {
        const codes = await detector.detect(video);
        if (codes.length) { const c = codes[0].rawValue; stopScan(); if (navigator.vibrate) navigator.vibrate(80); lookupBarcode(c); return; }
      } catch {}
      raf = requestAnimationFrame(tick);
    };
    tick();
  } catch {
    const m = $("#scanMsg");
    if (m) m.textContent = "Não foi possível abrir a câmara. Autoriza a câmara nas definições ou escreve o código em baixo.";
  }
}
function stopScan() {
  if (scanStop) { scanStop(); scanStop = null; }
}

async function lookupBarcode(code) {
  // Já guardado antes?
  const local = state.alimentosExtra.find((f) => f.code === code);
  if (local) { showView({ view: "detail", food: local, code }); return; }
  showView({ view: "loading", msg: `A procurar o código ${code}…` });
  try {
    const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,product_name_pt,brands,nutriments,serving_size,serving_quantity`);
    const data = await r.json();
    const p = data.product;
    const n = p?.nutriments || {};
    const kcal = n["energy-kcal_100g"] ?? (n["energy_100g"] ? n["energy_100g"] / 4.184 : null);
    if (!p || kcal == null) throw new Error("sem dados");
    const nome = [p.product_name_pt || p.product_name || "Produto " + code, p.brands?.split(",")[0]].filter(Boolean).join(" · ");
    const f = {
      nome, code,
      kcal: +kcal.toFixed(1), p: +(n.proteins_100g || 0), c: +(n.carbohydrates_100g || 0), g: +(n.fat_100g || 0),
    };
    if (p.serving_quantity > 0) { f.porcao = "1 porção"; f.porcaoG = +p.serving_quantity; }
    state.alimentosExtra = state.alimentosExtra.filter((x) => x.code !== code && x.nome !== f.nome).concat(f);
    save();
    sheetStack.pop(); // tira o "a procurar…" do histórico
    showView({ view: "detail", food: f, code });
  } catch {
    sheetStack.pop();
    showView({ view: "newFood", code, nome: "" });
    toast(navigator.onLine === false ? "Sem internet. Introduz os valores manualmente." : "Produto não encontrado. Introduz os valores da embalagem.");
  }
}

// ---------- Plano alimentar semanal ----------
const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const DIAS_CURTOS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
let planoSemana = mondayOf(todayISO());
let planoDia = (new Date().getDay() + 6) % 7; // 0 = segunda
// Sem plano para esta semana? Abre o próximo plano disponível (ex.: a semana seguinte)
if (!PLANOS.some((p) => p.semana === planoSemana)) {
  const prox = PLANOS.map((p) => p.semana).filter((w) => w > planoSemana).sort()[0];
  if (prox) { planoSemana = prox; planoDia = 0; }
}
function setPlanoSemana(w) {
  planoSemana = w;
  const hoje = todayISO();
  planoDia = hoje >= w && hoje <= shiftDay(w, 6) ? (new Date().getDay() + 6) % 7 : 0;
  renderPlano();
}

function mondayOf(iso) {
  const d = new Date(iso + "T12:00:00");
  return shiftDay(iso, -((d.getDay() + 6) % 7));
}
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
function fmtDiaMes(iso) {
  const d = new Date(iso + "T12:00:00");
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}

// Converte um ingrediente do plano num item do diário (com kcal e macros)
function planItem([nome, qtd, tipo], refeicao) {
  const food = findFood(nome);
  if (!food) return null;
  const porcoes = tipo === "p" && food.porcao ? qtd : null;
  const item = makeItem(food, porcoes ? qtd * food.porcaoG : qtd, refeicao);
  if (porcoes) {
    item.porcoes = porcoes;
    item.porcaoTxt = porcoes === 1 ? food.porcao : `${porcoes} × ${food.porcao}`;
  }
  return item;
}
function planMeal(plano, dia, ref) {
  const r = plano.dias[dia]?.[ref];
  if (!r) return null;
  const itens = r.itens.map((i) => planItem(i, ref));
  return { ...r, itens: itens.filter(Boolean), faltam: r.itens.filter((_, k) => !itens[k]).map((i) => i[0]) };
}
const planTag = (plano, dia, ref) => `${plano.semana}|${dia}|${ref}`;
function inDiary(plano, dia, ref) {
  const d = state.dias[shiftDay(plano.semana, dia)];
  return !!d && d.itens.some((i) => i.plano === planTag(plano, dia, ref));
}
function addMealToDiary(plano, dia, ref) {
  const m = planMeal(plano, dia, ref);
  if (!m || inDiary(plano, dia, ref)) return 0;
  const tag = planTag(plano, dia, ref);
  getDay(shiftDay(plano.semana, dia)).itens.push(...m.itens.map((i) => ({ ...i, plano: tag })));
  m.itens.forEach((i) => addRecente(i.nome));
  return 1;
}
function removeMealFromDiary(plano, dia, ref) {
  const d = state.dias[shiftDay(plano.semana, dia)];
  if (d) d.itens = d.itens.filter((i) => i.plano !== planTag(plano, dia, ref));
}

function renderPlano() {
  const plano = PLANOS.find((p) => p.semana === planoSemana);
  $("#weekLabel").innerHTML = `<strong>${fmtDiaMes(planoSemana)} a ${fmtDiaMes(shiftDay(planoSemana, 6))}</strong><span>${plano ? esc(plano.titulo || "Plano semanal") : "Sem plano"}</span>`;
  const body = $("#planoBody");

  if (!plano) {
    const outras = PLANOS.map((p) => p.semana).sort();
    body.innerHTML = `<div class="card empty">
      <p><strong>Ainda não há plano para esta semana.</strong></p>
      <p>Pede ao Claude um plano novo e ele aparece aqui. Depois escolhes o que queres passar para o Diário.</p>
      ${outras.length ? `<button class="link" id="lastPlan">Ver o plano mais recente</button>` : ""}
    </div>`;
    if (outras.length) $("#lastPlan").onclick = () => setPlanoSemana(outras.at(-1));
    return;
  }

  const tgt = calcTargets(state.perfil) || DEFAULT_TARGETS;
  const data = shiftDay(plano.semana, planoDia);
  const refs = REFEICOES.map((ref) => ({ ref, m: planMeal(plano, planoDia, ref) })).filter((x) => x.m);
  const totDia = totals(refs.flatMap((x) => x.m.itens));

  // Média da semana
  const diasCom = plano.dias.map((_, d) => totals(REFEICOES.flatMap((r) => planMeal(plano, d, r)?.itens || []))).filter((t) => t.kcal > 0);
  const media = diasCom.length ? diasCom.reduce((a, t) => a + t.kcal, 0) / diasCom.length : 0;

  body.innerHTML = `
    <div class="day-chips">${DIAS_CURTOS.map((d, i) => `<button class="day-chip ${i === planoDia ? "active" : ""} ${shiftDay(plano.semana, i) === todayISO() ? "today" : ""}" data-d="${i}">${d}<small>${new Date(shiftDay(plano.semana, i) + "T12:00:00").getDate()}</small></button>`).join("")}</div>

    <div class="card plan-summary">
      <div class="meal-head"><h2>${DIAS_SEMANA[planoDia]}, ${fmtDiaMes(data)}</h2><strong>${round(totDia.kcal)} kcal</strong></div>
      <div class="macros">
        <div class="macro"><span>Proteína</span><div class="bar"><i class="bp" style="width:${Math.min(100, totDia.p / tgt.p * 100)}%"></i></div><small>${round(totDia.p)} / ${round(tgt.p)} g</small></div>
        <div class="macro"><span>Hidratos</span><div class="bar"><i class="bc" style="width:${Math.min(100, totDia.c / tgt.c * 100)}%"></i></div><small>${round(totDia.c)} / ${round(tgt.c)} g</small></div>
        <div class="macro"><span>Gordura</span><div class="bar"><i class="bg" style="width:${Math.min(100, totDia.g / tgt.g * 100)}%"></i></div><small>${round(totDia.g)} / ${round(tgt.g)} g</small></div>
      </div>
      <p class="muted small">A tua meta: ${round(tgt.kcal)} kcal/dia · Média do plano: ${round(media)} kcal/dia</p>
      ${refs.length ? `<button class="primary block" id="addDay">Adicionar o dia todo ao Diário</button>` : ""}
    </div>

    <div id="planMeals"></div>
    ${plano.notas ? `<div class="card"><h2>Notas da semana</h2><p class="notes"></p></div>` : ""}`;

  if (plano.notas) body.querySelector(".notes").textContent = plano.notas;
  body.querySelectorAll(".day-chip").forEach((b) => (b.onclick = () => { planoDia = +b.dataset.d; renderPlano(); }));
  const addDay = $("#addDay");
  if (addDay) {
    const todos = refs.every((x) => inDiary(plano, planoDia, x.ref));
    addDay.disabled = todos;
    addDay.textContent = todos ? "✓ Dia todo no Diário" : "Adicionar o dia todo ao Diário";
    addDay.onclick = () => {
      const n = refs.reduce((a, x) => a + addMealToDiary(plano, planoDia, x.ref), 0);
      save(); renderAll();
      toast(`${n} refeição(ões) adicionadas ao Diário de ${fmtDiaMes(data)}.`);
    };
  }

  const wrap = $("#planMeals");
  if (!refs.length) {
    wrap.innerHTML = `<div class="card empty">Este dia ainda não tem refeições no plano.</div>`;
    return;
  }
  for (const { ref, m } of refs) {
    const t = totals(m.itens);
    const added = inDiary(plano, planoDia, ref);
    const card = document.createElement("div");
    card.className = "card plan-meal" + (added ? " added" : "");
    card.innerHTML = `
      <div class="meal-head"><h2>${ref}</h2><strong>${round(t.kcal)} kcal</strong></div>
      <div class="dish"></div>
      <div class="macro-pills"><span class="pill p">P ${round(t.p)} g</span><span class="pill c">H ${round(t.c)} g</span><span class="pill g">G ${round(t.g)} g</span></div>
      <ul class="list ingredients"></ul>
      ${m.faltam.length ? `<p class="small warn">Sem dados nutricionais: ${esc(m.faltam.join(", "))}</p>` : ""}
      <div class="meal-actions">
        ${added
          ? `<span class="in-diary">✓ No Diário</span><button class="link undo">Retirar</button>`
          : `<button class="link add">+ Adicionar ao Diário</button>`}
      </div>`;
    card.querySelector(".dish").textContent = m.nome || "";
    const ul = card.querySelector(".ingredients");
    for (const it of m.itens) {
      const li = document.createElement("li");
      li.innerHTML = `<div><div class="name"></div><div class="meta">${esc(it.porcaoTxt || it.gramas + " g")}</div></div><div class="kcal">${round(it.kcal)}</div>`;
      li.querySelector(".name").textContent = it.nome;
      ul.appendChild(li);
    }
    const add = card.querySelector(".add");
    if (add) add.onclick = () => { addMealToDiary(plano, planoDia, ref); save(); renderAll(); toast(`${ref} adicionado ao Diário de ${fmtDiaMes(data)}.`); };
    const undo = card.querySelector(".undo");
    if (undo) undo.onclick = () => { removeMealFromDiary(plano, planoDia, ref); save(); renderAll(); toast(`${ref} retirado do Diário.`); };
    wrap.appendChild(card);
  }
}

$("#prevWeek").onclick = () => setPlanoSemana(shiftDay(planoSemana, -7));
$("#nextWeek").onclick = () => setPlanoSemana(shiftDay(planoSemana, 7));

// ---------- Aviso rápido ----------
let toastTimer;
function toast(msg) {
  let t = $("#toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2500);
}

// ---------- Render: Perfil ----------
function renderPerfil() {
  const f = $("#profileForm");
  if (state.perfil) for (const [k, v] of Object.entries(state.perfil)) if (f[k] && v != null) f[k].value = v;
  const atual = pesoAtual();
  if (atual) f.peso.value = atual;
  $("#kcalManualWrap").hidden = f.modoKcal.value !== "manual";

  // A minha meta
  const ini = pesoInicial(), meta = state.meta.pesoMeta;
  $("#gInicial").textContent = ini ? fmtKg(ini) : "–";
  $("#gAtual").textContent = atual ? fmtKg(atual) : "–";
  $("#gMeta").textContent = meta ? fmtKg(meta) : "–";
  $("#pesoInicial").value = ini ?? "";
  $("#pesoMeta").value = meta ?? "";
  const faltamEl = $("#gFaltam"), bar = $("#gBar"), prog = $("#gProgress");
  if (atual && meta) {
    const diff = atual - meta;
    const perder = ini ? ini >= meta : diff >= 0;
    if ((perder && diff <= 0) || (!perder && diff >= 0)) {
      faltamEl.innerHTML = `<strong>Meta atingida!</strong> 🎉`;
    } else {
      faltamEl.innerHTML = `Faltam <strong>${fmtKg(Math.abs(diff))}</strong> para a meta`;
    }
    if (ini && ini !== meta) {
      const feito = perder ? ini - atual : atual - ini;
      const pct = Math.max(0, Math.min(100, (feito / Math.abs(ini - meta)) * 100));
      bar.style.width = pct + "%";
      prog.textContent = `${feito >= 0 ? (perder ? "Já perdeste" : "Já ganhaste") : (perder ? "Ganhaste" : "Perdeste")} ${fmtKg(Math.abs(feito))} · ${round(pct)}% do caminho`;
    } else { bar.style.width = "0"; prog.textContent = ""; }
  } else {
    faltamEl.textContent = "Define o teu peso meta para ver quanto falta.";
    bar.style.width = "0"; prog.textContent = "";
  }

  const t = calcTargets(state.perfil);
  $("#targets").innerHTML = t
    ? `<h2>As tuas metas diárias</h2><div class="targets">
        <div class="target"><strong>${round(t.kcal)}</strong><span>kcal${state.perfil.modoKcal === "manual" ? " (manual)" : ""}</span></div>
        <div class="target"><strong>${round(t.p)} g</strong><span>proteína</span></div>
        <div class="target"><strong>${round(t.c)} g</strong><span>hidratos</span></div>
        <div class="target"><strong>${round(t.g)} g</strong><span>gordura</span></div>
        <div class="target"><strong>${round(t.tmb)}</strong><span>metab. basal</span></div>
        <div class="target"><strong>${round(t.tdee)}</strong><span>gasto diário</span></div>
      </div>
      ${state.perfil.modoKcal === "manual" ? `<p class="muted small">Pelo perfil seriam ${round(t.auto)} kcal.</p>` : ""}`
    : `<p class="empty">Preenche o perfil para calcular as tuas metas.<br>(Até lá usamos 2000 kcal.)</p>`;
}

// ---------- Render: Peso ----------
function renderPeso() {
  $("#wDate").value ||= todayISO();
  const pesos = [...state.pesos].sort((a, b) => a.data.localeCompare(b.data));
  const ul = $("#weightList");
  ul.innerHTML = "";
  [...pesos].reverse().forEach((w) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${w.data}</span><span class="row-actions">${w.kg} kg <button class="del" title="Remover">✕</button></span>`;
    li.querySelector(".del").onclick = () => {
      state.pesos = state.pesos.filter((x) => x.data !== w.data);
      save(); renderAll();
    };
    ul.appendChild(li);
  });

  const svg = $("#chart");
  if (pesos.length < 2) {
    svg.innerHTML = `<text x="160" y="80" text-anchor="middle">Regista pelo menos 2 pesos para ver o gráfico</text>`;
    return;
  }
  const W = 320, H = 160, pad = 28;
  const kgs = pesos.map((p) => p.kg);
  if (state.meta.pesoMeta) kgs.push(state.meta.pesoMeta);
  const min = Math.min(...kgs) - 1, max = Math.max(...kgs) + 1;
  const x = (i) => pad + (i * (W - pad - 10)) / (pesos.length - 1);
  const y = (kg) => H - pad + 10 - ((kg - min) / (max - min)) * (H - pad - 10);
  let out = "";
  for (const v of [min, (min + max) / 2, max]) {
    out += `<line class="grid" x1="${pad}" x2="${W - 10}" y1="${y(v)}" y2="${y(v)}"/>
            <text x="2" y="${y(v) + 3}">${v.toFixed(1)}</text>`;
  }
  if (state.meta.pesoMeta) {
    const ym = y(state.meta.pesoMeta);
    out += `<line class="goal" x1="${pad}" x2="${W - 10}" y1="${ym}" y2="${ym}"/>
            <text x="${W - 12}" y="${ym - 3}" text-anchor="end" class="goal-txt">meta</text>`;
  }
  out += `<polyline class="line" points="${pesos.map((p, i) => `${x(i)},${y(p.kg)}`).join(" ")}"/>`;
  out += pesos.map((p, i) => `<circle class="dot" cx="${x(i)}" cy="${y(p.kg)}" r="3"><title>${p.data}: ${p.kg} kg</title></circle>`).join("");
  out += `<text x="${pad}" y="${H - 2}">${pesos[0].data}</text>
          <text x="${W - 10}" y="${H - 2}" text-anchor="end">${pesos.at(-1).data}</text>`;
  svg.innerHTML = out;
}

// ---------- Eventos ----------
document.querySelectorAll(".tab").forEach((btn) =>
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab, .panel").forEach((el) => el.classList.remove("active"));
    btn.classList.add("active");
    $("#" + btn.dataset.tab).classList.add("active");
  })
);

$("#prevDay").onclick = () => { currentDay = shiftDay(currentDay, -1); renderDiario(); };
$("#nextDay").onclick = () => { currentDay = shiftDay(currentDay, 1); renderDiario(); };
$("#dayPicker").onchange = (e) => { if (e.target.value) { currentDay = e.target.value; renderDiario(); } };

$("#modoKcal").onchange = (e) => {
  $("#kcalManualWrap").hidden = e.target.value !== "manual";
  if (e.target.value === "manual" && !$("#kcalManual").value) {
    const t = calcTargets(state.perfil);
    if (t) $("#kcalManual").value = round(t.auto);
  }
};

$("#profileForm").onsubmit = (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  state.perfil = {
    sexo: fd.get("sexo"), idade: +fd.get("idade"), altura: +fd.get("altura"),
    peso: +fd.get("peso"), atividade: fd.get("atividade"), objetivo: fd.get("objetivo"),
    modoKcal: fd.get("modoKcal"), kcalManual: fd.get("kcalManual") ? +fd.get("kcalManual") : null,
  };
  if (!state.meta.pesoInicial) state.meta.pesoInicial = pesoInicial() ?? state.perfil.peso;
  // regista também o peso de hoje, se mudou
  if (state.perfil.peso !== pesoAtual() || !state.pesos.length) {
    const hoje = todayISO();
    state.pesos = state.pesos.filter((w) => w.data !== hoje).concat({ data: hoje, kg: state.perfil.peso });
  }
  save();
  renderAll();
  toast("Perfil guardado.");
};

$("#goalForm").onsubmit = (e) => {
  e.preventDefault();
  const ini = Number($("#pesoInicial").value), meta = Number($("#pesoMeta").value);
  state.meta.pesoInicial = ini || null;
  state.meta.pesoMeta = meta || null;
  save();
  renderAll();
  toast("Meta guardada.");
};

$("#weightForm").onsubmit = (e) => {
  e.preventDefault();
  const data = $("#wDate").value, kg = Number($("#wVal").value);
  state.pesos = state.pesos.filter((w) => w.data !== data).concat({ data, kg });
  if (!state.meta.pesoInicial) state.meta.pesoInicial = pesoInicial();
  if (state.perfil) state.perfil.peso = pesoAtual();
  save();
  $("#wVal").value = "";
  renderAll();
};

$("#resetBtn").onclick = () => {
  if (!confirm("Apagar todos os dados? Esta ação não pode ser desfeita.")) return;
  state = structuredClone(defaultState);
  save();
  renderAll();
};

// Botão "voltar" do Android fecha o ecrã de alimentos em vez de sair da app
window.addEventListener("popstate", () => closeSheet());

function renderAll() {
  renderDiario();
  renderPlano();
  renderPerfil();
  renderPeso();
}
renderAll();

// Permite instalar como app (precisa de https, ex.: GitHub Pages)
if ("serviceWorker" in navigator && location.protocol === "https:") {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register("sw.js", { updateViaCache: "none" });
  // Quando chega uma versão nova, recarrega uma vez para a mostrar
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hadController && !reloaded) { reloaded = true; location.reload(); }
  });
}
