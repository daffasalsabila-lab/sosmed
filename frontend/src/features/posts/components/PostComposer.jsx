import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ImagePicker from '@/components/common/ImagePicker';
import UserAvatar from '@/components/common/UserAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/features/auth/AuthContext';
import { applyServerErrors, getErrorMessage } from '@/lib/http';
import { createPost } from '../api';
import LocationPicker from './LocationPicker';

const EMPTY_IMAGE = { file: null, url: '' };
const MAX_POST_LENGTH = 500;

export default function PostComposer({ onCreated }) {
  const { user } = useAuth();
  const [image, setImage] = useState(EMPTY_IMAGE);
  const [location, setLocation] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { content: '' } });
  const content = watch('content') || '';
  const exceedsLimit = content.length > MAX_POST_LENGTH;

  const onSubmit = async ({ content }) => {
    if (content.length > MAX_POST_LENGTH) {
      return setError('content', { message: `Maksimal ${MAX_POST_LENGTH} karakter` });
    }
    // Status wajib berisi teks atau gambar
    if (!content.trim() && !image.file && !image.url.trim()) {
      return setError('content', { message: 'Tulis sesuatu atau lampirkan gambar' });
    }
    try {
      const post = await createPost({
        content: content.trim(),
        imageUrl: image.url.trim(),
        file: image.file,
        latitude: location?.latitude,
        longitude: location?.longitude,
        locationName: location?.name,
      });
      onCreated(post);
      reset();
      setImage(EMPTY_IMAGE);
      setLocation(null);
      toast.success('Status berhasil diposting');
    } catch (err) {
      applyServerErrors(err, (field, e) => setError(field === 'imageUrl' ? 'content' : field, e));
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Card className="border-sky-100 shadow-lg shadow-sky-100/40 bg-white/90 backdrop-blur-md rounded-2xl">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3" noValidate>
          <UserAvatar user={user} />
          <div className="min-w-0 flex-1 space-y-3">
            <Textarea
              rows={3}
              maxLength={2000}
              placeholder={`Apa yang sedang Anda pikirkan, ${user?.name?.split(' ')[0]}?`}
              aria-label="Tulis status"
              {...register('content', {
                maxLength: { value: MAX_POST_LENGTH, message: `Maksimal ${MAX_POST_LENGTH} karakter` },
                onChange: () => clearErrors('content'),
              })}
            />
            {errors.content && !exceedsLimit && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {errors.content.message}
              </p>
            )}
            {exceedsLimit && (
              <p role="alert" className="text-xs font-medium text-destructive">
                Maksimal {MAX_POST_LENGTH} karakter
              </p>
            )}
            <p className={`text-right text-xs ${exceedsLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
              {content.length}/{MAX_POST_LENGTH} karakter
            </p>
            <ImagePicker value={image} onChange={setImage} disabled={isSubmitting} />
            <LocationPicker value={location} onChange={setLocation} disabled={isSubmitting} />
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting || exceedsLimit}
                className="rounded-xl bg-[#2196F3] text-white shadow-sm hover:bg-[#0D47A1]"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />} Posting
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
