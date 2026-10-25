export type PricingSettingsValues = {
  /** ₹/hour the printer is considered to "cost" while running. */
  machineRatePerHour: number;
  /** Average grams of filament a printer extrudes per hour at standard settings. */
  printSpeedGramsPerHour: number;
  /** Flat fee covering support removal, cleanup, and QA per line item. */
  finishingCostFlat: number;
  /**
   * Fraction of the bounding-box volume that ends up as printed material
   * once walls + a standard infill percentage are accounted for. There's no
   * slicer in the loop, so this is a deliberately simple approximation.
   */
  infillFactor: number;
  /**
   * Fraction accounting for the model not filling its own bounding box —
   * most real objects (figures, brackets, decor) are far from a solid cube.
   */
  shapeFactor: number;
  /** Price floor for a single custom print unit, regardless of how small/cheap it computes to. */
  minimumPrice: number;
};

export const DEFAULT_PRICING_SETTINGS: PricingSettingsValues = {
  machineRatePerHour: 2.5,
  printSpeedGramsPerHour: 20,
  finishingCostFlat: 2,
  infillFactor: 0.3,
  shapeFactor: 0.55,
  minimumPrice: 10,
};

export type FilamentForPricing = {
  pricePerGram: number;
  /** g/cm3 */
  density: number;
};

export type Dimensions = {
  heightMm: number;
  widthMm: number;
  depthMm: number;
};

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function boundingBoxVolumeCm3({ heightMm, widthMm, depthMm }: Dimensions): number {
  const volumeMm3 = Math.max(0, heightMm) * Math.max(0, widthMm) * Math.max(0, depthMm);
  return volumeMm3 / 1000;
}

export function estimatedPrintVolumeCm3(
  dimensions: Dimensions,
  settings: PricingSettingsValues
): number {
  return boundingBoxVolumeCm3(dimensions) * settings.shapeFactor * settings.infillFactor;
}

export function estimatedWeightGrams(printVolumeCm3: number, densityGPerCm3: number): number {
  return printVolumeCm3 * densityGPerCm3;
}

export function estimatedPrintTimeHours(
  weightGrams: number,
  settings: PricingSettingsValues
): number {
  if (settings.printSpeedGramsPerHour <= 0) return 0;
  return weightGrams / settings.printSpeedGramsPerHour;
}

export type PriceBreakdown = {
  weightGrams: number;
  printTimeHours: number;
  materialCost: number;
  printingCost: number;
  finishingCost: number;
  /** max(materialCost + printingCost + finishingCost, settings.minimumPrice) */
  unitPrice: number;
  /** True when the computed cost was below the minimum and got floored up to it. */
  minimumApplied: boolean;
  quantity: number;
  /** unitPrice * quantity */
  total: number;
};

export function calculateCustomPrintPrice({
  dimensions,
  filament,
  settings = DEFAULT_PRICING_SETTINGS,
  quantity = 1,
}: {
  dimensions: Dimensions;
  filament: FilamentForPricing;
  settings?: PricingSettingsValues;
  quantity?: number;
}): PriceBreakdown {
  const printVolumeCm3 = estimatedPrintVolumeCm3(dimensions, settings);
  const weightGrams = estimatedWeightGrams(printVolumeCm3, filament.density);
  const printTimeHours = estimatedPrintTimeHours(weightGrams, settings);

  const materialCost = weightGrams * filament.pricePerGram;
  const printingCost = printTimeHours * settings.machineRatePerHour;
  const finishingCost = settings.finishingCostFlat;
  const computedCost = materialCost + printingCost + finishingCost;
  const unitPrice = Math.max(computedCost, settings.minimumPrice);
  const safeQuantity = Math.max(1, Math.round(quantity));

  return {
    weightGrams: round2(weightGrams),
    printTimeHours: round2(printTimeHours),
    materialCost: round2(materialCost),
    printingCost: round2(printingCost),
    finishingCost: round2(finishingCost),
    unitPrice: round2(unitPrice),
    minimumApplied: unitPrice > computedCost,
    quantity: safeQuantity,
    total: round2(unitPrice * safeQuantity),
  };
}
