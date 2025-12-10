"""
Core data models for the cenovnici pipeline.

This module defines Pydantic models for:
- Raw cenovnici data structure
- Transformed vizualni-admin format
- Pipeline internal data structures
"""

from enum import Enum
from typing import Any

from pydantic import BaseModel
from pydantic import Field
from pydantic import validator


class ProductCategory(str, Enum):
    """Standardized product categories from Serbian classification."""

    FRESH_PRODUCE = "Sveže voće i povrće"
    PROCESSED_FRUIT_VEG = "Prerada voća i povrća"
    MEAT_PRODUCTS = "Meso i mesne prerađevine"
    DAIRY_PRODUCTS = "Mleko i mlecni proizvodi"
    BAKERY_PRODUCTS = "Pekarski proizvodi"
    CEREALS = "Žitarice i proizvodi od žitarica"
    SWEET_CONFECTIONERY = "Slatki konditori i cerealije"
    SAVORY_SNACKS = "Slani konditori"
    BEVERAGES = "Pića"
    ALCOHOLIC_BEVERAGES = "Alkoholna pića"
    COFFEE_TEA = "Kafa i čaj"
    OILS_FATS = "Ulja i masti"
    CONDIMENTS = "Začini, dodaci i sosovi"
    FROZEN_FOODS = "Smrznuti proizvodi"
    CANNED_FOODS = "Konzervirane hrane"
    PERSONAL_CARE = "Lična higijena i kozmetika"
    HOUSEHOLD_CHEMICALS = "Kućna hemija"
    PET_SUPPLIES = "Namirnice za kućne ljubimce"
    BABY_PRODUCTS = "Proizvodi za bebe"
    TOBACCO = "Duvanski proizvodi"
    OTHER = "Ostalo"


class StoreFormat(str, Enum):
    """Standardized store format classifications."""

    HYPERMARKET = "Hipermarket"
    SUPERMARKET = "Supermarket"
    CONVENIENCE = "Mini market"
    DISCOUNT = "Diskont"
    PHARMACY = "Apoteka"
    SPECIALTY = "Specijalizovana prodavnica"
    ONLINE = "Online prodavnica"
    WHOLESALE = "Veleprodaja"


class VATRate(str, Enum):
    """VAT rates in Serbia."""

    STANDARD = "20"
    REDUCED = "10"
    ZERO = "0"


class RawCenovnikRecord(BaseModel):
    """Raw data structure from cenovnici CSV files.

    Matches the format from data.gov.rs datasets.
    """

    kategorija_id: str | None = Field(None, alias="KATEGORIJA")
    kategorija_naziv: str | None = Field(None, alias="NAZIV KATEGORIJE")
    naziv_proizvoda: str = Field(..., alias="Naziv proizvoda")
    robna_marka: str | None = Field(None, alias="Robna marka")
    barkod: str | None = Field(None, alias="Barkod proizvoda")
    jedinica_mere: str = Field(..., alias="Jedinica mere")
    naziv_trgovca_format: str = Field(..., alias="Naziv trgovca - format")
    datum_cenovnika: str = Field(..., alias="Datum cenovnika")
    redovna_cena: float | None = Field(None, alias="Redovna cena")
    cena_po_jedinici: float | None = Field(None, alias="Cena po jedinici mere")
    snizena_cena: float | None = Field(None, alias="Snižena cena")
    datum_pocetka_snizenja: str | None = Field(None, alias="Datum početka sniženja")
    datum_kraja_snizenja: str | None = Field(None, alias="Datum kraja sniženja")
    stopa_pdv: str | None = Field(None, alias="Stopa PDV")

    @validator("redovna_cena", "cena_po_jedinici", "snizena_cena", pre=True)
    def parse_price(cls, v):
        """Parse price values from Serbian format."""
        if v is None or v == "":
            return None
        if isinstance(v, (int, float)):
            return float(v)
        # Remove dots and replace comma with dot
        cleaned = str(v).replace(".", "").replace(",", ".")
        try:
            return float(cleaned)
        except ValueError:
            return None

    @validator("datum_cenovnika", "datum_pocetka_snizenja", "datum_kraja_snizenja", pre=True)
    def parse_date(cls, v):
        """Parse Serbian date format."""
        if v is None or v == "":
            return None
        # Handle DD-MM-YYYY format
        if isinstance(v, str):
            # Try different separators
            for sep in ["-", ".", "/"]:
                if sep in v:
                    parts = v.split(sep)
                    if len(parts) == 3:
                        try:
                            day, month, year = parts
                            return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
                        except ValueError:
                            continue
        return v

    model_config = {"populate_by_name": True}


