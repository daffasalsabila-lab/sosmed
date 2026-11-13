import { useEffect, useMemo, useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { assetUrl } from '@/lib/http';
import { cn } from '@/lib/utils';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024;

/**
 * Pemilih gambar: unggah berkas ATAU tempel URL.
 * value = { file: File|null, url: string }
 */
export default function ImagePicker({ value, onChange, fallbackPreview, variant = 'banner', compact = false, disabled }) {
  const inputRef = useRef(null);
  const objectUrl = useMemo(() => (value.file ? URL.createObjectURL(value.file) : null), [value.file]);
  useEffect(() => () => objectUrl && URL.revokeObjectURL(objectUrl), [objectUrl]);

  const preview = objectUrl || value.url || (fallbackPreview ? assetUrl(fallbackPreview) : null);
  const hasNew = Boolean(value.file || value.url);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!ALLOWED.includes(file.type)) return toast.error('Format gambar harus JPG, PNG, WEBP, atau GIF');
  if (file.size > MAX_SIZE) return toast.error('Ukuran gambar maksimal 5 MB'); // sesuaikan angkanya
    onChange({ file, url: '' });
  };

  return (
    <div className="space-y-2">
      {preview && (
        //ini tempat foto profil, untuk foto ke kiri pake relative inline-block
        <div className="flex flex-col items-center relative">
          <img
            src={preview}
            alt="Pratinjau"
            className={cn(
              'object-cover',
              variant === 'avatar'
                ? 'h-20 w-20 rounded-full'
                : compact
                  ? 'max-h-32 rounded-md'
                  : 'max-h-60 rounded-lg',
            )}
          />
          {hasNew && (
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
              onClick={() => onChange({ file: null, url: '' })}
              aria-label="Hapus gambar terpilih"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <input ref={inputRef} type="file" accept={ALLOWED.join(',')} className="hidden" onChange={handleFile} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="shrink-0"
        >
          <ImagePlus /> {value.file ? 'Ganti berkas' : 'Unggah gambar'}
        </Button>
        <Input
          type="url"
          inputMode="url"
          placeholder="atau tempel URL gambar (https://...)"
          className="h-8 text-xs"
          value={value.url}
          disabled={disabled}
          onChange={(e) => onChange({ file: null, url: e.target.value })}
        />
      </div>
      {value.file && <p className="truncate text-xs text-muted-foreground">{value.file.name}</p>}
    </div>
  );
}
