"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { SAAS_UNIVERSAL_PUCK_DATA } from "@/lib/saasUniversalLanding";
import { SAAS_TEMPLATE_PROJECT_NAME } from "@/lib/saasTemplateMeta";

/**
 * Публичный превью-кадр редактора со шаблоном «Продукт» (без авторизации).
 * Используется для скриншотов маркетингового лендинга и демо.
 */
export default function PreviewProductPage() {
  return (
    <DashboardLayout
      user={{
        name: "Preview",
        email: "preview@protospec.local",
        plan: "Preview",
      }}
      preview={{
        initialData: SAAS_UNIVERSAL_PUCK_DATA,
        projectName: SAAS_TEMPLATE_PROJECT_NAME,
      }}
    />
  );
}
