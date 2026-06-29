# Graph Report - .  (2026-06-29)

## Corpus Check
- Corpus is ~8,926 words - fits in a single context window. You may not need a graph.

## Summary
- 127 nodes · 134 edges · 15 communities (7 shown, 8 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Banco de Dados|Banco de Dados]]
- [[_COMMUNITY_Componentes 1|Componentes 1]]
- [[_COMMUNITY_Componentes 2|Componentes 2]]
- [[_COMMUNITY_Pagamentos|Pagamentos]]
- [[_COMMUNITY_SEO & Redes Sociais|SEO & Redes Sociais]]
- [[_COMMUNITY_Componentes 5|Componentes 5]]
- [[_COMMUNITY_SEO & Redes Sociais|SEO & Redes Sociais]]
- [[_COMMUNITY_Sistema de Email|Sistema de Email]]
- [[_COMMUNITY_SEO & Redes Sociais|SEO & Redes Sociais]]
- [[_COMMUNITY_Serviços Externos|Serviços Externos]]
- [[_COMMUNITY_Componentes 11|Componentes 11]]
- [[_COMMUNITY_Componentes 12|Componentes 12]]
- [[_COMMUNITY_Componentes 13|Componentes 13]]

## God Nodes (most connected - your core abstractions)
1. `Database` - 23 edges
2. `compilerOptions` - 16 edges
3. `VisitaController` - 14 edges
4. `PaymentService` - 11 edges
5. `SeoController` - 9 edges
6. `Auth` - 7 edges
7. `EmailService` - 6 edges
8. `scripts` - 5 edges
9. `Config` - 4 edges
10. `CepService` - 3 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities (15 total, 8 thin omitted)

### Community 0 - "Banco de Dados"
Cohesion: 0.09
Nodes (3): Config, Database, VisitaController

### Community 1 - "Componentes 1"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 2 - "Componentes 2"
Cohesion: 0.15
Nodes (12): dependencies, next, react, react-dom, name, private, scripts, build (+4 more)

### Community 5 - "Componentes 5"
Cohesion: 0.22
Nodes (9): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+1 more)

### Community 8 - "SEO & Redes Sociais"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

## Knowledge Gaps
- **41 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+36 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Database` connect `Banco de Dados` to `SEO & Redes Sociais`, `Sistema de Email`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Are the 14 inferred relationships involving `Database` (e.g. with `.get()` and `.set()`) actually correct?**
  _`Database` has 14 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _41 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Banco de Dados` be split into smaller, more focused modules?**
  _Cohesion score 0.08735632183908046 - nodes in this community are weakly interconnected._
- **Should `Componentes 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._