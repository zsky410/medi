import assert from "node:assert/strict";
import test from "node:test";
import { createAiProvider } from "../src/ai/ai.provider-impl";

function config(values: Record<string, string | undefined>) {
  return {
    get: <T = string>(key: string): T | undefined => values[key] as T | undefined,
  };
}

test("OpenAiProvider uses configured base URL and model", async () => {
  const originalFetch = globalThis.fetch;
  let requestUrl = "";
  let requestInit: RequestInit | undefined;

  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    requestUrl = String(url);
    requestInit = init;
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "Đà Lạt chill 4 ngày",
                destination: "Đà Lạt, Lâm Đồng",
                dayCount: 4,
                budget: 5000000,
                places: [{ name: "Hồ Xuân Hương", category: "ATTRACTION", lat: 11.9416, lng: 108.4441 }],
              }),
            },
          },
        ],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    const provider = createAiProvider(config({
      OPENAI_API_KEY: "test-key",
      OPENAI_BASE_URL: "https://gateway.example.com/openai",
      OPENAI_MODEL: "gpt-5.5",
    }) as never);

    await provider.generateTrip("Đà Lạt 4 ngày, budget 5 triệu, thích cà phê");

    assert.equal(requestUrl, "https://gateway.example.com/openai/v1/chat/completions");
    assert.equal((requestInit?.headers as Record<string, string>).Authorization, "Bearer test-key");
    assert.equal(JSON.parse(String(requestInit?.body)).model, "gpt-5.5");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
