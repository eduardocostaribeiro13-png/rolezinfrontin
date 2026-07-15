import { useEffect, useRef } from "react";
import maplibregl, { type Map as MapLibre } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { LngLat, RealRoute } from "@/lib/tour-virtual/data";

interface Props {
  route: RealRoute;
  vehicleLngLat: LngLat;
  headingRad: number;
}

export function WazeMinimap({ route, vehicleLngLat, headingRad }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibre | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap",
          },
        },
        layers: [
          { id: "bg", type: "background", paint: { "background-color": "#0f172a" } },
          { id: "osm", type: "raster", source: "osm" },
        ],
      },
      center: route.coordinates[0],
      zoom: 14,
      pitch: 45,
      bearing: 0,
      attributionControl: false,
      interactive: false,
    });
    mapRef.current = map;

    map.on("load", () => {
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: route.coordinates },
        },
      });
      map.addLayer({
        id: "route-outline",
        type: "line",
        source: "route",
        paint: { "line-color": "#000", "line-width": 8, "line-opacity": 0.6 },
      });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: { "line-color": route.color, "line-width": 5 },
      });

      // POIs
      map.addSource("pois", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: route.pois.map((p) => ({
            type: "Feature",
            properties: { name: p.name },
            geometry: { type: "Point", coordinates: p.coord },
          })),
        },
      });
      map.addLayer({
        id: "pois",
        type: "circle",
        source: "pois",
        paint: {
          "circle-radius": 6,
          "circle-color": "#f59e0b",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      // Marker do veículo (elemento HTML custom)
      const el = document.createElement("div");
      el.className = "waze-vehicle-marker";
      el.innerHTML = `
        <div style="width:28px;height:28px;border-radius:50%;background:#f59e0b;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.5);display:grid;place-items:center;">
          <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:10px solid #fff;transform:translateY(-1px);"></div>
        </div>`;
      markerRef.current = new maplibregl.Marker({ element: el, rotationAlignment: "map" })
        .setLngLat(vehicleLngLat)
        .addTo(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.id]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    marker.setLngLat(vehicleLngLat);
    marker.setRotation((headingRad * 180) / Math.PI);
    map.easeTo({
      center: vehicleLngLat,
      bearing: (headingRad * 180) / Math.PI,
      duration: 400,
    });
  }, [vehicleLngLat, headingRad]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-white/90 backdrop-blur">
        Mapa · Frontin · RJ
      </div>
    </div>
  );
}
