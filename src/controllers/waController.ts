"use server";

// ──────────────────────────────────────────────────────────────────────────────
// waController.ts — WhatsApp Cloud API (Meta) integration
// Handles sending template messages and freeform text messages via the
// official Meta WhatsApp Business Cloud API with rate-limit–safe batching.
// ──────────────────────────────────────────────────────────────────────────────

const WA_API_VERSION = process.env.WA_API_VERSION || "v21.0";
const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID || "";
const WA_ACCESS_TOKEN = process.env.WA_ACCESS_TOKEN || "";
const WA_BASE_URL = `https://graph.facebook.com/${WA_API_VERSION}/${WA_PHONE_NUMBER_ID}/messages`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface WASendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface WATemplateParam {
  type: "text";
  text: string;
}

interface WABatchItem {
  phone: string;
  message: string;
  templateName?: string;
  templateParams?: WATemplateParam[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizePhone(phone: string): string {
  // Strip spaces, dashes, parens
  let cleaned = phone.replace(/[\s\-()]/g, "");
  // Convert leading 0 to +62 (Indonesian default)
  if (cleaned.startsWith("0")) {
    cleaned = "+62" + cleaned.slice(1);
  }
  // Ensure + prefix
  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }
  return cleaned;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Send a single template message via WA Cloud API ─────────────────────────

export async function sendTemplateMessage(
  phone: string,
  templateName: string,
  parameters: WATemplateParam[]
): Promise<WASendResult> {
  const normalizedPhone = normalizePhone(phone);

  // If WA credentials aren't configured, fall back to mock
  if (!WA_PHONE_NUMBER_ID || !WA_ACCESS_TOKEN) {
    return mockSend(normalizedPhone);
  }

  const body = {
    messaging_product: "whatsapp",
    to: normalizedPhone,
    type: "template",
    template: {
      name: templateName,
      language: { code: "id" }, // Indonesian locale
      components: [
        {
          type: "body",
          parameters,
        },
      ],
    },
  };

  return callWAAPI(body);
}

// ─── Send a single freeform text message ─────────────────────────────────────

export async function sendTextMessage(
  phone: string,
  text: string
): Promise<WASendResult> {
  const normalizedPhone = normalizePhone(phone);

  if (!WA_PHONE_NUMBER_ID || !WA_ACCESS_TOKEN) {
    return mockSend(normalizedPhone);
  }

  const body = {
    messaging_product: "whatsapp",
    to: normalizedPhone,
    type: "text",
    text: { body: text },
  };

  return callWAAPI(body);
}

// ─── Low-level API call with retry ────────────────────────────────────────────

async function callWAAPI(
  body: Record<string, unknown>,
  retries = 1
): Promise<WASendResult> {
  try {
    const res = await fetch(WA_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WA_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        messageId: data.messages?.[0]?.id ?? undefined,
      };
    }

    // Rate-limited (429) or server error (5xx) → retry once
    if ((res.status === 429 || res.status >= 500) && retries > 0) {
      const retryAfter = parseInt(res.headers.get("retry-after") || "2", 10);
      await sleep(retryAfter * 1000);
      return callWAAPI(body, retries - 1);
    }

    const errorData = await res.json().catch(() => ({}));
    return {
      success: false,
      error: (errorData as any)?.error?.message || `HTTP ${res.status}`,
    };
  } catch (err: unknown) {
    if (retries > 0) {
      await sleep(2000);
      return callWAAPI(body, retries - 1);
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

// ─── Batch send with rate-limit safety ────────────────────────────────────────
// Meta's throughput limit is ~80 msgs/sec for Business accounts.
// We use conservative batches of 50 with 1s delay between batches.

export async function batchSendMessages(
  items: WABatchItem[],
  batchSize = 50,
  delayMs = 1000
): Promise<{ results: WASendResult[]; sent: number; failed: number }> {
  const results: WASendResult[] = [];
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (item) => {
        if (item.templateName && item.templateParams) {
          return sendTemplateMessage(
            item.phone,
            item.templateName,
            item.templateParams
          );
        }
        return sendTextMessage(item.phone, item.message);
      })
    );

    for (const r of batchResults) {
      results.push(r);
      if (r.success) sent++;
      else failed++;
    }

    // Delay between batches (skip after last batch)
    if (i + batchSize < items.length) {
      await sleep(delayMs);
    }
  }

  return { results, sent, failed };
}

// ─── Mock fallback (used when WA credentials are not set) ─────────────────────

async function mockSend(phone: string): Promise<WASendResult> {
  await sleep(200 + Math.random() * 400);
  // 95% success rate simulation
  if (Math.random() > 0.05) {
    return {
      success: true,
      messageId: `mock_${crypto.randomUUID().substring(0, 12)}`,
    };
  }
  return { success: false, error: "Mock: simulated delivery failure" };
}
