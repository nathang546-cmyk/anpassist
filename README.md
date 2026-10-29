# Site ANP Assistência 24h

Novo site institucional de **anpassistencia.com.br**. É um site estático (HTML, CSS e JavaScript puros): sem build, sem banco de dados, sem WordPress.

## Estrutura

```
index.html              página única com todas as seções
assets/css/style.css    estilos (cores e fontes no topo, em :root)
assets/js/main.js       menu, animações, formulários -> WhatsApp, vídeos
assets/js/avaliacoes.js avaliações do Google exibidas no site
assets/img/             logos, fotos, favicon e imagem de compartilhamento
assets/video/           vídeos de apresentação já comprimidos para web
robots.txt, sitemap.xml SEO
_referencias/           material de origem (portfólio, tabelas, frames). NÃO publicar.
```

## Ver localmente

```bash
python -m http.server 5180
```

Depois abra http://localhost:5180.

## Publicar

Envie para a raiz do domínio tudo **exceto** a pasta `_referencias/` (e `.claude/`, `README.md`):
`index.html`, `robots.txt`, `sitemap.xml` e a pasta `assets/`.

Funciona em qualquer hospedagem: a atual (substituindo o WordPress), Hostinger, Netlify, Vercel ou Cloudflare Pages.

## Como atualizar

- **Avaliações**: edite `assets/js/avaliacoes.js` e cole o texto exatamente como está no Google.
- **Nota e número de avaliações** (5,0 e 142): procure por `142` no `index.html` e atualize todas as ocorrências (hero, números, avaliações, proposta, rodapé e meta tags). A imagem `assets/img/og-image.jpg` também mostra 142.
- **WhatsApp**: o número fica em `assets/js/main.js` (`WHATSAPP`) e nos links `wa.me` do `index.html`.
- **Formulários**: não precisam de servidor. Ao enviar, abrem o WhatsApp comercial com a mensagem já preenchida.
