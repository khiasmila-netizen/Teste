// Planos alimentares semanais.
// Para criar a semana seguinte, acrescenta um objeto a PLANOS com o formato abaixo.
// As calorias e os macros são calculados a partir de foods.js, por isso cada
// ingrediente tem de usar o nome exato de um alimento dessa lista.
//
// {
//   semana: "2026-10-12",          // segunda-feira em que a semana começa
//   titulo: "Semana 1",
//   notas: "Texto opcional com dicas para a semana.",
//   dias: [                        // 7 dias, de segunda a domingo
//     {
//       "Pequeno-almoço": {
//         nome: "Papas de aveia com banana",
//         itens: [
//           ["Aveia (flocos)", 40],          // [alimento, gramas]
//           ["Banana", 1, "p"],              // [alimento, nº de porções, "p"]
//           ["Leite meio-gordo", 200],
//         ],
//       },
//       "Lanche da manhã": { ... },
//       "Almoço": { ... },
//       "Lanche da tarde": { ... },
//       "Jantar": { ... },
//     },
//     ...
//   ],
// }
const PLANOS = [];

// Ajuste único ao perfil da Katia (aplicado uma vez pela app): meta de 1250 kcal definida à mão.
const AJUSTE_PERFIL = { id: "kcal-1250", modoKcal: "manual", kcalManual: 1250 };

// Pequenos-almoços escolhidos pela Katia, alternados (sem lactose; a canela não conta calorias).
// Usar estes também nos planos das semanas seguintes.
const BATIDO_MORANGO = [["Leite magro sem lactose", 150], ["Morangos congelados", 100], ["Whey Protein Decathlon (neutro)", 30]];
const PA_BATIDO = { nome: "Batido de whey com banana, aveia, canela e leite sem lactose", itens: [["Whey Protein Decathlon (neutro)", 30], ["Banana", 60], ["Aveia (flocos)", 20], ["Leite magro sem lactose", 200]] };
const PA_PAO_OVO = { nome: "Pão de mistura com ovo mexido + batido de morango com whey", itens: [["Pão de mistura", 1, "p"], ["Ovos mexidos", 1, "p"], ...BATIDO_MORANGO] };
const PA_PAO_QUEIJO = { nome: "Pão de mistura com Limiano magro e peru fumado + batido de morango com whey", itens: [["Pão de mistura", 1, "p"], ["Queijo flamengo magro (Limiano)", 1, "p"], ["Fiambre de peru fumado", 2, "p"], ...BATIDO_MORANGO] };

// Lanche da tarde: iogurte líquido Go Active (sem lactose) + fruta
const GO_ACTIVE = ["Iogurte líquido proteína Go Active (baunilha)", 1, "p"];
const LT_KIWI_AMENDOAS = { nome: "Go Active com kiwi e amêndoas", itens: [GO_ACTIVE, ["Kiwi", 1, "p"], ["Amêndoas", 10]] };
const LT_LARANJA = { nome: "Go Active com laranja", itens: [GO_ACTIVE, ["Laranja", 1, "p"]] };
const LT_MORANGOS = { nome: "Go Active com morangos", itens: [GO_ACTIVE, ["Morangos", 150]] };
const LT_TANGERINA = { nome: "Go Active com tangerina", itens: [GO_ACTIVE, ["Tangerina", 1, "p"]] };
const LT_MIRTILOS = { nome: "Go Active com mirtilos e amêndoas", itens: [GO_ACTIVE, ["Mirtilos", 100], ["Amêndoas", 10]] };
const LT_ANANAS = { nome: "Go Active com ananás", itens: [GO_ACTIVE, ["Ananás", 1, "p"]] };
const LT_KIWI = { nome: "Go Active com kiwi", itens: [GO_ACTIVE, ["Kiwi", 1, "p"]] };

// Sopa base da Katia (sem cebola nem alho, que lhe incham a barriga)
const SOPA_KATIA = [["Cenoura", 60], ["Courgette", 100], ["Abóbora cozida", 100], ["Espinafres cozidos", 40], ["Batata cozida", 50], ["Azeite", 8]];

