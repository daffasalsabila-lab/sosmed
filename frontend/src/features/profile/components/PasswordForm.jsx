import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import FormField from '@/components/common/FormField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { applyServerErrors, getErrorMessage } from '@/lib/http';
import { changePassword } from '../api';

export default function PasswordForm() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' } });

  const onSubmit = async (values) => {
    try {
      await changePassword(values); // server memverifikasi password lama
      reset();
      toast.success('Password berhasil diubah');
    } catch (err) {
      applyServerErrors(err, setError);
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Card id="ubah-password">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardHeader>
          <CardTitle>Ubah password</CardTitle>
          <CardDescription>Masukkan password lama untuk mengamankan perubahan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField id="oldPassword" label="Password lama" error={errors.oldPassword?.message}>
            <Input
              id="oldPassword"
              type="password"
              autoComplete="current-password"
              {...register('oldPassword', { required: 'Password lama wajib diisi' })}
            />
          </FormField>
          <FormField id="newPassword" label="Password baru" error={errors.newPassword?.message} hint="Minimal 6 karakter">
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              {...register('newPassword', {
                required: 'Password baru wajib diisi',
                minLength: { value: 6, message: 'Password baru minimal 6 karakter' },
              })}
            />
          </FormField>
          <FormField id="confirmPassword" label="Konfirmasi password baru" error={errors.confirmPassword?.message}>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Konfirmasi password baru wajib diisi',
                validate: (v) => v === watch('newPassword') || 'Konfirmasi password baru tidak cocok',
              })}
            />
          </FormField>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />} Ubah password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
