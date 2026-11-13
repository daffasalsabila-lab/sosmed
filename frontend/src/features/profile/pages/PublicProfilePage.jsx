import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import UserAvatar from '@/components/common/UserAvatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fullDate } from '@/lib/format';
import { getErrorMessage } from '@/lib/http';
import { toast } from 'sonner';
import ProfilePosts from '../components/ProfilePosts';
import { fetchPublicProfile } from '../api';

export default function PublicProfilePage() {
  const { userId: rawUserId } = useParams();
  const userId = Number(rawUserId);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setProfile(null);
    setLoading(true);

    if (!Number.isInteger(userId) || userId < 1) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    fetchPublicProfile(userId)
      .then((result) => active && setProfile(result))
      .catch((err) => {
        if (!active) return;
        toast.error(getErrorMessage(err, 'Gagal memuat profil'));
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [userId]);

  if (loading) {
    return <Skeleton className="h-44 w-full rounded-xl" />;
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Profil tidak ditemukan.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profil {profile.name}</CardTitle>
          <CardDescription>Informasi profil dan postingan pengguna.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <UserAvatar user={profile} className="h-16 w-16" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{profile.name}</p>
              <p className="text-sm text-muted-foreground">
                Bergabung {fullDate(profile.createdAt)}
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-medium text-slate-700">Bio</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
              {profile.bio || 'Belum ada bio.'}
            </p>
          </div>
        </CardContent>
      </Card>
      <ProfilePosts userId={profile.id} />
    </>
  );
}
