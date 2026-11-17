import { useState } from 'react';
import { ImagePlus, Loader2, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ImagePicker from '@/components/common/ImagePicker';
import UserAvatar from '@/components/common/UserAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/AuthContext';
import { getErrorMessage } from '@/lib/http';
import { createComment } from '../api';
import LocationPicker from './LocationPicker';

const EMPTY_IMAGE = { file: null, url: '' };

export default function CommentForm({ postId, parentId, onCreated, onCancel }) {
  const { user } = useAuth();
  const [image, setImage] = useState(EMPTY_IMAGE);
  const [showImage, setShowImage] = useState(false);
  const [location, setLocation] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { comment: '' } });

  const onSubmit = async ({ comment }) => {
    if (!comment.trim() && !image.file && !image.url.trim() && !location) {
      return toast.error('Tulis komentar, lampirkan gambar, atau tambahkan lokasi');
    }
    try {
      const created = await createComment(postId, {
        comment: comment.trim(),
        imageUrl: image.url.trim(),
        file: image.file,
        parentId,
        latitude: location?.latitude,
        longitude: location?.longitude,
        locationName: location?.name,
      });
      onCreated(created);
      reset();
      setImage(EMPTY_IMAGE);
      setShowImage(false);
      setLocation(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2" noValidate>
      <UserAvatar user={user} className="h-8 w-8" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder={parentId ? 'Tulis balasan...' : 'Tulis komentar...'}
            maxLength={1000}
            aria-label="Tulis komentar"
            {...register('comment')}
          />
          <Button
            type="button"
            variant={showImage ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => setShowImage((s) => !s)}
            aria-label="Lampirkan gambar"
            title="Lampirkan gambar"
          >
            <ImagePlus />
          </Button>
          <Button type="submit" size="icon" disabled={isSubmitting} aria-label="Kirim komentar">
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </div>
        {showImage && <ImagePicker compact value={image} onChange={setImage} disabled={isSubmitting} />}
        <LocationPicker value={location} onChange={setLocation} disabled={isSubmitting} />
        {onCancel && (
          <div className="flex justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
              Batal membalas
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}
