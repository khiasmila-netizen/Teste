// ---------- Estado / armazenamento ----------
const STORE_KEY = "dietaTeste.v1";

const defaultState = {
  perfil: null,          // { sexo, idade, altura, peso, atividade, objetivo }
  dias: {},              // { "2026-10-10": { itens: [...], agua: 0 } }
  pesos: [],             // [{ data, kg }]
  alimentosExtra: [],    // alimentos criados pelo utilizador
};

function load() {
  try {
    return { ...defaultState, ...JSON.parse(localStorage.getItem(STORE_KEY)) };
  } catch {
    return structuredClone(defaultState);
  }
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
const allFoods = () => [...FOODS, ...state.alimentosExtra];
function getDay(iso) {
  if (!state.dias[iso]) state.dias[iso] = { itens: [], agua: 0 };
  return state.dias[iso];
}

// ---------- Cálculos ----------
// Mifflin-St Jeor
function calcTargets(p) {
  if (!p) return null;
  const tmb = 10 * p.peso + 6.25 * p.altura - 5 * p.idade + (p.sexo === "m" ? 5 : -161);
  const tdee = tmb * Number(p.atividade);
  const kcal = Math.max(1200, tdee + Number(p.objetivo));
  const prot = p.peso * 1.8;            // g
  const gord = (kcal * 0.25) / 9;       // g
  const hidr = (kcal - prot * 4 - gord * 9) / 4;
  return { tmb, tdee, kcal, p: prot, c: Math.max(0, hidr), g: gord, agua: Math.round(p.peso * 35 / 250) };
}

function totals(itens) {
  return itens.reduce(
    (t, i) => ({ kcal: t.kcal + i.kcal, p: t.p + i.p, c: t.c + i.c, g: t.g + i.g }),
    { kcal: 0, p: 0, c: 0, g: 0 }
  );
}

// ---------- Render: Hoje ----------
function renderHoje() {
  $("#dayPicker").value = currentDay;
  const dia = getDay(currentDay);
  const tgt = calcTargets(state.perfil) || { kcal: 2000, p: 100, c: 250, g: 65, agua: 8 };
  const tot = totals(dia.itens);

  // Anel de calorias
  const left = tgt.kcal - tot.kcal;
  $("#kcalLeft").textContent = round(Math.abs(left));
  $("#kcalLeftLabel").textContent = left >= 0 ? "kcal restantes" : "kcal acima";
  const circ = 2 * Math.PI * 52;
  const ring = $("#ringFg");
  ring.style.strokeDasharray = circ;
  ring.style.strokeDashoffset = circ * (1 - Math.min(1, tot.kcal / tgt.kcal));
  ring.classList.toggle("over", left < 0);

  // Macros
  for (const k of ["p", "c", "g"]) {
    $("#bar" + k.toUpperCase()).style.width = Math.min(100, (tot[k] / tgt[k]) * 100) + "%";
    $("#txt" + k.toUpperCase()).textContent = `${round(tot[k])} / ${round(tgt[k])} g`;
  }

  // Água
  const nCopos = Math.max(tgt.agua, dia.agua);
  const w = $("#water");
  w.innerHTML = "";
  for (let i = 0; i < nCopos; i++) {
    const b = document.createElement("button");
    b.textContent = "💧";
    b.className = i < dia.agua ? "full" : "";
    b.onclick = () => { dia.agua = i < dia.agua ? i : i + 1; save(); renderHoje(); };
    w.appendChild(b);
  }
  $("#waterTxt").textContent = `${dia.agua} de ${tgt.agua} copos (250 ml)`;

  // Refeições
  const meals = $("#meals");
  meals.innerHTML = "";
  if (!dia.itens.length) {
    meals.innerHTML = `<div class="card empty">Ainda não registaste nada neste dia.</div>`;
    return;
  }
  const grupos = {};
  dia.itens.forEach((it, idx) => (grupos[it.refeicao] ||= []).push({ ...it, idx }));
  const ordem = ["Pequeno-almoço", "Almoço", "Lanche", "Jantar", "Ceia"];
  for (const ref of ordem) {
    if (!grupos[ref]) continue;
    const card = document.createElement("div");
    card.className = "card meal";
    const t = totals(grupos[ref]);
    card.innerHTML = `<h2>${ref} <small>${round(t.kcal)} kcal</small></h2><ul class="list"></ul>`;
    const ul = card.querySelector("ul");
    for (const it of grupos[ref]) {
      const li = document.createElement("li");
      li.innerHTML = `<div><div></div><div class="meta">${it.gramas} g · P ${round(it.p)} · H ${round(it.c)} · G ${round(it.g)}</div></div>
        <div>${round(it.kcal)} kcal <button class="del" title="Remover">✕</button></div>`;
      li.querySelector("div > div").textContent = it.nome;
      li.querySelector(".del").onclick = () => { dia.itens.splice(it.idx, 1); save(); renderHoje(); };
      ul.appendChild(li);
    }
    meals.appendChild(card);
  }
}

function fillFoodList() {
  $("#foodList").innerHTML = allFoods()
    .map((f) => `<option value="${f.nome.replace(/"/g, "&quot;")}">${f.kcal} kcal/100g</option>`)
    .join("");
}

// ---------- Render: Perfil ----------
function renderPerfil() {
  const f = $("#profileForm");
  if (state.perfil) for (const [k, v] of Object.entries(state.perfil)) if (f[k]) f[k].value = v;
  const t = calcTargets(state.perfil);
  $("#targets").innerHTML = t
    ? `<h2>As tuas metas diárias</h2><div class="targets">
        <div class="target"><strong>${round(t.kcal)}</strong><span>kcal</span></div>
        <div class="target"><strong>${round(t.p)} g</strong><span>proteína</span></div>
        <div class="target"><strong>${round(t.c)} g</strong><span>hidratos</span></div>
        <div class="target"><strong>${round(t.g)} g</strong><span>gordura</span></div>
        <div class="target"><strong>${round(t.tmb)}</strong><span>metab. basal</span></div>
        <div class="target"><strong>${round(t.tdee)}</strong><span>gasto diário</span></div>
      </div>`
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
    li.innerHTML = `<span>${w.data}</span><span>${w.kg} kg <button class="del" title="Remover">✕</button></span>`;
    li.querySelector(".del").onclick = () => {
      state.pesos = state.pesos.filter((x) => x.data !== w.data);
      save(); renderPeso();
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
  const min = Math.min(...kgs) - 1, max = Math.max(...kgs) + 1;
  const x = (i) => pad + (i * (W - pad - 10)) / (pesos.length - 1);
  const y = (kg) => H - pad + 10 - ((kg - min) / (max - min)) * (H - pad - 10);
  let out = "";
  for (const v of [min, (min + max) / 2, max]) {
    out += `<line class="grid" x1="${pad}" x2="${W - 10}" y1="${y(v)}" y2="${y(v)}"/>
            <text x="2" y="${y(v) + 3}">${v.toFixed(1)}</text>`;
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

$("#prevDay").onclick = () => { currentDay = shiftDay(currentDay, -1); renderHoje(); };
$("#nextDay").onclick = () => { currentDay = shiftDay(currentDay, 1); renderHoje(); };
$("#dayPicker").onchange = (e) => { if (e.target.value) { currentDay = e.target.value; renderHoje(); } };

$("#addForm").onsubmit = (e) => {
  e.preventDefault();
  const nome = $("#food").value.trim();
  const food = allFoods().find((f) => f.nome.toLowerCase() === nome.toLowerCase());
  if (!food) { alert("Alimento não encontrado. Escolhe da lista ou adiciona-o manualmente."); return; }
  const gramas = Number($("#grams").value);
  const k = gramas / 100;
  getDay(currentDay).itens.push({
    refeicao: $("#meal").value, nome: food.nome, gramas,
    kcal: food.kcal * k, p: food.p * k, c: food.c * k, g: food.g * k,
  });
  save();
  $("#food").value = "";
  renderHoje();
};

$("#customForm").onsubmit = (e) => {
  e.preventDefault();
  const novo = {
    nome: $("#cNome").value.trim(),
    kcal: Number($("#cKcal").value), p: Number($("#cP").value),
    c: Number($("#cC").value), g: Number($("#cG").value),
  };
  state.alimentosExtra = state.alimentosExtra.filter((f) => f.nome !== novo.nome).concat(novo);
  save();
  fillFoodList();
  $("#food").value = novo.nome;
  e.target.reset();
  e.target.closest("details").open = false;
};

$("#profileForm").onsubmit = (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  state.perfil = {
    sexo: fd.get("sexo"), idade: +fd.get("idade"), altura: +fd.get("altura"),
    peso: +fd.get("peso"), atividade: fd.get("atividade"), objetivo: fd.get("objetivo"),
  };
  // regista também o peso de hoje
  const hoje = todayISO();
  state.pesos = state.pesos.filter((w) => w.data !== hoje).concat({ data: hoje, kg: state.perfil.peso });
  save();
  renderAll();
};

$("#weightForm").onsubmit = (e) => {
  e.preventDefault();
  const data = $("#wDate").value, kg = Number($("#wVal").value);
  state.pesos = state.pesos.filter((w) => w.data !== data).concat({ data, kg });
  if (state.perfil && data >= (state.pesos.map((w) => w.data).sort().at(-1))) state.perfil.peso = kg;
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

function renderAll() {
  fillFoodList();
  renderHoje();
  renderPerfil();
  renderPeso();
}
renderAll();
