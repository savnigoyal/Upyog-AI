"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

  const handleAnalyze = async () => {
    if (!file) return;

    setError(null);
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Item detection failed");
      }

      if (!data.detectedItem) {
        throw new Error("No item detected. Please try again with a clearer image.");
      }

      router.push(`/result?item=${encodeURIComponent(data.detectedItem)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong during analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-green-50 to-green-200">

      <div className="px-10 py-6">
        <Link href="/" className="text-2xl font-bold text-green-700">
          Upyog ♻️
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-6">
        <div className="bg-white w-full max-w-lg p-10 rounded-2xl shadow-xl border border-green-200 text-center">

          <h1 className="text-3xl font-bold text-green-700">
            Upload Your Item
          </h1>

          <p className="text-green-600 mt-3">
            Let AI detect your product
          </p>

          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          <label className="mt-8 flex flex-col items-center justify-center border-2 border-dashed border-green-400 rounded-xl p-12 cursor-pointer hover:bg-green-50 transition">
            <span className="text-green-700 font-medium">
              Click to upload image
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                  setPreview(URL.createObjectURL(e.target.files[0]));
                  setError(null);
                }
              }}
              className="hidden"
            />
          </label>

          {preview && (
            <div className="mt-6">
              <img
                src={preview}
                alt="Preview"
                className="rounded-xl max-h-64 mx-auto shadow-md"
              />
            </div>
          )}

          {file && (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="mt-8 bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Item →"}
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
