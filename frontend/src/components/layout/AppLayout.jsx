import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-violet-100/70 to-purple-200/70">
      <Navbar />
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">    
        <Outlet />
      </main>
    </div>
  );
}
