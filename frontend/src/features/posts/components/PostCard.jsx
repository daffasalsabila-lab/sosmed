import { useState } from 'react';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import UserAvatar from '@/components/common/UserAvatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/features/auth/AuthContext';
import { fullDate, timeAgo } from '@/lib/format';
import { assetUrl, getErrorMessage } from '@/lib/http';
import { cn } from '@/lib/utils';
import { deletePost, toggleLike } from '../api';
import CommentSection from './CommentSection';

export default function PostCard({ post, onDeleted, onChange }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isOwner = post.user.id === user?.id; // tombol hapus hanya untuk pemilik (server juga memverifikasi)

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const { liked, likesCount } = await toggleLike(post.id);
      onChange(post.id, { likedByMe: liked, likesCount });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLiking(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePost(post.id);
      onDeleted(post.id);
      toast.success('Postingan dihapus');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <UserAvatar user={post.user} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{post.user.name}</p>
            <time className="text-xs text-muted-foreground" title={fullDate(post.createdAt)} dateTime={post.createdAt}>
              {timeAgo(post.createdAt)}
            </time>
          </div>

          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Hapus postingan" title="Hapus postingan" disabled={deleting}>
                  <Trash2 className="text-muted-foreground" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus postingan ini?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Postingan beserta like dan komentarnya akan dihapus permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDelete}
                  >
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {post.content && <p className="whitespace-pre-wrap break-words text-sm">{post.content}</p>}
        {post.image && (
          <img
            src={assetUrl(post.image)}
            alt="Lampiran status"
            loading="lazy"
            className="h-auto w-full rounded-lg border"
            // ini adalah bagian ukuran foto yang telah diposting
          />
        )}

        <div className="flex items-center gap-1 border-t pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={liking}
            aria-pressed={post.likedByMe}
            className={cn(post.likedByMe && 'text-red-500 hover:text-red-500')}
          >
            <Heart className={cn(post.likedByMe && 'fill-current')} /> {post.likesCount}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowComments((s) => !s)} aria-expanded={showComments}>
            <MessageCircle /> {post.commentsCount}
          </Button>
        </div>

        {showComments && (
          <CommentSection postId={post.id} onCountChange={(n) => onChange(post.id, { commentsCount: n })} />
        )}
      </CardContent>
    </Card>
  );
}
