
# Tour Virtual v2 — Simulador GPS 3D com dados reais

## Escopo e realismo

Este é um trabalho grande. Vou entregá-lo em **4 fases incrementais** — cada fase deixa o produto utilizável antes de partir para a próxima. Isso evita 3 dias de build sem preview.

Antes de começar, preciso alinhar 3 decisões que travam a implementação:

### Decisões que preciso da sua parte

1. **Provedor de tiles/DEM** — o navegador não renderiza terreno real sem um serviço de tiles. As opções viáveis:
   - **MapTiler** (free tier 100k tiles/mês) — tem Terrain-RGB + tiles vetoriais OSM prontos. Recomendo.
   - **Mapbox** (free tier 50k loads/mês) — Terrain-RGB nativo, mais polido, requer conta.
   - **OpenStreetMap tiles públicos + AWS Terrain Tiles** — 100% grátis, sem chave, qualidade inferior.

   Precisarei que você conecte via `add_secret` a chave escolhida (ou confirmar OSM público).

2. **Nível de fidelidade visual**
   - **A) GPS 3D estilo Waze** (recomendado) — terreno real com relevo, ruas extrudadas, vegetação instanciada estilizada (não fotorrealista), rios/pontes marcados. Roda a 60fps em mobile.
   - **B) Google Earth-like fotorrealista** — inviável em WebGL puro sem tiles 3D pagos (Cesium Ion / Google Photorealistic 3D Tiles, ~$200/mês).

   Vou assumir **(A)** — é o que fecha com "sensação de navegador GPS moderno + 3D".

3. **Rotas iniciais** — quais 2-3 trajetos reais devem existir no lançamento? Ex.: "Centro → Cachoeira do Amor", "Sede → Morro Azul". Sem isso, uso rotas OSM automáticas entre POIs conhecidos do município.

---

## Stack técnica

```text
Renderização 3D   → three.js + @react-three/fiber + @react-three/drei
Terreno           → three-tile / three-geo (tiles + heightmap DEM)
Malha viária      → Overpass API (OSM) → GeoJSON → extrusão via three-mesh-bvh
Minimapa 2D       → maplibre-gl (Waze-style, sem chave)
Vegetação         → InstancedMesh (10k+ árvores, LOD)
Física do veículo → cinemática simples ao longo de spline OSM (não engine física)
Dados de rota     → GeoJSON/GPX loader (turf.js para cálculos geodésicos)
```

Bibliotecas novas a instalar: `three`, `@react-three/fiber`, `@react-three/drei`, `maplibre-gl`, `@turf/turf`, `three-mesh-bvh`.

---

## Arquitetura de arquivos

```text
src/lib/tour-virtual/
  osm-loader.ts          Fetch Overpass → GeoJSON (cacheado)
  dem-loader.ts          Tiles Terrain-RGB → heightmap
  route-engine.ts        Segue polyline real, calcula velocidade/altitude/ETA
  camera-rig.ts          5 câmeras (3ª pessoa, drone, capô, lateral, aérea)
  poi-registry.ts        POIs de EPF com fotos/descrição/curiosidades
  geojson-import.ts      Loader plugável para novas rotas
  data/
    epf-bounds.ts        Bounding box de Eng. Paulo de Frontin
    epf-pois.ts          Pontos turísticos com lat/lon
    routes/              Rotas GeoJSON versionadas no repo

src/components/tour/
  TourWorld.tsx          Canvas r3f principal
  Terrain.tsx            Mesh do relevo (DEM)
  RoadNetwork.tsx        Extrusão das ruas OSM
  Vehicle.tsx            Veículo seguindo route-engine
  Vegetation.tsx         InstancedMesh de Mata Atlântica
  Rivers.tsx             LineStrings de água OSM
  Buildings.tsx          Extrusão de edifícios OSM
  WazeMinimap.tsx        MapLibre 2D sincronizado
  NavigationHUD.tsx      Distância/velocidade/altitude/ETA/progresso
  CameraControls.tsx     Switch entre 5 câmeras
  POIPanel.tsx           Painel lateral com fotos + botão Reservar
  TourVirtualExperience.tsx  Composição (substitui a versão atual)
```

