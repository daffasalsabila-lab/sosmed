import { LogOut, MessagesSquare } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import UserAvatar from '@/components/common/UserAvatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      {/* mx=ketengah isian nya ibarat nya langsung kekiri kalau tanpa dia max-w=biar ketengah */}
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <MessagesSquare className="h-5 w-5" /> ConnectSpace
        </Link>
        <div className="flex items-center gap-1">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent',
                isActive && 'bg-accent',
              )
            }
          >
            <UserAvatar user={user} className="h-8 w-8" />
            <span className="hidden max-w-[10rem] truncate font-medium sm:inline">{user?.name}</span>
          </NavLink>
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Keluar" title="Keluar">
            <LogOut />
          </Button>
        </div>
      </div>
    </header>
  );
}
