"use client";

import Link from "next/link";
import { useState } from "react";
import { Suspense } from "react";

const ITEM_TYPES = [
  "aerosol_cans",
  "aluminum_food_cans",
  "aluminum_soda_cans",
  "cardboard_boxes",
  "cardboard_packaging",
  "clothing",
  "coffee_grounds",
  "disposable_plastic_cutlery",
  "eggshells",
  "food_waste",
  "glass_beverage_bottles",
  "glass_cosmetic_containers",
  "glass_food_jars",
  "magazines",
  "newspaper",
  "office_paper",
  "paper_cups",
  "plastic_cup_lids",
  "plastic_detergent_bottles",
  "plastic_food_containers",
  "plastic_shopping_bags",
  "plastic_soda_bottles",
  "plastic_straws",
  "plastic_trash_bags",
  "plastic_water_bottles",
  "shoes",
  "steel_food_cans",
  "styrofoam_cups",
  "styrofoam_food_containers",
  "tea_bags",
];

type IItemType = typeof ITEM_TYPES[number];

const ITEM_LABELS: Record<string, string> = {
  aerosol_cans: "Aerosol Cans",
  aluminum_food_cans: "Aluminum Food Cans",
  aluminum_soda_cans: "Aluminum Soda Cans",
  cardboard_boxes: "Cardboard Boxes",
  cardboard_packaging: "Cardboard Packaging",
  clothing: "Clothing",
  coffee_grounds: "Coffee Grounds",
  disposable_plastic_cutlery: "Disposable Plastic Cutlery",
  eggshells: "Eggshells",
  food_waste: "Food Waste",
  glass_beverage_bottles: "Glass Beverage Bottles",
  glass_cosmetic_containers: "Glass Cosmetic Containers",
  glass_food_jars: "Glass Food Jars",
  magazines: "Magazines",
  newspaper: "Newspaper",
  office_paper: "Office Paper",
  paper_cups: "Paper Cups",
  plastic_cup_lids: "Plastic Cup Lids",
  plastic_detergent_bottles: "Plastic Detergent Bottles",
  plastic_food_containers: "Plastic Food Containers",
  plastic_shopping_bags: "Plastic Shopping Bags",
  plastic_soda_bottles: "Plastic Soda Bottles",
  plastic_straws: "Plastic Straws",
  plastic_trash_bags: "Plastic Trash Bags",
  plastic_water_bottles: "Plastic Water Bottles",
  shoes: "Shoes",
  steel_food_cans: "Steel Food Cans",
  styrofoam_cups: "Styrofoam Cups",
  styrofoam_food_containers: "Styrofoam Food Containers",
  tea_bags: "Tea Bags",
};

type ResultClientProps = {
  initialItem: string;
};

