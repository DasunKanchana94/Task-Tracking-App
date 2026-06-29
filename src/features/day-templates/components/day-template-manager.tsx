"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useApplyDayTemplate,
  useCreateDayTemplate,
  useDayTemplates,
  useDeleteDayTemplate,
} from "@/features/day-templates/lib/use-day-templates";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function DayTemplateManager() {
  const { data: templates, isLoading } = useDayTemplates();
  const createTemplate = useCreateDayTemplate();
  const deleteTemplate = useDeleteDayTemplate();
  const applyTemplate = useApplyDayTemplate();

  const [name, setName] = useState("");
  const [sourceDate, setSourceDate] = useState(today());
  const [applyDates, setApplyDates] = useState<Record<string, string>>({});

  function handleSave(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    createTemplate.mutate({ name: trimmed, date: sourceDate }, { onSuccess: () => setName("") });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSave} className="flex flex-wrap items-end gap-2">
        <div className="grid gap-2">
          <Label htmlFor="template-name">Template name</Label>
          <Input
            id="template-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Workday routine"
            disabled={createTemplate.isPending}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="template-source-date">From date</Label>
          <Input
            id="template-source-date"
            type="date"
            value={sourceDate}
            onChange={(event) => setSourceDate(event.target.value)}
          />
        </div>
        <Button type="submit" disabled={createTemplate.isPending || !name.trim()}>
          {createTemplate.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Save as template
        </Button>
      </form>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {!isLoading && templates && templates.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No day templates yet. Save a day with time blocks above to create one.
        </p>
      )}

      {!isLoading && templates && templates.length > 0 && (
        <ul className="flex flex-col gap-3" data-testid="day-template-list">
          {templates.map((template) => (
            <li
              key={template.id}
              data-testid={`day-template-${template.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
            >
              <div>
                <p className="font-medium">{template.name}</p>
                <p className="text-muted-foreground text-sm">{template.blocks.length} block(s)</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  aria-label={`Apply ${template.name} to date`}
                  value={applyDates[template.id] ?? today()}
                  onChange={(event) =>
                    setApplyDates((current) => ({ ...current, [template.id]: event.target.value }))
                  }
                  className="w-40"
                />
                <Button
                  type="button"
                  size="sm"
                  data-testid={`apply-template-${template.id}`}
                  disabled={applyTemplate.isPending}
                  onClick={() =>
                    applyTemplate.mutate({
                      id: template.id,
                      date: applyDates[template.id] ?? today(),
                    })
                  }
                >
                  Apply
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${template.name}`}
                  onClick={() => deleteTemplate.mutate(template.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
