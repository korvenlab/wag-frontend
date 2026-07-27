/**
 * Pós-build: gera HTML estático por rota SEO com meta/OG/canonical próprios.
 * Arquivos em dist/<rota>/index.html têm prioridade sobre o rewrite SPA na Vercel.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");
const origin = "https://wagoobot.com";

const routes = [
  {
    path: "/",
    title: "Wagoo — Agenda no WhatsApp que se paga sozinha",
    description:
      "Wagoo agenda clientes pelo WhatsApp no seu Google Calendar, 24 horas por dia. Automação simples para profissionais e negócios.",
    ogTitle: "Wagoo — Agenda no automático",
    ogDescription:
      "Transforme conversas de WhatsApp em horários confirmados no Google Calendar.",
    h1: "Sua agenda no automático",
  },
  {
    path: "/agendamento",
    title: "Agendamento automático | Wagoo",
    description:
      "Agendamento automático no WhatsApp e no Google Calendar. Menos furos, menos tempo no celular — o Wagoo confirma horário por você.",
    ogTitle: "Agendamento automático com o Wagoo",
    ogDescription:
      "Do pedido no chat ao horário na agenda — sem planilha e sem responder tudo à mão.",
    h1: "Agendamento automático que roda enquanto você atende",
  },
  {
    path: "/agendamento/whatsapp",
    title: "Agendamento no WhatsApp | Wagoo",
    description:
      "Agendamentos no WhatsApp no automático: o cliente pede horário, o Wagoo confirma e grava no Google Calendar, 24 horas por dia.",
    ogTitle: "Agendamento no WhatsApp",
    ogDescription:
      "Automatize agendamentos no WhatsApp e sincronize com o Google Calendar — sem copiar horário à mão.",
    h1: "Agendamento no WhatsApp sem perder o fio da meada",
  },
  {
    path: "/agenda-whatsapp-google-calendar",
    title: "Agenda WhatsApp + Google Calendar em tempo real | Wagoo",
    description:
      "Integre WhatsApp e Google Calendar: disponibilidade real, confirmação automática e menos furos na agenda do seu negócio.",
    ogTitle: "WhatsApp + Google Calendar no automático",
    ogDescription:
      "Sincronize conversas de agenda com o Google Calendar sem planilha e sem copiar horário à mão.",
    h1: "WhatsApp + Google Calendar: agenda em tempo real, sem copiar horário",
  },
  {
    path: "/wagoo-vs-planilha",
    title: "Wagoo vs planilha manual de agenda | Wagoo",
    description:
      "Compare agenda no WhatsApp com planilha: tempo perdido, furos e follow-up. Por que o Wagoo se paga no primeiro horário recuperado.",
    ogTitle: "Wagoo vs planilha de agendamentos",
    ogDescription:
      "Planilha não responde o cliente à noite. Veja a diferença na operação do dia a dia.",
    h1: "Wagoo vs planilha: quem responde o cliente quando você está ocupado?",
  },
];

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function injectMeta(html, route) {
  const url = route.path === "/" ? `${origin}/` : `${origin}${route.path}`;
  const ogTitle = route.ogTitle || route.title;
  const ogDescription = route.ogDescription || route.description;

  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(route.title)}</title>`);
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapeHtml(route.description)}" />`,
  );
  out = out.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${url}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${escapeHtml(ogTitle)}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${escapeHtml(ogDescription)}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${url}" />`,
  );
  out = out.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${escapeHtml(ogTitle)}" />`,
  );
  out = out.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${escapeHtml(ogDescription)}" />`,
  );

  const noscript = `<noscript><main><h1>${escapeHtml(route.h1)}</h1><p>${escapeHtml(route.description)}</p><p><a href="${origin}/">Wagoo</a></p></main></noscript>`;
  out = out.replace('<div id="root"></div>', `<div id="root"></div>\n    ${noscript}`);

  return out;
}

const indexPath = path.join(distDir, "index.html");
if (!fs.existsSync(indexPath)) {
  console.error("dist/index.html não encontrado. Rode vite build antes.");
  process.exit(1);
}

const baseHtml = fs.readFileSync(indexPath, "utf8");

for (const route of routes) {
  const html = injectMeta(baseHtml, route);
  if (route.path === "/") {
    fs.writeFileSync(indexPath, html, "utf8");
    console.log("prerender: / -> dist/index.html");
    continue;
  }
  const dir = path.join(distDir, route.path.replace(/^\//, ""));
  fs.mkdirSync(dir, { recursive: true });
  const outFile = path.join(dir, "index.html");
  fs.writeFileSync(outFile, html, "utf8");
  console.log(`prerender: ${route.path} -> ${path.relative(distDir, outFile)}`);
}

console.log("prerender-seo: ok");
