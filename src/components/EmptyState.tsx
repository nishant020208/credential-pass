import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export const EmptyState = ({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: ReactNode;
}) => (
  <div className="p-12 text-center">
    <div className="size-14 mx-auto rounded-full bg-surface-1 grid place-items-center mb-3 border border-border">
      <Icon className="size-6 text-muted-foreground" />
    </div>
    <div className="font-semibold text-foreground">{title}</div>
    {hint && <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">{hint}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
