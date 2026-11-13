import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import FormField from '@/components/common/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { applyServerErrors, getErrorMessage } from '@/lib/http';
import { useAuth } from '../AuthContext';
import AuthShell from '../components/AuthShell';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: '', email: '', password: '', confirmPassword: '' } });

  const onSubmit = async (values) => {
    try {
      await registerUser(values); // sesi aktif langsung dibuat (auto-login)
      toast.success('Akun berhasil dibuat. Selamat datang!');
      navigate('/', { replace: true }); // langsung ke Beranda, bukan form login
    } catch (err) {
      applyServerErrors(err, setError);
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <AuthShell
      title="Buat akun"
      description="Daftar untuk mulai berbagi di ConnectSpace."
      footer={
        <>
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
            Masuk
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField id="name" label="Nama lengkap" error={errors.name?.message}>
          <Input
            id="name"
            autoComplete="name"
            {...register('name', {
              required: 'Nama lengkap wajib diisi',
              minLength: { value: 2, message: 'Nama minimal 2 karakter' },
              maxLength: { value: 100, message: 'Nama maksimal 100 karakter' },
            })}
          />
        </FormField>
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email', {
              required: 'Email wajib diisi',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Format email tidak valid' },
            })}
          />
        </FormField>
        <FormField id="password" label="Password" error={errors.password?.message} hint="Minimal 6 karakter">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password', {
              required: 'Password wajib diisi',
              minLength: { value: 6, message: 'Password minimal 6 karakter' },
            })}
          />
        </FormField>
        <FormField id="confirmPassword" label="Konfirmasi password" error={errors.confirmPassword?.message}>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword', {
              required: 'Konfirmasi password wajib diisi',
              validate: (v) => v === watch('password') || 'Konfirmasi password tidak cocok',
            })}
          />
          {/* Ada fungsi validate yang mencocokkan apakah ketikannya sama persis dengan kolom Password di atasnya (watch('password')). Jika beda, otomatis muncul pesan error "Konfirmasi password tidak cocok". */}
        </FormField>
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />} Daftar
        </Button>
      </form>
    </AuthShell>
  );
}
