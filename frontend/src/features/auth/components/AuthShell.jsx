// bingkai atau latar belakang form login maupun regis

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import logoImage from '@/assets/logo.png'; // 1. Impor logo dari folder assets


export default function AuthShell({ title, description, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 via-violet-100/70 to-purple-200/70 p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo Custom & Nama Aplikasi */}
        <div className="flex items-center justify-center gap-3">
          <img 
            src={logoImage} // 2. Panggil variabel impor logo di sini
            alt="ConnectSpace Logo" 
            className="h-11 w-11 rounded-2xl shadow-md object-cover border border-sky-200" 
          />
          <span className="text-2xl font-bold tracking-tight text-sky-900">ConnectSpace</span>
        </div>

        {/* Kotak Kartu */}
        <Card className="border-sky-100 shadow-xl shadow-sky-100/50 bg-white/90 backdrop-blur-md rounded-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold tracking-tight text-sky-950">{title}</CardTitle>
            <CardDescription className="text-sky-700/80 text-sm">{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">{children}</CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground">{footer}</p>
      </div>
    </div>
  );
}