export default function ResultClient({ initialItem }: ResultClientProps) {
  const [itemType, setItemType] = useState<IItemType>(
    ITEM_TYPES.includes(initialItem as IItemType) ? (initialItem as IItemType) : ITEM_TYPES[0]
  );
  const [price, setPrice] = useState<number | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [isPredictingPrice, setIsPredictingPrice] = useState(false);

  const [impact, setImpact] = useState<{
    co2: number;
    energy: number;
    trees: number;
    water: number;
  } | null>(null);

  const [ideas, setIdeas] = useState<string | null>(null);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [diyError, setDiyError] = useState<string | null>(null);

  const [condition, setCondition] = useState("clean");
  const [unit, setUnit] = useState("kg");
  const [weight, setWeight] = useState(1);

  const activeSummary = {
    icon: "♻️",
    label: ITEM_LABELS[itemType] ?? itemType,
    material: "Recyclable material",
    status: "Recyclable",
    description: "Ready for circular reuse and resale opportunities.",
  };

  const weightInKg =
    unit === "kg" ? weight : unit === "lb" ? weight * 0.453592 : weight / 1000;

  const predictPriceWithRetry = async (
    itemValue: string,
    conditionValue: string,
    weightValue: number,
    maxRetries = 3
  ): Promise<number | null> => {
    let lastError: string | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch("/api/price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item: itemValue,
            condition: conditionValue,
            weight_kg: weightValue,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || `Price API returned ${res.status}`);
        }

        if (data.predictedPrice == null || data.predictedPrice === undefined) {
          throw new Error("Price prediction returned no value");
        }

        const predictedPrice = Number(data.predictedPrice);
        if (isNaN(predictedPrice)) {
          throw new Error("Price prediction returned invalid value");
        }

        return predictedPrice;
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Price prediction failed";
        console.error(`Price attempt ${attempt}/${maxRetries} failed:`, lastError);

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    return null;
  };

  const impactCards = [
    {
      label: "CO₂ saved",
      value: impact ? `${impact.co2} kg` : "--",
      icon: "🌿",
      accent: "from-emerald-500 to-green-600",
    },
    {
      label: "Energy saved",
      value: impact ? `${impact.energy} kWh` : "--",
      icon: "⚡",
      accent: "from-amber-400 to-yellow-500",
    },
    {
      label: "Trees saved",
      value: impact ? `${impact.trees}` : "--",
      icon: "🌳",
      accent: "from-lime-500 to-emerald-600",
    },
    {
      label: "Water saved",
      value: impact ? `${impact.water} L` : "--",
      icon: "💧",
      accent: "from-cyan-500 to-sky-600",
    },
  ];

  return (
    <Suspense fallback={<div className="min-h-screen p-10 text-center text-slate-700">Loading...</div>}>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_36%),_linear-gradient(180deg,_#f8fff9_0%,_#edfdf5_100%)] text-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-8 flex items-center justify-between gap-3">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-emerald-700">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-lg shadow-sm">
                ♻️
              </span>
              Upyog
            </Link>
            <span className="rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-emerald-700 shadow-sm">
              Smart Sustainability
            </span>
          </header>

          <main className="space-y-6">
            <section className="rounded-[28px] border border-emerald-100 bg-white/90 p-5 shadow-[0_18px_45px_rgba(16,185,129,0.08)] backdrop-blur-sm sm:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 text-4xl text-white shadow-lg shadow-emerald-200/70">
                    {activeSummary.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">Detection result</p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
                      {activeSummary.label}
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">{activeSummary.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
                    Material: {activeSummary.material}
                  </span>
                  <span className="rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm shadow-emerald-200">
                    {activeSummary.status}
                  </span>
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">Marketplace</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">Sell & Predict Price</h2>
                  </div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-2 text-2xl text-emerald-700">💰</div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Item type</label>
                    <select
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value as IItemType)}
                      className="w-full rounded-xl border border-emerald-200 bg-emerald-50/30 px-3 py-3 text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    >
                      {ITEM_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {ITEM_LABELS[type] ?? type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Quality</label>
                      <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        className="w-full rounded-xl border border-emerald-200 bg-emerald-50/30 px-3 py-3 text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                      >
                        <option value="clean">Clean</option>
                        <option value="slightly_dirty">Slightly Dirty</option>
                        <option value="dirty">Dirty</option>
                        <option value="wet">Wet</option>
                        <option value="mixed">Mixed</option>
                        <option value="crushed">Crushed</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Quantity</label>
                      <div className="flex overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/30 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100">
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={weight}
                          onChange={(e) => setWeight(Number(e.target.value) || 0)}
                          className="w-full border-0 bg-transparent px-3 py-3 text-slate-800 outline-none"
                        />
                        <select
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          className="border-l border-emerald-200 bg-white/70 px-3 py-3 text-sm font-medium text-slate-700 outline-none"
                        >
                          <option value="kg">kg</option>
                          <option value="lb">lb</option>
                          <option value="g">g</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      setIsPredictingPrice(true);
                      setPriceError(null);
                      setPrice(null);

                      try {
                        const predictedPrice = await predictPriceWithRetry(
                          itemType,
                          condition,
                          weightInKg
                        );

                        if (predictedPrice !== null) {
                          setPrice(predictedPrice);
                        } else {
                          setPriceError(
                            "Price prediction failed after multiple attempts. Please try again later."
                          );
                        }
                      } catch (err) {
                        setPriceError(err instanceof Error ? err.message : "Price prediction failed");
                      } finally {
                        setIsPredictingPrice(false);
                      }
                    }}
                    disabled={isPredictingPrice}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-200 transition hover:translate-y-[-1px] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isPredictingPrice ? "Predicting price..." : "Predict price"}
                  </button>
                </div>

                <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Estimated value</p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                      <div className="text-3xl font-black text-slate-900 sm:text-4xl">
                        {price !== null ? `₹${price.toFixed(2)}` : "₹--"}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {weight > 0 ? `For ${weight} ${unit} of ${ITEM_LABELS[itemType] ?? itemType}` : "Add quantity to estimate"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-emerald-700 shadow-sm">
                      {weight > 0 ? `${weight} ${unit}` : "0 kg"}
                    </div>
                  </div>
                  {priceError && (
                    <p className="mt-3 text-sm text-red-600" role="alert">
                      {priceError}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] sm:p-6">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">Circular impact</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">Environmental Impact</h2>
                  </div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-2 text-2xl text-emerald-700">🌍</div>
                </div>

                <div className="space-y-4">
                  {impactCards.map((card) => (
                    <div
                      key={card.label}
                      className="group flex items-center gap-3 rounded-2xl border border-emerald-100 bg-slate-50/60 p-3 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white"
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent} text-lg shadow-sm`}>
                        {card.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-600">{card.label}</p>
                        <p className="mt-1 text-xl font-bold text-slate-900">{card.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={async () => {
                    const res = await fetch("/api/impact", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ item: itemType }),
                    });

                    const data = await res.json();
                    setImpact(data.impact);
                  }}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  Calculate impact
                </button>
              </div>
            </section>

            <section className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] sm:p-6">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-600">AI workshop</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">DIY Innovation AI</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700">
                  <span>✨</span>
                  Gemini-powered ideas
                </div>
              </div>

              <div className="rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 via-emerald-50 to-white p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">Turn this material into something useful.</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Explore sustainable upcycling ideas and inspiring reuse opportunities for {ITEM_LABELS[itemType] ?? itemType.toLowerCase()}.
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      setIsGeneratingIdeas(true);
                      setDiyError(null);

                      try {
                        const res = await fetch("/api/diy", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ item: itemType }),
                        });
                        const data = await res.json();

                        if (!res.ok) {
                          throw new Error(data.error ?? "Could not generate DIY ideas");
                        }

                        setIdeas(data.ideas);
                      } catch (error) {
                        setDiyError(error instanceof Error ? error.message : "Could not generate DIY ideas");
                      } finally {
                        setIsGeneratingIdeas(false);
                      }
                    }}
                    disabled={isGeneratingIdeas}
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:translate-y-[-1px] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isGeneratingIdeas ? "Generating ideas..." : "Generate ideas"}
                  </button>
                </div>
              </div>

              {diyError && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600" role="alert">
                  {diyError}
                </div>
              )}

              {isGeneratingIdeas && (
                <div className="mt-5 flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 p-4 text-sm text-violet-700">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-violet-500" />
                  Generating AI-powered reuse ideas for your {ITEM_LABELS[itemType] ?? itemType}...
                </div>
              )}

              {ideas && (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {ideas
                    .split(/\n\s*[-*•]?\s*/)
                    .map((idea) => idea.trim())
                    .filter(Boolean)
                    .slice(0, 6)
                    .map((idea, index) => (
                      <div key={`${idea}-${index}`} className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                        <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-lg text-emerald-700">
                          {index % 2 === 0 ? "✦" : "✨"}
                        </div>
                        <p className="text-sm leading-6 text-slate-700">{idea}</p>
                      </div>
                    ))}
                </div>
              )}

              {!ideas && !isGeneratingIdeas && !diyError && (
                <div className="mt-5 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-5 text-sm text-slate-600">
                  AI suggestions will appear here after generation.
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </Suspense>
  );
}
