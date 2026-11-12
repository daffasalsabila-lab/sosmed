import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import FormField from '@/components/common/FormField';
import ImagePicker from '@/components/common/ImagePicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/features/auth/AuthContext';
import { applyServerErrors, getErrorMessage } from '@/lib/http';
import { updateProfile } from '../api';

export default function ProfileForm() {
  const { user, updateUser } = useAuth();
  const [avatar, setAvatar] = useState({ file: null, url: '' });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: user.name, bio: user.bio || '' } });

  const onSubmit = async (values) => {
    try {
      const updated = await updateProfile({
        name: values.name.trim(),
        bio: values.bio.trim(),
        avatarUrl: avatar.url.trim(),
        file: avatar.file,
      });
      updateUser(updated); // navbar, postingan, dan komentar langsung memakai avatar baru
      setAvatar({ file: null, url: '' });
      toast.success('Profil berhasil diperbarui');
    } catch (err) {
      applyServerErrors(err, (field, e) => setError(field === 'avatarUrl' ? 'root' : field, e));
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardHeader>
          <CardTitle>Edit profil</CardTitle>
          <CardDescription>Perbarui nama, bio, dan foto profil Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Foto profil" hint="Unggah berkas (maks. 2 MB) atau tempel URL gambar.">
            <ImagePicker variant="avatar" value={avatar} onChange={setAvatar} fallbackPreview={user.avatar} disabled={isSubmitting} />
          </FormField>
          <FormField id="name" label="Nama pengguna" error={errors.name?.message}>
            <Input
              id="name"
              {...register('name', {
                required: 'Nama wajib diisi',
                minLength: { value: 2, message: 'Nama minimal 2 karakter' },
                maxLength: { value: 100, message: 'Nama maksimal 100 karakter' },
              })}
            />
          </FormField>
          <FormField id="bio" label="Bio" error={errors.bio?.message}>
            <Textarea
              id="bio"
              rows={3}
              maxLength={500}
              placeholder="Ceritakan sedikit tentang Anda"
              {...register('bio', { maxLength: { value: 500, message: 'Bio maksimal 500 karakter' } })}
            />
          </FormField>
          {errors.root && <p className="text-xs font-medium text-destructive">{errors.root.message}</p>}
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />} Simpan perubahan
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
