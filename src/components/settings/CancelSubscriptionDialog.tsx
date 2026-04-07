"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  canceling: boolean;
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  onConfirm,
  canceling,
}: CancelSubscriptionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Отменить подписку?
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm">
            Вы уверены, что хотите отменить подписку?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-lg bg-muted/50 p-4 text-sm">
          <div className="flex items-start gap-2 text-amber-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Последствия отмены:</p>
              <ul className="mt-1 list-inside list-disc space-y-1 text-xs">
                <li>Доступ к платным функциям прекратится в конце текущего периода</li>
                <li>Проекты сохранятся, но AI генерация будет ограничена</li>
                <li>Вы сможете возобновить подписку в любое время</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={canceling}
          >
            Оставить подписку
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={canceling}
          >
            {canceling ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                </svg>
                Отмена...
              </span>
            ) : (
              "Отменить подписку"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
