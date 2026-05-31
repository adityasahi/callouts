import { useState } from 'react';

/**
 * Returns { requireAuth, authWallOpen, closeAuthWall }
 * requireAuth(fn) — if user is logged in, calls fn(); otherwise opens the auth wall modal.
 */
export function useAuthWall(user) {
  const [authWallOpen, setAuthWallOpen] = useState(false);

  const requireAuth = (fn) => {
    if (user) {
      fn();
    } else {
      setAuthWallOpen(true);
    }
  };

  return { requireAuth, authWallOpen, closeAuthWall: () => setAuthWallOpen(false) };
}