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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-green-50 to-green-200 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="leaf leaf-1">🍃</div>
        <div className="leaf leaf-2">🍃</div>
        <div className="leaf leaf-3">🍃</div>
        <div className="leaf leaf-4">🍃</div>

        <div className="recycle recycle-1">♻</div>
        <div className="recycle recycle-2">♻</div>
        <div className="recycle recycle-3">♻</div>

        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3" />
        <div className="particle particle-4" />
        <div className="particle particle-5" />
        <div className="particle particle-6" />
        <div className="particle particle-7" />
        <div className="particle particle-8" />

        <div className="bubble bubble-1" />
        <div className="bubble bubble-2" />
        <div className="bubble bubble-3" />
        <div className="bubble bubble-4" />
      </div>

      <div className="px-10 py-6 relative z-10">
        <Link href="/" className="text-2xl font-bold text-green-700">
          Upyog ♻️
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 relative z-10">
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

      <style jsx>{`
        .leaf,
        .recycle,
        .particle,
        .bubble {
          position: absolute;
          pointer-events: none;
        }

        .leaf {
          font-size: 1.2rem;
          opacity: 0.28;
          filter: drop-shadow(0 8px 12px rgba(16, 185, 129, 0.12));
          animation: leafFloat 12s ease-in-out infinite alternate;
        }

        .leaf-1 {
          left: 8%;
          top: 22%;
          animation-delay: 0s;
        }

        .leaf-2 {
          left: 18%;
          bottom: 18%;
          animation-delay: 2.5s;
        }

        .leaf-3 {
          right: 15%;
          top: 28%;
          animation-delay: 4s;
        }

        .leaf-4 {
          right: 11%;
          bottom: 22%;
          animation-delay: 1.2s;
        }

        .recycle {
          font-size: 1.4rem;
          color: rgba(16, 185, 129, 0.5);
          text-shadow: 0 0 18px rgba(52, 211, 153, 0.16);
          animation: recycleFloat 15s ease-in-out infinite alternate;
        }

        .recycle-1 {
          left: 14%;
          top: 42%;
        }

        .recycle-2 {
          right: 18%;
          top: 36%;
          animation-delay: 2s;
        }

        .recycle-3 {
          left: 32%;
          bottom: 20%;
          animation-delay: 4s;
        }

        .particle {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(52, 211, 153, 0.7);
          box-shadow: 0 0 12px rgba(52, 211, 153, 0.6);
          animation: particleRise 16s linear infinite;
        }

        .particle-1 { left: 12%; top: 74%; width: 5px; height: 5px; opacity: 0.75; animation-delay: 0s; }
        .particle-2 { left: 28%; top: 80%; width: 7px; height: 7px; opacity: 0.5; animation-delay: 2s; }
        .particle-3 { left: 46%; top: 82%; width: 4px; height: 4px; opacity: 0.85; animation-delay: 3s; }
        .particle-4 { right: 28%; top: 76%; width: 6px; height: 6px; opacity: 0.55; animation-delay: 1.5s; }
        .particle-5 { right: 14%; top: 82%; width: 7px; height: 7px; opacity: 0.7; animation-delay: 2.7s; }
        .particle-6 { left: 8%; top: 58%; width: 5px; height: 5px; opacity: 0.65; animation-delay: 4.5s; }
        .particle-7 { right: 10%; top: 60%; width: 5px; height: 5px; opacity: 0.8; animation-delay: 5.3s; }
        .particle-8 { left: 68%; top: 84%; width: 6px; height: 6px; opacity: 0.6; animation-delay: 6s; }

        .bubble {
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          border: 1px solid rgba(110, 231, 183, 0.35);
          background: rgba(167, 243, 208, 0.18);
          animation: bubbleRise 18s ease-in-out infinite alternate;
        }

        .bubble-1 { left: 10%; bottom: 10%; }
        .bubble-2 { right: 20%; bottom: 12%; animation-delay: 2s; }
        .bubble-3 { left: 70%; bottom: 15%; animation-delay: 4s; }
        .bubble-4 { right: 34%; bottom: 18%; animation-delay: 6s; }

        @keyframes leafFloat {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(14px, -12px, 0) rotate(9deg);
          }
          100% {
            transform: translate3d(-10px, -26px, 0) rotate(-10deg);
          }
        }

        @keyframes recycleFloat {
          0% {
            transform: translate3d(0, 0, 0) rotate(-7deg);
          }
          50% {
            transform: translate3d(8px, -16px, 0) rotate(5deg);
          }
          100% {
            transform: translate3d(-10px, -26px, 0) rotate(-4deg);
          }
        }

        @keyframes particleRise {
          0% {
            transform: translate3d(0, 0, 0) scale(0.9);
            opacity: 0;
          }
          15% {
            opacity: 0.7;
          }
          50% {
            transform: translate3d(10px, -24px, 0) scale(1.1);
            opacity: 0.8;
          }
          100% {
            transform: translate3d(-8px, -60px, 0) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes bubbleRise {
          0% {
            transform: translate3d(0, 0, 0) scale(0.9);
            opacity: 0.15;
          }
          50% {
            transform: translate3d(8px, -20px, 0) scale(1);
            opacity: 0.3;
          }
          100% {
            transform: translate3d(-8px, -46px, 0) scale(1.08);
            opacity: 0.12;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .leaf,
          .recycle,
          .particle,
          .bubble {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
