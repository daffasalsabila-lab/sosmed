import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import PostCard from '@/features/posts/components/PostCard';
import { useFeed } from '@/features/posts/hooks/useFeed';

export default function ProfilePosts({ userId }) {
  const { posts, loading, loadingMore, hasMore, loadMore, removePost, patchPost } = useFeed(userId);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Postingan</h2>
      {loading ? (
        <div className="space-y-4">
          {[0, 1].map((item) => <Skeleton key={item} className="h-40 w-full rounded-xl" />)}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Belum ada postingan.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onDeleted={removePost} onChange={patchPost} />
          ))}
          {hasMore && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                {loadingMore && <Loader2 className="animate-spin" />} Muat lebih banyak
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
