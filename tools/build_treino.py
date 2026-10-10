#!/usr/bin/env python3
"""Gera a app instalável (PWA) em treino/ a partir de plano-treino.html (a versão artefacto).

Uso: python3 tools/build_treino.py

Fica em https://khiasmila-netizen.github.io/Teste/treino/ quando a pasta treino/
está no ramo publicado pelo GitHub Pages. Os dados ficam no telemóvel (localStorage),
separados da Dieta Katia. Volta a correr o script depois de mudares plano-treino.html.
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = (ROOT / "plano-treino.html").read_text()

head = """<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#b5345a">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}</style>
</head>
<body>
"""
sw = """<script>
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
</script>
</body>
</html>
"""
out = head + src.rstrip() + "\n" + sw
(ROOT / "treino" / "index.html").write_text(out)

# Nova versão do service worker sempre que a app muda, para o telemóvel ir buscar a atualização.
swp = ROOT / "treino" / "sw.js"
text = swp.read_text()
n = int(re.search(r'"treino-v(\d+)"', text).group(1))
swp.write_text(text.replace(f'"treino-v{n}"', f'"treino-v{n + 1}"'))
print("treino/index.html gerado; service worker treino-v%d" % (n + 1))
