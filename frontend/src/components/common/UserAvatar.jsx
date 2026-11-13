import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { assetUrl } from '@/lib/http';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function UserAvatar({ user, className }) {
  return (
    <Avatar className={cn('h-10 w-10', className)}>
      <AvatarImage src={assetUrl(user?.avatar) || undefined} alt={user?.name} />
      <AvatarFallback className="text-xs font-medium">{initials(user?.name)}</AvatarFallback>
    </Avatar>
  );
}
