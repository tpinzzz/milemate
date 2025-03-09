import { useState, useEffect } from 'react';

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    const stored = localStorage.getItem('hasCompletedOnboarding');
    return stored === 'true';
  });

  useEffect(() => {
    if (hasCompletedOnboarding) {
      setShowOnboarding(false);
    }
  }, [hasCompletedOnboarding]);

  const completeOnboarding = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    setShowOnboarding,
    completeOnboarding
  };
}
