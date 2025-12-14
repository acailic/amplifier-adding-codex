#!/usr/bin/env python3
"""Test dataset functionality directly without API"""

import json
import os
import sys
import tempfile
from pathlib import Path

import pandas as pd

# Add the scenario to path
sys.path.append(str(Path(__file__).parent.parent / "amplifier" / "scenarios" / "dataset_insights"))


def test_insights_functionality():
    """Test the insights generation functionality directly"""
    print("\n=== Testing Dataset Insights Functionality ===")

    try:
        # Import the module
        from generate_insights import generate_insights
        from generate_insights import load_table

        # Create test data
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
        print(f"✅ Created test dataframe with {len(df)} rows and {len(df.columns)} columns")

        # Test insights generation
        insights = generate_insights(df, locale="sr", max_insights=10)
        print(f"✅ Generated {len(insights)} insights")

        # Print some insights
        for i, insight in enumerate(insights[:3]):
            print(f"\nInsight {i + 1}:")
            print(f"  Type: {insight.get('type', 'N/A')}")
            print(f"  Title: {insight.get('title', 'N/A')}")
            print(f"  Description: {insight.get('description', 'N/A')}")

        return True, insights

    except ImportError as e:
        print(f"❌ Import error: {str(e)}")
        return False, None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback

        traceback.print_exc()
        return False, None


def test_with_csv_file():
    """Test insights generation with a CSV file"""
    print("\n=== Testing with CSV File ===")

    try:
        from generate_insights import generate_insights
        from generate_insights import load_table

        # Create temporary CSV file
        with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
            data = """ID,Ime,Godine,Grad,Plata,Departman
1,Ana,25,Beograd,80000,IT
2,Marko,30,Novi Sad,95000,Marketing
3,Petar,35,Niš,120000,Finansije
4,Jelena,,Beograd,75000,IT
5,Marija,28,Kragujevac,85000,Prodaja
6,Ivan,45,Novi Sad,150000,Menadžment
7,Sofija,22,Beograd,65000,IT
8,Nikola,38,Niš,110000,Finansije
9,Milica,29,Subotica,88000,Marketing
10,Stefan,31,Beograd,92000,IT"""
            f.write(data)
            csv_path = f.name

        try:
            # Load the CSV
            df = load_table(Path(csv_path))
            print(f"✅ Loaded CSV with {len(df)} rows")

            # Generate insights
            insights = generate_insights(df, locale="sr", max_insights=15)
            print(f"✅ Generated {len(insights)} insights from CSV")

            return True

        finally:
            # Clean up
            os.unlink(csv_path)

    except Exception as e:
        print(f"❌ Error testing CSV: {str(e)}")
        return False


def test_dataset_discovery():
    """Test dataset discovery functionality"""
    print("\n=== Testing Dataset Discovery ===")

    try:
        sys.path.append(str(Path(__file__).parent.parent / "amplifier" / "scenarios" / "dataset_discovery"))

        # Try to import discovery module
        import data_pipeline as dp

        # Test basic search functionality
        if hasattr(dp, "search_datasets"):
            results = dp.search_datasets(query="test", limit=5)
            print(f"✅ Search returned {len(results)} results")
        else:
            print("⚠️ Search function not found in data_pipeline")

        return True

    except ImportError as e:
        print(f"⚠️ Dataset discovery module not found: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Error testing discovery: {str(e)}")
        return False


def create_mock_dataset_insights():
    """Create a mock dataset insights function for testing"""
    print("\n=== Creating Mock Dataset Insights Function ===")

    def generate_dataset_insights(csv_path, language="sr"):
        """Mock function to generate dataset insights"""
        try:
            df = pd.read_csv(csv_path)

            # Basic info
            insights = {
                "total_rows": len(df),
                "total_columns": len(df.columns),
                "memory_usage_mb": df.memory_usage(deep=True).sum() / 1024 / 1024,
                "columns": [],
            }

            # Column analysis with Serbian language support
            for col in df.columns:
                col_info = {
                    "naziv": col if language == "sr" else col,
                    "tip": str(df[col].dtype),
                    "broj_vrednosti": df[col].count(),
                    "jedinstvene_vrednosti": df[col].nunique(),
                    "nedostajuce_vrednosti": df[col].isnull().sum(),
                }

                # Add examples for categorical columns
                if df[col].dtype == "object":
                    examples = df[col].dropna().unique()[:5].tolist()
                    col_info["primeri_vrednosti"] = examples

                insights["columns"].append(col_info)

            # Basic statistics
            insights["statistike"] = {
                "numericke_kolone": df.select_dtypes(include=["number"]).columns.tolist(),
                "kategoricke_kolone": df.select_dtypes(include=["object"]).columns.tolist(),
            }

            # Missing values
            missing = df.isnull().sum()
            if missing.any():
                insights["nedostajuce_vrednosti"] = missing[missing > 0].to_dict()

            return insights

        except Exception as e:
            return {"error": str(e)}

    # Test the mock function
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
        f.write("ID,Vrednost,Kategorija\n1,100,A\n2,200,B\n3,300,C\n")
        csv_path = f.name

    try:
        insights = generate_dataset_insights(csv_path, language="sr")
        print(f"✅ Mock function generated insights for {insights.get('total_rows')} rows")

        # Save the function for API use
        mock_path = Path(__file__).parent / "mock_dataset_insights.py"
        with open(mock_path, "w") as f:
            f.write(f"""import pandas as pd
from typing import Dict, Any

{generate_dataset_insights.__doc__}

{generate_dataset_insights.__code__.co_consts[1] if generate_dataset_insights.__code__.co_consts else ""}""")

        print(f"✅ Mock function saved to {mock_path}")
        return True

    finally:
        os.unlink(csv_path)


def main():
    """Run all tests"""
    print("Testing Dataset Functionality")
    print("=" * 50)

    results = {}

    # Test insights functionality
    results["insights"], insights_data = test_insights_functionality()
    results["csv_test"] = test_with_csv_file()
    results["discovery"] = test_dataset_discovery()

    # Create mock function for API testing
    results["mock_creation"] = create_mock_dataset_insights()

    # Summary
    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for test, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test:20} {status}")

    print(f"\nTotal: {passed}/{total} tests passed")

    if insights_data:
        # Save sample output
        output_file = Path("testing/insights_sample.json")
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(insights_data, f, ensure_ascii=False, indent=2)
        print(f"\n📄 Sample insights saved to: {output_file}")


if __name__ == "__main__":
    main()
