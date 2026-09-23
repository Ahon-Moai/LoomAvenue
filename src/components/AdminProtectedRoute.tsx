import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, ShieldAlert, Lock, LogOut, ArrowLeft, RefreshCw, KeyRound, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  onExit: () => void;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children, onExit }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  // Sign-in form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check admin privileges in user metadata OR profiles table
  const verifyAdminPrivileges = useCallback(async (currentUser: User): Promise<boolean> => {
    try {
      // 1. Check user metadata / app_metadata for 'admin' role or 'is_admin' flag
      const appRole = currentUser.app_metadata?.role;
      const userRole = currentUser.user_metadata?.role;
      const appIsAdmin = currentUser.app_metadata?.is_admin;
      const userIsAdmin = currentUser.user_metadata?.is_admin;

      if (
        appRole === 'admin' ||
        userRole === 'admin' ||
        appIsAdmin === true ||
        userIsAdmin === true
      ) {
        return true;
      }

      // 2. Check the Supabase 'profiles' table for 'is_admin' = true or 'role' = 'admin'
      if (supabase) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin, role')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (!error && profile) {
          if (profile.is_admin === true || profile.role === 'admin') {
            return true;
          }
        }
      }

      return false;
    } catch (err: any) {
      console.error('Error verifying admin privileges:', err);
      setCheckError(err.message || 'Permission verification error');
      return false;
    }
  }, []);

  // Initial session & auth listener
  useEffect(() => {
    let isMounted = true;

    if (!supabase) {
      setLoading(false);
      return;
    }

    const checkCurrentSession = async () => {
      setLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (isMounted) {
          if (session?.user) {
            setUser(session.user);
            const verified = await verifyAdminPrivileges(session.user);
            setIsAdmin(verified);
          } else {
            setUser(null);
            setIsAdmin(false);
          }
        }
      } catch (err: any) {
        console.warn('Session retrieval warning:', err);
        if (isMounted) {
          setUser(null);
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkCurrentSession();

    // Listen for auth changes (sign-in, sign-out, token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        setUser(session.user);
        setLoading(true);
        const verified = await verifyAdminPrivileges(session.user);
        setIsAdmin(verified);
        setLoading(false);
      } else {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [verifyAdminPrivileges]);

  // Handle Login submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setAuthError('Supabase client is not configured.');
      return;
    }

    setSubmitting(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setUser(data.user);
        const verified = await verifyAdminPrivileges(data.user);
        setIsAdmin(verified);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsAdmin(false);
    setEmail('');
    setPassword('');
  };

  // Re-verify manually if admin privileges were just granted in Supabase
  const handleManualRecheck = async () => {
    if (!user) return;
    setLoading(true);
    setCheckError(null);
    const verified = await verifyAdminPrivileges(user);
    setIsAdmin(verified);
    setLoading(false);
  };

  // 1. Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0e11] text-neutral-200 flex flex-col items-center justify-center p-6 select-none">
        <div className="w-14 h-14 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-mono">
          Verifying Administrator Privileges...
        </p>
      </div>
    );
  }

  // 2. Not logged in -> Render Protected Admin Sign-In Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0c0e] text-neutral-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl p-8 rounded-2xl shadow-2xl relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-serif tracking-wide text-white">Loom-Avenue</h1>
                <p className="text-xs text-neutral-400">Staff & Administrator Access</p>
              </div>
            </div>
            
            <button
              onClick={onExit}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
              title="Return to Storefront"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-6 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3.5 text-xs text-amber-200/90 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Protected route: Requires authenticated credentials with an assigned <strong>admin</strong> role in Supabase.
            </span>
          </div>

          {authError && (
            <div className="mb-5 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 font-mono mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@loomcontrol.com"
                className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-800/80 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 font-mono mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-800/80 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-medium text-sm transition-all shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate Admin</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
            <span>Encrypted Supabase Auth</span>
            <button
              type="button"
              onClick={onExit}
              className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. User is authenticated, but DOES NOT have admin privileges
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0b0c0e] text-neutral-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg bg-neutral-900/90 border border-neutral-800 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-5">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <h1 className="text-xl font-serif text-white mb-1">Access Restricted (403)</h1>
          <p className="text-sm text-neutral-400 mb-5">
            You are signed in as <strong className="text-neutral-200">{user.email}</strong>, but your account lacks administrative clearance.
          </p>

          <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 text-xs space-y-2 mb-6 font-mono text-neutral-300">
            <div className="flex justify-between border-b border-neutral-800 pb-2">
              <span className="text-neutral-500">User ID:</span>
              <span className="text-neutral-400 truncate max-w-[240px]">{user.id}</span>
            </div>
            <div className="flex justify-between border-b border-neutral-800 pb-2">
              <span className="text-neutral-500">Metadata 'role':</span>
              <span className="text-rose-400">{user.app_metadata?.role || user.user_metadata?.role || 'null'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">profiles.is_admin:</span>
              <span className="text-rose-400">false / not found</span>
            </div>
          </div>

          <div className="bg-neutral-800/40 rounded-lg p-3 text-xs text-neutral-400 mb-6">
            <p className="font-semibold text-neutral-300 mb-1">How to grant access in Supabase:</p>
            <p className="text-neutral-400 font-mono text-[11px] bg-neutral-950 p-2 rounded border border-neutral-800 select-all">
              UPDATE public.profiles SET is_admin = true WHERE id = '{user.id}';
            </p>
          </div>

          {checkError && (
            <div className="mb-4 text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 p-2.5 rounded">
              {checkError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleManualRecheck}
              className="flex-1 py-2.5 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-check Privileges
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 py-2.5 px-4 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-medium transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
            <button
              onClick={onExit}
              className="py-2.5 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs transition-colors"
            >
              Return to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authenticated AND Verified Admin -> Render Admin Panel
  return (
    <div className="min-h-screen bg-[#0d0e12] text-neutral-100 flex flex-col">
      {/* Top Security Status Bar */}
      <header className="bg-neutral-900/90 border-b border-neutral-800/80 px-6 py-2.5 flex items-center justify-between text-xs backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Admin
          </span>
          <span className="text-neutral-400 font-mono text-[11px] hidden sm:inline">
            {user.email}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExit}
            className="px-3 py-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Storefront
          </button>
          <button
            onClick={handleSignOut}
            className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5 text-neutral-400" /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Admin Panel View */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};
