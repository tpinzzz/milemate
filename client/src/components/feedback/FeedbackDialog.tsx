import { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      // Log the environment variables (with masked values for security)
      console.log('Environment variables:', {
        serviceId: serviceId ? "set" : "missing",
        templateId: templateId ? "set" : "missing",
        publicKey: publicKey ? "set" : "missing"
      });

      if (!serviceId || !templateId || !publicKey) {
        throw new Error(`EmailJS configuration is missing: ${[
          !serviceId && 'Service ID',
          !templateId && 'Template ID',
          !publicKey && 'Public Key'
        ].filter(Boolean).join(', ')}`);
      }

      // Use init before sending to ensure the public key is properly set
      emailjs.init(publicKey);
      
      const response = await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: "tyler@atohmsllc.com",
          from_email: user?.email || "anonymous@user.com",
          message: feedback,
        }
      );
      
      console.log("EmailJS response:", response);

      toast({
        title: "Feedback sent",
        description: "Thank you for your feedback!",
      });
      setFeedback("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending feedback:", error);
      
      // More detailed error handling
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Error sending feedback",
          description: error.message,
        });
      } else if (typeof error === 'object' && error !== null) {
        // Handle EmailJS error response
        const errorObj = error as any;
        const errorMessage = errorObj.text || JSON.stringify(error);
        toast({
          variant: "destructive",
          title: "EmailJS Error",
          description: errorMessage,
        });
        console.error("EmailJS error details:", errorObj);
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