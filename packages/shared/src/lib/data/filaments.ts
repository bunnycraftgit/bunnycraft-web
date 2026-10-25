import { Filament, PricingSettings } from "@bunnycraft/db";
import { FILAMENTS } from "@/lib/catalog-data";
import { DEFAULT_PRICING_SETTINGS, type PricingSettingsValues } from "@/lib/pricing";

export type FilamentColor = { name: string; hex: string };

export type PlainFilament = {
  id: string;
  name: string;
  type: string;
  colors: FilamentColor[];
  pricePerGram: number;
  density: number;
  stockGrams: number;
  strength: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  finish: string;
  description: string;
};

function fallbackFilaments(): PlainFilament[] {
  return FILAMENTS.map((f) => ({ ...f, colors: [...f.colors] }));
}

export async function getFilaments(): Promise<PlainFilament[]> {
  try {
    const filaments = await Filament.findAll({
      where: { active: true },
      order: [["pricePerGram", "ASC"]],
    });
    if (filaments.length === 0) throw new Error("no filaments in database yet");
    return filaments.map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      colors: Array.isArray(f.colors) ? (f.colors as FilamentColor[]) : [],
      pricePerGram: Number(f.pricePerGram),
      density: Number(f.density),
      stockGrams: f.stockGrams,
      strength: f.strength,
      finish: f.finish,
      description: f.description,
    }));
  } catch (err) {
    console.warn(
      "[getFilaments] using fallback catalog data —",
      err instanceof Error ? err.message : err
    );
    return fallbackFilaments();
  }
}

export async function getPricingSettings(): Promise<PricingSettingsValues> {
  try {
    const settings = await PricingSettings.findByPk(1);
    if (!settings) throw new Error("pricing settings not seeded yet");
    return {
      machineRatePerHour: Number(settings.machineRatePerHour),
      printSpeedGramsPerHour: Number(settings.printSpeedGramsPerHour),
      finishingCostFlat: Number(settings.finishingCostFlat),
      infillFactor: Number(settings.infillFactor),
      shapeFactor: Number(settings.shapeFactor),
      minimumPrice: Number(settings.minimumPrice),
    };
  } catch (err) {
    console.warn(
      "[getPricingSettings] using default settings —",
      err instanceof Error ? err.message : err
    );
    return DEFAULT_PRICING_SETTINGS;
  }
}
