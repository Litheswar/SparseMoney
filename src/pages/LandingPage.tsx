import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, LockKeyhole, Sparkles, WalletCards, ArrowRight, UserPlus, LogIn } from 'lucide-react';

const trustItems = ['256-bit encryption', 'RBI compliant', 'Secure AA framework'];

export default function LandingPage() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  const handleNav = (path: string) => {
    setLeaving(true);
    window.setTimeout(() => navigate(path), 360);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,hsl(174_62%_88%/.75),transparent_34%),linear-gradient(145deg,hsl(174_62%_92%),hsl(180_10%_98%)_46%,white)] px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: leaving ? 0 : 1, y: leaving ? -24 : 0, scale: leaving ? 1.04 : 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col items-center justify-center gap-10"
      >
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="mb-5 inline-flex items-center gap-3"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/85 shadow-xl shadow-primary/15 ring-1 ring-primary/15 backdrop-blur">
              <WalletCards className="h-7 w-7 text-primary" />
            </div>
            <span className="font-heading text-4xl font-bold tracking-normal text-gradient sm:text-5xl">SpareSmart</span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            className="mx-auto max-w-2xl text-xl font-medium leading-relaxed text-foreground sm:text-2xl"
          >
            Turn your daily spending into intelligent investments
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/75 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Start your investment journey
          </div>
        </motion.div>

        <div className="grid w-full max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
          {/* Sign Up Card */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36, duration: 0.5, ease: 'easeOut' }}
            whileHover={{ y: -8, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNav('/signup')}
            className="group relative min-h-[260px] overflow-hidden rounded-lg border border-white/70 bg-white/78 p-8 text-left shadow-2xl shadow-primary/10 outline-none backdrop-blur-xl transition-colors duration-300 hover:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex h-full flex-col justify-between gap-10">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }}
                className="flex h-16 w-16 items-center justify-center rounded-lg gradient-primary text-primary-foreground shadow-lg shadow-primary/20"
              >
                <UserPlus className="h-8 w-8" />
              </motion.div>
              <div>
                <h2 className="font-heading text-3xl font-bold tracking-normal text-foreground">Create Account</h2>
                <p className="mt-3 max-w-sm text-base leading-7 text-muted-foreground">
                  Sign up with your name and email. We'll generate your UPI and set up your investment profile.
                </p>
                <div className="mt-7 flex items-center gap-2 text-sm font-semibold text-primary">
                  <ArrowRight className="h-4 w-4" />
                  Get started free
                </div>
              </div>
            </div>
          </motion.button>

          {/* Sign In Card */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48, duration: 0.5, ease: 'easeOut' }}
            whileHover={{ y: -8, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNav('/login')}
            className="group relative min-h-[260px] overflow-hidden rounded-lg border border-white/70 bg-white/78 p-8 text-left shadow-2xl shadow-primary/10 outline-none backdrop-blur-xl transition-colors duration-300 hover:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex h-full flex-col justify-between gap-10">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }}
                className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-lg shadow-primary/10"
              >
                <LogIn className="h-8 w-8" />
              </motion.div>
              <div>
                <h2 className="font-heading text-3xl font-bold tracking-normal text-foreground">Sign In</h2>
                <p className="mt-3 max-w-sm text-base leading-7 text-muted-foreground">
                  Already have an account? Sign in with your email and password to access your dashboard.
                </p>
                <div className="mt-7 flex items-center gap-2 text-sm font-semibold text-primary">
                  <BarChart3 className="h-4 w-4" />
                  Continue securely
                </div>
              </div>
            </div>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.68, duration: 0.45 }}
          className="flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-muted-foreground"
        >
          {trustItems.map((item) => (
            <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 shadow-sm backdrop-blur">
              <LockKeyhole className="h-4 w-4 text-primary" />
              {item}
            </span>
          ))}
        </motion.div>
      </motion.section>
    </main>
  );
}
