#!/usr/bin/env python3
"""Test edge cases and error scenarios for the dataset API"""

import base64

import requests

API_BASE_URL = "http://localhost:8000"


def test_edge_cases():
    """Test various edge cases"""
    print("Testing Edge Cases and Error Scenarios")
    print("=" * 50)

    test_results = []

    # Test 1: Empty CSV
    print("\n1. Testing empty CSV...")
    try:
        empty_csv = base64.b64encode(b"").decode("utf-8")
        payload = {"csv_data": empty_csv, "filename": "empty.csv", "language": "sr"}
        response = requests.post(f"{API_BASE_URL}/api/v1/datasets/insights", json=payload)
        if response.status_code == 400:
            print("✅ Empty CSV properly rejected")
            test_results.append(("Empty CSV", True))
        else:
            print(f"⚠️ Empty CSV accepted with status {response.status_code}")
            test_results.append(("Empty CSV", False))
    except Exception as e:
        print(f"✅ Empty CSV error handled: {str(e)}")
        test_results.append(("Empty CSV", True))

    # Test 2: CSV with only headers
    print("\n2. Testing CSV with only headers...")
    headers_csv = base64.b64encode(b"Kolona1,Kolona2,Kolona3").decode("utf-8")
    payload = {"csv_data": headers_csv, "filename": "headers.csv", "language": "sr"}
    response = requests.post(f"{API_BASE_URL}/api/v1/datasets/insights", json=payload)
    if response.status_code == 200:
        insights = response.json()
        if insights.get("total_rows", 0) == 0:
            print("✅ Headers-only CSV handled correctly")
            test_results.append(("Headers only", True))
        else:
            print(f"⚠️ Unexpected row count: {insights.get('total_rows')}")
            test_results.append(("Headers only", False))
    else:
        print(f"✅ Headers-only CSV rejected: {response.status_code}")
        test_results.append(("Headers only", True))

    # Test 3: Very large number in CSV
    print("\n3. Testing CSV with very large numbers...")
    large_num_csv = base64.b64encode(b"ID,Vrednost\n1,999999999999999999\n2,-999999999999999999").decode("utf-8")
    payload = {"csv_data": large_num_csv, "filename": "large_numbers.csv", "language": "sr"}
    response = requests.post(f"{API_BASE_URL}/api/v1/datasets/insights", json=payload)
    if response.status_code == 200:
        print("✅ Large numbers handled correctly")
        test_results.append(("Large numbers", True))
    else:
        print(f"⚠️ Large numbers caused error: {response.status_code}")
        test_results.append(("Large numbers", False))

    # Test 4: CSV with special characters
    print("\n4. Testing CSV with special characters...")
    special_csv = base64.b64encode('ID,Ime,Opis\n1,"Jovan","Čćžđš: @#$%^&*()"\n2,"Ana","🚀🌟✨"'.encode()).decode(
        "utf-8"
    )
    payload = {"csv_data": special_csv, "filename": "special.csv", "language": "sr"}
    response = requests.post(f"{API_BASE_URL}/api/v1/datasets/insights", json=payload)
    if response.status_code == 200:
        print("✅ Special characters handled correctly")
        test_results.append(("Special characters", True))
    else:
        print(f"⚠️ Special characters caused error: {response.status_code}")
        test_results.append(("Special characters", False))

    # Test 5: Invalid base64 data
    print("\n5. Testing invalid base64...")
    payload = {"csv_data": "This is not base64!!!", "filename": "invalid.txt", "language": "sr"}
    response = requests.post(f"{API_BASE_URL}/api/v1/datasets/insights", json=payload)
    if response.status_code >= 400:
        print("✅ Invalid base64 properly rejected")
        test_results.append(("Invalid base64", True))
    else:
        print("⚠️ Invalid base64 was accepted")
        test_results.append(("Invalid base64", False))

    # Test 6: Missing required fields
    print("\n6. Testing missing required fields...")
    # Missing csv_data
    payload = {"filename": "test.csv"}
    response = requests.post(f"{API_BASE_URL}/api/v1/datasets/insights", json=payload)
    if response.status_code >= 400:
        print("✅ Missing csv_data field rejected")
        test_results.append(("Missing csv_data", True))
    else:
        print("⚠️ Missing csv_data field accepted")
        test_results.append(("Missing csv_data", False))

    # Missing filename
    payload = {"csv_data": base64.b64encode(b"1,2,3").decode("utf-8")}
    response = requests.post(f"{API_BASE_URL}/api/v1/datasets/insights", json=payload)
    if response.status_code >= 400:
        print("✅ Missing filename field rejected")
        test_results.append(("Missing filename", True))
    else:
        print("⚠️ Missing filename field accepted")
        test_results.append(("Missing filename", False))

    # Test 7: Very long field values
    print("\n7. Testing very long field values...")
    long_text = "A" * 10000  # 10KB string
    long_csv = base64.b64encode(f"ID,Text\n1,{long_text}".encode()).decode("utf-8")
    payload = {"csv_data": long_csv, "filename": "long_text.csv", "language": "sr"}
    response = requests.post(f"{API_BASE_URL}/api/v1/datasets/insights", json=payload)
    if response.status_code == 200:
        print("✅ Long field values handled correctly")
        test_results.append(("Long values", True))
    else:
        print(f"⚠️ Long values caused error: {response.status_code}")
        test_results.append(("Long values", False))

    # Test 8: Search with special characters
    print("\n8. Testing search with special characters...")
    response = requests.get(f"{API_BASE_URL}/api/v1/datasets/search", params={"q": "čćžđš & symbols"})
    if response.status_code == 200:
        print("✅ Search with special characters works")
        test_results.append(("Search special chars", True))
    else:
        print(f"⚠️ Search with special characters failed: {response.status_code}")
        test_results.append(("Search special chars", False))

    # Test 9: Pagination edge cases
    print("\n9. Testing pagination edge cases...")
    # Very large limit
    response = requests.get(f"{API_BASE_URL}/api/v1/datasets/search", params={"limit": 999999})
    if response.status_code == 200:
        print("✅ Large limit handled gracefully")
        test_results.append(("Pagination large limit", True))
    else:
        print(f"⚠️ Large limit caused error: {response.status_code}")
        test_results.append(("Pagination large limit", False))

    # Zero limit
    response = requests.get(f"{API_BASE_URL}/api/v1/datasets/search", params={"limit": 0})
    if response.status_code == 200:
        print("✅ Zero limit handled")
        test_results.append(("Pagination zero limit", True))
    else:
        print(f"⚠️ Zero limit caused error: {response.status_code}")
        test_results.append(("Pagination zero limit", False))

    # Negative offset
    response = requests.get(f"{API_BASE_URL}/api/v1/datasets/search", params={"offset": -1})
    if response.status_code == 200:
        print("✅ Negative offset handled")
        test_results.append(("Pagination negative offset", True))
    else:
        print(f"✅ Negative offset properly rejected: {response.status_code}")
        test_results.append(("Pagination negative offset", True))

    # Test 10: Invalid dataset ID
    print("\n10. Testing invalid dataset ID...")
    response = requests.get(f"{API_BASE_URL}/api/v1/datasets/999999")
    if response.status_code == 404:
        print("✅ Invalid dataset ID returns 404")
        test_results.append(("Invalid dataset ID", True))
    else:
        print(f"⚠️ Unexpected response for invalid ID: {response.status_code}")
        test_results.append(("Invalid dataset ID", False))

    # Test 11: Different language codes
    print("\n11. Testing different language codes...")
    simple_csv = base64.b64encode(b"ID,Value\n1,100").decode("utf-8")
    for lang in ["en", "de", "fr", "invalid_lang"]:
        payload = {"csv_data": simple_csv, "filename": "test.csv", "language": lang}
        response = requests.post(f"{API_BASE_URL}/api/v1/datasets/insights", json=payload)
        if response.status_code == 200:
            print(f"✅ Language '{lang}' accepted")
            test_results.append((f"Language {lang}", True))
        else:
            print(f"⚠️ Language '{lang}' rejected: {response.status_code}")
            test_results.append((f"Language {lang}", False))

    # Summary
    print("\n" + "=" * 50)
    print("EDGE CASE TEST SUMMARY")
    print("=" * 50)

    passed = sum(1 for _, result in test_results if result)
    total = len(test_results)

    for test, result in test_results:
        status = "✅ PASS" if result else "⚠️ ISSUE"
        print(f"{test:30} {status}")

    print(f"\nTotal: {passed}/{total} edge cases handled correctly")

    # Performance test
    print("\n12. Performance test with medium dataset...")
    import io
    import time

    import pandas as pd

    # Create medium dataset (1000 rows)
    medium_df = pd.DataFrame(
        {
            "ID": range(1000),
            "Category": ["A", "B", "C", "D", "E"] * 200,
            "Value": [i * 10 + (i % 7) for i in range(1000)],
            "Flag": [i % 2 == 0 for i in range(1000)],
        }
    )

    csv_buffer = io.StringIO()
    medium_df.to_csv(csv_buffer, index=False)
    medium_csv = base64.b64encode(csv_buffer.getvalue().encode("utf-8")).decode("utf-8")

    payload = {"csv_data": medium_csv, "filename": "medium.csv", "language": "sr"}

    start_time = time.time()
    response = requests.post(f"{API_BASE_URL}/api/v1/datasets/insights", json=payload)
    end_time = time.time()

    if response.status_code == 200:
        duration = end_time - start_time
        print(f"✅ Medium dataset (1000 rows) processed in {duration:.2f} seconds")
        test_results.append(("Performance", True))
    else:
        print(f"⚠️ Medium dataset processing failed: {response.status_code}")
        test_results.append(("Performance", False))

    return test_results


def main():
    """Run all edge case tests"""
    print("Dataset API Edge Case Testing")
    print("Make sure the API server is running on http://localhost:8000")
    print()

    # First check if API is running
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code != 200:
            print("❌ API server not responding correctly!")
            return
    except:
        print("❌ Cannot connect to API server!")
        print("Please start the server with: python testing/dataset_api_server.py")
        return

    # Run edge case tests
    results = test_edge_cases()

    # Final summary
    passed = sum(1 for _, result in results if result)
    total = len(results)
    percentage = (passed / total) * 100

    print("\n" + "=" * 50)
    print("FINAL SUMMARY")
    print("=" * 50)
    print(f"Edge cases handled: {passed}/{total} ({percentage:.1f}%)")

    if percentage >= 90:
        print("🎉 Excellent! The API handles most edge cases correctly.")
    elif percentage >= 75:
        print("✅ Good! The API handles most edge cases, but some improvements are needed.")
    else:
        print("⚠️ The API needs improvements to handle edge cases properly.")


if __name__ == "__main__":
    main()
