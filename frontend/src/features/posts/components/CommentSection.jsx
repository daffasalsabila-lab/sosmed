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
import LocationDisplay from './LocationDisplay';

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

  const handleUpdated = async (commentId, { text, ...values }) => {
    try {
      const updated = await updateComment(postId, commentId, { comment: text, ...values });
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
    const replyTarget = comment.parentId
      ? (comments || []).find((item) => item.id === comment.parentId)
      : null;
    const shouldMentionReplyTarget = replyTarget && replyTarget.user.id !== comment.user.id;

    return (
      <li key={comment.id} className="space-y-2">
        <div className="flex items-start gap-2 sm:gap-3">
          <Link to={profilePath} aria-label={`Lihat profil ${comment.user.name}`}>
            <UserAvatar user={comment.user} className="h-9 w-9" />
          </Link>
          <div className="min-w-0 flex-1 space-y-1">
            {editingId === comment.id ? (
              <ContentEditForm
                initialText={comment.comment}
                image={comment.image}
                allowLocation
                allowLocationOnly
                initialLocation={
                  comment.latitude != null && comment.longitude != null
                    ? {
                        latitude: comment.latitude,
                        longitude: comment.longitude,
                        name: comment.locationName,
                      }
                    : null
                }
                label="Edit komentar"
                maxLength={1000}
                onSave={(values) => handleUpdated(comment.id, values)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                <div className="rounded-2xl rounded-tl-md border border-border/60 bg-muted/40 px-3.5 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <Link to={profilePath} className="text-sm font-semibold hover:underline">
                      {comment.user.name}
                    </Link>
                    <time
                      className="text-[11px] text-muted-foreground"
                      title={fullDate(comment.createdAt)}
                      dateTime={comment.createdAt}
                    >
                      {timeAgo(comment.createdAt)}
                    </time>
                  </div>
                  {(comment.comment || shouldMentionReplyTarget) && (
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {shouldMentionReplyTarget && (
                        <span className="mr-1 font-semibold text-primary">
                          @{replyTarget.user.name}
                        </span>
                      )}
                      {comment.comment}
                    </p>
                  )}
                  <LocationDisplay
                    latitude={comment.latitude}
                    longitude={comment.longitude}
                    locationName={comment.locationName}
                    className="mt-2"
                  />
                  {comment.image && (
                    <img
                      src={assetUrl(comment.image)}
                      alt="Lampiran komentar"
                      loading="lazy"
                      className="mt-2 max-h-64 max-w-full rounded-lg object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(comment.id)}
                    disabled={likingId !== null || deletingId === comment.id}
                    aria-pressed={comment.likedByMe}
                    aria-label={comment.likedByMe ? 'Batal suka komentar' : 'Suka komentar'}
                    className={cn(
                      'h-8 gap-1.5 px-2.5 text-xs text-muted-foreground',
                      comment.likedByMe && 'text-red-500 hover:text-red-500',
                    )}
                  >
                    {likingId === comment.id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Heart className={cn('h-4 w-4', comment.likedByMe && 'fill-current')} />}
                    {comment.likesCount}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo((current) => current === comment.id ? null : comment.id)}
                    className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground"
                  >
                    <CornerUpLeft className="h-4 w-4" /> Balas
                  </Button>
                  {isOwner && (
                    <details className="relative">
                      <summary
                        aria-label="Menu komentar"
                        className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-md text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden"
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
          <ul className="ml-5 space-y-3 border-l-2 border-border/60 pl-3 sm:ml-11 sm:pl-4">
            {repliesFor(comment.id).map((reply) => renderComment(reply))}
          </ul>
        )}
        {replyingTo === comment.id && (
          <div className="ml-5 border-l-2 border-border/60 pl-3 sm:ml-11 sm:pl-4">
            {comment.user.id !== user?.id && (
              <p className="mb-2 truncate text-xs text-muted-foreground">
                Membalas <span className="font-medium text-foreground">@{comment.user.name}</span>
              </p>
            )}
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
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Komentar</h3>
        {comments !== null && (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {comments.length}
          </span>
        )}
      </div>
      {comments === null ? (
        <div className="flex justify-center rounded-xl border border-border/60 bg-muted/20 py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Belum ada komentar. Jadilah yang pertama.
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.filter((comment) => !comment.parentId).map((comment) => renderComment(comment))}
        </ul>
      )}
      <div className="border-t border-border/60 pt-4">
        <CommentForm postId={postId} onCreated={handleCreated} />
      </div>
    </div>
  );
}
