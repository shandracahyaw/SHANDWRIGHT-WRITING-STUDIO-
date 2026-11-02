import React, { useState, useEffect, createContext, useContext } from 'react';
import { Lock, Unlock, KeyRound, Shield, Eye, EyeOff, Feather, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthContextType {
  username: string;
  lockStudio: () => void;
  openAccountSettings: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useLocalAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useLocalAuth must be used within LocalAuthGate');
  }
  return ctx;
};

// SHA-256 local hash helper
async function hashPassword(password: string): Promise<string> {
  const salt = 'jaeyyyiii-secure-salt-2026';
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const STORAGE_KEY_ACCOUNT = 'jaeyyyiii_auth_account';
const STORAGE_KEY_SESSION = 'jaeyyyiii_auth_session';

interface StoredAccount {
  username: string;
  passwordHash: string;
  hint?: string;
  createdAt: string;
}

export const LocalAuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<StoredAccount | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Setup form states
  const [setupUsername, setSetupUsername] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [setupHint, setSetupHint] = useState('');
  const [showSetupPassword, setShowSetupPassword] = useState(false);

  // Login form states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password reset/hint dialog
  const [showHintModal, setShowHintModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Load account and session on initial mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACCOUNT);
      if (raw) {
        const parsed: StoredAccount = JSON.parse(raw);
        setAccount(parsed);
        // Check if session is currently active
        const active = sessionStorage.getItem(STORAGE_KEY_SESSION);
        if (active === 'unlocked') {
          setIsUnlocked(true);
        }
      }
    } catch (err) {
      console.error('Error loading local auth state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!setupUsername.trim()) {
      setErrorMessage('Username wajib diisi.');
      return;
    }
    if (setupPassword.length < 4) {
      setErrorMessage('Kata sandi minimal 4 karakter.');
      return;
    }
    if (setupPassword !== setupConfirm) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    const hash = await hashPassword(setupPassword);
    const newAcc: StoredAccount = {
      username: setupUsername.trim(),
      passwordHash: hash,
      hint: setupHint.trim(),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY_ACCOUNT, JSON.stringify(newAcc));
    sessionStorage.setItem(STORAGE_KEY_SESSION, 'unlocked');
    setAccount(newAcc);
    setIsUnlocked(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!account) return;

    if (loginUsername.trim().toLowerCase() !== account.username.toLowerCase()) {
      setErrorMessage('Username tidak ditemukan.');
      return;
    }

    const hash = await hashPassword(loginPassword);
    if (hash !== account.passwordHash) {
      setErrorMessage('Kata sandi salah.');
      return;
    }

    sessionStorage.setItem(STORAGE_KEY_SESSION, 'unlocked');
    setIsUnlocked(true);
    setLoginPassword('');
    setErrorMessage('');
  };

  const lockStudio = () => {
    sessionStorage.removeItem(STORAGE_KEY_SESSION);
    setIsUnlocked(false);
    setLoginPassword('');
    setErrorMessage('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center text-white font-sans">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--app-accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  // 1. Initial Setup Screen (First time visit)
  if (!account) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[var(--app-accent)] flex items-center justify-center mx-auto shadow-md">
              <Feather className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--app-text)] font-cinzel">
              jaeyyyiii
            </h1>
            <p className="text-xs uppercase tracking-widest text-[var(--app-accent)] font-semibold">
              WRITING STUDIO
            </p>
            <div className="pt-2">
              <h2 className="text-base font-semibold text-[var(--app-text)]">
                Buat Kunci Studio Pribadi
              </h2>
              <p className="text-xs text-[var(--app-text-muted)] mt-1">
                Atur username dan kata sandi Anda sendiri agar draf dan karya Anda hanya bisa dibuka oleh Anda di perangkat ini.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSetup} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-[var(--app-text-muted)] uppercase mb-1">
                Username Anda *
              </label>
              <input
                type="text"
                required
                value={setupUsername}
                onChange={(e) => setSetupUsername(e.target.value)}
                placeholder="Contoh: jaeyyyiii"
                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3.5 py-2.5 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--app-text-muted)] uppercase mb-1">
                Kata Sandi *
              </label>
              <div className="relative">
                <input
                  type={showSetupPassword ? 'text' : 'password'}
                  required
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3.5 py-2.5 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSetupPassword(!showSetupPassword)}
                  className="absolute right-3 top-2.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                >
                  {showSetupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--app-text-muted)] uppercase mb-1">
                Ulangi Kata Sandi *
              </label>
              <input
                type="password"
                required
                value={setupConfirm}
                onChange={(e) => setSetupConfirm(e.target.value)}
                placeholder="Masukkan ulang kata sandi"
                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3.5 py-2.5 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--app-text-muted)] uppercase mb-1">
                Petunjuk Sandi (Opsional)
              </label>
              <input
                type="text"
                value={setupHint}
                onChange={(e) => setSetupHint(e.target.value)}
                placeholder="Contoh: Nama kucing pertama"
                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3.5 py-2.5 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--app-accent)] text-black font-bold text-xs hover:opacity-90 active:scale-98 transition-all shadow-md mt-2"
            >
              <Shield className="w-4 h-4 stroke-[2.5]" />
              <span>Aktifkan Kunci Studio &amp; Masuk</span>
            </button>
          </form>

          <p className="text-[11px] text-center text-[var(--app-text-muted)]">
            🔒 Keamanan lokal: Semua draf disimpan di komputer Anda dan terlindungi dari pihak lain.
          </p>
        </div>
      </div>
    );
  }

  // 2. Login Screen (Studio Locked)
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[var(--app-accent)] flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--app-text)] font-cinzel">
              jaeyyyiii
            </h1>
            <p className="text-xs uppercase tracking-widest text-[var(--app-accent)] font-semibold">
              WRITING STUDIO
            </p>
            <p className="text-xs text-[var(--app-text-muted)] pt-1">
              Studio terkunci. Masukkan kredensial Anda untuk membuka draf cerita.
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-[var(--app-text-muted)] uppercase mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Masukkan username Anda"
                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3.5 py-2.5 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--app-text-muted)] uppercase mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3.5 py-2.5 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-2.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--app-accent)] text-black font-bold text-xs hover:opacity-90 active:scale-98 transition-all shadow-md mt-2"
            >
              <Unlock className="w-4 h-4 stroke-[2.5]" />
              <span>Buka Studio</span>
            </button>
          </form>

          {account.hint && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowHintModal(true)}
                className="text-[11px] text-[var(--app-text-muted)] hover:text-[var(--app-accent)] transition-colors underline"
              >
                Lupa kata sandi? Lihat petunjuk sandi
              </button>
            </div>
          )}

          {showHintModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="w-full max-w-xs bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl p-5 shadow-2xl text-[var(--app-text)] space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[var(--app-accent)]" />
                  Petunjuk Kata Sandi
                </h3>
                <p className="text-xs text-[var(--app-text-muted)]">
                  {account.hint ? account.hint : 'Tidak ada petunjuk yang disimpan.'}
                </p>
                <button
                  onClick={() => setShowHintModal(false)}
                  className="w-full py-2 rounded-xl bg-[var(--app-card-sub)] border border-[var(--app-border)] text-xs font-semibold text-[var(--app-text)] hover:border-[var(--app-accent)] transition-colors mt-2"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. Unlocked Studio: Provide Context to child components
  return (
    <AuthContext.Provider
      value={{
        username: account.username,
        lockStudio,
        openAccountSettings: () => setShowSettingsModal(true),
      }}
    >
      {children}

      {/* Account Settings / Change Password Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl p-6 shadow-2xl text-[var(--app-text)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--app-accent)]" />
                <h3 className="text-sm font-bold">Kunci &amp; Akun Studio</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--app-card-sub)] border border-[var(--app-border)]">
                <p className="text-[11px] text-[var(--app-text-muted)]">Username Aktif:</p>
                <p className="text-sm font-bold text-[var(--app-text)]">{account.username}</p>
                {account.hint && (
                  <p className="text-[10px] text-[var(--app-text-muted)] mt-1">
                    Petunjuk: {account.hint}
                  </p>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(false);
                    lockStudio();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[var(--app-accent-bg)] border border-[var(--app-accent)]/30 text-[var(--app-accent)] font-semibold text-xs hover:bg-[var(--app-accent)] hover:text-black transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Kunci Studio Sekarang</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Yakin ingin mengganti username dan sandi studio Anda?')) {
                      localStorage.removeItem(STORAGE_KEY_ACCOUNT);
                      sessionStorage.removeItem(STORAGE_KEY_SESSION);
                      setAccount(null);
                      setIsUnlocked(false);
                      setShowSettingsModal(false);
                    }
                  }}
                  className="w-full py-2 rounded-xl border border-[var(--app-border)] text-xs text-[var(--app-text-muted)] hover:text-red-400 transition-colors"
                >
                  Reset / Ganti Kredensial Studio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
