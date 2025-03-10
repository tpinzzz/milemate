import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { DollarSign, Car, Clock, CheckCircle2 } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";

interface OnboardingStepProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const OnboardingStep = ({ title, children, icon }: OnboardingStepProps) => (
  <div className="space-y-4 text-center">
    {icon && <div className="flex justify-center text-primary">{icon}</div>}
    <h2 className="text-2xl font-bold">{title}</h2>
    {children}
  </div>
);

export default function OnboardingFlow() {
  const { completeOnboarding } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleComplete = () => {
    completeOnboarding();
  };

  return (
    <Card className="w-full max-w-lg mx-auto p-6">
      <Progress 
        value={(currentStep / totalSteps) * 100} 
        className="mb-8"
      />
      <div className="text-center mb-2">
        <p className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</p>
      </div>

      {currentStep === 1 && (
        <OnboardingStep 
          title="Track Mileage, Save Money" 
          icon={<DollarSign className="w-12 h-12" />}
        >
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Welcome to your smart mileage tracker! Log your business trips and maximize your tax deductions effortlessly.
            </p>
            <div className="grid gap-3">
              <div className="flex items-center gap-2 text-left">
                <DollarSign className="w-5 h-5 text-primary" />
                <span>Save $0.70 per mile in tax deductions (2025 rate)</span>
              </div>
              <div className="flex items-center gap-2 text-left">
                <Clock className="w-5 h-5 text-primary" />
                <span>Track earnings and expenses in one place</span>
              </div>
              <div className="flex items-center gap-2 text-left">
                <Car className="w-5 h-5 text-primary" />
                <span>Automatic trip logging saves you time</span>
              </div>
            </div>
          </div>
        </OnboardingStep>
      )}

      {currentStep === 2 && (
        <OnboardingStep 
          title="Ready to Start Tracking?" 
          icon={<Car className="w-12 h-12" />}
        >
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Recording trips is simple! Just tap "Start Trip" when you begin driving and "Stop Trip" when you're done.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold">Quick Tips:</h3>
              <ul className="space-y-2 text-left text-muted-foreground">
                <li>• Enable location services for best accuracy</li>
                <li>• Keep your phone charged while tracking</li>
                <li>• Start tracking before you start driving</li>
              </ul>
            </div>
          </div>
        </OnboardingStep>
      )}

      {currentStep === 3 && (
        <OnboardingStep 
          title="Let's Record Your First Trip"
          icon={<Car className="w-12 h-12" />}
        >
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Track your first trip and see how much you could save in tax deductions!
            </p>
            <div className="bg-muted/50 p-4 rounded-lg text-left space-y-2">
              <h3 className="font-semibold">How to Start:</h3>
              <ol className="space-y-2 text-muted-foreground">
                <li>1. Tap "Start Trip" on the tracking screen</li>
                <li>2. Drive to your destination</li>
                <li>3. Tap "Stop Trip" when you arrive</li>
                <li>4. See your potential tax savings!</li>
              </ol>
            </div>
          </div>
        </OnboardingStep>
      )}

      {currentStep === 4 && (
        <OnboardingStep 
          title="You're All Set!" 
          icon={<CheckCircle2 className="w-12 h-12" />}
        >
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Start tracking your trips and watch your tax deductions grow. Every mile counts!
            </p>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Did you know?</h3>
              <p className="text-muted-foreground">
                A 20-mile daily commute could save you up to $3,640 in tax deductions per year!
              </p>
            </div>
          </div>
        </OnboardingStep>
      )}

      <div className="mt-8">
        {currentStep < totalSteps ? (
          <Button onClick={handleNext} className="w-full">
            Next
          </Button>
        ) : (
          <Button onClick={handleComplete} className="w-full">
            Get Started!
          </Button>
        )}
      </div>
    </Card>
  );
}