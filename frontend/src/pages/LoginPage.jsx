import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Mail, Lock, ArrowRight, Sparkles, UserCheck } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errs.email = 'Enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Signed in successfully. Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid email or password credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('developer@cogniwrite.dev');
    setPassword('secret123');
    setErrors({});
    toast.info('Pre-filled sample author credentials');
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <Card className="space-y-6 shadow-floating">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white mx-auto shadow-subtle">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
            Sign In to CogniWrite
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your author studio, bookmarks, and AI writing co-pilot
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            startIcon={<Mail className="w-4 h-4" />}
            placeholder="developer@cogniwrite.dev"
          />

          <Input
            label="Password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            startIcon={<Lock className="w-4 h-4" />}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full"
            endIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        <div className="pt-2 border-t border-slate-100 dark:border-surface-borderDark/60">
          <Button
            type="button"
            variant="subtle"
            size="sm"
            onClick={handleQuickFill}
            startIcon={<UserCheck className="w-3.5 h-3.5" />}
            className="w-full"
          >
            Quick Fill Demo Credentials
          </Button>
        </div>

        <p className="text-center text-xs text-slate-500">
          New to CogniWrite?{' '}
          <Link to="/register" className="text-brand-600 font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
};
