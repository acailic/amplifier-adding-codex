"""
Sample data generator for cenovnici pipeline.

Generates realistic sample data for demo purposes based on actual Serbian product data.
"""

import json
import logging
import random
import uuid
from datetime import datetime
from datetime import timedelta
from pathlib import Path
from typing import Any

from ..config.settings import settings
from ..core.models import CategoryAnalytics
from ..core.models import DiscountInfo
from ..core.models import PipelineStats
from ..core.models import PriceInsight
from ..core.models import PriceTrend
from ..core.models import PriceTrendPoint
from ..core.models import RetailerAnalytics
from ..core.models import TransformedProduct

logger = logging.getLogger(__name__)


class SampleDataGenerator:
    """Generates sample data for demo purposes."""

    def __init__(self):
        """Initialize the sample generator."""
        self.category_mappings = settings.get_category_mappings()
        self.retailers = settings.get_all_retailers()
        self.product_templates = self._init_product_templates()

    def _init_product_templates(self) -> dict[str, list[dict]]:
        """Initialize realistic product templates for Serbian market."""
        return {
            "Sveže voće i povrće": [
                {
                    "name": "Domaće jabuke",
                    "name_sr": "Домаће јабуке",
                    "brand": "RM NIJE DEFINISANA",
                    "unit": "kg",
                    "price_base": 150,
                    "price_var": 50,
                },
                {
                    "name": "Banane",
                    "name_sr": "Банане",
                    "brand": "Import",
                    "unit": "kg",
                    "price_base": 250,
                    "price_var": 30,
                },
                {
                    "name": "Krompir",
                    "name_sr": "Кромпир",
                    "brand": "Domaći",
                    "unit": "kg",
                    "price_base": 80,
                    "price_var": 20,
                },
                {
                    "name": "Paradajz",
                    "name_sr": "Парадајз",
                    "brand": "Domaći",
                    "unit": "kg",
                    "price_base": 300,
                    "price_var": 50,
                },
                {
                    "name": "Kuvana šunka",
                    "name_sr": "Кувана шунка",
                    "brand": "Vindija",
                    "unit": "kg",
                    "price_base": 1200,
                    "price_var": 200,
                },
            ],
            "Mleko i mlecni proizvodi": [
                {
                    "name": "Mleko 1L",
                    "name_sr": "Млеко 1Л",
                    "brand": "Imlek",
                    "unit": "L",
                    "price_base": 140,
                    "price_var": 10,
                },
                {
                    "name": "Jogurt 1kg",
                    "name_sr": "Јогурт 1кг",
                    "brand": "Mlekara",
                    "unit": "kg",
                    "price_base": 200,
                    "price_var": 20,
                },
                {
                    "name": "Kačkavalj 1kg",
                    "name_sr": "Качкаваљ 1кг",
                    "brand": "Nektar",
                    "unit": "kg",
                    "price_base": 1000,
                    "price_var": 100,
                },
                {
                    "name": "Maslac 200g",
                    "name_sr": "Маслац 200г",
                    "brand": "Imlek",
                    "unit": "g",
                    "price_base": 350,
                    "price_var": 30,
                },
            ],
            "Pekarski proizvodi": [
                {
                    "name": "Hleb beli 600g",
                    "name_sr": "Хлеб бели 600г",
                    "brand": "Fionka",
                    "unit": "g",
                    "price_base": 100,
                    "price_var": 10,
                },
                {
                    "name": "Hleb integralni 600g",
                    "name_sr": "Хлеб интегрални 600г",
                    "brand": "Fionka",
                    "unit": "g",
                    "price_base": 120,
                    "price_var": 10,
                },
                {
                    "name": "Kifle 6kom",
                    "name_sr": "Кифле 6ком",
                    "brand": "Bambi",
                    "unit": "kom",
                    "price_base": 150,
                    "price_var": 20,
                },
            ],
            "Slani konditori": [
                {
                    "name": "Pringles Original",
                    "name_sr": "Pringles Original",
                    "brand": "Pringles",
                    "unit": "g",
                    "price_base": 300,
                    "price_var": 50,
                },
                {
                    "name": "Sticks 100g",
                    "name_sr": "Sticks 100г",
                    "brand": "Kras",
                    "unit": "g",
                    "price_base": 120,
                    "price_var": 10,
                },
                {
                    "name": "Sole 100g",
                    "name_sr": "Sole 100г",
                    "brand": "Kras",
                    "unit": "g",
                    "price_base": 80,
                    "price_var": 5,
                },
            ],
            "Slatki konditori i cerealije": [
                {
                    "name": "Milka Čokolada 100g",
                    "name_sr": "Milka Чоколада 100г",
                    "brand": "Milka",
                    "unit": "g",
                    "price_base": 180,
                    "price_var": 20,
                },
                {
                    "name": "Najlepše Želje 100g",
                    "name_sr": "Најлепше Жеље 100г",
                    "brand": "Stark",
                    "unit": "g",
                    "price_base": 120,
                    "price_var": 10,
                },
                {
                    "name": "Coko Smoki 100g",
                    "name_sr": "Цоко Смоји 100г",
                    "brand": "Stark",
                    "unit": "g",
                    "price_base": 100,
                    "price_var": 10,
                },
                {
                    "name": "Jaffa keksi",
                    "name_sr": "Јаффа кекси",
                    "brand": "Stark",
                    "unit": "g",
                    "price_base": 250,
                    "price_var": 20,
                },
            ],
            "Pića": [
                {
                    "name": "Coca-Cola 2L",
                    "name_sr": "Coca-Cola 2Л",
                    "brand": "Coca-Cola",
                    "unit": "L",
                    "price_base": 220,
                    "price_var": 20,
                },
                {
                    "name": "Voda Rosa 1.5L",
                    "name_sr": "Вода Роса 1.5Л",
                    "brand": "Voda Rosa",
                    "unit": "L",
                    "price_base": 70,
                    "price_var": 5,
                },
                {
                    "name": "Sok Jamnica 1L",
                    "name_sr": "Сок Јамница 1Л",
                    "brand": "Jamnica",
                    "unit": "L",
                    "price_base": 180,
                    "price_var": 20,
                },
            ],
            "Lična higijena i kozmetika": [
                {
                    "name": "Šampoon 400ml",
                    "name_sr": "Шампон 400мл",
                    "brand": "Dove",
                    "unit": "ml",
                    "price_base": 400,
                    "price_var": 50,
                },
                {
                    "name": "Sabun 100g",
                    "name_sr": "Сапун 100г",
                    "brand": "Camay",
                    "unit": "g",
                    "price_base": 120,
                    "price_var": 10,
                },
                {
                    "name": "Pasta za zube 75ml",
                    "name_sr": "Паста за зубе 75мл",
                    "brand": "Colgate",
                    "unit": "ml",
                    "price_base": 200,
                    "price_var": 20,
                },
            ],
            "Kućna hemija": [
                {
                    "name": "Deterdžent za veš 3kg",
                    "name_sr": "Детерџент за веш 3кг",
                    "brand": "Ariel",
                    "unit": "kg",
                    "price_base": 800,
                    "price_var": 100,
                },
                {
                    "name": "Sredstvo za čišćenje 1L",
                    "name_sr": "Средство за чишћење 1Л",
                    "brand": "Cif",
                    "unit": "L",
                    "price_base": 250,
                    "price_var": 30,
                },
                {
                    "name": "Toalet papir 12rol",
                    "name_sr": "Тоалет папир 12рол",
                    "brand": "Milan",
                    "unit": "kom",
                    "price_base": 400,
                    "price_var": 50,
                },
            ],
        }

    def generate_sample_products(self, count: int = 1000) -> list[TransformedProduct]:
        """Generate sample product data.

        Args:
            count: Number of products to generate

        Returns:
            List of sample products
        """
        products = []
        categories = list(self.product_templates.keys())

        for i in range(count):
            # Select random category and template
            category_sr = random.choice(categories)
            category_info = self.category_mappings.get(category_sr, {"en": "Other", "en_short": "other"})
            category = category_info["en"]

            template = random.choice(self.product_templates[category_sr])
            retailer = random.choice(self.retailers)

            # Generate price variation
            price = template["price_base"] + random.uniform(-template["price_var"], template["price_var"])
            price = max(10, price)  # Minimum price

            # Generate discount
            has_discount = random.random() < 0.3  # 30% chance of discount
            original_price = price
            discount = None

            if has_discount:
                discount_pct = random.uniform(5, 40)
                discount = round(discount_pct, 1)
                price = price * (1 - discount_pct / 100)

            # Generate timestamp
            days_ago = random.randint(0, 30)
            timestamp = (datetime.now() - timedelta(days=days_ago)).isoformat()

            # Create product
            product = TransformedProduct(
                id=str(uuid.uuid4()),
                product_id=f"{template['name'].lower().replace(' ', '_')}_{random.randint(1000, 9999)}",
                product_name=template["name"],
                product_name_sr=template["name_sr"],
                retailer=retailer.id,
                retailer_name=retailer.name,
                price=round(price, 2),
                original_price=round(original_price, 2) if has_discount else None,
                currency="RSD",
                discount=discount,
                category=category,
                category_sr=category_sr,
                brand=template["brand"],
                unit=template["unit"],
                quantity=random.uniform(0.1, 5) if "kg" in template["unit"] else None,
                price_per_unit=round(price, 2) if "kg" in template["unit"] else None,
                availability="in_stock" if random.random() > 0.05 else "limited",
                location="Srbija",
                location_sr="Србија",
                timestamp=timestamp,
                url=f"https://{retailer.website}" if retailer.website else None,
                barcode=f"{random.randint(8600000000000, 8609999999999)}",
                vat_rate="20" if category != "Sveže voće i povrće" else "10",
                description=f"Category: {category}, Brand: {template['brand']}",
                description_sr=f"Категорија: {category_sr}, Бренд: {template['brand']}",
            )

            products.append(product)

        return products

    def generate_sample_trends(self, products: list[TransformedProduct], days: int = 30) -> list[PriceTrend]:
        """Generate sample price trend data.

        Args:
            products: List of products to generate trends for
            days: Number of days of trend data

        Returns:
            List of price trends
        """
        trends = []
        # Select subset of products for trends
        selected_products = random.sample(products, min(100, len(products)))

        for product in selected_products:
            # Generate historical prices
            data_points = []
            base_price = product.original_price or product.price

            for i in range(days):
                date = (datetime.now() - timedelta(days=days - i)).date()
                # Add some random variation
                price_variation = random.uniform(-0.1, 0.1)  # ±10%
                price = base_price * (1 + price_variation)

                # Occasional price drops
                if random.random() < 0.1:  # 10% chance
                    price *= 0.8  # 20% discount

                point = PriceTrendPoint(
                    date=date.isoformat(),
                    price=round(price, 2),
                    currency="RSD",
                    discount=round(random.uniform(0, 30), 1) if random.random() < 0.3 else None,
                    availability="in_stock" if random.random() > 0.05 else "limited",
                )
                data_points.append(point)

            trend = PriceTrend(
                product_id=product.product_id,
                product_name=product.product_name,
                product_name_sr=product.product_name_sr,
                retailer=product.retailer,
                retailer_name=product.retailer_name,
                category=product.category,
                category_sr=product.category_sr,
                data_points=data_points,
            )
            trends.append(trend)

        return trends

    def generate_sample_discounts(self, products: list[TransformedProduct]) -> list[DiscountInfo]:
        """Generate sample discount information.

        Args:
            products: List of products

        Returns:
            List of discount information
        """
        discounts = []
        # Filter products with discounts
        discounted_products = [p for p in products if p.discount and p.discount > 0]

        for product in discounted_products:
            if product.original_price:
                discount = DiscountInfo(
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
                    currency="RSD",
                    category=product.category,
                    category_sr=product.category_sr,
                    valid_until=(datetime.now() + timedelta(days=random.randint(1, 30))).isoformat(),
                    discount_type="percentage" if random.random() > 0.3 else "special_offer",
                    tags=["flash_sale", "limited_time"] if product.discount > 20 else ["discount"],
                )
                discounts.append(discount)

        return discounts

    def generate_category_analytics(self, products: list[TransformedProduct]) -> list[CategoryAnalytics]:
        """Generate category analytics from products.

        Args:
            products: List of products

        Returns:
            List of category analytics
        """
        analytics = []
        categories = {}

        # Group products by category
        for product in products:
            if product.category_sr not in categories:
                categories[product.category_sr] = []
            categories[product.category_sr].append(product)

        # Generate analytics for each category
        for category_sr, cat_products in categories.items():
            prices = [p.price for p in cat_products]
            discounts = [p.discount for p in cat_products if p.discount]

            # Calculate price changes (mock data)
            price_change_24h = random.uniform(-5, 5)
            price_change_7d = random.uniform(-10, 10)
            price_change_30d = random.uniform(-15, 15)

            # Top brands
            brand_counts = {}
            for p in cat_products:
                if p.brand:
                    brand_counts[p.brand] = brand_counts.get(p.brand, 0) + 1

            top_brands = [
                {"brand": brand, "count": count}
                for brand, count in sorted(brand_counts.items(), key=lambda x: x[1], reverse=True)[:5]
            ]

            category_info = self.category_mappings.get(category_sr, {"en": "Other", "en_short": "other"})

            analytics.append(
                CategoryAnalytics(
                    category=category_info["en"],
                    category_sr=category_sr,
                    product_count=len(cat_products),
                    avg_price=round(sum(prices) / len(prices), 2),
                    min_price=min(prices),
                    max_price=max(prices),
                    price_change_24h=price_change_24h,
                    price_change_7d=price_change_7d,
                    price_change_30d=price_change_30d,
                    top_brands=top_brands,
                    discount_rate=len(discounts) / len(cat_products) * 100,
                )
            )

        return analytics

    def generate_retailer_analytics(self, products: list[TransformedProduct]) -> list[RetailerAnalytics]:
        """Generate retailer analytics from products.

        Args:
            products: List of products

        Returns:
            List of retailer analytics
        """
        analytics = []
        retailers = {}

        # Group products by retailer
        for product in products:
            if product.retailer not in retailers:
                retailers[product.retailer] = []
            retailers[product.retailer].append(product)

        # Generate analytics for each retailer
        for retailer_id, retailer_products in retailers.items():
            retailer_info = settings.get_retailer_by_id(retailer_id)
            if not retailer_info:
                continue

            prices = [p.price for p in retailer_products]
            discounts = [p.discount for p in retailer_products if p.discount]
            categories = set(p.category for p in retailer_products)

            analytics.append(
                RetailerAnalytics(
                    retailer=retailer_id,
                    retailer_name=retailer_info.name,
                    product_count=len(retailer_products),
                    categories_covered=len(categories),
                    avg_price=round(sum(prices) / len(prices), 2),
                    avg_discount=sum(discounts) / len(discounts) if discounts else 0,
                    price_competitiveness=random.uniform(0.3, 0.9),  # Mock data
                    update_frequency=retailer_info.update_frequency,
                    last_updated=datetime.now().isoformat(),
                )
            )

        return analytics

    def generate_sample_insights(self, products: list[TransformedProduct]) -> list[PriceInsight]:
        """Generate sample price insights.

        Args:
            products: List of products

        Returns:
            List of price insights
        """
        insights = []

        # Price drop alerts
        discounted_products = [p for p in products if p.discount and p.discount > 20]
        if discounted_products:
            insights.append(
                PriceInsight(
                    id=str(uuid.uuid4()),
                    type="price_drop",
                    title="Big Discounts Available",
                    title_sr="Велики попусти доступни",
                    description=f"{len(discounted_products)} products have discounts over 20%",
                    description_sr=f"{len(discounted_products)} производа има попуст преко 20%",
                    product_ids=[p.product_id for p in discounted_products[:10]],
                    retailers=list(set(p.retailer for p in discounted_products)),
                    categories=list(set(p.category for p in discounted_products)),
                    confidence=0.9,
                    created_at=datetime.now().isoformat(),
                    valid_until=(datetime.now() + timedelta(days=7)).isoformat(),
                )
            )

        # Category price changes
        categories = {}
        for product in products:
            if product.category_sr not in categories:
                categories[product.category_sr] = []
            categories[product.category_sr].append(product)

        for category_sr, cat_products in list(categories.items())[:5]:
            if len(cat_products) > 10:
                avg_price = sum(p.price for p in cat_products) / len(cat_products)
                category_info = self.category_mappings.get(category_sr, {"en": "Other"})

                insights.append(
                    PriceInsight(
                        id=str(uuid.uuid4()),
                        type="category_trend",
                        title=f"{category_info['en']} Price Trend",
                        title_sr=f"Тренд цена {category_sr}",
                        description=f"Average price for {category_info['en']} is {avg_price:.2f} RSD",
                        description_sr=f"Просечна цена за {category_sr} је {avg_price:.2f} РСД",
                        product_ids=[p.product_id for p in cat_products[:5]],
                        retailers=list(set(p.retailer for p in cat_products)),
                        categories=[category_info["en"]],
                        confidence=0.8,
                        created_at=datetime.now().isoformat(),
                    )
                )

        return insights

    def save_sample_data(self, data: Any, filename: str, data_type: str = "samples"):
        """Save sample data to JSON file.

        Args:
            data: Data to save
            filename: Output filename
            data_type: Type of data for directory structure
        """
        output_dir = Path(settings.get_output_paths()["samples"]) / data_type
        output_dir.mkdir(parents=True, exist_ok=True)

        output_file = output_dir / filename

        # Convert to JSON-serializable format
        if hasattr(data, "dict"):
            json_data = data.dict()
        elif isinstance(data, list):
            json_data = [item.dict() if hasattr(item, "dict") else item for item in data]
        else:
            json_data = data

        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)

        logger.info(f"Saved sample data to {output_file}")

    def generate_all_sample_data(self, product_count: int = 1000):
        """Generate all types of sample data.

        Args:
            product_count: Number of products to generate
        """
        logger.info(f"Generating {product_count} sample products")

        # Generate products
        products = self.generate_sample_products(product_count)
        self.save_sample_data(products, "sample_products.json", "products")

        # Generate trends
        trends = self.generate_sample_trends(products)
        self.save_sample_data(trends, "sample_trends.json", "trends")

        # Generate discounts
        discounts = self.generate_sample_discounts(products)
        self.save_sample_data(discounts, "sample_discounts.json", "discounts")

        # Generate category analytics
        category_analytics = self.generate_category_analytics(products)
        self.save_sample_data(category_analytics, "category_analytics.json", "analytics")

        # Generate retailer analytics
        retailer_analytics = self.generate_retailer_analytics(products)
        self.save_sample_data(retailer_analytics, "retailer_analytics.json", "analytics")

        # Generate insights
        insights = self.generate_sample_insights(products)
        self.save_sample_data(insights, "sample_insights.json", "insights")

        # Generate pipeline stats
        stats = PipelineStats(
            total_records_processed=product_count,
            total_retailers=len(set(p.retailer for p in products)),
            total_categories=len(set(p.category for p in products)),
            total_products=len(set(p.product_id for p in products)),
            total_discounts=len(discounts),
            processing_time_seconds=0.0,
            records_with_errors=0,
            records_with_discounts=len(discounts),
            avg_discount_percentage=sum(d.discount_percentage for d in discounts) / len(discounts) if discounts else 0,
            price_range={"min": min(p.price for p in products), "max": max(p.price for p in products)},
            last_updated=datetime.now().isoformat(),
        )
        self.save_sample_data(stats, "pipeline_stats.json", "stats")

        logger.info("Sample data generation completed")

        return {
            "products": products,
            "trends": trends,
            "discounts": discounts,
            "category_analytics": category_analytics,
            "retailer_analytics": retailer_analytics,
            "insights": insights,
            "stats": stats,
        }


# Export the main class
__all__ = ["SampleDataGenerator"]
