"use client";

import { useEffect, useState } from "react";

interface Props {
  animalId: string;
  className?: string;
}

export default function BotaoFavorito({ animalId, className = "" }: Props) {
  const [favoritado, setFavoritado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autenticado, setAutenticado] = useState(true);

  useEffect(() => {
    fetch("/api/favoritos")
      .then((r) => {
        if (r.status === 401) { setAutenticado(false); return []; }
        if (!r.ok) return [];
        return r.json();
      })
      .then((favs: { animalId: string }[]) => {
        setFavoritado(favs.some((f) => f.animalId === animalId));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [animalId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    const novoEstado = !favoritado;
    setFavoritado(novoEstado);

    await fetch("/api/favoritos", {
      method: novoEstado ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animalId }),
    }).catch(() => setFavoritado(!novoEstado));
  }

  if (loading || !autenticado) return null;

  return (
    <button
      onClick={toggle}
      aria-label={favoritado ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={`transition-transform hover:scale-110 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={favoritado ? "#dc2626" : "none"}
        stroke={favoritado ? "#dc2626" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
