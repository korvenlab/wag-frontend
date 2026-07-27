# SEO Wagoo — checklist operacional

Domínio canônico: **https://wagoobot.com**

## Arquivos no ar (confirme no navegador)

- https://wagoobot.com/robots.txt
- https://wagoobot.com/sitemap.xml
- https://wagoobot.com/og-wagoo.png

Páginas para indexar (não indexe `robots.txt` nem `sitemap.xml`):

- https://wagoobot.com/
- https://wagoobot.com/agendamento
- https://wagoobot.com/agendamento/whatsapp
- https://wagoobot.com/agenda-whatsapp-google-calendar
- https://wagoobot.com/wagoo-vs-planilha

Hierarquia de breadcrumb (como no SERP: `› agendamento › whatsapp`):

- Hub: `/agendamento`
- Folha keyword: `/agendamento/whatsapp`
- Redirect permanente: `/automatizar-agendamento-whatsapp` → `/agendamento/whatsapp`

## Google Search Console — ordem correta

### 1) Enviar o sitemap (obrigatório primeiro)

1. Abra a propriedade **`wagoobot.com`** (URL prefix `https://wagoobot.com`).
2. Menu **Indexação → Sitemaps**.
3. Em “Adicionar um novo sitemap”, digite só: `sitemap.xml`
4. Envie. Aguarde status **Êxito** (pode levar minutos/horas).

Não use a Inspeção de URL no `robots.txt` nem no `sitemap.xml` — o Google **não indexa** esses arquivos. Eles só orientam o crawler.

### 2) Pedir indexação das páginas

Para cada URL da lista acima:

1. **Inspeção de URL** → cole a URL da **página** (ex.: `https://wagoobot.com/`).
2. Clique **Testar o URL publicado** (versão ao vivo).
3. Se o teste ao vivo disser que a URL está disponível, use **Solicitar indexação**.
4. Se aparecer “Google não reconhece o URL”, é normal em site novo: o sitemap ainda não foi processado. Espere o sitemap ficar “Êxito” e tente de novo no dia seguinte.
5. Erro “Ops... algo deu errado” ao solicitar indexação costuma ser limite temporário do Search Console — espere e repita; não indica bug no site.

### 3) O que NÃO fazer

- Solicitar indexação de `https://wagoobot.com/robots.txt`
- Solicitar indexação de `https://wagoobot.com/sitemap.xml`
- Usar propriedade com domínio errado (`wagobot.com` com 2 “o”)

## Após cada deploy

- Confirme que sitemap e robots respondem 200 no domínio **wagoobot.com**.
- Teste prévia social: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).
- Se mudar preços Basic/Pro/Pro+, atualize o JSON-LD em `index.html`.

## Build

```bash
npm run build
```

O script `prerender-seo` roda após o Vite e gera HTML por rota com meta/OG próprios.
