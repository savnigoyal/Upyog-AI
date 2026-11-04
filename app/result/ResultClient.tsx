"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Suspense } from "react";

const WASTE_CLASS_METADATA: Record<
  string,
  {
    label: string;
    material: string;
    status: string;
    description: string;
    icon: string;
  }
> = {
  aerosol_cans: {
    label: "Aerosol Cans",
    material: "Metal packaging",
    status: "Recyclable",
    description: "Metal container suited for material recovery and proper recycling streams.",
    icon: "🧴",
  },
  aluminum_food_cans: {
    label: "Aluminum Food Cans",
    material: "Aluminum",
    status: "Highly recyclable",
    description: "A high-value metal stream that can be remelted and reused efficiently.",
    icon: "🥫",
  },
  aluminum_soda_cans: {
    label: "Aluminum Soda Cans",
    material: "Aluminum",
    status: "Highly recyclable",
    description: "Lightweight aluminum packaging with strong resale and recycling value.",
    icon: "🥤",
  },
  cardboard_boxes: {
    label: "Cardboard Boxes",
    material: "Paperboard",
    status: "Recyclable",
    description: "Bulk paper packaging ideal for recycling, repurposing, and craft projects.",
    icon: "📦",
  },
  cardboard_packaging: {
    label: "Cardboard Packaging",
    material: "Paperboard",
    status: "Recyclable",
    description: "Lightweight corrugated packaging that can be diverted into recycling or reuse loops.",
    icon: "📦",
  },
  clothing: {
    label: "Clothing",
    material: "Textile",
    status: "Reuse ready",
    description: "Textile item with strong repair, resale, and upcycling potential.",
    icon: "👕",
  },
  coffee_grounds: {
    label: "Coffee Grounds",
    material: "Organic waste",
    status: "Compostable",
    description: "Organic by-product suited for composting, soil enrichment, and garden use.",
    icon: "☕",
  },
  disposable_plastic_cutlery: {
    label: "Disposable Plastic Cutlery",
    material: "Plastic",
    status: "Needs sorting",
    description: "Single-use plastic item that should be sorted and recycled where possible.",
    icon: "🍴",
  },
  eggshells: {
    label: "Eggshells",
    material: "Organic waste",
    status: "Compostable",
    description: "Calcium-rich organic waste that can be composted or used in soil mixes.",
    icon: "🥚",
  },
  food_waste: {
    label: "Food Waste",
    material: "Organic waste",
    status: "Compostable",
    description: "Organic material suitable for composting and nutrient recovery programs.",
    icon: "🍏",
  },
  glass_beverage_bottles: {
    label: "Glass Beverage Bottles",
    material: "Glass",
    status: "Recyclable",
    description: "Glass stream item that can be remelted repeatedly without quality loss.",
    icon: "🥃",
  },
  glass_cosmetic_containers: {
    label: "Glass Cosmetic Containers",
    material: "Glass",
    status: "Recyclable",
    description: "Recycled glass container with a strong circular reuse pathway.",
    icon: "🧴",
  },
  glass_food_jars: {
    label: "Glass Food Jars",
    material: "Glass",
    status: "Recyclable",
    description: "Reusable glass packaging ideal for return-to-recycling or refilling systems.",
    icon: "🫙",
  },
  magazines: {
    label: "Magazines",
    material: "Paper",
    status: "Recyclable",
    description: "Low-grade paper material suitable for milling and paper recovery.",
    icon: "📰",
  },
  newspaper: {
    label: "Newspaper",
    material: "Paper",
    status: "Recyclable",
    description: "Recovered paper stream with a strong recycling value in paper manufacturing.",
    icon: "🗞️",
  },
  office_paper: {
    label: "Office Paper",
    material: "Paper",
    status: "Recyclable",
    description: "Clean paper stream with excellent recycling and fiber recovery potential.",
    icon: "📄",
  },
  paper_cups: {
    label: "Paper Cups",
    material: "Paper laminate",
    status: "Needs sorting",
    description: "Paper cup material needs proper sorting due to mixed-layer construction.",
    icon: "☕",
  },
  plastic_cup_lids: {
    label: "Plastic Cup Lids",
    material: "Plastic",
    status: "Recyclable",
    description: "Plastic lid material suitable for plastics recovery when clean and sorted.",
    icon: "🧃",
  },
  plastic_detergent_bottles: {
    label: "Plastic Detergent Bottles",
    material: "Plastic",
    status: "Recyclable",
    description: "Household plastic packaging commonly recovered through plastics recycling programs.",
    icon: "🧼",
  },
  plastic_food_containers: {
    label: "Plastic Food Containers",
    material: "Plastic",
    status: "Recyclable",
    description: "Food-grade plastic packaging with recovery and reuse potential after cleaning.",
    icon: "🥡",
  },
  plastic_shopping_bags: {
    label: "Plastic Shopping Bags",
    material: "Plastic",
    status: "Needs sorting",
    description: "Lightweight plastic item that is best recovered in dedicated collection streams.",
    icon: "🛍️",
  },
  plastic_soda_bottles: {
    label: "Plastic Soda Bottles",
    material: "Plastic",
    status: "Recyclable",
    description: "Common PET packaging stream with strong mechanical recycling value.",
    icon: "🥤",
  },
  plastic_straws: {
    label: "Plastic Straws",
    material: "Plastic",
    status: "Needs sorting",
    description: "Thin plastic item that requires careful sorting and proper recycling handling.",
    icon: "🥤",
  },
  plastic_trash_bags: {
    label: "Plastic Trash Bags",
    material: "Plastic",
    status: "Needs sorting",
    description: "Mixed plastic waste requiring careful collection and recycling coordination.",
    icon: "🗑️",
  },
  plastic_water_bottles: {
    label: "Plastic Water Bottles",
    material: "PET plastic",
    status: "Recyclable",
    description: "Widely accepted PET material stream for bottle-to-bottle recycling systems.",
    icon: "💧",
  },
  shoes: {
    label: "Shoes",
    material: "Mixed materials",
    status: "Repair or reuse",
    description: "Footwear item with reuse, repair, and material recovery pathways.",
    icon: "👟",
  },
  steel_food_cans: {
    label: "Steel Food Cans",
    material: "Steel",
    status: "Highly recyclable",
    description: "Durable metal packaging with excellent recovery and remanufacturing value.",
    icon: "🥫",
  },
  styrofoam_cups: {
    label: "Styrofoam Cups",
    material: "Expanded polystyrene",
    status: "Needs sorting",
    description: "Foam packaging item that requires special handling and designated collection.",
    icon: "🧁",
  },
  styrofoam_food_containers: {
    label: "Styrofoam Food Containers",
    material: "Expanded polystyrene",
    status: "Needs sorting",
    description: "Foam food packaging requiring specific sorting and specialized recycling channels.",
    icon: "🥡",
  },
  tea_bags: {
    label: "Tea Bags",
    material: "Organic waste",
    status: "Compostable",
    description: "Organic tea residue suited for composting and soil improvement.",
    icon: "🫖",
  },
};

