import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

export function useOnboarding() {
  const [user] = useAuthState(auth);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    const stored = localStorage.getItem(`hasCompletedOnboarding_${user?.uid}`);
    console.log('Initial onboarding state:', { stored, userId: user?.uid });
    return stored === 'true';
  });

  // Reset onboarding state when user changes
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`hasCompletedOnboarding_${user.uid}`);
      console.log('User changed, updating onboarding state:', { stored, userId: user.uid });
      setHasCompletedOnboarding(stored === 'true');
      setShowOnboarding(stored !== 'true');
    }
  }, [user]);

  const completeOnboarding = () => {
    if (user) {
      console.log('Completing onboarding for user:', user.uid);
      localStorage.setItem(`hasCompletedOnboarding_${user.uid}`, 'true');
      setHasCompletedOnboarding(true);
      setShowOnboarding(false);
      console.log('Onboarding state updated:', { 
        hasCompletedOnboarding: true, 
        showOnboarding: false 
      });
    } else {
      console.error('No user found when trying to complete onboarding');
    }
  };

  return {
    showOnboarding,
    setShowOnboarding,
    completeOnboarding
  };
}