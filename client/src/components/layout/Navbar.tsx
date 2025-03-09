import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { GaugeCircle } from "lucide-react";

export default function Navbar() {
  const [user] = useAuthState(auth);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <GaugeCircle className="h-6 w-6" />
            <span className="font-bold">MileageTracker</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {user && (
            <Button 
              variant="ghost" 
              onClick={() => auth.signOut()}
              className="text-sm"
            >
              Sign out
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
