# Alterações — 02/09/2026

## Pagamentos Asaas (UI)

- **Pagamentos:** saldo PIX, chave, saque, sinal — sem Stripe Connect.  
- **Clube:** apenas plano mensal, link do cliente e lista de membros.  
- Commit: `5179c7f`.

## Mobile (esta entrega)

Versão desktop (`lg:` e acima) **inalterada**. Abaixo de `1024px`:

- Menus em overlay com backdrop e bloqueio de scroll  
- Áreas de toque mínimas (44px)  
- Safe area iOS (`env(safe-area-inset-*)`)  
- Drawer reutilizável para navegação lateral  

Componentes tocados: `Header`, `DashboardSidebar`, `AgendaWebDashboardPage`, `mobile.css`.

Ver também: `wag-backend/Alterações/2026-09-02-pagamentos-asaas-e-seguranca.md` (API, ledger, segurança).
