
import { useState } from 'react';
import {
  ChevronDown,
  KeyRound,
  LogOut,
  PencilLine,
  UserRound,
} from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import UserAvatar from '@/components/common/UserAvatar';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useAuth } from '@/features/auth/AuthContext';
import logoImage from '@/assets/logo.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
      setLogoutOpen(false);
    }
  };

  const menuItem =
    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-sky-50 hover:text-sky-700';

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-sky-200/80 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-semibold">
            <img
              src={logoImage}
              alt="ConnectSpace"
              className="h-9 w-9 rounded-xl border border-sky-200 object-cover shadow-sm"
            />
            <span className="text-lg font-bold tracking-tight text-sky-950">
              ConnectSpace
            </span>
          </Link>

          {/* Menu Profil */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-label="Menu akun"
              className="flex items-center gap-2 rounded-full px-2 hover:bg-sky-100"
            >
              <UserAvatar user={user} className="h-8 w-8" />

              <span className="hidden max-w-[10rem] truncate font-medium text-sky-900 sm:inline">
                {user?.name}
              </span>

              <ChevronDown
                className={`h-4 w-4 text-sky-700 transition-transform ${
                  menuOpen ? 'rotate-180' : ''
                }`}
              />
            </Button>

            {menuOpen && (
              <>
                {/* Area untuk menutup menu */}
                <button
                  type="button"
                  aria-label="Tutup menu"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />

                <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-sky-100 bg-white p-2 shadow-xl">

                  <div className="border-b border-sky-100 px-3 py-3">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {user?.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user?.email}
                    </p>
                  </div>

                  {/* <div> */}
                  <div className="space-y-1 py-2">

                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className={menuItem}
                    >
                      <UserRound className="h-4 w-4" />
                      Profil Saya
                    </Link>

                    <Link
                      to="/profile#edit-profil"
                      onClick={() => setMenuOpen(false)}
                      className={menuItem}
                    >
                      <PencilLine className="h-4 w-4" />
                      Edit Profil
                    </Link>

                    <Link
                      to="/profile#ubah-password"
                      onClick={() => setMenuOpen(false)}
                      className={menuItem}
                    >
                      <KeyRound className="h-4 w-4" />
                      Ubah Password
                    </Link>

                  </div>

                  <div className="border-t border-sky-100 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setLogoutOpen(true);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Keluar Akun
                    </button>
                  </div>

                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Konfirmasi Logout */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Keluar dari akun?
            </AlertDialogTitle>

            <AlertDialogDescription>
              Apakah kamu yakin ingin keluar dari akun ConnectSpace?
              Kamu harus login kembali untuk mengakses akunmu.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loggingOut}>
              Batal
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleLogout}
              disabled={loggingOut}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {loggingOut ? 'Memproses...' : 'Ya, Keluar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
