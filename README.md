# Site ANP Assistência 24h

Novo site institucional de **anpassistencia.com.br**. É um site estático (HTML, CSS e JavaScript puros): sem build, sem banco de dados, sem WordPress.

Prévia: https://nathang546-cmyk.github.io/anpassist/

## Estrutura

```
index.html                    página única
assets/css/style.css          estilos (cores e fontes no topo, em :root)
assets/js/main.js             menu, animações, avaliações, formulários -> WhatsApp, vídeo
data/google.js                nota, total e avaliações do Google (atualizado sozinho)
scripts/atualizar-google.mjs  busca os dados no Google
.github/workflows/            roda o script todo dia às 08:00
assets/img/, assets/video/    imagens e vídeo de apresentação
_referencias/                 material interno (fora do Git, não publicar)
```

## Avaliações do Google: atualização automática

Todo dia o GitHub Actions consulta a **Places API** do Google e atualiza `data/google.js`:
nota, total de avaliações e as avaliações novas (só as de 4 e 5 estrelas, até 12 no mural).

Para ligar, faça uma vez só:

1. No [Google Cloud Console](https://console.cloud.google.com/), crie um projeto, ative o faturamento e ative a **Places API (New)**.
   Uma consulta por dia fica bem dentro da cota gratuita.
2. Crie uma chave de API e restrinja-a à Places API.
3. Salve a chave como segredo do repositório:

   ```bash
   gh secret set GOOGLE_PLACES_API_KEY
   ```

4. Rode a primeira vez manualmente: aba **Actions** → "Atualizar avaliações do Google" → **Run workflow**.

Sem a chave, o workflow apenas avisa e não muda nada. Os números continuam os do arquivo.

A distribuição por estrelas (141 de 5★, 1 de 4★) não vem da API: edite `distribuicao` em `data/google.js`
quando quiser. Se ela não bater com o total, o site esconde o gráfico automaticamente para não mostrar número errado.

## Marca

A logo nova fica em `assets/img/logo/`:

- `anp-logo.svg` / `anp-logo-branco.svg`: versão principal (ANP com "Assistência 24 horas" embaixo)
- `anp-logo-reduzida.svg` / `-branco.svg`: só o ANP com o traço, para espaços pequenos (usada no topo do site)
- `anp-icone.svg` e `anp-icone-512.png`: ícone para WhatsApp, Google e redes sociais

Cores: preto `#111214`, branco e vermelho `#E3141B` (só em detalhes).
Os SVGs são gerados por `_referencias/gerar_marca.py`. O texto "Assistência 24 horas" usa a fonte Sora:
para gráfica, a versão final precisa ter o texto convertido em curvas.

## Ver localmente

```bash
python -m http.server 5180
```

Depois abra http://localhost:5180.

## Publicar no domínio

Envie para a raiz do domínio: `index.html`, `robots.txt`, `sitemap.xml` e as pastas `assets/` e `data/`.
Funciona em qualquer hospedagem (a atual, Hostinger, Netlify, Vercel, Cloudflare Pages ou o próprio GitHub Pages com domínio próprio).

## Outros ajustes

- **WhatsApp**: o número fica em `assets/js/main.js` (`WHATSAPP`) e nos links `wa.me` do `index.html`.
- **Formulários**: não precisam de servidor. Ao enviar, abrem o WhatsApp comercial com a mensagem já preenchida.
- **Imagem de compartilhamento** (`assets/img/og-image.jpg`): mostra "142 avaliações" fixo; refaça quando o número mudar bastante.
