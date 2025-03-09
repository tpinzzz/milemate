import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [feedback, setFeedback] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  // Initialize EmailJS
  useEffect(() => {
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (publicKey) {
      emailjs.init(publicKey);
    } else {
      console.error("EmailJS public key is missing");
    }
    console.log("Environment variables (without values):", {
      VITE_EMAILJS_PUBLIC_KEY: "REDACTED",
      VITE_EMAILJS_SERVICE_ID: "REDACTED",
      VITE_EMAILJS_TEMPLATE_ID: "REDACTED",

    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

      if (!serviceId || !templateId) {
        throw new Error("EmailJS configuration is missing");
      }

      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: "tyler@atohmsllc.com",
          from_email: user?.email || "anonymous@user.com",
          message: feedback,
        }
      );

      toast({
        title: "Feedback sent",
        description: "Thank you for your feedback!",
      });
      setFeedback("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending feedback:", error);
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "An unexpected error occurred. Please try again later.",
          });
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Help us improve! Share your thoughts, suggestions, or report any issues.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Your feedback..."
              className="min-h-[100px]"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSending}>
              {isSending ? "Sending..." : "Send Feedback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}