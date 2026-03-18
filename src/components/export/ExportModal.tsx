"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, FileText, Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { type Block } from "@/lib/export/textExport";
import { saveProjectAction, saveProjectSpecAction } from "@/lib/actions/projects";

type GenStage = "idle" | "connecting" | "analyzing" | "generating" | "done";

const STAGES: { key: GenStage; label: string }[] = [
  { key: "connecting", label: "Подключение к AI" },
  { key: "analyzing", label: "Анализ блоков" },
  { key: "generating", label: "Генерация ТЗ" },
  { key: "done", label: "Готово" },
];

interface ExportModalProps {
  blocks: Block[];
  isOpen: boolean;
  onClose: () => void;
  projectId?: string | null;
  initialSpec?: string | null;
  onSpecSaved?: (args: { projectId: string; spec: string }) => void;
}

// Ориентировочная длина ТЗ в символах (~4000 токенов × ~3 символа)
const ESTIMATED_SPEC_CHARS = 12000;

export function ExportModal({
  blocks,
  isOpen,
  onClose,
  projectId,
  initialSpec,
  onSpecSaved,
}: ExportModalProps) {
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [aiSpec, setAiSpec] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string>("");
  const [specSaveStatus, setSpecSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [specSaveError, setSpecSaveError] = useState<string>("");
  const [stage, setStage] = useState<GenStage>("idle");
  const [progressPercent, setProgressPercent] = useState(0);
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const charsReceivedRef = useRef(0);

  const handleGenerateAI = async () => {
    // Lock projectId at the moment user starts generation, so it can't change
    // due to async project switching while the stream is running.
    const lockedProjectId =
      typeof projectId === "string" && projectId.trim() ? projectId : null;

    setIsGenerating(true);
    setAiError("");
    setAiSpec("");
    setSpecSaveStatus("idle");
    setSpecSaveError("");
    setStage("connecting");
    setProgressPercent(0);
    setEtaSeconds(null);
    charsReceivedRef.current = 0;
    startTimeRef.current = Date.now();

    let finalSpecText = "";
    let streamError = false;

    try {
      const response = await fetch("/api/generate-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });

      if (!response.ok) {
        const data = await response.json();
        setAiError(data.error || "Ошибка генерации");
        return;
      }

      if (!response.body) {
        setAiError("Сервер не поддерживает потоковую передачу");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6)) as {
                type: string;
                stage?: string;
                message?: string;
                content?: string;
              };
              if (data.type === "stage") {
                setStage((data.stage as GenStage) ?? "generating");
                if (data.stage === "analyzing") {
                  setProgressPercent(15);
                } else if (data.stage === "generating") {
                  setProgressPercent(25);
                }
              } else if (data.type === "chunk" && data.content) {
                setStage("generating");
                charsReceivedRef.current += data.content.length;
                const pct = Math.min(
                  95,
                  25 + (charsReceivedRef.current / ESTIMATED_SPEC_CHARS) * 70
                );
                setProgressPercent(pct);

                const elapsed = (Date.now() - startTimeRef.current) / 1000;
                if (charsReceivedRef.current > 200 && elapsed > 1) {
                  const charsPerSec = charsReceivedRef.current / elapsed;
                  const remaining = Math.max(0, ESTIMATED_SPEC_CHARS - charsReceivedRef.current);
                  setEtaSeconds(Math.round(remaining / charsPerSec));
                }
                finalSpecText += data.content;
                setAiSpec(finalSpecText);
              } else if (data.type === "done") {
                setProgressPercent(100);
                setStage("done");
                setEtaSeconds(0);
                // finalSpecText already accumulated from chunks
              } else if (data.type === "error") {
                setAiError(data.message ?? "Ошибка генерации");
                streamError = true;
              }
            } catch {
              // ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // Auto-save once stream is finished
      if (finalSpecText && !streamError) {
        let resolvedProjectId: string | null = lockedProjectId;

        // If projectId missing (project not yet created in cloud), create a new one.
        if (!resolvedProjectId) {
          setSpecSaveStatus("saving");
          setSpecSaveError("");
          setAiError("");

          const formData = new FormData();
          formData.set("blocks", JSON.stringify(blocks));
          formData.set("name", "Без названия");

          const created = await saveProjectAction(null, formData);
          if (created.error || !created.projectId) {
            setSpecSaveStatus("error");
            setSpecSaveError(
              created.error ?? "Не удалось создать проект для сохранения ТЗ",
            );
            return;
          }
          resolvedProjectId = created.projectId;
        }

        setSpecSaveStatus("saving");
        const res = await saveProjectSpecAction(resolvedProjectId, finalSpecText);
        if (res.error) {
          setSpecSaveStatus("error");
          setSpecSaveError(res.error);
        } else {
          setSpecSaveStatus("saved");
          setSpecSaveError("");
          onSpecSaved?.({ projectId: resolvedProjectId, spec: finalSpecText });
        }
      }
    } catch {
      setAiError("Не удалось подключиться к серверу");
    } finally {
      setIsGenerating(false);
      setStage("idle");
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setAiSpec("");
      setAiError("");
      setSpecSaveStatus("idle");
      setSpecSaveError("");
      setStage("idle");
      setProgressPercent(0);
      setEtaSeconds(null);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    }
  }, [isOpen]);

  // Populate textarea with the currently saved spec for the selected project.
  useEffect(() => {
    if (!isOpen) return;
    if (isGenerating) return;
    if (aiSpec) return;
    setAiSpec(initialSpec ?? "");
    setAiError("");
    setSpecSaveStatus("idle");
    setSpecSaveError("");
    setStage("idle");
    setProgressPercent(0);
    setEtaSeconds(null);
    setCopied(false);
  }, [isOpen, initialSpec]); // run on open/selection change only

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleCopyAI = useCallback(async () => {
    if (!aiSpec) return;
    try {
      await navigator.clipboard.writeText(aiSpec);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = aiSpec;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }
  }, [aiSpec]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex flex-col gap-0 p-0 sm:max-w-2xl max-h-[90vh]"
        showCloseButton={true}
      >
        {/* Header */}
        <DialogHeader className="flex-row items-center justify-between gap-4 border-b border-gray-200 px-5 py-4 pr-12">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500 shrink-0" />
            <DialogTitle className="text-base font-semibold">
              Генерация ТЗ с AI
            </DialogTitle>
            <span className="text-[11px] text-gray-400 font-normal">
              {blocks.length} {pluralBlocks(blocks.length)}
            </span>
          </div>
        </DialogHeader>

        {/* AI Generate button */}
        <div className="px-5 pt-4 space-y-3">
          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="w-full bg-[#0A0A0A] text-white rounded-lg py-2.5 px-4 text-sm font-medium hover:bg-[#0A0A0A]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Генерирую ТЗ...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Сгенерировать ТЗ с AI
              </>
            )}
          </button>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {STAGES.find((s) => s.key === stage)?.label ?? "Обработка..."}
                </span>
                {etaSeconds !== null && etaSeconds > 0 && (
                  <span>≈ {etaSeconds} сек осталось</span>
                )}
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          )}

          {isGenerating && specSaveStatus === "saving" && (
            <p className="text-[11px] text-gray-500 text-center">
              Сохраняю ТЗ в проект...
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4">
          {isGenerating && !aiSpec && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <p className="text-sm text-gray-500 text-center">
                AI составляет техническое задание...
                <br />
                Текст появится по мере генерации
              </p>
            </div>
          )}
          {isGenerating && aiSpec && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-gray-500">
                Текст генерируется в реальном времени...
              </p>
              <textarea
                readOnly
                value={aiSpec}
                className="w-full h-64 p-3 text-xs font-mono bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg resize-none focus:outline-none text-[#0A0A0A] leading-relaxed"
              />
            </div>
          )}
          {!isGenerating && aiError && (
            <p className="text-sm text-red-600">{aiError}</p>
          )}
          {!isGenerating && specSaveStatus === "error" && specSaveError && (
            <p className="text-sm text-red-600">{specSaveError}</p>
          )}
          {!isGenerating && aiSpec && (
            <div className="flex flex-col gap-3">
              <textarea
                readOnly
                value={aiSpec}
                className="w-full h-64 p-3 text-xs font-mono bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg resize-none focus:outline-none text-[#0A0A0A] leading-relaxed"
              />
              <button
                type="button"
                onClick={handleCopyAI}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors w-fit ${
                  copied
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Скопировано
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Скопировать
                  </>
                )}
              </button>
            </div>
          )}
          {!isGenerating && !aiError && !aiSpec && (
            <p className="text-sm text-gray-500 py-8">
              Нажмите «Сгенерировать ТЗ с AI» чтобы создать подробное ТЗ
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function pluralBlocks(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return "блок";
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return "блока";
  return "блоков";
}
