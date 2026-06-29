import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PRIORITY_LABELS = ["None", "Low", "Medium", "High", "Urgent"] as const;
const PRIORITY_CLASSES = [
  "text-muted-foreground",
  "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
];

export function PriorityBadge({ priority }: { priority: number }) {
  if (priority === 0) return null;
  return (
    <Badge variant="outline" className={cn(PRIORITY_CLASSES[priority])}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}
