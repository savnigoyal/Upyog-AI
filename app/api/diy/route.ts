import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item = typeof body.item === "string" ? body.item.trim() : "";

    if (!item) {
      return NextResponse.json(
        { error: "An item is required to generate DIY ideas" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL ?? "gemini-3.7-flash";
    const apiUrl = process.env.GEMINI_API_URL ?? "https://generativelanguage.googleapis.com/v1beta/models";

    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json(
        { error: "Gemini API key not configured. Please set GEMINI_API_KEY in .env" },
        { status: 500 }
      );
    }

    const maxRetries = 3;
    let lastError: string | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`${apiUrl}/${model}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Give exactly 5 practical DIY reuse ideas for this discarded item: ${item}. Return a numbered list. Each idea must include a short title, the materials needed, and one sentence of instructions. Avoid unsafe uses and do not invent special tools.`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        });

        if (!response.ok) {
          const details = await response.text();
          lastError = `Gemini API request failed (attempt ${attempt}/${maxRetries}): ${response.status} ${details}`;
          console.error(lastError);
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          return NextResponse.json(
            { error: `Gemini could not generate ideas with model ${model}` },
            { status: 502 }
          );
        }

        const data = await response.json();

        const ideas =
          data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;

        if (typeof ideas !== "string" || !ideas.trim()) {
          lastError = `Gemini returned an empty response (attempt ${attempt}/${maxRetries})`;
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          return NextResponse.json(
            { error: "Gemini returned an empty response" },
            { status: 502 }
          );
        }

        return NextResponse.json({ ideas: ideas.trim() });
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          continue;
        }
      }
    }

    return NextResponse.json(
      { error: lastError || "DIY idea generation failed after multiple attempts" },
      { status: 503 }
    );
  } catch (error) {
    console.error("DIY idea generation failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "DIY idea generation failed" },
      { status: 500 }
    );
  }
}
