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

// Produtos que o Helber usa (valores da embalagem / loja, por 100 g ou 100 ml)
FOODS.push(
  { nome: "Leite meio-gordo Mimosa", kcal: 48, p: 3.4, c: 4.9, g: 1.6, porcao: "1 copo (250 ml)", porcaoG: 250 },
  { nome: "Whey Protein Decathlon (neutro)", kcal: 397, p: 75, c: 12, g: 5.4, porcao: "1 dose (30 g)", porcaoG: 30 },
);

// Pequeno-almoço (sempre igual) e lanches que se repetem ao longo da semana
const PA_BATIDO = { nome: "Batido de leite, banana, aveia e whey", itens: [["Leite meio-gordo Mimosa", 1, "p"], ["Banana", 1, "p"], ["Aveia (flocos)", 40], ["Whey Protein Decathlon (neutro)", 1, "p"]] };

const LM_LARANJA = { nome: "Laranja", itens: [["Laranja", 1, "p"]] };
const LM_PERA = { nome: "Pera", itens: [["Pera", 1, "p"]] };
const LM_MACA = { nome: "Maçã com manteiga de amendoim", itens: [["Maçã", 1, "p"], ["Manteiga de amendoim", 15]] };
const LM_IOGURTE = { nome: "Iogurte grego com kiwi", itens: [["Iogurte grego magro", 1, "p"], ["Kiwi", 1, "p"]] };

const LT_SKYR = { nome: "Skyr com mirtilos e amêndoas", itens: [["Skyr natural", 1, "p"], ["Mirtilos", 100], ["Amêndoas", 10]] };
const LT_TOSTA_ATUM = { nome: "Tostas integrais com atum", itens: [["Pão integral", 2, "p"], ["Atum em lata (água)", 1, "p"], ["Tomate", 50]] };
const LT_BOLACHAS = { nome: "Bolachas de arroz com queijo fresco e peru", itens: [["Bolacha de arroz", 3, "p"], ["Queijo fresco magro", 1, "p"], ["Fiambre de peru", 2, "p"]] };
const LT_BATIDO = { nome: "Batido de proteína com banana", itens: [["Whey Protein Decathlon (neutro)", 1, "p"], ["Leite magro", 250], ["Banana", 60]] };

// Pratos principais (rápidos; alguns jantares dão para o almoço do dia seguinte).
// O Helber não come peixe, à exceção de atum de lata.
const ATUM_GRAO = { nome: "Salada de atum com grão-de-bico", itens: [["Atum em lata (água)", 2, "p"], ["Grão-de-bico cozido", 120], ["Tomate", 100], ["Pepino", 100], ["Cebola", 30], ["Azeite", 5]] };
const FRANGO_ARROZ = { nome: "Frango grelhado com arroz e brócolos", itens: [["Peito de frango grelhado", 180], ["Arroz branco cozido", 120], ["Brócolos cozidos", 150], ["Azeite", 5]] };
const OMELETE = { nome: "Omelete de espinafres com batata e salada", itens: [["Omelete (2 ovos)", 1, "p"], ["Clara de ovo", 3, "p"], ["Espinafres cozidos", 100], ["Batata cozida", 200], ["Salada mista", 1, "p"]] };
const WRAP = { nome: "Wrap de frango com queijo creme", itens: [["Wrap / tortilha", 1, "p"], ["Peito de frango grelhado", 130], ["Queijo creme light", 1, "p"], ["Alface", 30], ["Tomate", 80]] };
const BOLONHESA = { nome: "Esparguete à bolonhesa", itens: [["Carne picada de vaca", 120], ["Esparguete cozido", 110], ["Tomate", 150], ["Cebola", 50]] };
const LOMBO = { nome: "Lombo de porco grelhado com batata e feijão-verde", itens: [["Lombo de porco grelhado", 150], ["Batata cozida", 100], ["Feijão-verde cozido", 150]] };
const PERU_CUSCUZ = { nome: "Peru salteado com cuscuz e legumes", itens: [["Peito de peru grelhado", 180], ["Cuscuz cozido", 150], ["Courgette", 100], ["Pimento", 80], ["Azeite", 5]] };
const HAMBURGUER = { nome: "Hambúrguer no prato com queijo, batata-doce e salada", itens: [["Hambúrguer de vaca", 1, "p"], ["Queijo flamengo light", 1, "p"], ["Batata-doce cozida", 200], ["Salada mista", 1, "p"]] };
const BIFE = { nome: "Bife de vaca grelhado com batata e salada", itens: [["Bife de vaca grelhado", 1, "p"], ["Batata cozida", 150], ["Salada mista", 1, "p"]] };
const PIZZA = { nome: "Pizza com salada (refeição livre)", itens: [["Pizza", 2, "p"], ["Salada mista", 1, "p"]] };
const FRANGO_ASSADO = { nome: "Frango assado com grão e couve", itens: [["Frango assado (com pele)", 1, "p"], ["Grão-de-bico cozido", 80], ["Couve portuguesa cozida", 150]] };
const SOPA_FRANGO = { nome: "Sopa de legumes com frango grelhado", itens: [["Sopa de legumes", 1, "p"], ["Peito de frango grelhado", 150], ["Salada mista", 1, "p"]] };

const dia = (pa, lm, al, lt, ja) => ({
  "Pequeno-almoço": pa, "Lanche da manhã": lm, "Almoço": al, "Lanche da tarde": lt, "Jantar": ja,
});

PLANOS.push({
  semana: "2026-10-12",
  titulo: "Semana 1 · 1800 kcal",
  notas:
    "Jantares de segunda e quarta: cozinha a dobrar e leva as sobras para o almoço do dia seguinte. " +
    "O pequeno-almoço é sempre o batido; os lanches repetem-se para facilitar as compras. " +
    "Bebe pelo menos 2,5 L de água por dia, mais nos dias de treino. Café e chá sem açúcar não contam calorias. " +
    "Nos dias de treino, o batido de proteína da tarde pode ser tomado logo a seguir ao treino. " +
    "O sábado ao jantar é uma refeição mais livre; se comeres fora, regista no Diário o que comeste.",
  dias: [
    dia(PA_BATIDO, LM_IOGURTE, ATUM_GRAO, LT_SKYR, FRANGO_ARROZ),         // segunda
    dia(PA_BATIDO, LM_LARANJA, FRANGO_ARROZ, LT_TOSTA_ATUM, OMELETE),     // terça
    dia(PA_BATIDO, LM_PERA, WRAP, LT_BATIDO, BOLONHESA),                  // quarta
    dia(PA_BATIDO, LM_IOGURTE, BOLONHESA, LT_BOLACHAS, LOMBO),          // quinta
    dia(PA_BATIDO, LM_LARANJA, PERU_CUSCUZ, LT_BOLACHAS, HAMBURGUER),         // sexta
    dia(PA_BATIDO, LM_PERA, BIFE, LT_BOLACHAS, PIZZA),                 // sábado
    dia(PA_BATIDO, LM_MACA, FRANGO_ASSADO, LT_TOSTA_ATUM, SOPA_FRANGO),        // domingo
  ],
});
