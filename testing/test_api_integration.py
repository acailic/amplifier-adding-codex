#!/usr/bin/env python3
"""Test API integration for dataset insights and discovery"""

import base64
import io
import json
from pathlib import Path

import pandas as pd
import requests

API_BASE_URL = "http://localhost:8000"
HEALTH_ENDPOINT = "/health"


def create_test_csv_base64():
    """Create a test CSV and encode it in base64"""
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
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    csv_content = csv_buffer.getvalue()

    # Encode to base64
    base64_content = base64.b64encode(csv_content.encode("utf-8")).decode("utf-8")
    return base64_content


def test_health_endpoint():
    """Test the health endpoint"""
    print("\n=== Testing Health Endpoint ===")
    try:
        response = requests.get(f"{API_BASE_URL}{HEALTH_ENDPOINT}")
        if response.status_code == 200:
            print("✅ Health endpoint is working")
            print(f"Response: {response.json()}")
            return True
        print(f"❌ Health endpoint failed: {response.status_code}")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Is the server running on port 8000?")
        return False
    except Exception as e:
        print(f"❌ Error testing health endpoint: {str(e)}")
        return False


def test_dataset_categories():
    """Test the dataset categories endpoint"""
    print("\n=== Testing Dataset Categories ===")
    try:
        response = requests.get(f"{API_BASE_URL}/api/v1/datasets/categories")
        if response.status_code == 200:
            categories = response.json()
            print("✅ Categories endpoint working")
            print(f"Found {len(categories)} categories")
            if categories:
                print("First few categories:", categories[:3])
            return True
        print(f"❌ Categories endpoint failed: {response.status_code}")
        print(f"Response: {response.text}")
        return False
    except Exception as e:
        print(f"❌ Error testing categories: {str(e)}")
        return False


def test_dataset_search():
    """Test the dataset search endpoint"""
    print("\n=== Testing Dataset Search ===")
    try:
        params = {"q": "test", "limit": 5, "offset": 0}
        response = requests.get(f"{API_BASE_URL}/api/v1/datasets/search", params=params)

        if response.status_code == 200:
            results = response.json()
            print("✅ Search endpoint working")
            print(f"Total found: {results.get('total', 0)}")
            print(f"Page size: {results.get('page_size', 0)}")
            return True
        print(f"❌ Search endpoint failed: {response.status_code}")
        print(f"Response: {response.text}")
        return False
    except Exception as e:
        print(f"❌ Error testing search: {str(e)}")
        return False


def test_insights_generation():
    """Test the insights generation endpoint"""
    print("\n=== Testing Insights Generation ===")
    try:
        # Create test data
        base64_content = create_test_csv_base64()

        payload = {"csv_data": base64_content, "filename": "test_data.csv", "language": "sr"}

        response = requests.post(
            f"{API_BASE_URL}/api/v1/datasets/insights", json=payload, headers={"Content-Type": "application/json"}
        )

        if response.status_code == 200:
            insights = response.json()
            print("✅ Insights generation working")
            print(f"Rows: {insights.get('total_rows', 'N/A')}")
            print(f"Columns: {insights.get('total_columns', 'N/A')}")

            # Check Serbian language support
            columns = insights.get("columns", [])
            if columns and "naziv" in columns[0]:
                print("✅ Serbian language support detected")

            return True, insights
        print(f"❌ Insights endpoint failed: {response.status_code}")
        print(f"Response: {response.text}")
        return False, None
    except Exception as e:
        print(f"❌ Error testing insights: {str(e)}")
        return False, None


def test_insights_with_large_file():
    """Test insights with a larger simulated file"""
    print("\n=== Testing Insights with Large File ===")
    try:
        # Create larger dataset
        data = {
            "ID": list(range(1, 101)),
            "Vrednost": [i * 10 + (i % 7) for i in range(100)],
            "Kategorija": ["A", "B", "C", "D"] * 25,
            "Status": ["Aktivan" if i % 2 == 0 else "Neaktivan" for i in range(100)],
        }

        df = pd.DataFrame(data)
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        csv_content = csv_buffer.getvalue()

        base64_content = base64.b64encode(csv_content.encode("utf-8")).decode("utf-8")

        payload = {"csv_data": base64_content, "filename": "large_test_data.csv", "language": "sr"}

        response = requests.post(
            f"{API_BASE_URL}/api/v1/datasets/insights", json=payload, headers={"Content-Type": "application/json"}
        )

        if response.status_code == 200:
            insights = response.json()
            print("✅ Large file insights working")
            print(f"Processed {insights.get('total_rows', 0)} rows")

            # Check for statistics
            stats = insights.get("statistike", {})
            if stats.get("numericke_kolone"):
                print("✅ Numeric statistics generated")
            if stats.get("korelacije"):
                print("✅ Correlations calculated")

            return True
        print(f"❌ Large file test failed: {response.status_code}")
        print(f"Response: {response.text}")
        return False
    except Exception as e:
        print(f"❌ Error with large file test: {str(e)}")
        return False


def test_error_handling():
    """Test error handling scenarios"""
    print("\n=== Testing Error Handling ===")

    # Test invalid CSV data
    print("\nTesting invalid CSV data...")
    try:
        payload = {"csv_data": "invalid_base64_content", "filename": "invalid.csv", "language": "sr"}

        response = requests.post(
            f"{API_BASE_URL}/api/v1/datasets/insights", json=payload, headers={"Content-Type": "application/json"}
        )

        if response.status_code >= 400:
            print("✅ Invalid CSV properly rejected")
        else:
            print("⚠️ Invalid CSV was accepted")
    except Exception as e:
        print(f"✅ Error handling working: {str(e)}")

    # Test missing required fields
    print("\nTesting missing fields...")
    try:
        payload = {
            "csv_data": create_test_csv_base64()
            # Missing filename and language
        }

        response = requests.post(
            f"{API_BASE_URL}/api/v1/datasets/insights", json=payload, headers={"Content-Type": "application/json"}
        )

        if response.status_code >= 400:
            print("✅ Missing fields properly rejected")
        else:
            print("⚠️ Missing fields were accepted")
    except Exception as e:
        print(f"✅ Error handling working: {str(e)}")


def main():
    """Run all tests"""
    print("Starting API Integration Tests")
    print("=" * 50)

    results = {}

    # Test basic connectivity
    results["health"] = test_health_endpoint()

    if not results["health"]:
        print("\n❌ API server is not responding. Please start the server first.")
        return

    # Test endpoints
    results["categories"] = test_dataset_categories()
    results["search"] = test_dataset_search()
    results["insights"], insights_data = test_insights_generation()
    results["large_file"] = test_insights_with_large_file()

    # Test error handling
    test_error_handling()

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

    if passed == total:
        print("\n🎉 All tests passed! The integration is working correctly.")
    else:
        print("\n⚠️ Some tests failed. Please check the errors above.")

    # Save sample insights for manual review
    if insights_data:
        output_file = Path("testing/sample_insights_output.json")
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(insights_data, f, ensure_ascii=False, indent=2)
        print(f"\n📄 Sample insights saved to: {output_file}")


if __name__ == "__main__":
    main()
