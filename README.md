# Dieta Katia 🥗

Aplicação web simples (HTML + CSS + JavaScript, sem dependências) para acompanhar a dieta.

## Como usar

Abre o ficheiro `index.html` no browser. Os dados ficam guardados no próprio browser (`localStorage`).

## Funcionalidades

- **Perfil**: peso inicial, atual e meta (quanto falta), sexo, idade, altura, peso, atividade e objetivo → calcula metas diárias de calorias e macros (fórmula Mifflin-St Jeor).
- **Diário** (estilo MyFitnessPal): Meta − Alimentos = Restantes, 5 refeições, pesquisa com recentes e porções, código de barras (Open Food Facts), copiar de ontem, refeições guardadas e água.
- **Alimentos**: ~170 alimentos em `foods.js` (com porções) + alimentos criados por ti.
- **Plano**: plano alimentar semanal (em `plano.js`) com kcal e macros por refeição; cada refeição ou o dia todo pode ser adicionado ao Diário.
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

## Artefacto no claude.ai

`python3 tools/build_artifact.py saida.html` gera a versão de ficheiro único usada no artefacto (dados guardados na conta do Claude, sem código de barras).

## Dieta Helber

Cópia da app para outra pessoa, em `helber/` (https://khiasmila-netizen.github.io/Teste/helber/).
Gera-se com `python3 tools/build_helber.py`: mesmo código e alimentos, outro nome, ícone azul e
armazenamento separado. O plano alimentar do Helber fica em `helber/plano.js` e não é apagado ao voltar a gerar.
