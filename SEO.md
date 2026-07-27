# SEO Wagoo — checklist operacional

## Arquivos no ar

- `https://wagobot.com/robots.txt`
- `https://wagobot.com/sitemap.xml`
- `https://wagobot.com/og-wagoo.png`
- Páginas de conteúdo:
  - `/automatizar-agendamento-whatsapp`
  - `/agenda-whatsapp-google-calendar`
  - `/wagoo-vs-planilha`

## Google Search Console (manual)

1. Abra [Google Search Console](https://search.google.com/search-console).
2. Adicione a propriedade **URL prefix**: `https://wagobot.com`.
3. Verifique o domínio (método recomendado: **registro DNS** no provedor do domínio, ou meta tag HTML / arquivo HTML se preferir).
4. Em **Sitemaps**, envie: `https://wagobot.com/sitemap.xml`.
5. Em **Inspeção de URL**, peça indexação de:
   - `https://wagobot.com/`
   - as 3 páginas de guia acima
6. Acompanhe cobertura e Core Web Vitals nas semanas seguintes.

## Após cada deploy

- Confirme que `sitemap.xml` e `robots.txt` respondem 200.
- Teste prévia social: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) e WhatsApp (colar o link numa conversa).
- Se mudar preços Basic/Pro/Pro+, atualize o JSON-LD em `index.html` e a AggregateOffer nas páginas SEO.

## Build

```bash
npm run build
```

O script `prerender-seo` roda após o Vite e gera HTML por rota com meta/OG próprios.