Os componentes atuais (`TourScene`, `Minimap`, `HotspotPanel` etc.) serão **removidos** — a arquitetura fictícia com spline aleatória sai por completo.

---

## Fases

### Fase 1 — Base geográfica real (fundação)
- Instala stack 3D e maplibre.
- Define bounding box de EPF (~22°32'S, 43°40'W).
- Loader Overpass baixa ruas + rios + edifícios da região (cache em JSON no repo para não bater na API a cada render).
- Loader DEM baixa heightmap e gera terreno com deslocamento vertical real.
- Renderiza terreno + ruas OSM extrudadas + minimapa Waze 2D sincronizado.
- Câmera única (3ª pessoa) seguindo primeira rota real.

**Entregável:** você já vê o município real em 3D com uma rota funcionando.

### Fase 2 — Simulação de rota + HUD navegador
- `route-engine` interpola posição ao longo da polyline OSM (não spline sintética).
- Cálculo real de velocidade média, distância restante, altitude (do DEM), ETA, % de progresso.
- HUD estilo Waze/Google Maps com esses dados.
- Sistema de 5 câmeras cinematográficas com transição suave.
- Loader plugável de GeoJSON/GPX para adicionar rotas via arquivo.

### Fase 3 — Ambiente Mata Atlântica
- InstancedMesh de árvores (3-4 modelos low-poly em rotação/escala aleatória mas seedada — determinístico) posicionadas fora das ruas usando máscara OSM (landuse=forest, natural=wood).
- Rios OSM renderizados como fitas com shader de água.
- Pontes destacadas onde ruas cruzam rios.
- Cercas em `barrier=fence` OSM.
- Edifícios OSM extrudados com `building:levels`.
- LOD por distância + frustum culling + instancing (r3f nativo).

### Fase 4 — POIs turísticos e conversão
- Registro de POIs de EPF (Cachoeira, mirantes, pontos históricos) com lat/lon reais.
- Trigger geodésico (turf `distance`): ao passar a <150m de um POI, abre `POIPanel` com fotos, descrição, curiosidades e CTA "Reservar Agora" → `/reservar?tour=...`.
- Loader final para você adicionar novas rotas dropando GeoJSON em `src/lib/tour-virtual/data/routes/`.

---

## Performance — o que garante 60fps

- **Terreno**: 1 mesh 256×256 com displacement map (não geometria densa).
- **Ruas**: BufferGeometry mergeada única por tipo (`primary`, `residential`, `track`).
- **Vegetação**: `InstancedMesh` com até 15k instâncias, `frustumCulled: true`, LOD em 3 níveis.
- **Edifícios**: extrusão apenas dentro do frustum + raio configurável ao redor do veículo.
- **Minimapa**: `maplibre-gl` em canvas separado (não compete com r3f).
- **Assets**: modelos de árvore/veículo em GLTF Draco-comprimido em `src/assets/tour-3d/`.

---

## Como continuar após lançamento

Adicionar uma rota nova é 1 arquivo:

```text
src/lib/tour-virtual/data/routes/serra-do-couto.geojson
```

O `geojson-import.ts` detecta automaticamente e disponibiliza no seletor de rotas.

---

## Preciso do seu OK em 3 pontos antes de codar

1. **Tiles/DEM**: MapTiler (recomendo), Mapbox, ou OSM público grátis?
2. **Fidelidade**: confirma o nível A (GPS 3D estilizado, viável) e não B (Google Earth fotorrealista, inviável sem tiles pagos)?
3. **Rotas iniciais**: você me passa 2-3 trajetos reais, ou gero automaticamente entre POIs conhecidos do município?

Assim que responder, começo pela Fase 1.
