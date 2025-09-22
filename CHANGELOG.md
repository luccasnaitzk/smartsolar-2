# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

Formato baseado em Keep a Changelog e em SemVer (quando aplicável).

## [Unreleased]
- Em andamento

## [2025-09-22]
### Adicionado
- Home: prévia do Dashboard no slide “Monitoramento em tempo real” usando moldura de navegador (mock-browser) e nova imagem `src/images/dashboard-hero.png`.
- Serviços: card "Monitoramento Inteligente" atualizado para usar a imagem do dashboard (com fallback).
- Página Monitoramento Inteligente: mesma moldura de navegador aplicada à imagem principal; cantos arredondados e sombra.
- Suporte (dashboard): indicador de status "Online" no cabeçalho do painel e ênfase de ação primária em "Abrir chamado"; textos do painel com i18n (pt/en).
- Autenticação: fluxo completo de “Esqueci a senha” via modal (e-mail → código → nova senha), com validação e persistência local em `localStorage`.

### Alterado
- Ajustes visuais em `styles.css` para suportar a moldura mock-browser, barra de endereço e responsividade.
- `index.html`: imagens e estrutura do slide de herói atualizadas.
- `monitoramento-inteligente.html`: imagem substituída e envolta na moldura.
- `src/scripts/dashboard.js`: melhorias de UX no painel de suporte e i18n.

### Corrigido
- Evitado corte na prévia do dashboard na home (hero-media agora adapta altura quando usa mock-browser).

