'use client';

import { ArrowRight, Lock, Mail, Webhook } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authClient } from '@/src/lib/auth-client';
import { Input } from './form/input';
import { PasswordInput } from './form/password-input';
import { GoogleButton } from './google-button';

export default function LoginCard() {
  const router = useRouter();

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) return;

    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL: `${window.location.origin}/dashboard`,
    });

    if (result.error) {
      toast.error(result.error.message ?? 'Failed to sign in.');
      return;
    }

    toast.success('Signed in successfully!');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 text-text-main relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        style={{ backgroundColor: 'rgba(167, 139, 250, 0.15)' }}
      />

      <div className="w-full max-w-[420px] bg-surface relative z-10 border border-border border-r-[4px] border-r-border-bold border-b-[4px] border-b-border-bold rounded-2xl">
        <div className="p-8 pb-6">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(124,58,237,0.25)]">
              <Webhook size={22} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl tracking-tight">Hookly</span>
          </div>

          <h1 className="text-[28px] font-extrabold tracking-tight mb-1.5">Welcome back</h1>
          <p className="text-text-muted text-sm leading-relaxed">
            Sign in to manage your webhooks and integrations.
          </p>
        </div>

        <div className="px-8 pb-8 space-y-5">
          <GoogleButton label="Sign in with Google" />

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-xs text-text-muted font-medium uppercase tracking-wider">
              Or continue with
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <form className="space-y-4" onSubmit={(e) => handleLogin(e)}>
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="name@company.com"
              icon={Mail}
              autoComplete="email"
              required
              maxLength={255}
            />
            <PasswordInput
              id="password"
              label="Password"
              placeholder="••••••••"
              icon={Lock}
              minLength={8}
              maxLength={128}
              trailing={
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-accent hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              }
            />

            <button
              type="submit"
              className="w-full font-semibold h-12 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-2 cursor-pointer group bg-primary text-primary-foreground shadow-[0_4px_14px_rgba(124,58,237,0.3)]"
            >
              Sign in
              <ArrowRight
                className="group-hover:translate-x-2 transition-transform duration-200"
                size={18}
              />
            </button>
          </form>
        </div>

        <div className="border-t border-border px-8 py-5 text-center rounded-b-xl">
          <p className="text-sm text-text-muted">
            Don't have an account?{' '}
            <Link
              href="/auth/sign-up"
              className="font-semibold hover:underline transition-colors text-primary"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
