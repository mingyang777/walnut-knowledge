export interface Category {
  id: string;
  name: string;
  description?: string;
  children: {
    id: string;
    name: string;
  }[];
}

export interface PriceRange {
  min: number;
  max: number;
  unit: string;
  notes?: string;
}

export interface WalnutVariety {
  id: string;
  name: string;
  alias?: string[];
  primaryCategory: string;
  secondaryCategory: string;
  introduction: string;
  history: string;
  priceRange: PriceRange;
  identificationTips: string[];
  pros: string[];
  cons: string[];
  images: string[];
  tags: string[];
  origin?: string;
}

export interface KnowledgeBase {
  categories: Category[];
  varieties: WalnutVariety[];
}

export interface IdentificationResult {
  varietyName: string;
  matchedVarietyId?: string;
  confidence: number;
  pros: string[];
  cons: string[];
  predictedPrice: {
    min: number;
    max: number;
    unit: string;
    reasoning: string;
  };
  identificationNotes: string[];
  alternativeMatches?: {
    name: string;
    confidence: number;
  }[];
}
