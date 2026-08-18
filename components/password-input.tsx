"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { EyeIcon, EyeOffIcon } from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PasswordInput({ className, ...props }: React.ComponentProps<"input">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-10", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        <HugeiconsIcon icon={visible ? EyeOffIcon : EyeIcon} size={18} />
      </button>
    </div>
  );
}
