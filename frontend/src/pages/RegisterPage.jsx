import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { User, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!name.trim() || name.trim().length < 2) {
      errs.name = 'Full name must be at least 2 characters long';
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      errs.email = 'Valid email address is required';
    }
    if (!password || password.length < 6) {
      errs.password = 'Password must be at least 6 characters long';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({ name, email, password, bio });
      toast.success('Account created successfully! Welcome to the writer community.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10">
      <Card className="space-y-6 shadow-floating">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white mx-auto shadow-subtle">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
            Create Writer Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join engineering authors sharing architectural insights
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            startIcon={<User className="w-4 h-4" />}
            placeholder="Ada Lovelace"
          />

          <Input
            label="Email Address"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            startIcon={<Mail className="w-4 h-4" />}
            placeholder="ada@computing.org"
          />

          <Input
            label="Password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            startIcon={<Lock className="w-4 h-4" />}
            placeholder="Minimum 6 characters"
          />

          <Input
            label="Technical Focus / Bio (Optional)"
            type="text"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="e.g. Distributed Systems & High-Throughput Node.js"
            helperText="Shown on your author card and essay bylines."
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full"
            endIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Writer Account
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
};
