import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function AdminRoute({ children }) {
  const [status, setStatus] = useState('checking'); // checking | allowed | denied

  useEffect(() => {
    base44.auth.me()
      .then((user) => {
        setStatus(user?.role === 'admin' ? 'allowed' : 'denied');
      })
      .catch(() => setStatus('denied'));
  }, []);

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/" replace />;
  }

  return children;
}