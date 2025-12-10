"""
Pipeline configuration settings.

This module handles all configuration for the cenovnici data processing pipeline.
"""

from pathlib import Path

import yaml

from ..core.models import PipelineConfig
from ..core.models import RetailerInfo
from ..core.models import StoreFormat


class Settings:
    """Global settings for the cenovnici pipeline."""

    def __init__(self, config_path: str | None = None):
        """Initialize settings from config file or defaults."""
        self.config_path = config_path or Path(__file__).parent / "settings.yaml"
        self.config = self._load_config()

    def _load_config(self) -> PipelineConfig:
        """Load configuration from YAML file."""
        if Path(self.config_path).exists():
            with open(self.config_path, encoding="utf-8") as f:
                config_data = yaml.safe_load(f)
            return PipelineConfig(**config_data.get("pipeline", {}))
        return PipelineConfig()

    def save_config(self):
        """Save current configuration to file."""
        config_data = {
            "pipeline": self.config.dict(),
            "retailers": {r.id: r.dict() for r in self.get_all_retailers()},
            "category_mappings": self.get_category_mappings(),
        }
        Path(self.config_path).parent.mkdir(parents=True, exist_ok=True)
        with open(self.config_path, "w", encoding="utf-8") as f:
            yaml.dump(config_data, f, default_flow_style=False, allow_unicode=True)

    def get_all_retailers(self) -> list[RetailerInfo]:
        """Get all configured retailers."""
        return [
            RetailerInfo(
                id="delhaize",
                name="Delhaize Serbia",
                name_sr="Delhaize Srbija",
                website="https://shop.delhaize.rs",
                store_formats=[StoreFormat.SUPERMARKET, StoreFormat.HYPERMARKET],
                data_source_url="https://data.gov.rs/dataset/cenovnici-delhaize-serbia",
                update_frequency="Daily",
                description="Leading supermarket chain in Serbia",
                description_sr="Vodeći lanac supermarketa u Srbiji",
            ),
            RetailerInfo(
                id="idea",
                name="Idea Marketi",
                name_sr="Idea Marketi",
                website="https://idea.rs",
                store_formats=[StoreFormat.SUPERMARKET, StoreFormat.CONVENIENCE],
                data_source_url="https://data.gov.rs/dataset/cenovnici-idea",
                update_frequency="Daily",
                description="Supermarket chain with focus on fresh products",
                description_sr="Lanac supermarketa sa fokusom na sveže proizvode",
            ),
            RetailerInfo(
                id="lidl",
                name="Lidl Serbia",
                name_sr="Lidl Srbija",
                website="https://www.lidl.rs",
                store_formats=[StoreFormat.DISCOUNT, StoreFormat.SUPERMARKET],
                data_source_url="https://data.gov.rs/dataset/cenovnici-lidl",
                update_frequency="Weekly",
                description="German discount supermarket chain",
                description_sr="Nemački lanac diskont supermarketa",
            ),
            RetailerInfo(
                id="maxi",
                name="Maxi",
                name_sr="Maksi",
                website="https://maxi.rs",
                store_formats=[StoreFormat.SUPERMARKET, StoreFormat.HYPERMARKET],
                data_source_url="https://data.gov.rs/dataset/cenovnici-maxi",
                update_frequency="Daily",
                description="One of the largest supermarket chains in Serbia",
                description_sr="Jedan od najvećih lanaca supermarketa u Srbiji",
            ),
            RetailerInfo(
                id="univerexport",
                name="Univerexport",
                name_sr="Univereksport",
                website="https://univerexport.rs",
                store_formats=[StoreFormat.SUPERMARKET],
                data_source_url="https://data.gov.rs/dataset/cenovnici-univerexport",
                update_frequency="Weekly",
                description="Supermarket chain focused on quality products",
                description_sr="Lanac supermarketa fokusiran na kvalitetne proizvode",
            ),
            RetailerInfo(
                id="dis",
                name="DIS (Krnjevo)",
                name_sr="DIS (Krnjevo)",
                website="https://dis.co.rs",
                store_formats=[StoreFormat.SUPERMARKET, StoreFormat.WHOLESALE],
                data_source_url="https://data.gov.rs/dataset/cenovnici-dis",
                update_frequency="Weekly",
                description="Wholesale and retail supermarket chain",
                description_sr="Veleprodajni i maloprodajni lanac supermarketa",
            ),
            RetailerInfo(
                id="gomex",
                name="Gomex",
                name_sr="Gomeks",
                website="https://gomex.rs",
                store_formats=[StoreFormat.SUPERMARKET],
                data_source_url="https://data.gov.rs/dataset/cenovnici-gomex",
                update_frequency="Weekly",
                description="Supermarket chain with various store formats",
                description_sr="Lanac supermarketa sa različitim formatima prodavnica",
            ),
            RetailerInfo(
                id="vum",
                name="Vum",
                name_sr="Vum",
                website="https://vum.rs",
                store_formats=[StoreFormat.SUPERMARKET, StoreFormat.DISCOUNT],
                data_source_url="https://data.gov.rs/dataset/cenovnici-vum",
                update_frequency="Daily",
                description="Discount supermarket chain",
                description_sr="Lanac diskont supermarketa",
            ),
            RetailerInfo(
                id="aman",
                name="Aman",
                name_sr="Aman",
                website="https://aman.rs",
                store_formats=[StoreFormat.SUPERMARKET],
                data_source_url="https://data.gov.rs/dataset/cenovnici-aman",
                update_frequency="Weekly",
                description="Supermarket chain",
                description_sr="Lanac supermarketa",
            ),
            RetailerInfo(
                id="sumadija",
                name="Šumadija Market",
                name_sr="Šumadija Market",
                website="https://sumadijamarket.rs",
                store_formats=[StoreFormat.SUPERMARKET],
                data_source_url="https://data.gov.rs/dataset/cenovnici-sumadija",
                update_frequency="Weekly",
                description="Regional supermarket chain",
                description_sr="Regionalni lanac supermarketa",
            ),
            # Add 17 more retailers...
            RetailerInfo(
                id="tempo",
                name="Tempo",
                name_sr="Tempo",
                website="https://tempo.rs",
                store_formats=[StoreFormat.HYPERMARKET],
                data_source_url="https://data.gov.rs/dataset/cenovnici-tempo",
                update_frequency="Weekly",
                description="Hypermarket chain",
                description_sr="Lanac hipermarketa",
            ),
            RetailerInfo(
                id="idea_brigade",
                name="Idea Brigade",
                name_sr="Idea Brigada",
                website="https://idea.rs",
                store_formats=[StoreFormat.SUPERMARKET],
                data_source_url="https://data.gov.rs/dataset/cenovnici-idea-brigade",
                update_frequency="Weekly",
                description="Idea supermarket format",
                description_sr="Format Idea supermarketa",
            ),
            RetailerInfo(
                id="rodja",
                name="Rodja Megamarket",
                name_sr="Rođa Megamarket",
                website="https://rodja.rs",
                store_formats=[StoreFormat.HYPERMARKET],
                data_source_url="https://data.gov.rs/dataset/cenovnici-rodja",
                update_frequency="Weekly",
                description="Megamarket chain",
                description_sr="Lanac megamarketa",
            ),
            RetailerInfo(
                id="stadium",
                name="Stadium",
                name_sr="Stadium",
                website="https://stadium.rs",
                store_formats=[StoreFormat.SUPERMARKET],
                data_source_url="https://data.gov.rs/dataset/cenovnici-stadium",
                update_frequency="Weekly",
                description="Goods supermarket chain",
                description_sr="Lanac supermarketa Robna kuća",
            ),
            RetailerInfo(
                id="depot",
                name="Depot",
                name_sr="Depot",
                website="https://depot.rs",
                store_formats=[StoreFormat.SUPERMARKET],
                data_source_url="https://data.gov.rs/dataset/cenovnici-depot",
                update_frequency="Weekly",
                description="Warehouse supermarket",
                description_sr="Skladišni supermarket",
            ),
        ]

    def get_category_mappings(self) -> dict[str, dict[str, str]]:
        """Get category mappings from Serbian to English."""
        return {
            "Sveže voće i povrće": {"en": "Fresh Produce", "en_short": "fresh_produce", "icon": "🥬"},
            "Prerada voća i povrća": {
                "en": "Processed Fruit & Vegetables",
                "en_short": "processed_fruit_veg",
                "icon": "🥫",
            },
            "Meso i mesne prerađevine": {"en": "Meat & Meat Products", "en_short": "meat_products", "icon": "🥩"},
            "Mleko i mlecni proizvodi": {"en": "Milk & Dairy Products", "en_short": "dairy_products", "icon": "🥛"},
            "Pekarski proizvodi": {"en": "Bakery Products", "en_short": "bakery_products", "icon": "🍞"},
            "Žitarice i proizvodi od žitarica": {"en": "Cereals & Grain Products", "en_short": "cereals", "icon": "🌾"},
            "Slatki konditori i cerealije": {
                "en": "Sweet Confectionery & Cereals",
                "en_short": "sweet_confectionery",
                "icon": "🍪",
            },
            "Slani konditori": {"en": "Savory Snacks", "en_short": "savory_snacks", "icon": "🥨"},
            "Pića": {"en": "Beverages", "en_short": "beverages", "icon": "🧃"},
            "Alkoholna pića": {"en": "Alcoholic Beverages", "en_short": "alcoholic_beverages", "icon": "🍺"},
            "Kafa i čaj": {"en": "Coffee & Tea", "en_short": "coffee_tea", "icon": "☕"},
            "Ulja i masti": {"en": "Oils & Fats", "en_short": "oils_fats", "icon": "🫒"},
            "Začini, dodaci i sosovi": {"en": "Spices, Additives & Sauces", "en_short": "condiments", "icon": "🧂"},
            "Smrznuti proizvodi": {"en": "Frozen Foods", "en_short": "frozen_foods", "icon": "🧊"},
            "Konzervirane hrane": {"en": "Canned Foods", "en_short": "canned_foods", "icon": "🥫"},
            "Lična higijena i kozmetika": {
                "en": "Personal Care & Cosmetics",
                "en_short": "personal_care",
                "icon": "🧴",
            },
            "Kućna hemija": {"en": "Household Chemicals", "en_short": "household_chemicals", "icon": "🧹"},
            "Namirnice za kućne ljubimce": {"en": "Pet Supplies", "en_short": "pet_supplies", "icon": "🐾"},
            "Proizvodi za bebe": {"en": "Baby Products", "en_short": "baby_products", "icon": "👶"},
            "Duvanski proizvodi": {"en": "Tobacco Products", "en_short": "tobacco", "icon": "🚬"},
            "Ostalo": {"en": "Other", "en_short": "other", "icon": "📦"},
        }

    def get_retailer_by_id(self, retailer_id: str) -> RetailerInfo | None:
        """Get retailer info by ID."""
        for retailer in self.get_all_retailers():
            if retailer.id == retailer_id:
                return retailer
        return None

    def get_output_paths(self) -> dict[str, Path]:
        """Get all output directory paths."""
        base = Path(self.config.output_directory)
        return {
            "raw": base / "raw",
            "processed": base / "processed",
            "insights": base / "insights",
            "samples": base / "samples",
            "reports": base / "reports",
            "cache": base / ".cache",
        }

    def ensure_output_dirs(self):
        """Create all output directories if they don't exist."""
        for path in self.get_output_paths().values():
            path.mkdir(parents=True, exist_ok=True)


# Global settings instance
settings = Settings()
