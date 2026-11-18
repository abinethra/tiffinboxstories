import { useState } from 'react';
import { Utensils } from 'lucide-react';

interface DishImageProps {
  src: string;
  alt: string;
  className?: string;
}

/**
 * Resilient editorial image component following the Zero-Broken-Image Policy.
 * Renders a warm turmeric-cream gradient + Utensils icon fallback if the asset fails to load.
 */
export function DishImage({ src, alt, className = '' }: DishImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F3ECE0] via-[#FAF6EF] to-[#F6E6C4] text-[#6A5D52] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Utensils className="w-8 h-8 text-[#B84A2F]/60 mb-2" aria-hidden="true" />
        <span className="text-xs font-medium text-[#6A5D52] max-w-[18ch] leading-snug">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
}
