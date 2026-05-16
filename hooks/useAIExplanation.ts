import { useMemo } from "react";
import { generateExplanation, IndicatorInput } from "@/lib/analysis/explainIndicators";

export function useAIExplanation(
  data: IndicatorInput | null,
  mode: "beginner" | "advanced"
) {
  const explanation = useMemo(() => {
    if (!data) return null;
    return generateExplanation(data, mode);
  }, [data?.symbol, data?.signal, data?.confidence, mode]);

  return { explanation, isLoading: false, error: null };
}