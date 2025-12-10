#!/usr/bin/env python3
"""Test script for dataset insights generation"""

import json
import os
import sys
from pathlib import Path

import pandas as pd

# Add amplifier directory to path
sys.path.append(str(Path(__file__).parent.parent / "amplifier" / "scenarios" / "dataset_insights"))

# Import the function from the module
import dataset_insights as di

generate_dataset_insights = di.generate_dataset_insights


def create_sample_csv():
    """Create a sample CSV file for testing"""
    data = {
        "ID": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        "Ime": ["Ana", "Marko", "Petar", "Jelena", "Marija", "Ivan", "Sofija", "Nikola", "Milica", "Stefan"],
        "Godine": [25, 30, 35, None, 28, 45, 22, 38, 29, 31],
        "Grad": [
            "Beograd",
            "Novi Sad",
            "Niš",
            "Beograd",
            "Kragujevac",
            "Novi Sad",
            "Beograd",
            "Niš",
            "Subotica",
            "Beograd",
        ],
        "Plata": [80000, 95000, 120000, 75000, 85000, 150000, 65000, 110000, 88000, 92000],
        "Departman": [
            "IT",
            "Marketing",
            "Finansije",
            "IT",
            "Prodaja",
            "Menadžment",
            "IT",
            "Finansije",
            "Marketing",
            "IT",
        ],
    }

    df = pd.DataFrame(data)
    csv_path = "/tmp/sample_data.csv"
    df.to_csv(csv_path, index=False)
    return csv_path


def test_dataset_insights():
    """Test the dataset insights generation"""
    print("Creating sample CSV...")
    csv_path = create_sample_csv()

    print(f"Testing insights generation for: {csv_path}")
    try:
        insights = generate_dataset_insights(csv_path, language="sr")

        print("\n✅ Insights generated successfully!")
        print("\n=== INSIGHTS SUMMARY ===")
        print(f"Total rows: {insights.get('total_rows')}")
        print(f"Total columns: {insights.get('total_columns')}")
        print(f"Memory usage: {insights.get('memory_usage_mb', 'N/A')} MB")

        print("\n=== COLUMN DETAILS ===")
        for col in insights.get("columns", [])[:3]:  # Show first 3 columns
            print(f"\nColumn: {col.get('naziv', 'N/A')}")
            print(f"  Type: {col.get('tip', 'N/A')}")
            print(f"  Non-null: {col.get('broj_vrednosti')}")
            print(f"  Unique: {col.get('jedinstvene_vrednosti')}")
            if col.get("primeri_vrednosti"):
                print(f"  Examples: {col['primeri_vrednosti'][:3]}")

        print("\n=== STATISTICS SUMMARY ===")
        stats = insights.get("statistike", {})
        if stats:
            print(f"Numeric columns: {len(stats.get('numericke_kolone', []))}")
            print(f"Categorical columns: {len(stats.get('kategoricke_kolone', []))}")

            # Check correlations
            korelacije = stats.get("korelacije", {})
            if korelacije:
                print(f"\nTop correlations found: {len(korelacije)}")

        # Check for missing values
        nedostajuce = insights.get("nedostajuce_vrednosti", {})
        if nedostajuce:
            print(f"\nMissing values found in: {list(nedostajuce.keys())}")

        # Validate JSON structure
        json_str = json.dumps(insights, ensure_ascii=False, indent=2)
        print("\n✅ JSON serialization successful!")

        return True

    except Exception as e:
        print(f"\n❌ Error generating insights: {str(e)}")
        import traceback

        traceback.print_exc()
        return False

    finally:
        # Cleanup
        if os.path.exists(csv_path):
            os.remove(csv_path)
            print(f"\n🧹 Cleaned up {csv_path}")


if __name__ == "__main__":
    success = test_dataset_insights()
    sys.exit(0 if success else 1)
