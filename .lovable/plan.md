
# Centro de Experiências Off-Road

Remove todo o módulo 3D atual (Tour Virtual) e cria um novo módulo baseado em vídeos reais, 100% gerenciável pelo Dashboard. Nada mais no site é alterado.

## Escopo do que muda

**Remover (apenas Tour Virtual):**
- `src/routes/tour-virtual.tsx`
- `src/components/tour/**` (TourWorld, WazeMinimap, NavigationHUD, POIPanel, CameraSwitcher, TourVirtualExperience)
- `src/lib/tour-virtual/**` (data, geo, elevation, route-engine)
- Dependências 3D não usadas em outras partes: `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `maplibre-gl`, `@turf/turf` (verificar antes de remover)

**Manter intocado:** navbar, footer, home, reservas, checkout InfinitePay, admin existente, auth, veículos, galeria, tours, contato.

**Navbar:** o link atual "Tour Virtual" passa a apontar para `/experiencias` com label "Experiências Off-Road" (única mudança em navegação global).

## Banco de dados (nova migração)

Novas tabelas em `public` (sem tocar em nada existente):

```text
experience_categories(id, slug, name, sort_order)
experience_vehicle_types(id, slug, name)         -- Quadriciclo, UTV, etc.
experiences(
  id, slug UNIQUE, name, short_description, description,
  category_id FK, level, duration_hours, distance_km, altitude_m,
  price_cents, max_people,
  cover_image_url, horizontal_image_url, vertical_image_url,
  preview_video_url, main_video_url, drone_video_url,
  onboard_video_url, video_360_url, route_map_url,
  equipment TEXT[], what_to_bring TEXT[], curiosities TEXT[],
  points_of_interest JSONB,
  badge TEXT,                                    -- Novo|Premium|... (nullable)
  tour_slug TEXT,                                -- link p/ reserva existente
  seo_title, seo_description, og_image_url,
  status TEXT CHECK IN ('PUBLISHED','DRAFT','COMING_SOON'),
  popularity INT DEFAULT 0,
  sort_order INT, created_at, updated_at
)
experience_gallery(id, experience_id FK CASCADE, url, sort_order)
experience_videos(id, experience_id FK CASCADE, kind, url, sort_order)
experience_vehicle_map(experience_id, vehicle_type_id)  -- N:N
experience_tags(id, experience_id FK, tag)
```

- GRANT `SELECT` para `anon` e `authenticated` nas tabelas de leitura pública; escrita restrita a admin via `has_role`.
- RLS: leitura pública somente onde `status = 'PUBLISHED'`; admin vê tudo e escreve.
- Storage: novo bucket privado `experiences` (imagens + vídeos), URLs assinadas por 10 anos, mesmo padrão dos buckets atuais.
- Seed: 2 categorias e 3 tipos de veículos padrão (Quadriciclo, UTV, Buggy) para o admin já ter opções.

## Rotas novas (TanStack)

- `src/routes/experiencias.tsx` — listagem pública:
  - Hero com vídeo institucional (URL vinda de `site_settings` se existir; fallback estático).
  - Grid de cards responsivo carregado via `ExperienceService.listPublished()`.
  - Busca em tempo real (input controlado, filtro client-side sobre o resultado paginado).
  - Filtros por categoria/veículo/nível/tag.
  - Ordenação: recentes, populares, duração asc/desc, distância asc/desc.
  - Card: capa + `<video muted playsInline preload="metadata">` que dá play no hover (desktop) e autoplay contínuo no mobile via IntersectionObserver.
- `src/routes/experiencias.$slug.tsx` — página da trilha:
  - Vídeo principal em destaque, título, descrição.
  - Blocos dinâmicos: informações, equipamentos, o que levar, POIs, curiosidades, mapa da rota.
  - Galeria e vídeos extras (drone/onboard/360) só renderizam se existirem no banco.
  - Botão "Reservar Agora" → `/reservar?tour=<experience.tour_slug>` (fluxo atual intocado).
  - `head()` dinâmico com SEO title/description/og:image.

## Admin novo

- `src/routes/admin.experiencias.tsx` — listagem com ações: Nova, Editar, Duplicar, Excluir, Publicar/Rascunho.
- `src/routes/admin.experiencias.$id.tsx` — formulário completo:
  - Todos os campos do schema.
  - Uploads via `StorageService` estendido para o bucket `experiences` (imagens + vídeos).
  - Galeria e vídeos extras gerenciados em subformulários (add/remove/reorder).
  - Seleção múltipla de tipos de veículos e tags.
- Link "Experiências Off-Road" adicionado no menu do admin (uma linha em `admin.tsx`).

## Serviços

- `src/lib/services/experience-service.ts`:
  - `listPublished({ filters, sort, page })`, `getBySlug`, `listAll` (admin), `upsert`, `remove`, `duplicate`, `setStatus`.
- `StorageService.uploadExperienceMedia(file, kind)` reutilizando o padrão signed-url existente.

## Performance / UX

- `loading="lazy"` em imagens, `preload="metadata"` em vídeos.
- Paginação server-side (`range`) de 12 em 12.
- Skeletons durante fetch; TanStack Query com `staleTime` de 60s.
- Prefetch da página de detalhe no hover do card.

## Visual

Preto/grafite/laranja (tokens `--brand` existentes), tipografia display atual (Road Rage) nos títulos, cards com hover elevado, microinterações via Framer Motion já instalado. Sem novas dependências pesadas.

## Ordem de execução

1. Migração SQL (cria tabelas, GRANTs, RLS, bucket, seeds).  ← precisa aprovação do usuário
2. Após aprovação: remover arquivos do Tour Virtual antigo + desinstalar deps 3D órfãs.
3. Criar service, rotas públicas, rotas admin, link no menu admin e ajuste do label na navbar.
4. Verificar build/typecheck e testar fluxo Reserva a partir de uma experiência publicada.
