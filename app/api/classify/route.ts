import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const backendForm = new FormData();
    backendForm.append("file", file as Blob);

    const mlBase = process.env.ML_API_URL ?? "http://127.0.0.1:8001";

    const response = await fetch(`${mlBase}/predict`, {
      method: "POST",
      body: backendForm,
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Classify backend error:", response.status, details);
      return NextResponse.json(
        { error: "Image classification service is unavailable" },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (!data.predicted_class) {
      return NextResponse.json(
        { error: "No item detected from image" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      detectedItem: data.predicted_class,
      confidence: data.confidence,
    });
  } catch (error) {
    console.error("Classify route error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
