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
