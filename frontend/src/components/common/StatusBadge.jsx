import React, { useState, useEffect } from 'react';
import { healthService } from '../../services/healthService';
import { Activity, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export const StatusBadge = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchHealth = async () => {
      const data = await healthService.checkHealth();
      if (mounted) {
        setHealth(data);
        setLoading(false);
      }
    };

    fetchHealth();
    // Poll every 30 seconds
    const interval = setInterval(fetchHealth, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-2.5 py-1 text-xs rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 animate-pulse">
        <Activity className="w-3.5 h-3.5" />
        <span>Checking API...</span>
      </div>
    );
  }

  const isHealthy = health?.status === 'healthy';
  const isDegraded = health?.status === 'degraded';

  return (
    <div
      title={`Database: ${health?.database?.status || 'Unknown'} | AI: ${health?.aiService?.provider || 'Unknown'} | Uptime: ${health?.uptimeSeconds || 0}s`}
      className={`flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full transition-all cursor-help border ${
        isHealthy
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          : isDegraded
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
          : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isHealthy ? 'bg-emerald-400' : isDegraded ? 'bg-amber-400' : 'bg-rose-400'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isHealthy ? 'bg-emerald-500' : isDegraded ? 'bg-amber-500' : 'bg-rose-500'
          }`}
        />
      </span>
      <span className="capitalize font-semibold text-[11px]">
        {isHealthy
          ? `System Live • ${health?.aiService?.provider === 'mock-local' ? 'Mock AI' : health?.aiService?.provider?.toUpperCase() || 'AI'}`
          : isDegraded
          ? 'DB Connecting'
          : 'API Offline'}
      </span>
    </div>
  );
};