// Almoços (gramas de alimentos já cozinhados)
const ATUM_OVO_GRAO = { nome: "Salada de atum com ovo, grão e batata", itens: [["Atum em lata (água)", 1, "p"], ["Ovo cozido", 1, "p"], ["Grão-de-bico cozido", 70], ["Batata cozida", 100], ["Tomate", 100]] };
const FRANGO_ARROZ_FV = { nome: "Frango grelhado com arroz e feijão-verde", itens: [["Peito de frango grelhado", 120], ["Arroz branco cozido", 80], ["Feijão-verde cozido", 150], ["Azeite", 3]] };
const SALADA_QUINOA = { nome: "Salada de frango com quinoa", itens: [["Peito de frango grelhado", 100], ["Quinoa cozida", 100], ["Tomate", 80], ["Pepino", 80], ["Azeite", 5]] };
const SALMAO_BATATA = { nome: "Salmão com batata e espinafres (sobras do jantar de quarta)", itens: [["Salmão grelhado", 100], ["Batata cozida", 150], ["Espinafres cozidos", 100]] };
const PESCADA_FORNO = { nome: "Pescada no forno com batata-doce e cenoura", itens: [["Pescada cozida", 170], ["Batata-doce cozida", 150], ["Cenoura", 80], ["Azeite", 5]] };
const DOURADA = { nome: "Dourada grelhada com batata e salada", itens: [["Dourada grelhada", 1, "p"], ["Batata cozida", 150], ["Salada mista", 1, "p"]] };
const LIVRE = { nome: "Refeição livre (~400–500 kcal; um prato normal, sem buffet). Regista no Diário o que comeres.", itens: [] };

// Jantares
const J_SOPA_FRANGO = { nome: "Sopa + frango grelhado", itens: [...SOPA_KATIA, ["Peito de frango grelhado", 120]] };
const J_SOPA_PESCADA = { nome: "Sopa + pescada cozida", itens: [...SOPA_KATIA, ["Pescada cozida", 170]] };
const J_SOPA_SALMAO = { nome: "Sopa + salmão grelhado (faz o dobro do salmão para o almoço de quinta)", itens: [...SOPA_KATIA, ["Salmão grelhado", 100]] };
const J_SOPA_OMELETE = { nome: "Sopa + omelete de ovos e claras, sem azeite", itens: [...SOPA_KATIA, ["Omelete (2 ovos)", 100], ["Clara de ovo", 100]] };
const CAMARAO_ARROZ = { nome: "Camarão salteado com arroz e legumes", itens: [["Camarão cozido", 150], ["Arroz branco cozido", 100], ["Courgette", 100], ["Pimento", 80], ["Azeite", 5]] };
const SOPA_OVOS = { nome: "Sopa de legumes com ovos cozidos e tosta", itens: [["Sopa de legumes", 1, "p"], ["Ovo cozido", 2, "p"], ["Pão integral", 1, "p"]] };

const dia = (pa, lm, al, lt, ja) => ({
  "Pequeno-almoço": pa, "Lanche da manhã": lm, "Almoço": al, "Lanche da tarde": lt, "Jantar": ja,
});

// Semana tipo, validada pela Katia com o personal trainer (11/10). Repete-se todas as semanas a partir de 12/10.
const SEMANA_TIPO = [
  dia(PA_BATIDO, null, ATUM_OVO_GRAO, LT_KIWI_AMENDOAS, J_SOPA_FRANGO),   // segunda
  dia(PA_PAO_OVO, null, FRANGO_ARROZ_FV, LT_LARANJA, J_SOPA_PESCADA),     // terça
  dia(PA_BATIDO, null, SALADA_QUINOA, LT_MORANGOS, J_SOPA_SALMAO),        // quarta
  dia(PA_PAO_QUEIJO, null, SALMAO_BATATA, LT_TANGERINA, J_SOPA_OMELETE),  // quinta
  dia(PA_BATIDO, null, PESCADA_FORNO, LT_MIRTILOS, J_SOPA_FRANGO),        // sexta
  dia(PA_PAO_OVO, null, DOURADA, LT_ANANAS, CAMARAO_ARROZ),               // sábado
  dia(PA_PAO_QUEIJO, null, LIVRE, LT_KIWI, SOPA_OVOS),                    // domingo
];
const NOTAS_SEMANA =
  "Plano sem lactose. Hidratos de baixa fermentação, por causa do inchaço; a sopa não leva cebola nem alho. " +
  "Não há lanche da manhã: o pequeno-almoço é entre as 10h e as 11h. " +
  "Come devagar e caminha 10 minutos depois do almoço. " +
  "Quarta ao jantar faz o dobro do salmão para o almoço de quinta. " +
  "Domingo ao almoço é refeição livre (~400–500 kcal, um prato normal, sem buffet). " +
  "Bebe pelo menos 1,5 L de água por dia. Café e chá sem açúcar não contam calorias.";

// Repete a semana tipo nas 12 semanas a partir de 12/10 (acrescenta mais quando for preciso)
for (let i = 0; i < 12; i++) {
  const d = new Date("2026-10-12T12:00:00");
  d.setDate(d.getDate() + 7 * i);
  PLANOS.push({
    semana: d.toISOString().slice(0, 10),
    titulo: `Semana ${i + 1} · ~1250 kcal · sem lactose`,
    notas: NOTAS_SEMANA,
    dias: SEMANA_TIPO,
  });
}
