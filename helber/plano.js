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
const PA_AVEIA = { nome: "Papas de aveia proteicas com banana", itens: [["Aveia (flocos)", 50], ["Leite magro", 250], ["Banana", 1, "p"], ["Proteína whey (pó)", 15]] };
const PA_TOSTA = { nome: "Tostas integrais com ovos e peru", itens: [["Pão integral", 2, "p"], ["Ovo cozido", 2, "p"], ["Fiambre de peru", 3, "p"], ["Tomate", 80]] };
const PA_SKYR = { nome: "Skyr com morangos, granola e nozes", itens: [["Skyr natural", 1, "p"], ["Morangos", 150], ["Granola", 40], ["Nozes", 10]] };
const PA_OMELETE = { nome: "Omelete com pão de mistura e sumo de laranja", itens: [["Omelete (2 ovos)", 1, "p"], ["Pão de mistura", 2, "p"], ["Sumo de laranja natural", 1, "p"]] };

const LM_BANANA = { nome: "Banana com amêndoas", itens: [["Banana", 1, "p"], ["Amêndoas", 15]] };
const LM_MACA = { nome: "Maçã com manteiga de amendoim", itens: [["Maçã", 1, "p"], ["Manteiga de amendoim", 15]] };
const LM_IOGURTE = { nome: "Iogurte grego com kiwi", itens: [["Iogurte grego magro", 1, "p"], ["Kiwi", 1, "p"]] };

const LT_SKYR = { nome: "Skyr com mirtilos e amêndoas", itens: [["Skyr natural", 1, "p"], ["Mirtilos", 100], ["Amêndoas", 10]] };
const LT_TOSTA_ATUM = { nome: "Tostas integrais com atum", itens: [["Pão integral", 2, "p"], ["Atum em lata (água)", 1, "p"], ["Tomate", 50]] };
const LT_BOLACHAS = { nome: "Bolachas de arroz com queijo fresco e peru", itens: [["Bolacha de arroz", 3, "p"], ["Queijo fresco magro", 1, "p"], ["Fiambre de peru", 2, "p"]] };
const LT_BATIDO = { nome: "Batido de proteína com banana", itens: [["Proteína whey (pó)", 1, "p"], ["Leite magro", 250], ["Banana", 60]] };

// Pratos principais (rápidos; alguns jantares dão para o almoço do dia seguinte)
const ATUM_GRAO = { nome: "Salada de atum com grão-de-bico", itens: [["Atum em lata (água)", 2, "p"], ["Grão-de-bico cozido", 120], ["Tomate", 100], ["Pepino", 100], ["Cebola", 30], ["Azeite", 5]] };
const FRANGO_ARROZ = { nome: "Frango grelhado com arroz e brócolos", itens: [["Peito de frango grelhado", 180], ["Arroz branco cozido", 120], ["Brócolos cozidos", 150], ["Azeite", 5]] };
const OMELETE = { nome: "Omelete de espinafres com batata e salada", itens: [["Omelete (2 ovos)", 1, "p"], ["Clara de ovo", 3, "p"], ["Espinafres cozidos", 100], ["Queijo flamengo light", 1, "p"], ["Batata cozida", 200], ["Salada mista", 1, "p"]] };
const WRAP = { nome: "Wrap de frango com queijo creme", itens: [["Wrap / tortilha", 1, "p"], ["Peito de frango grelhado", 150], ["Queijo creme light", 1, "p"], ["Alface", 30], ["Tomate", 80]] };
const BOLONHESA = { nome: "Esparguete à bolonhesa", itens: [["Carne picada de vaca", 120], ["Esparguete cozido", 130], ["Tomate", 150], ["Cebola", 50]] };
const PESCADA = { nome: "Pescada cozida com batata e feijão-verde", itens: [["Pescada cozida", 250], ["Batata cozida", 150], ["Feijão-verde cozido", 150], ["Azeite", 5]] };
const PERU_CUSCUZ = { nome: "Peru salteado com cuscuz e legumes", itens: [["Peito de peru grelhado", 180], ["Cuscuz cozido", 150], ["Courgette", 100], ["Pimento", 80], ["Azeite", 10]] };
const SALMAO = { nome: "Salmão no forno com batata-doce e salada", itens: [["Salmão grelhado", 150], ["Batata-doce cozida", 250], ["Salada mista", 1, "p"]] };
const DOURADA = { nome: "Dourada grelhada com batata e salada", itens: [["Dourada grelhada", 1, "p"], ["Batata cozida", 200], ["Salada mista", 1, "p"], ["Azeite", 5]] };
const PIZZA = { nome: "Pizza com salada (refeição livre)", itens: [["Pizza", 2, "p"], ["Salada mista", 1, "p"]] };
const BACALHAU = { nome: "Bacalhau cozido com grão e couve", itens: [["Bacalhau cozido", 200], ["Grão-de-bico cozido", 100], ["Couve portuguesa cozida", 150], ["Azeite", 10]] };
const SOPA_FRANGO = { nome: "Sopa de legumes com frango grelhado e tosta", itens: [["Sopa de legumes", 1, "p"], ["Peito de frango grelhado", 150], ["Pão integral", 1, "p"], ["Salada mista", 1, "p"]] };

const dia = (pa, lm, al, lt, ja) => ({
  "Pequeno-almoço": pa, "Lanche da manhã": lm, "Almoço": al, "Lanche da tarde": lt, "Jantar": ja,
});

PLANOS.push({
  semana: "2026-10-12",
  titulo: "Semana 1 · 1800 kcal",
  notas:
    "Jantares de segunda e quarta: cozinha a dobrar e leva as sobras para o almoço do dia seguinte. " +
    "Pequenos-almoços e lanches repetem-se para facilitar as compras. " +
    "Bebe pelo menos 2,5 L de água por dia, mais nos dias de treino. Café e chá sem açúcar não contam calorias. " +
    "Nos dias de treino, o batido de proteína pode ser tomado logo a seguir ao treino. " +
    "O sábado ao jantar é uma refeição mais livre; se comeres fora, regista no Diário o que comeste.",
  dias: [
    dia(PA_AVEIA, LM_BANANA, ATUM_GRAO, LT_SKYR, FRANGO_ARROZ),         // segunda
    dia(PA_TOSTA, LM_MACA, FRANGO_ARROZ, LT_TOSTA_ATUM, OMELETE),      // terça
    dia(PA_SKYR, LM_IOGURTE, WRAP, LT_BATIDO, BOLONHESA),              // quarta
    dia(PA_AVEIA, LM_BANANA, BOLONHESA, LT_BOLACHAS, PESCADA),             // quinta
    dia(PA_TOSTA, LM_MACA, PERU_CUSCUZ, LT_BOLACHAS, SALMAO),          // sexta
    dia(PA_SKYR, LM_IOGURTE, DOURADA, LT_SKYR, PIZZA),               // sábado
    dia(PA_OMELETE, LM_BANANA, BACALHAU, LT_TOSTA_ATUM, SOPA_FRANGO),  // domingo
  ],
});
