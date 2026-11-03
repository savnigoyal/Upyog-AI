import { NextResponse } from "next/server";

const impactData: Record<string, { co2: number; energy: number; trees: number; water: number }> = {
  aerosol_cans: { co2: 9, energy: 14, trees: 0, water: 250 },
  aluminum_food_cans: { co2: 10, energy: 15, trees: 0, water: 300 },
  aluminum_soda_cans: { co2: 10.5, energy: 16, trees: 0, water: 320 },
  steel_food_cans: { co2: 2, energy: 3.5, trees: 0, water: 120 },

  cardboard_boxes: { co2: 1.5, energy: 4, trees: 0.02, water: 3500 },
  cardboard_packaging: { co2: 1.4, energy: 3.5, trees: 0.018, water: 3200 },
  newspaper: { co2: 1.8, energy: 4.2, trees: 0.03, water: 4000 },
  magazines: { co2: 1.7, energy: 4, trees: 0.028, water: 3800 },
  office_paper: { co2: 2.2, energy: 5, trees: 0.04, water: 4500 },
  paper_cups: { co2: 1.1, energy: 2.5, trees: 0.01, water: 2500 },

  plastic_water_bottles: { co2: 1.4, energy: 3, trees: 0, water: 180 },
  plastic_soda_bottles: { co2: 1.5, energy: 3.2, trees: 0, water: 190 },
  plastic_detergent_bottles: { co2: 1.7, energy: 3.5, trees: 0, water: 200 },
  plastic_food_containers: { co2: 1.3, energy: 2.8, trees: 0, water: 150 },
  plastic_shopping_bags: { co2: 1.1, energy: 2.5, trees: 0, water: 130 },
  plastic_trash_bags: { co2: 1.0, energy: 2.3, trees: 0, water: 120 },
  plastic_cup_lids: { co2: 1.2, energy: 2.7, trees: 0, water: 140 },
  plastic_straws: { co2: 0.9, energy: 2.2, trees: 0, water: 110 },
  disposable_plastic_cutlery: { co2: 1.5, energy: 3, trees: 0, water: 160 },

  glass_beverage_bottles: { co2: 0.3, energy: 0.6, trees: 0, water: 50 },
  glass_food_jars: { co2: 0.25, energy: 0.5, trees: 0, water: 45 },
  glass_cosmetic_containers: { co2: 0.2, energy: 0.4, trees: 0, water: 40 },

  coffee_grounds: { co2: 0.8, energy: 0.5, trees: 0.01, water: 100 },
  eggshells: { co2: 0.6, energy: 0.3, trees: 0.01, water: 80 },
  food_waste: { co2: 1.2, energy: 0.6, trees: 0.02, water: 150 },
  tea_bags: { co2: 0.7, energy: 0.4, trees: 0.01, water: 90 },

  clothing: { co2: 15, energy: 20, trees: 0.1, water: 10000 },
  shoes: { co2: 8, energy: 12, trees: 0.05, water: 5000 },

  styrofoam_cups: { co2: 0.8, energy: 1.8, trees: 0, water: 90 },
  styrofoam_food_containers: { co2: 0.9, energy: 2, trees: 0, water: 100 }
};

export async function POST(req: Request) {
  const { item } = await req.json();

  const impact = impactData[item] || {
    co2: 1,
    energy: 1,
    trees: 0,
    water: 100
  };

  return NextResponse.json({ impact });
}