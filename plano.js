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

// Pequenos-almoços e lanches que se repetem ao longo da semana
const PA_AVEIA = { nome: "Papas de aveia com banana e chia", itens: [["Aveia (flocos)", 30], ["Leite magro", 150], ["Banana", 60], ["Sementes de chia", 5]] };
const PA_TOSTA = { nome: "Tostas integrais com queijo fresco e peru", itens: [["Pão integral", 2, "p"], ["Queijo fresco magro", 1, "p"], ["Fiambre de peru", 2, "p"], ["Tomate", 60]] };
const PA_IOGURTE = { nome: "Iogurte grego com morangos e granola", itens: [["Iogurte grego magro", 1, "p"], ["Morangos", 150], ["Granola", 20]] };
const PA_OVO = { nome: "Pão de mistura com ovo e tomate", itens: [["Pão de mistura", 2, "p"], ["Ovo cozido", 1, "p"], ["Tomate", 60]] };

const LM_MACA = { nome: "Maçã", itens: [["Maçã", 1, "p"]] };
const LM_PERA = { nome: "Pera", itens: [["Pera", 1, "p"]] };
const LM_KIWI = { nome: "Kiwi com amêndoas", itens: [["Kiwi", 1, "p"], ["Amêndoas", 10]] };
const LM_LARANJA = { nome: "Laranja", itens: [["Laranja", 1, "p"]] };

const LT_IOGURTE = { nome: "Iogurte natural com nozes", itens: [["Iogurte natural magro", 1, "p"], ["Nozes", 10]] };
const LT_SKYR = { nome: "Skyr com mirtilos", itens: [["Skyr natural", 1, "p"], ["Mirtilos", 50]] };
const LT_BOLACHA = { nome: "Bolachas de arroz com queijo", itens: [["Bolacha de arroz", 2, "p"], ["Queijo flamengo light", 1, "p"]] };

// Pratos principais (rápidos; alguns jantares dão para o almoço do dia seguinte)
const ATUM_GRAO = { nome: "Salada de atum com grão-de-bico", itens: [["Atum em lata (água)", 1, "p"], ["Grão-de-bico cozido", 120], ["Tomate", 100], ["Pepino", 100], ["Cebola", 30], ["Azeite", 5]] };
const FRANGO_ARROZ = { nome: "Frango grelhado com arroz e brócolos", itens: [["Peito de frango grelhado", 120], ["Arroz branco cozido", 80], ["Brócolos cozidos", 150], ["Azeite", 5]] };
const OMELETE = { nome: "Omelete de espinafres com salada", itens: [["Omelete (2 ovos)", 1, "p"], ["Espinafres cozidos", 100], ["Salada mista", 1, "p"], ["Pão integral", 1, "p"]] };
const SALADA_QUINOA = { nome: "Salada de frango com quinoa", itens: [["Peito de frango grelhado", 100], ["Quinoa cozida", 100], ["Tomate", 80], ["Pepino", 80], ["Azeite", 5]] };
const BOLONHESA = { nome: "Esparguete à bolonhesa", itens: [["Carne picada de vaca", 80], ["Esparguete cozido", 100], ["Tomate", 100], ["Cebola", 30]] };
const PESCADA = { nome: "Pescada cozida com batata e feijão-verde", itens: [["Pescada cozida", 150], ["Batata cozida", 150], ["Feijão-verde cozido", 150], ["Azeite", 5]] };
const PERU_CUSCUZ = { nome: "Peru salteado com cuscuz e legumes", itens: [["Peito de peru grelhado", 120], ["Cuscuz cozido", 100], ["Courgette", 100], ["Pimento", 80], ["Azeite", 5]] };
const SALMAO = { nome: "Salmão no forno com batata-doce e salada", itens: [["Salmão grelhado", 100], ["Batata-doce cozida", 150], ["Salada mista", 1, "p"]] };
const DOURADA = { nome: "Dourada grelhada com batata e salada", itens: [["Dourada grelhada", 1, "p"], ["Batata cozida", 150], ["Salada mista", 1, "p"]] };
const PIZZA = { nome: "Fatia de pizza com salada (refeição livre)", itens: [["Pizza", 1, "p"], ["Salada mista", 1, "p"]] };
const BACALHAU = { nome: "Bacalhau cozido com grão e couve", itens: [["Bacalhau cozido", 150], ["Grão-de-bico cozido", 80], ["Couve portuguesa cozida", 100], ["Azeite", 5]] };
const SOPA_OVOS = { nome: "Sopa de legumes com ovos cozidos e tosta", itens: [["Sopa de legumes", 1, "p"], ["Ovo cozido", 2, "p"], ["Pão integral", 1, "p"]] };

const dia = (pa, lm, al, lt, ja) => ({
  "Pequeno-almoço": pa, "Lanche da manhã": lm, "Almoço": al, "Lanche da tarde": lt, "Jantar": ja,
});

PLANOS.push({
  semana: "2026-10-12",
  titulo: "Semana 1 · 1200 kcal",
  notas:
    "Jantares de segunda e quarta: cozinha a dobrar e leva as sobras para o almoço do dia seguinte. " +
    "Pequenos-almoços e lanches repetem-se para facilitar as compras. " +
    "Bebe pelo menos 1,5 L de água por dia. Café e chá sem açúcar não contam calorias. " +
    "O sábado ao jantar é uma refeição mais livre; se comeres fora, regista no Diário o que comeste.",
  dias: [
    dia(PA_AVEIA, LM_MACA, ATUM_GRAO, LT_IOGURTE, FRANGO_ARROZ),      // segunda
    dia(PA_TOSTA, LM_KIWI, FRANGO_ARROZ, LT_SKYR, OMELETE),           // terça
    dia(PA_IOGURTE, LM_PERA, SALADA_QUINOA, LT_BOLACHA, BOLONHESA),            // quarta
    dia(PA_AVEIA, LM_LARANJA, BOLONHESA, LT_IOGURTE, PESCADA),        // quinta
    dia(PA_TOSTA, LM_MACA, PERU_CUSCUZ, LT_SKYR, SALMAO),             // sexta
    dia(PA_IOGURTE, LM_KIWI, DOURADA, LT_BOLACHA, PIZZA),             // sábado
    dia(PA_OVO, LM_PERA, BACALHAU, LT_IOGURTE, SOPA_OVOS),            // domingo
  ],
});
