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
  const [weight, setWeight] = useState(1);

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

  return (
    <Suspense fallback={<div className="min-h-screen p-10 text-center">Loading...</div>}>
      <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-200">

        <div className="px-10 py-6">
          <Link href="/" className="text-2xl font-bold text-green-700">
            Upyog ♻️
          </Link>
        </div>

        <div className="text-center mt-8">
          <h1 className="text-3xl font-bold text-green-700">
            Detection Result
          </h1>
          <p className="text-green-600 mt-2 text-lg">
            {initialItem ? initialItem.charAt(0).toUpperCase() + initialItem.slice(1) : "Unknown"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Select the item type below for accurate pricing
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 px-10 mt-16">

          {/* SELL CARD */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-200 text-center">
            <h2 className="text-xl font-semibold text-green-700">
              💰 Sell & Predict Price
            </h2>

            <div className="mt-4">
              <label className="block text-sm text-green-700 mb-2">
                Item Type
              </label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="border border-green-300 rounded-lg px-3 py-2 text-green-700 w-full"
              >
                {ITEM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {ITEM_LABELS[type] ?? type}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="border border-green-300 rounded-lg px-3 py-2 text-green-700 w-full"
              >
                <option value="clean">Clean</option>
                <option value="slightly_dirty">Slightly Dirty</option>
                <option value="dirty">Dirty</option>
                <option value="wet">Wet</option>
                <option value="mixed">Mixed</option>
                <option value="crushed">Crushed</option>
              </select>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-center gap-2">
                <input
                  type="number"
                  value={weight}
                  min="0.1"
                  step="0.1"
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="border border-green-300 rounded-lg px-3 py-2 text-green-700 w-24 text-center"
                />
                <span className="text-green-600">kg</span>
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
                    weight
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
              className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPredictingPrice ? "Predicting..." : "Predict Price"}
            </button>

            {priceError && (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {priceError}
              </p>
            )}

            {price !== null && (
              <div className="mt-6 text-lg font-semibold text-green-700">
                Estimated Price: ₹{price.toFixed(2)}
              </div>
            )}
          </div>

          {/* IMPACT CARD */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-200 text-center">
            <h2 className="text-xl font-semibold text-green-700">
              🌍 Environmental Impact (Recycling)
            </h2>

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
              className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Calculate Impact
            </button>

            {impact && (
              <div className="mt-6 text-green-700 space-y-3 text-sm">
                <p>🌿 CO₂ Saved: {impact.co2} kg</p>
                <p>⚡ Energy Saved: {impact.energy} kWh</p>
                <p>🌳 Trees Saved: {impact.trees}</p>
                <p>💧 Water Saved: {impact.water} liters</p>
              </div>
            )}
          </div>

          {/* DIY CARD */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-200 text-center">
            <h2 className="text-xl font-semibold text-green-700">
              🛠 DIY Innovation
            </h2>

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
              className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGeneratingIdeas ? "Generating..." : "Generate Ideas - Powered by Gemini"}
            </button>

            {diyError && (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {diyError}
              </p>
            )}

            {ideas && (
              <div className="mt-6 text-green-700 text-sm whitespace-pre-line">
                {ideas}
              </div>
            )}
          </div>

        </div>
      </div>
    </Suspense>
  );
}
