import { Button } from "@/components/ui/button";
import { signInWithGoogle, signInWithEmailAndPassword } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { FcGoogle } from "react-icons/fc";
import { useState } from 'react';
import { Input } from "@/components/ui/input";


function EmailPasswordAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleEmailPasswordLogin = async () => {
    try {
      await signInWithEmailAndPassword(email, password);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Could not sign in with email/password. Please try again.",
      });
    }
  };

  return (
    <div>
      <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button onClick={handleEmailPasswordLogin}>Sign in with Email/Password</Button>
    </div>
  );
}


export default function LoginButton() {
  const { toast } = useToast();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login button error:", error);
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error instanceof Error 
          ? error.message 
          : "Could not sign in with Google. Please try again.",
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

export { EmailPasswordAuth };