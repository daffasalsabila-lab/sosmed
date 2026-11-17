import { useState } from 'react';
import { Loader2, MapPin, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { reverseGeocode } from '../location';

const positionErrorMessage = (error, permissionState) => {
  if (error.code === 1) {
    const cause = permissionState === 'granted'
      ? 'Browser sudah memberi izin, jadi periksa izin lokasi sistem operasi atau apakah halaman dibuka di dalam iframe.'
      : 'Periksa izin lokasi untuk alamat situs yang sedang dibuka.';
    const details = error.message ? ` Detail browser: ${error.message}` : '';
    return `Akses lokasi ditolak. ${cause}${details}`;
  }
  if (error.code === 2) {
    const cause = permissionState === 'granted'
      ? 'Izin situs sudah aktif, tetapi Windows/browser tidak mendapatkan posisi perangkat.'
      : 'Browser tidak mendapatkan posisi perangkat.';
    return `${cause} Aktifkan Windows Settings > Privacy & security > Location > Location services dan Let desktop apps access your location. PC/VM tanpa sumber lokasi tidak dapat menentukan koordinat otomatis.`;
  }
  if (error.code === 3) return 'Pengambilan lokasi melewati batas waktu. Coba lagi.';
  return 'Gagal mengambil lokasi perangkat.';
};

const getGeolocationPolicy = () =>
  document.permissionsPolicy || document.featurePolicy;

const getPermissionState = () => {
  if (!navigator.permissions?.query) return Promise.resolve(null);
  return navigator.permissions.query({ name: 'geolocation' }).catch(() => null);
};

const showGeolocationError = (error, permission) => {
  toast.error(positionErrorMessage(error, permission?.state));
};

const resolvePositionError = async (error, permissionPromise) => {
  showGeolocationError(error, await permissionPromise);
};

export default function LocationPicker({ value, onChange, onRemove, disabled }) {
  const [loading, setLoading] = useState(false);

  const removeLocation = () => {
    if (onRemove) {
      onRemove();
    } else {
      onChange(null);
    }
  };

  const getLocation = () => {
    if (!window.isSecureContext) {
      toast.error('Lokasi hanya tersedia melalui HTTPS atau localhost. Buka situs dengan koneksi aman.');
      return;
    }
    if (!navigator.geolocation) {
      toast.error('Browser ini tidak mendukung fitur lokasi.');
      return;
    }

    const policy = getGeolocationPolicy();
    if (policy?.allowsFeature && !policy.allowsFeature('geolocation')) {
      toast.error('Situs ini diblokir dari memakai lokasi oleh kebijakan halaman atau iframe.');
      return;
    }

    setLoading(true);
    const permissionPromise = getPermissionState();

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const lat = coords.latitude;
        const lon = coords.longitude;
        let locationName = null;

        try {
          locationName = await reverseGeocode(lat, lon);
        } catch (error) {
          console.error('Gagal mengambil nama lokasi:', error);
          toast.warning('Lokasi ditambahkan, tetapi nama lokasi tidak dapat dimuat.');
        } finally {
          onChange({ latitude: lat, longitude: lon, name: locationName });
          setLoading(false);
          if (locationName) toast.success('Lokasi berhasil ditambahkan');
        }
      },
      async (error) => {
        setLoading(false);
        await resolvePositionError(error, permissionPromise);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant={value ? 'secondary' : 'outline'}
        size="sm"
        onClick={value ? removeLocation : getLocation}
        disabled={disabled || loading}
        aria-pressed={Boolean(value)}
      >
        {loading ? <Loader2 className="animate-spin" /> : value ? <X /> : <MapPin />}
        {value ? 'Batalkan lokasi' : 'Tambahkan lokasi'}
      </Button>
      {value && (
        <>
          <Button type="button" variant="outline" size="sm" onClick={getLocation} disabled={disabled || loading}>
            <MapPin /> Perbarui lokasi
          </Button>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${value.latitude},${value.longitude}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="max-w-xs truncate text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            title="Lihat lokasi di Google Maps"
            aria-label={`Lihat ${value.name || 'lokasi ini'} di Google Maps`}
          >
            {value.name || 'Nama lokasi tidak tersedia'}
          </a>
        </>
      )}
    </div>
  );
}