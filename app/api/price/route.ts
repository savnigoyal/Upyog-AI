import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { item, condition, weight_kg } = await req.json();

    if (!item || condition == null || weight_kg == null) {
      return NextResponse.json(
        { error: "Missing required fields: item, condition, weight_kg" },
        { status: 400 }
      );
    }

    const mlBase = process.env.ML_API_URL ?? "http://127.0.0.1:8001";

    const response = await fetch(`${mlBase}/predict-price`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        item,
        condition,
        weight_kg,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Price backend error:", response.status, details);
      return NextResponse.json(
        { error: "Price prediction service is unavailable" },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 502 });
    }

    return NextResponse.json({
      predictedPrice: data.predicted_price,
    });

  } catch (error) {
    console.error("Price route error:", error);
    return NextResponse.json(
      { error: "Price prediction failed" },
      { status: 500 }
    );
  }
}
