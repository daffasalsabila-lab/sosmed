import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { reverseGeocode } from '../location';

export default function LocationDisplay({ latitude, longitude, locationName, className = '' }) {
  const [resolvedName, setResolvedName] = useState(locationName || '');
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    setResolvedName(locationName || '');
    setUnavailable(false);

    if (!locationName && latitude != null && longitude != null) {
      reverseGeocode(latitude, longitude)
        .then((name) => {
          if (active) {
            setResolvedName(name || '');
            setUnavailable(!name);
          }
        })
        .catch(() => {
          if (active) setUnavailable(true);
        });
    }

    return () => {
      active = false;
    };
  }, [latitude, longitude, locationName]);

  if (latitude == null || longitude == null) return null;

  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline ${className}`}
      title="Lihat lokasi di Google Maps"
      aria-label={`Lihat ${resolvedName || 'lokasi ini'} di Google Maps`}
      aria-live="polite"
    >
      <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
      {resolvedName || (unavailable ? 'Nama lokasi tidak tersedia' : 'Memuat nama lokasi...')}
    </a>
  );
}
