import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item = typeof body.item === "string" ? body.item.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";

    const mlBase = process.env.ML_API_URL ?? "http://127.0.0.1:8001";
    const response = await fetch(`${mlBase}/predict-market-demand`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        item,
        category,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Market demand backend error:", response.status, details);
      return NextResponse.json(
        { error: "Waste market demand service is unavailable" },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 502 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Demand route error:", error);
    return NextResponse.json(
      { error: "Market demand prediction failed" },
      { status: 500 }
    );
  }
}
