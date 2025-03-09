import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { FcGoogle } from "react-icons/fc";

export default function LoginButton() {
  const { toast } = useToast();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: "Could not sign in with Google. Please try again.",
      });
    }
  };

  return (
    <Button
      onClick={handleLogin}
      variant="outline"
      className="w-full sm:w-auto flex items-center gap-2"
    >
      <FcGoogle className="h-5 w-5" />
      Sign in with Google
    </Button>
  );
}
