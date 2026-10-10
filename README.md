# Dieta Teste 🥗

Aplicação web simples (HTML + CSS + JavaScript, sem dependências) para acompanhar a dieta.

## Como usar

Abre o ficheiro `index.html` no browser. Os dados ficam guardados no próprio browser (`localStorage`).

## Funcionalidades

- **Perfil**: sexo, idade, altura, peso, atividade e objetivo → calcula metas diárias de calorias e macros (fórmula Mifflin-St Jeor).
- **Hoje**: regista alimentos por refeição, vê calorias restantes, macros e copos de água. Navega entre dias.
- **Alimentos**: lista base em `foods.js` + alimentos personalizados.
- **Peso**: regista o peso e vê o gráfico de evolução.

## Estrutura

| Ficheiro     | Conteúdo                                |
|--------------|-----------------------------------------|
| `index.html` | Estrutura da página                     |
| `style.css`  | Estilos (modo claro/escuro automático)  |
| `app.js`     | Lógica, cálculos e armazenamento        |
| `foods.js`   | Base de dados de alimentos (por 100 g)  |
