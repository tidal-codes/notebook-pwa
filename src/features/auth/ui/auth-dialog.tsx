import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { useAuthDialog } from "../model/use-auth-dialog";
import { useState } from "react";
import LoginForm from "./login-form";
import SignupForm from "./signup-form";

type AuthMode = "login" | "signUp";

const HEADINGS: Record<AuthMode, string> = {
  login: "Welcome back",
  signUp: "Create your account",
};

const DESCRIPTIONS: Record<AuthMode, string> = {
  login: "Sign in to sync your notes and pick up where you left off",
  signUp: "Sign up to sync your notes and never lose your work",
};

export default function AuthDialog() {
  const { isOpen, handleClose } = useAuthDialog();
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="[&>button]:hidden">
        <Tabs
          value={mode}
          onValueChange={(value) => setMode(value as AuthMode)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signUp">Sign up</TabsTrigger>
          </TabsList>

          <div className="mt-5 mb-5">
            <h3 className="text-2xl font-bold">{HEADINGS[mode]}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {DESCRIPTIONS[mode]}
            </p>
          </div>

          <TabsContent value="login">
            <LoginForm handleCloseDialog={handleClose} />
          </TabsContent>

          <TabsContent value="signUp">
            <SignupForm handleCloseDialog={handleClose} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
