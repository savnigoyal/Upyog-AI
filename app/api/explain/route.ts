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

    const response = await fetch(`${mlBase}/explain`, {
      method: "POST",
      body: backendForm,
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Explain backend error:", response.status, details);
      return NextResponse.json(
        { error: "Explanation service is unavailable" },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    if (!data.original_image || !data.heatmap_image || !data.overlay_image) {
      return NextResponse.json(
        { error: "No explanation visualization generated for this image" },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Explain route error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
