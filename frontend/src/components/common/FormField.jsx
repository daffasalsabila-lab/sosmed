import { Label } from '@/components/ui/label';

export default function FormField({ id, label, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

// kenapa Komponen Ini Dibuat? 
// Tanpa komponen FormField ini, setiap kali kamu membuat input di halaman Login atau Register,  harus menulis ulang kode untuk menampilkan label, input, teks bantuan, dan teks error secara manual berulang-ulang.

// Dengan FormField, cukup menulisnya sekali, dan semua kotak input di seluruh web akan memiliki tampilan, jarak, dan gaya error yang rapi dan konsisten secara otomatis