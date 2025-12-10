"""
Data transformer for cenovnici pipeline.

Transforms raw cenovnici data to vizualni-admin compatible format.
"""

import hashlib
import json
import logging
import uuid
from datetime import datetime
from datetime import timedelta
from pathlib import Path
from typing import Any

from ..config.settings import settings
from ..core.models import DiscountInfo
from ..core.models import PriceTrend
from ..core.models import PriceTrendPoint
from ..core.models import RawCenovnikRecord
from ..core.models import RetailerInfo
from ..core.models import TransformedProduct

logger = logging.getLogger(__name__)


class DataTransformer:
    """Transforms raw cenovnici data to vizualni-admin format."""

    def __init__(self):
        """Initialize the transformer."""
        self.category_mappings = settings.get_category_mappings()
        self.retailers = {r.id: r for r in settings.get_all_retailers()}

    def transform_raw_record(
        self, record: RawCenovnikRecord, retailer_info: RetailerInfo | None = None
    ) -> TransformedProduct | None:
        """Transform a single raw record to vizualni-admin format.

        Args:
            record: Raw cenovnik record
            retailer_info: Retailer information

        Returns:
            Transformed product or None if invalid
        """
        try:
            # Determine retailer
            if not retailer_info:
                retailer_name = record.naziv_trgovca_format.lower()
                retailer_id = self._extract_retailer_id(retailer_name)
                retailer_info = self.retailers.get(retailer_id)
                if not retailer_info:
                    logger.warning(f"Unknown retailer: {retailer_name}")
                    retailer_id = "unknown"
                    retailer_name = record.naziv_trgovca_format
                else:
                    retailer_name = retailer_info.name
            else:
                retailer_id = retailer_info.id
                retailer_name = retailer_info.name

            # Generate unique IDs
            product_id = self._generate_product_id(
                record.naziv_proizvoda, record.robna_marka or "", record.barkod or ""
            )
            record_id = str(uuid.uuid4())

            # Determine price and discount
            current_price = record.snizena_cena if record.snizena_cena else record.redovna_cena
            original_price = record.redovna_cena
            discount = None

            if current_price and original_price and current_price < original_price:
                discount = round(((original_price - current_price) / original_price) * 100, 2)

            # Map category
            category_sr = record.kategorija_naziv or "Ostalo"
            category_info = self.category_mappings.get(category_sr, {"en": "Other", "en_short": "other"})
            category = category_info["en"]

            # Extract quantity and unit
            unit = record.jedinica_mere
            quantity = None
            price_per_unit = record.cena_po_jedinici

            # Parse quantity from product name if available
            if " " in unit:
                # Unit might contain quantity like "1kg" or "500g"
                try:
                    # Extract number from unit
                    import re

                    match = re.search(r"(\d+\.?\d*)", unit)
                    if match:
                        quantity = float(match.group(1))
                except:
                    pass

            # Create transformed product
            transformed = TransformedProduct(
                id=record_id,
                product_id=product_id,
                product_name=record.naziv_proizvoda,
                product_name_sr=record.naziv_proizvoda,
                retailer=retailer_id,
                retailer_name=retailer_name,
                price=current_price or 0,
                original_price=original_price,
                currency="RSD",
                discount=discount,
                category=category,
                category_sr=category_sr,
                brand=record.robna_marka,
                unit=unit,
                quantity=quantity,
                price_per_unit=price_per_unit,
                availability="in_stock",
                timestamp=self._parse_timestamp(record.datum_cenovnika),
                barcode=record.barkod,
                vat_rate=record.stopa_pdv,
                discount_start_date=record.datum_pocetka_snizenja,
                discount_end_date=record.datum_kraja_snizenja,
                url="https://data.gov.rs/dataset/cenovnici",
                description=self._generate_description(record),
                description_sr=self._generate_description_sr(record),
            )

            return transformed

        except Exception as e:
            logger.error(f"Error transforming record: {e}")
            return None

    def transform_batch(
        self, raw_records: list[RawCenovnikRecord], retailer_id: str | None = None
    ) -> list[TransformedProduct]:
        """Transform a batch of raw records.

        Args:
            raw_records: List of raw records
            retailer_id: Retailer ID if known

        Returns:
            List of transformed products
        """
        retailer_info = self.retailers.get(retailer_id) if retailer_id else None
        transformed = []

        logger.info(f"Transforming {len(raw_records)} records for retailer {retailer_id}")

        for i, record in enumerate(raw_records):
            try:
                product = self.transform_raw_record(record, retailer_info)
                if product:
                    transformed.append(product)

                # Progress logging
                if (i + 1) % 10000 == 0:
                    logger.info(f"Transformed {i + 1}/{len(raw_records)} records")

            except Exception as e:
                logger.error(f"Error transforming record {i}: {e}")
                continue

        logger.info(f"Successfully transformed {len(transformed)}/{len(raw_records)} records")
        return transformed

    def extract_discounts(self, products: list[TransformedProduct]) -> list[DiscountInfo]:
        """Extract discount information from transformed products.

        Args:
            products: List of transformed products

        Returns:
            List of discount information
        """
        discounts = []

        for product in products:
            if product.discount and product.discount > 0 and product.original_price:
                discount_info = DiscountInfo(
                    id=str(uuid.uuid4()),
                    product_id=product.product_id,
                    product_name=product.product_name,
                    product_name_sr=product.product_name_sr,
                    retailer=product.retailer,
                    retailer_name=product.retailer_name,
                    original_price=product.original_price,
                    current_price=product.price,
                    discount_amount=product.original_price - product.price,
                    discount_percentage=product.discount,
                    currency=product.currency,
                    category=product.category,
                    category_sr=product.category_sr,
                    valid_until=product.discount_end_date,
                    discount_type="percentage",
                    tags=self._generate_discount_tags(product),
                )
                discounts.append(discount_info)

        return discounts

    def create_price_trends(self, products: list[TransformedProduct], days: int = 30) -> list[PriceTrend]:
        """Create price trend data from products.

        Args:
            products: List of transformed products
            days: Number of days for trend data

        Returns:
            List of price trends
        """
        # Group products by product_id
        product_groups = {}
        for product in products:
            if product.product_id not in product_groups:
                product_groups[product.product_id] = []
            product_groups[product.product_id].append(product)

        trends = []
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        for product_id, group in product_groups.items():
            if len(group) < 2:
                continue  # Need at least 2 data points for trend

            # Sort by timestamp
            group.sort(key=lambda x: x.timestamp)

            # Create data points
            data_points = []
            for product in group:
                date = datetime.fromisoformat(product.timestamp.replace("Z", "+00:00")).date()
                if start_date.date() <= date <= end_date.date():
                    point = PriceTrendPoint(
                        date=product.timestamp.split("T")[0],
                        price=product.price,
                        currency=product.currency,
                        discount=product.discount,
                        availability=product.availability,
                    )
                    data_points.append(point)

            if data_points:
                # Use first product for info
                first_product = group[0]
                trend = PriceTrend(
                    product_id=product_id,
                    product_name=first_product.product_name,
                    product_name_sr=first_product.product_name_sr,
                    retailer=first_product.retailer,
                    retailer_name=first_product.retailer_name,
                    category=first_product.category,
                    category_sr=first_product.category_sr,
                    data_points=data_points,
                )
                trends.append(trend)

        return trends

    def save_transformed_data(self, data: list[Any], filename: str, data_type: str = "products"):
        """Save transformed data to JSON file.

        Args:
            data: Data to save
            filename: Output filename
            data_type: Type of data for directory structure
        """
        output_dir = Path(settings.get_output_paths()["processed"]) / data_type
        output_dir.mkdir(parents=True, exist_ok=True)

        output_file = output_dir / filename

        # Convert to JSON-serializable format
        json_data = [item.dict() if hasattr(item, "dict") else item for item in data]

        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)

        logger.info(f"Saved {len(data)} items to {output_file}")

    def _generate_product_id(self, name: str, brand: str, barcode: str) -> str:
        """Generate consistent product ID."""
        # Normalize inputs
        name = name.lower().strip()
        brand = brand.lower().strip() if brand else ""
        barcode = barcode.strip() if barcode else ""

        # Create hash
        content = f"{name}|{brand}|{barcode}"
        return hashlib.md5(content.encode()).hexdigest()[:16]

    def _extract_retailer_id(self, retailer_name: str) -> str:
        """Extract retailer ID from retailer name."""
        retailer_name_lower = retailer_name.lower()

        for retailer_id, retailer_info in self.retailers.items():
            if retailer_info.name.lower() in retailer_name_lower:
                return retailer_id
            if retailer_id in retailer_name_lower:
                return retailer_id

        return "unknown"

    def _parse_timestamp(self, date_str: str) -> str:
        """Parse timestamp from cenovnik date."""
        if not date_str:
            return datetime.now().isoformat()

        try:
            # Handle YYYY-MM-DD format
            if len(date_str) == 10 and date_str[4] == "-":
                dt = datetime.strptime(date_str, "%Y-%m-%d")
            # Handle DD-MM-YYYY format
            elif len(date_str) == 10 and date_str[2] == "-":
                dt = datetime.strptime(date_str, "%d-%m-%Y")
            else:
                # Try to parse as is
                dt = datetime.fromisoformat(date_str)

            return dt.isoformat()

        except:
            return datetime.now().isoformat()

    def _generate_description(self, record: RawCenovnikRecord) -> str:
        """Generate English description for product."""
        parts = []

        if record.robna_marka:
            parts.append(f"Brand: {record.robna_marka}")

        if record.barkod:
            parts.append(f"Barcode: {record.barkod}")

        if record.jedinica_mere:
            parts.append(f"Unit: {record.jedinica_mere}")

        if record.stopa_pdv:
            parts.append(f"VAT: {record.stopa_pdv}%")

        return " | ".join(parts) if parts else "No additional information"

    def _generate_description_sr(self, record: RawCenovnikRecord) -> str:
        """Generate Serbian description for product."""
        parts = []

        if record.robna_marka:
            parts.append(f"Brend: {record.robna_marka}")

        if record.barkod:
            parts.append(f"Barkod: {record.barkod}")

        if record.jedinica_mere:
            parts.append(f"Jedinica: {record.jedinica_mere}")

        if record.stopa_pdv:
            parts.append(f"PDV: {record.stopa_pdv}%")

        return " | ".join(parts) if parts else "Nema dodatnih informacija"

    def _generate_discount_tags(self, product: TransformedProduct) -> list[str]:
        """Generate tags for discount."""
        tags = []

        if product.discount:
            if product.discount > 20:
                tags.append("high_discount")
            elif product.discount > 10:
                tags.append("medium_discount")
            else:
                tags.append("low_discount")

        if product.category_sr in ["Sveže voće i povrće", "Meso i mesne prerađevine"]:
            tags.append("fresh")

        if product.brand:
            tags.append(product.brand.lower())

        return tags


# Export the main class
__all__ = ["DataTransformer"]
