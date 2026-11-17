// bingkai atau latar belakang form login maupun regis

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import logoImage from '@/assets/logo.png'; // 1. Impor logo dari folder assets


export default function AuthShell({ title, description, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#E3F2FD] via-[#90CAF9]/70 to-[#E3F2FD] p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo Custom & Nama Aplikasi */}
        <div className="flex items-center justify-center gap-3">
          <img 
            src={logoImage} // 2. Panggil variabel impor logo di sini
            alt="ConnectSpace Logo" 
            className="h-11 w-11 rounded-2xl border border-[#90CAF9] object-cover shadow-md"
          />
          <span className="text-2xl font-bold tracking-tight text-[#0D47A1]">ConnectSpace</span>
        </div>

        {/* Kotak Kartu */}
        <Card className="rounded-2xl border-[#90CAF9]/60 bg-white/90 shadow-xl shadow-[#90CAF9]/30 backdrop-blur-md">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold tracking-tight text-[#0D47A1]">{title}</CardTitle>
            <CardDescription className="text-sm text-[#0D47A1]/80">{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">{children}</CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground">{footer}</p>
      </div>
    </div>
  );
}
