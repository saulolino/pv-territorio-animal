"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { FeatureCollection, Feature } from "geojson";
import type { Layer, PathOptions } from "leaflet";
import "leaflet/dist/leaflet.css";

interface RaStat {
  codigoRa: string;
  nome: string;
  sigla: string;
  animaisDisponiveis: number;
}

interface Props {
  raIdAtivo: number | null;
  onClickRa: (id: number | null) => void;
}

export default function MapaRAs({ raIdAtivo, onClickRa }: Props) {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [stats, setStats] = useState<Map<string, RaStat>>(new Map());
  const [maxAnimais, setMaxAnimais] = useState(1);

  useEffect(() => {
    Promise.all([
      fetch("/geo/df-ras.geojson").then((r) => r.json()),
      fetch("/api/territorios/stats").then((r) => r.json()),
    ]).then(([geo, raStats]: [FeatureCollection, RaStat[]]) => {
      setGeoData(geo);
      const map = new Map<string, RaStat>();
      let max = 1;
      raStats.forEach((s) => {
        map.set(s.codigoRa, s);
        if (s.animaisDisponiveis > max) max = s.animaisDisponiveis;
      });
      setStats(map);
      setMaxAnimais(max);
    });
  }, []);

  function styleFeature(feature?: Feature): PathOptions {
    if (!feature) return {};
    const codigoRa = feature.properties?.codigo_ra as string;
    const raCira = feature.properties?.ra_cira as number;
    const stat = stats.get(codigoRa);
    const n = stat?.animaisDisponiveis ?? 0;
    const intensity = maxAnimais > 0 ? n / maxAnimais : 0;
    const alpha = 0.1 + intensity * 0.7;
    const isAtivo = raIdAtivo !== null && raCira === raIdAtivo;
    return {
      fillColor: `rgba(22, 101, 52, ${alpha})`,
      fillOpacity: 1,
      color: isAtivo ? "#854d0e" : "#15803d",
      weight: isAtivo ? 3 : 1,
      opacity: isAtivo ? 1 : 0.6,
    };
  }

  function onEachFeature(feature: Feature, layer: Layer) {
    const codigoRa = feature.properties?.codigo_ra as string;
    const raCira = feature.properties?.ra_cira as number;
    const stat = stats.get(codigoRa);
    const nome = stat?.nome || feature.properties?.nome || codigoRa;
    const n = stat?.animaisDisponiveis ?? 0;

    const l = layer as unknown as {
      bindTooltip: (c: string, o: object) => void;
      on: (event: string, handler: () => void) => void;
    };
    l.bindTooltip(
      `<strong>${nome}</strong><br/>${n === 0 ? "Nenhum animal" : `${n} animal${n > 1 ? "is" : ""} disponível`}`,
      { sticky: true }
    );
    l.on("click", () => {
      onClickRa(raIdAtivo === raCira ? null : raCira);
    });
  }

  if (!geoData) {
    return (
      <div className="w-full h-80 bg-gray-100 rounded-2xl flex items-center justify-center">
        <span className="text-gray-400 text-sm">Carregando mapa...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-80 md:h-96 rounded-2xl overflow-hidden border border-gray-200">
      <MapContainer
        center={[-15.78, -47.93]}
        zoom={9}
        style={{ height: "100%", width: "100%" }}
        zoomControl
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          key={`${maxAnimais}-${raIdAtivo}`}
          data={geoData}
          style={styleFeature}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
    </div>
  );
}
