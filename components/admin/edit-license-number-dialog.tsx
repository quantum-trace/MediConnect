"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ── Types ─────────────────────────────────────────────────────────────────────

interface EditLicenseNumberDialogProps {
  open: boolean;
  doctorName: string;
  currentValue: string | null;
  onSave: (value: string | null) => Promise<void>;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EditLicenseNumberDialog({
  open,
  doctorName,
  currentValue,
  onSave,
  onClose,
}: EditLicenseNumberDialogProps) {
  const [draft, setDraft] = useState(currentValue ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset draft whenever the dialog opens for a new doctor
  useEffect(() => {
    if (open) {
      Promise.resolve().then(() => {
        setDraft(currentValue ?? "");
        setError(null);
      });
    }
  }, [open, currentValue]);

  const handleSave = async () => {
    const trimmed = draft.trim();
    setSaving(true);
    setError(null);
    try {
      await onSave(trimmed || null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const unchanged = draft.trim() === (currentValue ?? "").trim();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="rounded-2xl border-border/30 bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Edit License Number</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Updating license number for <span className="font-medium text-foreground">Dr. {doctorName}</span>.
            As an admin you can change this any number of times.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Enter license number…"
            className="rounded-xl border-border/50 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && !unchanged && !saving) handleSave();
              if (e.key === "Escape") onClose();
            }}
          />
          {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-border/30"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="rounded-xl"
            onClick={handleSave}
            disabled={saving || unchanged}
          >
            {saving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
