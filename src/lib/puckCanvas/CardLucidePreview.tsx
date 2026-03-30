import type { ComponentType } from "react";
import {
  Box,
  CheckCircle,
  Circle,
  Cpu,
  Feather,
  Globe,
  Heart,
  Layers,
  LayoutGrid,
  Lightbulb,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";

const CARD_LUCIDE_MAP: Record<string, ComponentType<{ className?: string }>> = {
  Feather,
  Sparkles,
  Zap,
  Star,
  Heart,
  Shield,
  Rocket,
  Lightbulb,
  CheckCircle,
  Box,
  Layers,
  LayoutGrid,
  Users,
  Globe,
  Cpu,
};

export function CardLucidePreview({ name, className }: { name: string; className?: string }) {
  const Cmp = CARD_LUCIDE_MAP[name] ?? Circle;
  return <Cmp className={className ?? "h-4 w-4 shrink-0 text-muted-foreground"} aria-hidden />;
}
