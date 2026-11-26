import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { BrandLogo, OrnamentalCorner } from '@/components/BrandLogo';
import { supabase } from '@/lib/supabase';

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/admin', { replace: true });
      }
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Email dan kata sandi wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError('Email atau kata sandi tidak valid. Silakan periksa kembali.');
        return;
      }

      toast.success('Selamat datang di Panel Admin Safara Prayer.');
      navigate('/admin', { replace: true });
    } catch {
      setError('Terjadi kendala saat menghubungi layanan autentikasi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-[78vh] items-center justify-center overflow-hidden bg-[#F3E5D8]/55 px-4 py-14">
      <OrnamentalCorner className="absolute -left-8 -top-8 h-56 w-56 text-[#C9B39E]" />
      <OrnamentalCorner className="absolute -bottom-8 -right-8 h-56 w-56 rotate-180 text-[#C9B39E]" />

      <div className="relative w-full max-w-md rounded-3xl border border-[#D6C3B3] bg-[#FAF6F2] p-8 shadow-sm sm:p-10">
        <div className="flex flex-col items-center">
          <BrandLogo variant="full" size="sm" />
          <p className="mt-4 text-[11px] font-medium tracking-[0.22em] uppercase text-[#57534E]">
            Portal Administrator
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-[#DFB9B9] bg-[#FDF2F2] px-4 py-3 text-xs text-[#7F1D1D]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="admin_email"
              className="block text-xs font-medium tracking-[0.14em] uppercase text-[#1C1917]"
            >
              Email Admin
            </label>
            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#57534E]" />
              <input
                id="admin_email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@safaraprayer.com"
                className="w-full rounded-xl border border-[#D6C3B3] bg-[#FAF6F2] py-3 pl-10 pr-4 text-sm text-[#1C1917] placeholder:text-[#57534E]/60 focus:border-[#1C1917] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin_password"
              className="block text-xs font-medium tracking-[0.14em] uppercase text-[#1C1917]"
            >
              Kata Sandi
            </label>
            <div className="relative mt-2">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#57534E]" />
              <input
                id="admin_password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#D6C3B3] bg-[#FAF6F2] py-3 pl-10 pr-11 text-sm text-[#1C1917] placeholder:text-[#57534E]/60 focus:border-[#1C1917] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#57534E] hover:text-[#1C1917]"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1C1917] px-6 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-[#FAF6F2] transition hover:bg-[#292524] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Masuk...
              </>
            ) : (
              'Masuk ke Dashboard'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
