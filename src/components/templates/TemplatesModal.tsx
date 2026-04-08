"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LayoutTemplate } from "lucide-react";
import {
  EVENT_CONFERENCE_TEMPLATE_PROJECT_NAME,
  PORTFOLIO_SERVICES_TEMPLATE_PROJECT_NAME,
  SAAS_TEMPLATE_PROJECT_NAME,
} from "@/lib/saasTemplateMeta";

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySaaSTemplate: () => void;
  onApplyEventConferenceTemplate: () => void;
  onApplyPortfolioServicesTemplate: () => void;
}

export function TemplatesModal({
  isOpen,
  onClose,
  onApplySaaSTemplate,
  onApplyEventConferenceTemplate,
  onApplyPortfolioServicesTemplate,
}: TemplatesModalProps) {
  const templates = [
    {
      name: SAAS_TEMPLATE_PROJECT_NAME,
      onClick: onApplySaaSTemplate,
    },
    {
      name: EVENT_CONFERENCE_TEMPLATE_PROJECT_NAME,
      onClick: onApplyEventConferenceTemplate,
    },
    {
      name: PORTFOLIO_SERVICES_TEMPLATE_PROJECT_NAME,
      onClick: onApplyPortfolioServicesTemplate,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
            Шаблоны
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Templates List */}
          <div className="space-y-2">
            <ul className="space-y-1 rounded-lg border border-border/60 p-2">
              {templates.map((template) => (
                <li key={template.name}>
                  <button
                    type="button"
                    onClick={() => {
                      template.onClick();
                      onClose();
                    }}
                    className="w-full truncate rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    {template.name}
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-xs leading-snug text-muted-foreground">
              Сохраняет текущий проект и создаёт новый проект с выбранным лендингом.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
