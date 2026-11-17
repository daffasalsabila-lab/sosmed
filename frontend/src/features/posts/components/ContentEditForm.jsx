import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import ImagePicker from '@/components/common/ImagePicker';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import LocationPicker from './LocationPicker';

export default function ContentEditForm({
  initialText,
  image,
  label,
  maxLength,
  allowLocation = false,
  allowLocationOnly = false,
  initialLocation = null,
  onSave,
  onCancel,
}) {
  const [imageValue, setImageValue] = useState({ file: null, url: '' });
  const [removeImage, setRemoveImage] = useState(false);
  const [location, setLocation] = useState(initialLocation);
  const [removeLocation, setRemoveLocation] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { text: initialText || '' } });
  const text = watch('text') || '';
  const exceedsLimit = text.length > maxLength;

  const submit = async ({ text }) => {
    const trimmedText = text.trim();
    if (text.length > maxLength) {
      setError('text', { message: `Maksimal ${maxLength} karakter` });
      return;
    }
    if (
      !trimmedText
      && !imageValue.file
      && !imageValue.url.trim()
      && (!image || removeImage)
      && !(allowLocationOnly && location && !removeLocation)
    ) {
      setError('text', { message: `Isi teks atau lampirkan gambar` });
      return;
    }

    await onSave({
      text: trimmedText,
      imageUrl: removeImage ? '' : imageValue.url.trim() || undefined,
      file: imageValue.file,
      ...(allowLocation ? {
        latitude: location?.latitude,
        longitude: location?.longitude,
        locationName: location?.name,
        removeLocation,
      } : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-3" noValidate>
      <Textarea
        rows={3}
        maxLength={maxLength}
        aria-label={label}
        {...register('text', {
          onChange: () => clearErrors('text'),
          maxLength: { value: maxLength, message: `Maksimal ${maxLength} karakter` },
        })}
      />
      {errors.text && !exceedsLimit && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {errors.text.message}
        </p>
      )}
      {exceedsLimit && (
        <p role="alert" className="text-xs font-medium text-destructive">
          Maksimal {maxLength} karakter
        </p>
      )}
      <p className={`text-right text-xs ${exceedsLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
        {text.length}/{maxLength} karakter
      </p>
      <ImagePicker
        value={imageValue}
        onChange={(value) => {
          setImageValue(value);
          setRemoveImage(false);
        }}
        fallbackPreview={removeImage ? null : image}
        disabled={isSubmitting}
      />
      {image && (
        <div className="flex items-center gap-2">
          {removeImage ? (
            <>
              <p className="text-xs text-muted-foreground">Gambar akan dihapus saat disimpan.</p>
              <Button type="button" variant="ghost" size="sm" onClick={() => setRemoveImage(false)}>
                Batalkan
              </Button>
            </>
          ) : (
            <Button type="button" variant="ghost" size="sm" onClick={() => {
              setImageValue({ file: null, url: '' });
              setRemoveImage(true);
            }}>
              Hapus gambar saat ini
            </Button>
          )}
        </div>
      )}
      {allowLocation && (
        <LocationPicker
          value={removeLocation ? null : location}
          onChange={(value) => {
            setLocation(value);
            setRemoveLocation(false);
          }}
          onRemove={() => {
            setLocation(null);
            setRemoveLocation(true);
          }}
          disabled={isSubmitting}
        />
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting || exceedsLimit}>
          {isSubmitting && <Loader2 className="animate-spin" />} Simpan
        </Button>
      </div>
    </form>
  );
}
