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

const EMPTY_IMAGE = { file: null, url: '' };

export default function PostComposer({ onCreated }) {
  const { user } = useAuth();
  const [image, setImage] = useState(EMPTY_IMAGE);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { content: '' } });

  const onSubmit = async ({ content }) => {
    // Status wajib berisi teks atau gambar
    if (!content.trim() && !image.file && !image.url.trim()) {
      return setError('content', { message: 'Tulis sesuatu atau lampirkan gambar' });
    }
    try {
      const post = await createPost({ content: content.trim(), imageUrl: image.url.trim(), file: image.file });
      onCreated(post);
      reset();
      setImage(EMPTY_IMAGE);
      toast.success('Status berhasil diposting');
    } catch (err) {
      applyServerErrors(err, (field, e) => setError(field === 'imageUrl' ? 'content' : field, e));
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3" noValidate>
          <UserAvatar user={user} />
          <div className="min-w-0 flex-1 space-y-3">
            <Textarea
              rows={3}
              maxLength={2000}
              placeholder={`Apa yang sedang Anda pikirkan, ${user?.name?.split(' ')[0]}?`}
              aria-label="Tulis status"
              {...register('content', { onChange: () => clearErrors('content') })}
            />
            {errors.content && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {errors.content.message}
              </p>
            )}
            <ImagePicker value={image} onChange={setImage} disabled={isSubmitting} />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />} Posting
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
