import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

export function useOnboarding() {
  const [user] = useAuthState(auth);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    const stored = localStorage.getItem(`hasCompletedOnboarding_${user?.uid}`);
    return stored === 'true';
  });

  // Reset onboarding state when user changes
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`hasCompletedOnboarding_${user.uid}`);
      setHasCompletedOnboarding(stored === 'true');
      setShowOnboarding(stored !== 'true');
    }
  }, [user]);

  const completeOnboarding = () => {
    if (user) {
      localStorage.setItem(`hasCompletedOnboarding_${user.uid}`, 'true');
      setHasCompletedOnboarding(true);
      setShowOnboarding(false);
    }
  };

  return {
    showOnboarding,
    setShowOnboarding,
    completeOnboarding
  };
}