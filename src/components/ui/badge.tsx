import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-2 rounded-xl px-3 py-1 text-xs font-semibold transition",
  {
    variants: {
      variant: {
        default: "bg-surface-muted text-title",
        success: "bg-green-500/10 text-green-500",
        muted: "bg-surface-muted text-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };