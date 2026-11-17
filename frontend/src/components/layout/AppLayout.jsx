import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3368A0] via-[#167D8D]/70 to-[#B9E4E8]">
      <Navbar />
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">    
        <Outlet />
      </main>
    </div>
  );
}
