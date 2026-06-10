# Test Perchance TS (v1.0.0)

Projeto de teste para explorar as capacidades do Perchance com arquitetura modular usando TypeScript + Vite + GitHub + jsDelivr CDN.

## 🚀 Performance Otimizada com Vite

O projeto utiliza **Vite** para gerar um bundle único, reduzindo drasticamente o tempo de carregamento:

| Antes (múltiplos arquivos) | Depois (Vite bundle) |
|----------------------------|----------------------|
| 16 requisições HTTP        | 1 requisição HTTP    |
| ~10-15s carregamento       | ~1-2s carregamento   |
| 70KB+ (múltiplos arquivos) | 7KB (1 arquivo minificado) |
| Carregamento sequencial    | Carregamento paralelo|

## 📦 Instalação

```bash
npm install
```

## 🛠️ Desenvolvimento

### Modo Desenvolvimento (HMR)
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
```

O bundle será gerado em `dist/main.bundle.js`.

### Preview do Build
```bash
npm run preview
```

## 📤 Release (Deploy)

O projeto utiliza **agent-release** para gerenciar releases de forma automatizada, criando PRs e GitHub Releases automaticamente.

### Fluxo Automatizado (Obrigatório)

Use o comando global `release` que automatiza TUDO:

```bash
release 1.0.1
```

⚠️ **Importante:** O comando `release` **deve ser executado em uma branch de feature ou chore**, nunca diretamente na `main`. Ele criará automaticamente uma branch `release/vX.Y.Z`, fará o build, commit, tag, criará um PR para `main`, e após o merge, criará o GitHub Release.

O script executa automaticamente:
1. ✅ Verifica working tree limpo
2. ✅ Cria branch `release/v{version}`
3. ✅ Roda lint, type check (`tsc --noEmit`), testes e auditoria de segurança
4. ✅ Atualiza `src/constants.ts` e sincroniza versão via `sync-version.cjs`
5. ✅ Gera bundle via `npm run build`
6. ✅ Valida artefatos (`dist/main.bundle.js`)
7. ✅ Cria commit e tag
8. ✅ Cria PR para `main` e faz push
9. ✅ Aguarda CI, auto-merge e cria GitHub Release

### ⚠️ Importante

- **Nunca** crie uma tag sem antes atualizar `constants.ts`
- O hook de pre-commit **sempre roda** em qualquer commit (idempotente)
- Sempre use `release X.Y.Z` para evitar esquecimentos
- Não edite manualmente `package.json`, `for-perchance.html`, `README.md` ou `AGENTS.md` para atualizar versões

## 🎮 Uso no Perchance

Cole o conteúdo de `for-perchance.html` no HTML Panel do seu gerador Perchance.
**Exemplo para v1.0.0:**
```html
<div id="game-container" style="position:relative; width:100vw; height:100vh; overflow:hidden; background:#1a1a1a;"></div>

<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js" type="module"></script>

<script type="module">
  import("https://cdn.jsdelivr.net/gh/Fahell/test-perchance-ts@v1.0.0/dist/main.bundle.js")
    .then(module => module.initGame())
    .catch(err => console.error('Erro:', err));
</script>
```

## 📁 Estrutura do Projeto

```
├── src/
│   ├── main.ts              # Entry point (imports estáticos + dynamic imports)
│   ├── perchance-bridge.ts  # Ponte segura para API do Perchance
│   ├── constants.ts         # Constantes globais (versão, CDN)
│   └── modules/             # Módulos independentes
│       ├── ai-text-test.ts  # Teste de plugin AI Text
│       ├── three-scene-test.ts # Teste Three.js (3D)
│       ├── renderer.ts      # Renderizador
│       └── types.ts         # Tipos TypeScript compartilhados
├── dist/
│   └── main.bundle.js       # Bundle único gerado pelo Vite (committed)
├── tests/
│   └── constants.test.ts    # Testes unitários com Vitest
├── scripts/
│   └── sync-version.cjs     # Sincroniza versão em todos os arquivos
├── for-perchance.html       # HTML Panel para copy/paste no Perchance
├── for-perchance-list-panel.txt  # List Panel para copy/paste no Perchance
├── .release-config.json     # Configuração do agent-release
└── AGENTS.md                # Instruções para AI agents
```

## 📚 Documentação

- `AGENTS.md` — Instruções para AI agents e contexto do projeto

## 🔧 Scripts Disponíveis

| Script | Função | Uso |
|---|---|---|
| `npm run dev` | Servidor de desenvolvimento com HMR | Desenvolvimento local |
| `npm run build` | Gera bundle de produção | Antes de deploy |
| `npm run preview` | Preview do build de produção | Testar build localmente |
| `npm test` | Roda testes unitários com Vitest | Validar mudanças |
| `npm run lint` | Roda ESLint | Verificar estilo de código |
| `release X.Y.Z` | Release automatizado completo | Deploy de nova versão |

## 🧪 Módulos de Teste

O projeto inclui módulos de teste para validar integração com bibliotecas e plugins do Perchance:

- `ai-text-test.ts` — Teste do plugin AI Text do Perchance
- `three-scene-test.ts` — Teste de renderização 3D com Three.js
- `renderer.ts` — Módulo de renderização e UI

## 🛡️ Boas Práticas

1. **Sempre use `release X.Y.Z`** para releases (em uma branch que não seja main)
2. **Nunca edite manualmente** arquivos de versão (use `constants.ts`)
3. **Commit atômico**: uma mudança por vez
4. **Teste localmente** com `npm run dev` antes de fazer release
5. **Verifique o bundle** em `dist/main.bundle.js` após mudanças
6. **Aguarde o CDN** propagar (~10 minutos) antes de testar no Perchance

## 📝 Versionamento

Este projeto segue [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Mudanças incompatíveis na API
- **MINOR** (0.X.0): Novas funcionalidades compatíveis
- **PATCH** (0.0.X): Correções de bugs compatíveis

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

ISC

---

**Última atualização:** v1.0.0
