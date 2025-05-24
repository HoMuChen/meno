import { Badge } from "./ui/badge";

export function MeetingStatusChip({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" = "secondary";
  let label = status;
  switch (status) {
    case "completed":
    case "done":
      variant = "default";
      label = "done";
      break;
    case "failed":
    case "error":
      variant = "destructive";
      label = "failed";
      break;
    case "in progress":
    case "init":
      variant = "secondary";
      label = status;
      break;
    default:
      variant = "secondary";
      label = status;
  }
  return <Badge variant={variant}>{label}</Badge>;
} 