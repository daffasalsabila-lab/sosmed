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

const EMPTY_IMAGE = { file: null, url: '' };

export default function CommentForm({ postId, onCreated }) {
  const { user } = useAuth();
  const [image, setImage] = useState(EMPTY_IMAGE);
  const [showImage, setShowImage] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { comment: '' } });

  const onSubmit = async ({ comment }) => {
    if (!comment.trim() && !image.file && !image.url.trim()) {
      return toast.error('Tulis komentar atau lampirkan gambar');
    }
    try {
      const created = await createComment(postId, { comment: comment.trim(), imageUrl: image.url.trim(), file: image.file });
      onCreated(created);
      reset();
      setImage(EMPTY_IMAGE);
      setShowImage(false);
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
            placeholder="Tulis komentar..."
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
      </div>
    </form>
  );
}