const ITEM_TYPES = Object.keys(WASTE_CLASS_METADATA) as Array<keyof typeof WASTE_CLASS_METADATA>;

type IItemType = (typeof ITEM_TYPES)[number];

const ITEM_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(WASTE_CLASS_METADATA).map(([key, value]) => [key, value.label])
);

type ResultClientProps = {
  initialItem: string;
};

type MarketDemandLevel = "High" | "Medium" | "Low";

type DemandCategory = {
  category: string;
  label: string;
  demand_index: number;
  demand_level: MarketDemandLevel;
  explanation: string;
  recommendation: string;
};

type MarketDemandResponse = {
  source: string;
  is_demo_data: boolean;
  summary: string;
  recommendation: string;
  top_categories: DemandCategory[];
};

export default function ResultClient({ initialItem }: ResultClientProps) {
  const [itemType, setItemType] = useState<IItemType>(
    ITEM_TYPES.includes(initialItem as IItemType) ? (initialItem as IItemType) : ITEM_TYPES[0]
  );
  const [price, setPrice] = useState<number | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [isPredictingPrice, setIsPredictingPrice] = useState(false);
  const [marketDemand, setMarketDemand] = useState<MarketDemandResponse | null>(null);
  const [isLoadingDemand, setIsLoadingDemand] = useState(false);
  const [demandError, setDemandError] = useState<string | null>(null);

  useEffect(() => {
    if (ITEM_TYPES.includes(initialItem as IItemType)) {
      setItemType(initialItem as IItemType);
    }

    const fetchMarketDemand = async () => {
      setIsLoadingDemand(true);
      setDemandError(null);

      try {
        const response = await fetch("/api/demand", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item: initialItem,
            category: initialItem,
          }),
        });

        const data = await response.json();
        if (!response.ok || data.error) {
          throw new Error(data.error || "Waste market demand could not be loaded.");
        }

        setMarketDemand(data as MarketDemandResponse);
      } catch (error) {
        setDemandError(
          error instanceof Error ? error.message : "Waste market demand could not be loaded."
        );
      } finally {
        setIsLoadingDemand(false);
      }
    };

    fetchMarketDemand();
  }, [initialItem]);

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

  const selectedMetadata = WASTE_CLASS_METADATA[itemType] ?? {
    label: ITEM_LABELS[itemType] ?? itemType,
    material: "Mixed material",
    status: "Needs assessment",
    description: "This item category is recognized by the model and can be reviewed for circular reuse opportunities.",
    icon: "♻️",
  };

  const activeSummary = {
    icon: selectedMetadata.icon,
    label: selectedMetadata.label,
    material: selectedMetadata.material,
    status: selectedMetadata.status,
    description: selectedMetadata.description,
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
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">Market intelligence</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">Waste Market Demand Prediction</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
                  <span>📊</span>
                  Sample historical demand data for demonstration only.
                </div>
              </div>

              {demandError && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {demandError}
                </div>
              )}

              {isLoadingDemand ? (
                <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 text-base font-medium text-emerald-700">
                  Loading market demand model...
                </div>
              ) : marketDemand ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-green-50 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Overview</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">{marketDemand.summary}</p>
                      </div>
                      <span className="inline-flex rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        {marketDemand.source}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
                    <div className="rounded-2xl border border-emerald-100 bg-slate-50/70 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Category demand</h3>
                        <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Top 5</span>
                      </div>

                      <div className="space-y-4">
                        {marketDemand.top_categories.map((category, index) => {
                          const levelTone =
                            category.demand_level === "High"
                              ? "bg-emerald-500"
                              : category.demand_level === "Medium"
                                ? "bg-amber-500"
                                : "bg-slate-400";

                          return (
                            <div
                              key={`${category.category}-${index}`}
                              className="rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                                    #{index + 1}
                                  </p>
                                  <p className="mt-1 text-base font-bold text-slate-900">{category.label}</p>
                                </div>
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white ${levelTone}`}>
                                  {category.demand_level}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-emerald-100">
                                  <div
                                    className={`h-full rounded-full ${levelTone} transition-all duration-500`}
                                    style={{ width: `${Math.min(category.demand_index, 100)}%` }}
                                  />
                                </div>
                                <div className="min-w-[58px] text-right text-sm font-bold text-slate-800">
                                  {category.demand_index.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Recommendation</p>
                      <h3 className="mt-2 text-xl font-bold text-slate-900">Best selling opportunity</h3>

                      <div className="mt-4 rounded-2xl border border-emerald-200 bg-white/80 p-4">
                        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Leading category</p>
                        <p className="mt-2 text-2xl font-black text-slate-900">
                          {marketDemand.top_categories[0]?.label ?? "N/A"}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          {marketDemand.top_categories[0]?.recommendation ?? marketDemand.recommendation}
                        </p>
                      </div>

                      <div className="mt-4 rounded-2xl border border-emerald-200 bg-white/80 p-4 text-sm text-slate-700">
                        <p className="font-semibold text-slate-900">Market signal</p>
                        <p className="mt-2 leading-6">{marketDemand.recommendation}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {marketDemand.top_categories.map((category, index) => (
                      <div
                        key={`${category.category}-detail-${index}`}
                        className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">#{index + 1}</p>
                            <h4 className="mt-1 text-lg font-bold text-slate-900">{category.label}</h4>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white ${
                            category.demand_level === "High"
                              ? "bg-emerald-500"
                              : category.demand_level === "Medium"
                                ? "bg-amber-500"
                                : "bg-slate-400"
                          }`}>
                            {category.demand_level}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-600">{category.explanation}</p>
                        <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                          Recommendation: {category.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
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
