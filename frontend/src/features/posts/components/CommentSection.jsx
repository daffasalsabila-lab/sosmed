import { useEffect, useState } from 'react';
import { CornerUpLeft, Heart, Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
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
import UserAvatar from '@/components/common/UserAvatar';
import { useAuth } from '@/features/auth/AuthContext';
import { assetUrl, getErrorMessage } from '@/lib/http';
import { fullDate, timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import { deleteComment, fetchComments, toggleCommentLike, updateComment } from '../api';
import CommentForm from './CommentForm';
import ContentEditForm from './ContentEditForm';

export default function CommentSection({ postId, onCountChange }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [likingId, setLikingId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    let active = true;
    fetchComments(postId)
      .then((rows) => {
        if (!active) return;
        setComments(rows);
        onCountChange(rows.length);
      })
      .catch((err) => {
        toast.error(getErrorMessage(err, 'Gagal memuat komentar'));
        if (active) setComments([]);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleCreated = (c) => {
    setComments((prev) => {
      const next = [...(prev || []), c];
      onCountChange(next.length);
      return next;
    });
  };

  const handleUpdated = async (commentId, { text, ...image }) => {
    try {
      const updated = await updateComment(postId, commentId, { comment: text, ...image });
      setComments((prev) => prev.map((comment) => (comment.id === commentId ? updated : comment)));
      setEditingId(null);
      toast.success('Komentar berhasil diperbarui');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleLike = async (commentId) => {
    if (likingId !== null) return;
    setLikingId(commentId);
    try {
      const { liked, likesCount } = await toggleCommentLike(postId, commentId);
      setComments((prev) => prev.map((comment) =>
        comment.id === commentId ? { ...comment, likedByMe: liked, likesCount } : comment,
      ));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLikingId(null);
    }
  };

  const handleDeleted = async (commentId) => {
    setDeletingId(commentId);
    try {
      await deleteComment(postId, commentId);
      const deletedIds = new Set([commentId]);
      let foundDescendant = true;
      while (foundDescendant) {
        foundDescendant = false;
        (comments || []).forEach((comment) => {
          if (deletedIds.has(comment.parentId) && !deletedIds.has(comment.id)) {
            deletedIds.add(comment.id);
            foundDescendant = true;
          }
        });
      }
      setComments((prev) => {
        const next = prev.filter((comment) => !deletedIds.has(comment.id));
        onCountChange(next.length);
        return next;
      });
      setReplyingTo((current) => deletedIds.has(current) ? null : current);
      toast.success('Komentar dihapus');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const repliesFor = (commentId) => (comments || []).filter((comment) => comment.parentId === commentId);

  const renderComment = (comment) => {
    const isOwner = comment.user.id === user?.id;
    const profilePath = isOwner ? '/profile' : `/profile/${comment.user.id}`;

    return (
      <li key={comment.id} className="space-y-2">
        <div className="flex gap-2">
          <Link to={profilePath} aria-label={`Lihat profil ${comment.user.name}`}>
            <UserAvatar user={comment.user} className="h-8 w-8" />
          </Link>
          <div className="min-w-0 flex-1">
            {editingId === comment.id ? (
              <ContentEditForm
                initialText={comment.comment}
                image={comment.image}
                label="Edit komentar"
                maxLength={1000}
                onSave={(values) => handleUpdated(comment.id, values)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                <div className="rounded-lg bg-muted px-3 py-2">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <Link to={profilePath} className="text-sm font-semibold hover:underline">
                      {comment.user.name}
                    </Link>
                    <time
                      className="text-xs text-muted-foreground"
                      title={fullDate(comment.createdAt)}
                      dateTime={comment.createdAt}
                    >
                      {timeAgo(comment.createdAt)}
                    </time>
                  </div>
                  {comment.comment && (
                    <p className="whitespace-pre-wrap break-words text-sm">{comment.comment}</p>
                  )}
                  {comment.image && (
                    <img
                      src={assetUrl(comment.image)}
                      alt="Lampiran komentar"
                      loading="lazy"
                      className="mt-2 max-h-56 rounded-md object-cover"
                    />
                  )}
                </div>
                <div className="mt-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(comment.id)}
                    disabled={likingId !== null || deletingId === comment.id}
                    aria-pressed={comment.likedByMe}
                    aria-label={comment.likedByMe ? 'Batal suka komentar' : 'Suka komentar'}
                    className={cn(comment.likedByMe && 'text-red-500 hover:text-red-500')}
                  >
                    {likingId === comment.id
                      ? <Loader2 className="animate-spin" />
                      : <Heart className={cn(comment.likedByMe && 'fill-current')} />}
                    {comment.likesCount}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo((current) => current === comment.id ? null : comment.id)}
                  >
                    <CornerUpLeft /> Balas
                  </Button>
                  {isOwner && (
                    <details className="relative">
                      <summary
                        aria-label="Menu komentar"
                        className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-md text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </summary>
                      <div className="absolute right-0 top-full z-50 mt-1 min-w-32 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                          onClick={() => setEditingId(comment.id)}
                          disabled={deletingId === comment.id}
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-destructive hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                            disabled={deletingId === comment.id}
                          >
                            {deletingId === comment.id
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <Trash2 className="h-4 w-4" />}
                            Hapus
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus komentar ini?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Komentar dan balasannya akan dihapus permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDeleted(comment.id)}
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      </div>
                    </details>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        {repliesFor(comment.id).length > 0 && (
          <ul className="ml-8 space-y-3 border-l pl-3">
            {repliesFor(comment.id).map((reply) => renderComment(reply))}
          </ul>
        )}
        {replyingTo === comment.id && (
          <div className="ml-8">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              onCreated={(reply) => {
                handleCreated(reply);
                setReplyingTo(null);
              }}
              onCancel={() => setReplyingTo(null)}
            />
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="space-y-3 border-t pt-3">
      {comments === null ? (
        <div className="flex justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-xs text-muted-foreground">Belum ada komentar. Jadilah yang pertama.</p>
      ) : (
        <ul className="space-y-3">
          {comments.filter((comment) => !comment.parentId).map((comment) => renderComment(comment))}
        </ul>
      )}
      <CommentForm postId={postId} onCreated={handleCreated} />
    </div>
  );
}
