#!/usr/bin/env python3
"""Gera a app "Dieta Helber" na pasta helber/ a partir da app principal.

Uso: python3 tools/build_helber.py

A cópia usa o mesmo código e a mesma base de alimentos, mas:
- tem outro nome, outro ícone (azul) e outra chave de armazenamento,
  por isso nunca partilha dados com a Dieta Katia, mesmo no mesmo telemóvel;
- não leva o plano alimentar da Katia (plano.js começa vazio);
- o próprio plano do Helber fica em helber/plano.js e não é apagado ao voltar a gerar.

Volta a correr este script sempre que mudares a app principal e quiseres
levar as melhorias para a app do Helber.
"""
import json
import math
import pathlib
import re
import shutil

from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "helber"
NOME = "Dieta Helber"
COR = (47, 111, 176, 255)   # azul do ícone
COR_HEX = "#2f6fb0"


def must_replace(text, old, new):
    if old not in text:
        raise SystemExit(f"Não encontrei o trecho a substituir:\n{old[:120]}")
    return text.replace(old, new)


OUT.mkdir(exist_ok=True)
(OUT / "icons").mkdir(exist_ok=True)

# Ficheiros iguais
for f in ("style.css", "foods.js"):
    shutil.copy(ROOT / f, OUT / f)

# index.html
html = (ROOT / "index.html").read_text()
html = re.sub(r"Dieta \w+", NOME, html)
html = must_replace(html, '<meta name="theme-color" content="#2e9d5b">', f'<meta name="theme-color" content="{COR_HEX}">')
(OUT / "index.html").write_text(html)

# app.js: dados guardados noutra chave
js = (ROOT / "app.js").read_text()
js = must_replace(js, 'const STORE_KEY = "dietaTeste.v1";', 'const STORE_KEY = "dietaHelber.v1";')
(OUT / "app.js").write_text(js)

# sw.js: caches com outro nome
sw = (ROOT / "sw.js").read_text()
sw = re.sub(r'const CACHE = "dieta-v(\d+)";', r'const CACHE = "helber-v\1";', sw)
if 'const CACHE = "helber-v' not in sw:
    raise SystemExit("Não consegui mudar o nome da cache em sw.js")
(OUT / "sw.js").write_text(sw)

# manifest
man = json.loads((ROOT / "manifest.webmanifest").read_text())
man.update(name=NOME, short_name=NOME, theme_color=COR_HEX)
(OUT / "manifest.webmanifest").write_text(json.dumps(man, ensure_ascii=False, indent=2) + "\n")

# plano.js: só o cabeçalho com o formato, sem o plano da Katia (mantém o do Helber se já existir)
plano_out = OUT / "plano.js"
if not plano_out.exists():
    plano = (ROOT / "plano.js").read_text()
    cabecalho = plano[: plano.index("const PLANOS = [];") + len("const PLANOS = [];")]
    plano_out.write_text(cabecalho + "\n")


# Ícones (folha branca sobre azul)
def leaf_pts(cx, cy, L, W, ang, n=60):
    pts = []
    for side in (1, -1):
        rng = range(n + 1) if side == 1 else range(n, -1, -1)
        for i in rng:
            t = i / n
            x = (t - 0.5) * L
            y = side * W * math.sin(math.pi * t) ** 1.2
            a = math.radians(ang)
            pts.append((cx + x * math.cos(a) - y * math.sin(a), cy + x * math.sin(a) + y * math.cos(a)))
    return pts


def icon(size, path, maskable=False):
    S = size * 4
    white = (255, 255, 255, 255)
    im = Image.new("RGBA", (S, S), COR if maskable else (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if not maskable:
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=S * 0.22, fill=COR)
    k = 0.8 if maskable else 1.0
    c = S / 2
    L = S * 0.62 * k
    Wd = S * 0.2 * k
    d.polygon(leaf_pts(c, c, L, Wd, -45), fill=white)
    a = math.radians(-45)
    h = L * 0.42
    d.line([c - h * math.cos(a), c - h * math.sin(a), c + h * math.cos(a), c + h * math.sin(a)], fill=COR, width=int(S * 0.022))
    for f in (-0.2, 0.05, 0.28):
        bx = c + f * L * math.cos(a)
        by = c + f * L * math.sin(a)
        for sgn in (1, -1):
            b = a + sgn * math.radians(50)
            l = Wd * 0.75 * (1 - abs(f))
            d.line([bx, by, bx + l * math.cos(b), by + l * math.sin(b)], fill=COR, width=int(S * 0.014))
    im.resize((size, size), Image.LANCZOS).save(path)


icon(192, OUT / "icons/icon-192.png")
icon(512, OUT / "icons/icon-512.png")
icon(512, OUT / "icons/icon-maskable-512.png", True)
icon(180, OUT / "icons/apple-touch-icon.png", True)

# Verificação: nada da Katia na cópia
for f in OUT.rglob("*"):
    if f.suffix in (".html", ".js", ".webmanifest") and re.search(r"katia|dietaTeste", f.read_text(), re.I):
        raise SystemExit(f"{f} ainda tem referências à Katia")

print("App gerada em", OUT)
