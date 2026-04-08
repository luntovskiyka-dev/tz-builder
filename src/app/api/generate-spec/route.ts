import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { buildStructuredSpecPayload } from "@/lib/export/specPayload";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

const SYSTEM_PROMPT = `You are an experienced technical writer and project manager.
Your task is to create a detailed technical specification (TZ) in Russian
based on the website page structure described in JSON.

Writing rules:
- Write professionally, clearly, without fluff
- For each block describe: purpose, content, layout requirements
- Always include responsiveness requirements (desktop / tablet / mobile)
- Specify semantic HTML markup requirements for each block
- Include SEO requirements where applicable (h1/h2 headings, image alt attributes)
- Use numbered sections
- At the end, add a "General Technical Requirements" section with requirements for:
  performance, accessibility (a11y), cross-browser compatibility, responsiveness

Response format — plain text with markdown markup (# ## ### for headings).
Do not add introductory phrases like "Here is the TZ:" — start directly with the document.`;

const BLOCKS_PER_BATCH = 10;
const BATCH_MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1200;

function sendSSE(controller: ReadableStreamDefaultController<Uint8Array>, data: object) {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
}

function chunkArray<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  try {
    const { blocks } = await req.json();

    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
      return NextResponse.json(
        { error: "Нет блоков для генерации ТЗ" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Войдите в аккаунт, чтобы генерировать ТЗ" },
        { status: 401 }
      );
    }

    // Проверяем и списаем слот AI генерации с учетом тарифа пользователя.
    // Если billing-таблицы ещё не созданы (миграция не применена),
    // разрешаем генерацию с дефолтными лимитами Starter.
    const { data: quotaData, error: quotaError } = await supabase.rpc(
      "try_consume_spec_generation"
    );

    let quota: {
      allowed: boolean;
      plan: string;
      used_today: number;
      daily_limit: number;
      used_this_month: number;
      monthly_limit: number;
      reason?: string;
    };

    if (quotaError) {
      console.warn(
        "try_consume_spec_generation RPC failed — falling back to starter defaults:",
        quotaError
      );
      quota = {
        allowed: true,
        plan: "starter",
        used_today: 0,
        daily_limit: 2,
        used_this_month: 0,
        monthly_limit: 999999,
      };
    } else {
      quota = quotaData as typeof quota;
    }

    if (!quota?.allowed) {
      const planName = quota.plan || 'Starter';
      let errorMessage = "Достигнут лимит генераций ТЗ.";
      
      if (quota.reason === 'daily_limit_exceeded') {
        errorMessage = `Достигнут дневной лимит: ${quota.used_today} из ${quota.daily_limit} генераций сегодня. Попробуйте завтра.`;
      } else if (quota.reason === 'monthly_limit_exceeded') {
        errorMessage = `Достигнут месячный лимит: ${quota.used_this_month} из ${quota.monthly_limit} генераций в этом месяце. Рассмотрите апгрейд тарифа.`;
      }

      return NextResponse.json(
        {
          error: errorMessage,
          plan: planName,
          used_today: quota?.used_today,
          daily_limit: quota?.daily_limit,
          used_this_month: quota?.used_this_month,
          monthly_limit: quota?.monthly_limit,
        },
        { status: 429 }
      );
    }

    // Build schema-aware normalized payload for the model.
    const structuredBlocks = buildStructuredSpecPayload(blocks);

    const batches = chunkArray(structuredBlocks, BLOCKS_PER_BATCH);

    const readable = new ReadableStream({
      async start(controller) {
        try {
          sendSSE(controller, { type: "stage", stage: "connecting", message: "Подключение к AI..." });
          sendSSE(controller, { type: "stage", stage: "analyzing", message: "Анализ блоков..." });

          let startedStreaming = false;
          let processedBlocks = 0;

          for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
            const batch = batches[batchIndex];
            const isLastBatch = batchIndex === batches.length - 1;
            const batchStart = processedBlocks + 1;
            const batchEnd = processedBlocks + batch.length;

            const userMessage = `Create a part of the technical specification for a website page.

This is batch ${batchIndex + 1} of ${batches.length}. Describe only blocks ${batchStart}-${batchEnd} out of ${structuredBlocks.length}.

Block structure for the current batch:
${JSON.stringify(batch, null, 2)}

Requirements:
- Write only the sections for blocks from the current batch, in numbered list format.
- Do not repeat already described blocks and do not add introductory phrases.
- Maintain a professional tone.
${isLastBatch ? '- At the end of this part, add a "General Technical Requirements" section.' : '- Do not add the "General Technical Requirements" section yet.'}

Project name: web page`;

            let batchCompleted = false;
            let lastError: unknown = null;

            for (let attempt = 0; attempt <= BATCH_MAX_RETRIES; attempt += 1) {
              try {
                const stream = await client.chat.completions.create({
                  model: "deepseek-chat",
                  messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: userMessage },
                  ],
                  max_tokens: 4000,
                  temperature: 0.3,
                  stream: true,
                });

                for await (const chunk of stream) {
                  const content = chunk.choices[0]?.delta?.content;
                  if (!content) continue;

                  if (!startedStreaming) {
                    startedStreaming = true;
                    sendSSE(controller, { type: "stage", stage: "generating", message: "Генерация ТЗ..." });
                  }

                  sendSSE(controller, { type: "chunk", content });
                }

                batchCompleted = true;
                break;
              } catch (batchError) {
                lastError = batchError;
                const hasMoreAttempts = attempt < BATCH_MAX_RETRIES;
                if (!hasMoreAttempts) break;

                sendSSE(controller, {
                  type: "stage",
                  stage: "generating",
                  message: `Временная ошибка AI, повтор батча ${batchIndex + 1}/${batches.length}...`,
                });
                await sleep(RETRY_DELAY_MS);
              }
            }

            if (!batchCompleted) {
              throw lastError ?? new Error("Batch generation failed");
            }

            if (!isLastBatch) {
              sendSSE(controller, { type: "chunk", content: "\n\n" });
            }

            processedBlocks += batch.length;
          }

          sendSSE(controller, { type: "done" });
        } catch (err) {
          console.error("Stream error:", err);
          sendSSE(controller, {
            type: "error",
            message: "Ошибка генерации. Попробуйте ещё раз.",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("DeepSeek API error:", error);

    const err = error as { status?: number };
    if (err?.status === 401) {
      return NextResponse.json(
        { error: "Неверный API ключ DeepSeek" },
        { status: 502 }
      );
    }

    if (err?.status === 429) {
      return NextResponse.json(
        { error: "Превышен лимит запросов. Попробуйте через минуту." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Ошибка генерации. Попробуйте ещё раз." },
      { status: 500 }
    );
  }
}
