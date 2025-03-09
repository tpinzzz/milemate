
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailPasswordAuth } from "./EmailPasswordAuth";
import LoginButton from "./LoginButton";

export default function AuthForm() {
  const [activeTab, setActiveTab] = useState("email");

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="google">Google</TabsTrigger>
        </TabsList>
        <TabsContent value="email" className="py-4">
          <EmailPasswordAuth />
        </TabsContent>
        <TabsContent value="google" className="py-4">
          <LoginButton />
        </TabsContent>
      </Tabs>
    </div>
  );
}
