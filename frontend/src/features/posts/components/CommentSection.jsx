import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import UserAvatar from '@/components/common/UserAvatar';
import { assetUrl, getErrorMessage } from '@/lib/http';
import { fullDate, timeAgo } from '@/lib/format';
import { fetchComments } from '../api';
import CommentForm from './CommentForm';

export default function CommentSection({ postId, onCountChange }) {
  const [comments, setComments] = useState(null);

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
          {comments.map((c) => (
            <li key={c.id} className="flex gap-2">
              <UserAvatar user={c.user} className="h-8 w-8" />
              <div className="min-w-0 flex-1">
                <div className="rounded-lg bg-muted px-3 py-2">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-sm font-semibold">{c.user.name}</span>
                    <time className="text-xs text-muted-foreground" title={fullDate(c.createdAt)} dateTime={c.createdAt}>
                      {timeAgo(c.createdAt)}
                    </time>
                  </div>
                  {c.comment && <p className="whitespace-pre-wrap break-words text-sm">{c.comment}</p>}
                  {c.image && (
                    <img
                      src={assetUrl(c.image)}
                      alt="Lampiran komentar"
                      loading="lazy"
                      className="mt-2 max-h-56 rounded-md object-cover"
                    />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <CommentForm postId={postId} onCreated={handleCreated} />
    </div>
  );
}
