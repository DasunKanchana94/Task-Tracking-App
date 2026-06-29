export function ProgressRing({ completed, total }: { completed: number; total: number }) {
  if (total === 0) return null;
  const ratio = completed / total;
  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - ratio);

  return (
    <span className="relative inline-flex size-5 shrink-0 items-center justify-center" title={`${completed}/${total} subtasks complete`}>
      <svg width="20" height="20" viewBox="0 0 20 20" className="-rotate-90">
        <circle cx="10" cy="10" r={radius} fill="none" stroke="currentColor" className="text-muted-foreground/20" strokeWidth="2" />
        <circle
          cx="10"
          cy="10"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-primary"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
