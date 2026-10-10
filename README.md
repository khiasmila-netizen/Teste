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

## Instalar como app (telemóvel ou computador)

A app pode ser instalada a partir do GitHub Pages (`manifest.webmanifest` + `sw.js`):

1. No GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
2. Escolhe o branch e a pasta `/ (root)` e clica em **Save**.
3. Abre o endereço `https://<utilizador>.github.io/Teste/` no Chrome → menu ⋮ → **Instalar app** / **Adicionar ao ecrã principal**.

Sempre que alterares ficheiros, muda a versão de `CACHE` em `sw.js` para os dispositivos irem buscar a versão nova.
