"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { WizardStepper } from "@/components/customize/wizard-stepper";
import { UploadStep } from "@/components/customize/upload-step";
import { DimensionsStep } from "@/components/customize/dimensions-step";
import { MaterialStep } from "@/components/customize/material-step";
import { PriceReviewStep } from "@/components/customize/price-review-step";
import type { ModelDimensions } from "@/components/customize/model-viewer";
import { calculateCustomPrintPrice, type PricingSettingsValues } from "@/lib/pricing";
import { useCartStore } from "@/store/cart-store";
import type { PlainFilament } from "@/lib/data/filaments";

export function CustomizeWizard({
  filaments,
  settings,
}: {
  filaments: PlainFilament[];
  settings: PricingSettingsValues;
}) {
  const router = useRouter();
  const addCustom = useCartStore((s) => s.addCustom);

  const [step, setStep] = React.useState(1);
  const [file, setFile] = React.useState<File | null>(null);
  const [dimensions, setDimensions] = React.useState<ModelDimensions>({
    heightMm: 0,
    widthMm: 0,
    depthMm: 0,
  });
  const [filamentId, setFilamentId] = React.useState<string | null>(filaments[0]?.id ?? null);
  const [colorName, setColorName] = React.useState<string | null>(
    filaments[0]?.colors[0]?.name ?? null
  );
  const [quantity, setQuantity] = React.useState(1);
  const [submitting, setSubmitting] = React.useState(false);

  const selectedFilament = filaments.find((f) => f.id === filamentId) ?? filaments[0] ?? null;

  function handleFileSelected(next: File | null) {
    setFile(next);
    if (!next) setDimensions({ heightMm: 0, widthMm: 0, depthMm: 0 });
  }

  async function handleAddToCart() {
    if (!file || !selectedFilament || !colorName) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const uploaded: { url: string; fileName: string; fileType: string } = await res.json();

      const breakdown = calculateCustomPrintPrice({
        dimensions,
        filament: selectedFilament,
        settings,
        quantity,
      });

      addCustom({
        fileName: uploaded.fileName,
        fileType: uploaded.fileType,
        fileUrl: uploaded.url,
        filamentId: selectedFilament.id,
        filamentName: selectedFilament.name,
        colorName,
        heightMm: dimensions.heightMm,
        widthMm: dimensions.widthMm,
        depthMm: dimensions.depthMm,
        estWeightGrams: breakdown.weightGrams,
        estPrintHours: breakdown.printTimeHours,
        unitPrice: breakdown.unitPrice,
        quantity,
      });

      toast.success("Custom print added to your cart.");
      router.push("/cart");
    } catch {
      toast.error("Something went wrong uploading your file. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Customize Your Model</h1>
          <p className="mt-2 text-muted-foreground">
            Upload a design, dial in the size and material, and get an instant price.
          </p>
        </div>

        <div className="mb-8">
          <WizardStepper current={step} />
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            {step === 1 && (
              <UploadStep
                file={file}
                onFileSelected={handleFileSelected}
                onDimensions={setDimensions}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <DimensionsStep
                dimensions={dimensions}
                onChange={setDimensions}
                settings={settings}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <MaterialStep
                filaments={filaments}
                filamentId={filamentId}
                colorName={colorName}
                onSelect={(id, color) => {
                  setFilamentId(id);
                  setColorName(color);
                }}
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
              />
            )}
            {step === 4 && file && selectedFilament && colorName && (
              <PriceReviewStep
                file={file}
                dimensions={dimensions}
                filament={selectedFilament}
                colorName={colorName}
                quantity={quantity}
                settings={settings}
                onQuantityChange={setQuantity}
                onBack={() => setStep(3)}
                onAddToCart={handleAddToCart}
                submitting={submitting}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
