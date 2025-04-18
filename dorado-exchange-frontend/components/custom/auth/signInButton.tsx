"use client";

import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignInButton() {
  const router = useRouter();

  return (
    <Button
      variant="default"
      effect="expandIcon"
      iconPlacement="right"
      onClick={() => {router.push('/authentication?tab=sign-in')}}
      icon={LogIn}
      iconSize={20}
      className="px-4 py-2 h-8 hover:bg-primary border-primary"
    >
      Sign In
    </Button>
  );
}
