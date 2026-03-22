import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const SPEC_GEN_PER_DAY = 2;

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

const SYSTEM_PROMPT = `Ты опытный технический писатель и проджект-менеджер.
Твоя задача — создать подробное техническое задание (ТЗ) на русском языке
на основе структуры страницы сайта описанной в JSON.

Правила написания ТЗ:
- Пиши профессионально, чётко, без воды
- Для каждого блока опиши: назначение, содержимое, требования к верстке
- Обязательно укажи требования к адаптивности (desktop / tablet / mobile)
- Укажи требования к семантической HTML-разметке каждого блока
- Укажи требования к SEO там где применимо (заголовки h1/h2, alt у изображений)
- Используй нумерованные разделы
- В конце добавь раздел "Общие технические требования" с требованиями к:
  производительности, доступности (a11y), кроссбраузерности, адаптивности

Формат ответа — чистый текст с markdown-разметкой (# ## ### для заголовков).
Не добавляй вводных фраз типа "Вот ТЗ:" — начинай сразу с документа.`;

function sendSSE(controller: ReadableStreamDefaultController<Uint8Array>, data: object) {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
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

    const { data: quotaData, error: quotaError } = await supabase.rpc(
      "try_consume_spec_generation",
      { max_per_day: SPEC_GEN_PER_DAY }
    );

    if (quotaError) {
      console.error("try_consume_spec_generation error:", quotaError);
      return NextResponse.json(
        { error: "Не удалось проверить лимит генераций" },
        { status: 500 }
      );
    }

    const quota = quotaData as {
      allowed?: boolean;
      used?: number;
      limit?: number;
      reason?: string;
    };

    if (!quota?.allowed) {
      return NextResponse.json(
        {
          error:
            "Достигнут лимит: 2 генерации ТЗ в сутки (UTC). Попробуйте завтра.",
          used: quota?.used,
          limit: quota?.limit ?? SPEC_GEN_PER_DAY,
        },
        { status: 429 }
      );
    }

    // Упрощаем блоки — убираем лишние данные, оставляем только нужное
    const simplifiedBlocks = blocks.map((block: { type: string; props?: unknown }, index: number) => ({
      номер: index + 1,
      тип: block.type,
      параметры: block.props,
    }));

    const userMessage = `Создай техническое задание для страницы сайта.
    
Структура страницы (${blocks.length} блоков):
${JSON.stringify(simplifiedBlocks, null, 2)}

Название проекта: веб-страница`;

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

    const readable = new ReadableStream({
      async start(controller) {
        try {
          sendSSE(controller, { type: "stage", stage: "connecting", message: "Подключение к AI..." });
          sendSSE(controller, { type: "stage", stage: "analyzing", message: "Анализ блоков..." });

          let firstChunk = true;
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              if (firstChunk) {
                firstChunk = false;
                sendSSE(controller, { type: "stage", stage: "generating", message: "Генерация ТЗ..." });
              }
              sendSSE(controller, { type: "chunk", content });
            }
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
