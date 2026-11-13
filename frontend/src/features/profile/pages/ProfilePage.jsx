import { Link, useLocation } from 'react-router-dom';
import UserAvatar from '@/components/common/UserAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/AuthContext';
import PasswordForm from '../components/PasswordForm';
import ProfileForm from '../components/ProfileForm';
import ProfilePosts from '../components/ProfilePosts';

export default function ProfilePage() {
  const { user } = useAuth();
  const { hash } = useLocation();

  if (hash === '#edit-profil') {
    return <ProfileForm />;
  }

  if (hash === '#ubah-password') {
    return <PasswordForm />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profil Saya</CardTitle>
          <CardDescription>Informasi profil Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} className="h-16 w-16" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{user?.name}</p>
              <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-medium text-slate-700">Bio</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
              {user?.bio || 'Belum ada bio.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/profile#edit-profil">Edit Profil</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/profile#ubah-password">Ubah Password</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      {user && <ProfilePosts userId={user.id} />}
    </>
  );
}
