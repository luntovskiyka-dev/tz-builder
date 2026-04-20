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
  AI_ASSISTANT_TEMPLATE_PROJECT_NAME,
  APP_LAUNCH_TEMPLATE_PROJECT_NAME,
  ECOMMERCE_PRODUCT_TEMPLATE_PROJECT_NAME,
  EVENT_CONFERENCE_TEMPLATE_PROJECT_NAME,
  LOCAL_SERVICE_TEMPLATE_PROJECT_NAME,
  MEDICAL_WELLNESS_TEMPLATE_PROJECT_NAME,
  ONLINE_COURSE_TEMPLATE_PROJECT_NAME,
  PORTFOLIO_SERVICES_TEMPLATE_PROJECT_NAME,
  REAL_ESTATE_TEMPLATE_PROJECT_NAME,
  SAAS_TEMPLATE_PROJECT_NAME,
} from "@/lib/saasTemplateMeta";

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanSlug?: string | null;
  currentProjectId?: string | null;
  onApplySaaSTemplate: () => void;
  onApplyEventConferenceTemplate: () => void;
  onApplyPortfolioServicesTemplate: () => void;
  onApplyOnlineCourseTemplate: () => void;
  onApplyEcommerceProductTemplate: () => void;
  onApplyAppLaunchTemplate: () => void;
  onApplyAiAssistantTemplate: () => void;
  onApplyRealEstateTemplate: () => void;
  onApplyMedicalWellnessTemplate: () => void;
  onApplyLocalServiceTemplate: () => void;
}

export function TemplatesModal({
  isOpen,
  onClose,
  currentPlanSlug,
  currentProjectId,
  onApplySaaSTemplate,
  onApplyEventConferenceTemplate,
  onApplyPortfolioServicesTemplate,
  onApplyOnlineCourseTemplate,
  onApplyEcommerceProductTemplate,
  onApplyAppLaunchTemplate,
  onApplyAiAssistantTemplate,
  onApplyRealEstateTemplate,
  onApplyMedicalWellnessTemplate,
  onApplyLocalServiceTemplate,
}: TemplatesModalProps) {
  const plan = (currentPlanSlug ?? "starter").toLowerCase();
  const starterWithOpenProject = plan === "starter" && currentProjectId != null;

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
    {
      name: ONLINE_COURSE_TEMPLATE_PROJECT_NAME,
      onClick: onApplyOnlineCourseTemplate,
    },
    {
      name: ECOMMERCE_PRODUCT_TEMPLATE_PROJECT_NAME,
      onClick: onApplyEcommerceProductTemplate,
    },
    {
      name: APP_LAUNCH_TEMPLATE_PROJECT_NAME,
      onClick: onApplyAppLaunchTemplate,
    },
    {
      name: AI_ASSISTANT_TEMPLATE_PROJECT_NAME,
      onClick: onApplyAiAssistantTemplate,
    },
    {
      name: REAL_ESTATE_TEMPLATE_PROJECT_NAME,
      onClick: onApplyRealEstateTemplate,
    },
    {
      name: MEDICAL_WELLNESS_TEMPLATE_PROJECT_NAME,
      onClick: onApplyMedicalWellnessTemplate,
    },
    {
      name: LOCAL_SERVICE_TEMPLATE_PROJECT_NAME,
      onClick: onApplyLocalServiceTemplate,
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
              {starterWithOpenProject
                ? "На тарифе Starter шаблон подставляется в текущий проект (второй проект не создаётся)."
                : "Сохраняет текущий проект и создаёт новый проект с выбранным лендингом."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
