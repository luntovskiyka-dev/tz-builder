"use client";

import React, { useState } from "react";
import { MessageSquare, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitFeedbackAction } from "@/lib/actions/feedback";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setMessage("");
      setSuccess(false);
      setError(null);
    }, 300);
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    setError(null);
    const result = await submitFeedbackAction(message);
    setSubmitting(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4 text-gray-500" />
            Обратная связь
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
            <p className="text-sm font-medium text-gray-800">
              Спасибо за отзыв!
            </p>
            <p className="text-xs text-gray-500">
              Мы постараемся учесть ваши пожелания.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="mt-2"
            >
              Закрыть
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-500">
              Расскажите, что можно улучшить, что нравится или что мешает работе.
            </p>
            <Textarea
              placeholder="Ваше сообщение..."
              className="min-h-[120px] resize-none text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={submitting}
            />
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={submitting}
              >
                Отмена
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={submitting || !message.trim()}
              >
                {submitting ? "Отправка..." : "Отправить"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
