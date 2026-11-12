import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import PostCard from '../components/PostCard';
import PostComposer from '../components/PostComposer';
import { useFeed } from '../hooks/useFeed';

export default function FeedPage() {
  const { posts, loading, loadingMore, hasMore, loadMore, addPost, removePost, patchPost } = useFeed();

  return (
    <>
      <PostComposer onCreated={addPost} />

      {loading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Belum ada status. Tulis status pertama Anda di atas.
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
    </>
  );
}