class RetailerInfo(BaseModel):
    """Information about a retailer."""

    id: str
    name: str
    name_sr: str | None = None
    website: str | None = None
    logo_url: str | None = None
    store_formats: list[StoreFormat] = []
    description: str | None = None
    description_sr: str | None = None
    data_source_url: str | None = None
    update_frequency: str = "Nepoznato"
    total_products: int = 0


class TransformedProduct(BaseModel):
    """Transformed product data matching vizualni-admin schema."""

    id: str
    product_id: str
    product_name: str
    product_name_sr: str
    retailer: str
    retailer_name: str
    price: float
    original_price: float | None = None
    currency: str = "RSD"
    discount: float | None = None
    category: str
    category_sr: str
    subcategory: str | None = None
    subcategory_sr: str | None = None
    brand: str | None = None
    unit: str
    quantity: float | None = None
    price_per_unit: float | None = None
    availability: str = "in_stock"  # cenovnici assume available
    location: str | None = None
    location_sr: str | None = None
    timestamp: str
    url: str | None = None
    image_url: str | None = None
    description: str | None = None
    description_sr: str | None = None
    barcode: str | None = None
    vat_rate: str | None = None
    discount_start_date: str | None = None
    discount_end_date: str | None = None


class PriceTrendPoint(BaseModel):
    """Single data point in a price trend."""

    date: str
    price: float
    currency: str = "RSD"
    discount: float | None = None
    availability: str = "in_stock"


class PriceTrend(BaseModel):
    """Price trend for a specific product."""

    product_id: str
    product_name: str
    product_name_sr: str
    retailer: str
    retailer_name: str
    category: str
    category_sr: str
    data_points: list[PriceTrendPoint]


class DiscountInfo(BaseModel):
    """Discount information."""

    id: str
    product_id: str
    product_name: str
    product_name_sr: str
    retailer: str
    retailer_name: str
    original_price: float
    current_price: float
    discount_amount: float
    discount_percentage: float
    currency: str = "RSD"
    category: str
    category_sr: str
    valid_until: str | None = None
    discount_type: str = "percentage"
    tags: list[str] = []


class CategoryAnalytics(BaseModel):
    """Analytics for a product category."""

    category: str
    category_sr: str
    product_count: int
    avg_price: float
    min_price: float
    max_price: float
    price_change_24h: float | None = None
    price_change_7d: float | None = None
    price_change_30d: float | None = None
    top_brands: list[dict[str, Any]] = []
    discount_rate: float = 0.0


class RetailerAnalytics(BaseModel):
    """Analytics for a retailer."""

    retailer: str
    retailer_name: str
    product_count: int
    categories_covered: int
    avg_price: float
    avg_discount: float
    price_competitiveness: float  # 0-1, lower is more competitive
    update_frequency: str
    last_updated: str


class PriceInsight(BaseModel):
    """Generated insight about prices."""

    id: str
    type: str  # "price_drop", "best_deal", "price_increase", etc.
    title: str
    title_sr: str
    description: str
    description_sr: str
    product_ids: list[str]
    retailers: list[str]
    categories: list[str]
    confidence: float  # 0-1
    created_at: str
    valid_until: str | None = None


class PipelineStats(BaseModel):
    """Pipeline execution statistics."""

    total_records_processed: int = 0
    total_retailers: int = 0
    total_categories: int = 0
    total_products: int = 0
    total_discounts: int = 0
    processing_time_seconds: float = 0.0
    records_with_errors: int = 0
    records_with_discounts: int = 0
    avg_discount_percentage: float = 0.0
    price_range: dict[str, float] = {"min": 0.0, "max": 0.0}
    last_updated: str


class PipelineConfig(BaseModel):
    """Pipeline configuration."""

    input_directory: str = "amplifier/output/raw_data"
    output_directory: str = "amplifier/output/processed"
    sample_size: int = 10000
    enable_insights: bool = True
    enable_trends: bool = True
    date_range_days: int = 30
    min_discount_threshold: float = 5.0
    max_records_per_file: int = 50000
    parallel_processing: bool = True
    cache_enabled: bool = True


# Export all models
__all__ = [
    "RawCenovnikRecord",
    "RetailerInfo",
    "TransformedProduct",
    "PriceTrend",
    "PriceTrendPoint",
    "DiscountInfo",
    "CategoryAnalytics",
    "RetailerAnalytics",
    "PriceInsight",
    "PipelineStats",
    "PipelineConfig",
    "ProductCategory",
    "StoreFormat",
    "VATRate",
]
