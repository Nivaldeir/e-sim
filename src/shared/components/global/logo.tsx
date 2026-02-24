"use client";

import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  /** Tamanho em pixels (largura e altura iguais). Padrão: 32 */
  size?: number;
  /** Classe CSS adicional */
  className?: string;
  /** Se true, envolve a imagem em um link para /dashboard */
  linkToDashboard?: boolean;
  /** Texto alternativo para acessibilidade */
  alt?: string;
}

export function Logo({
  size = 32,
  className = "",
  linkToDashboard = false,
  alt = "Taticca",
}: LogoProps) {
  const img = (
    <Image
      src="/taticca.png"
      alt={alt}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority
    />
  );

  if (linkToDashboard) {
    return (
      <Link href="/dashboard" className="inline-flex shrink-0" aria-label="Ir para o início">
        {img}
      </Link>
    );
  }

  return <span className="inline-flex shrink-0">{img}</span>;
}
