'use client'

import { Webhook, ArrowRight, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { GoogleButton } from "./google-button";
import { FormInput } from "./form-input";

export default function RegisterCard() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 text-text-main relative overflow-hidden">

            <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)',
                backgroundSize: '32px 32px',
            }} />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: 'rgba(167, 139, 250, 0.15)' }} />

            <div
                className="w-full max-w-[420px] bg-surface relative z-10"
                style={{
                    border: '1px solid var(--border)',
                    borderRight: '4px solid var(--border-bold)',
                    borderBottom: '4px solid var(--border-bold)',
                    borderRadius: '16px',
                }}
            >

                <div className="p-8 pb-6">
                    <div className="flex items-center gap-2.5 mb-8">
                        <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)' }}>
                            <Webhook size={22} strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Hookly</span>
                    </div>

                    <h1 className="text-[28px] font-extrabold tracking-tight mb-1.5">Create an account</h1>
                    <p className="text-text-muted text-sm leading-relaxed">Get started with your webhook orchestration.</p>
                </div>

                <div className="px-8 pb-8 space-y-5">
                    <GoogleButton label="Sign up with Google" />

                    <div className="relative flex items-center py-1">
                        <div className="flex-grow border-t border-border"></div>
                        <span className="flex-shrink-0 mx-4 text-xs text-text-muted font-medium uppercase tracking-wider">Or continue with</span>
                        <div className="flex-grow border-t border-border"></div>
                    </div>

                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <FormInput id="name" label="Name" type="text" placeholder="John Doe" icon={User} />
                        <FormInput id="email" label="Email" type="email" placeholder="name@company.com" icon={Mail} />
                        <FormInput id="password" label="Password" type="password" placeholder="••••••••" icon={Lock} />

                        <button
                            className="w-full font-semibold h-12 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                            style={{
                                backgroundColor: 'var(--primary)',
                                color: 'var(--primary-foreground)',
                                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)'
                            }}
                        >
                            Create account
                            <ArrowRight size={18} />
                        </button>
                    </form>
                </div>

                <div className="border-t border-border px-8 py-5 text-center" style={{ borderBottomLeftRadius: '16px', borderBottomRightRadius: '12px' }}>
                    <p className="text-sm text-text-muted">
                        Already have an account?{' '}
                        <Link href="/auth/sign-in" className="font-semibold hover:underline transition-colors" style={{ color: 'var(--primary)' }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
