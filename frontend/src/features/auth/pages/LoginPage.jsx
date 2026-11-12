import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import FormField from '@/components/common/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { applyServerErrors, getErrorMessage } from '@/lib/http';
import { useAuth } from '../AuthContext';
import AuthShell from '../components/AuthShell';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } });

  // Notifikasi peringatan saat dilempar dari halaman terproteksi
  useEffect(() => {
    if (location.state?.notice) toast.warning(location.state.notice, { id: 'auth-notice' });
  }, [location.state]);

  const onSubmit = async (values) => {
    try {
      await login(values);
      toast.success('Selamat datang kembali!');
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      applyServerErrors(err, setError);
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <AuthShell
      title="Masuk"
      description="Masuk dengan email dan password Anda."
      footer={
        <>
          Belum punya akun?{' '}
          <Link to="/register" className="font-medium text-foreground underline underline-offset-4">
            Daftar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            {...register('email', {
              required: 'Email wajib diisi',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Format email tidak valid' },
            })}
          />
        </FormField>
        <FormField id="password" label="Password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password', { required: 'Password wajib diisi' })}
          />
        </FormField>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />} Masuk
        </Button>
      </form>
    </AuthShell>
  );
}
