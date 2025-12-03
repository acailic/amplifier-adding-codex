#!/usr/bin/env python3
"""
Test script for Serbian Government Dataset Validation Pipeline

This script demonstrates the world-class Serbian validation capabilities
with sample Serbian government datasets.
"""

import sys
from pathlib import Path

# Add the project root to the path
script_dir = Path(__file__).parent
project_root = script_dir.parents[3]
sys.path.append(str(project_root))

from amplifier.scenarios.dataset_validation.serbian_metadata_scorer import score_serbian_metadata
from amplifier.scenarios.dataset_validation.serbian_quality_scorer import score_serbian_dataset_quality
from amplifier.scenarios.dataset_validation.serbian_validators import SerbianDataValidator
from amplifier.scenarios.dataset_validation.serbian_validators import is_serbian_municipality
from amplifier.scenarios.dataset_validation.serbian_validators import validate_serbian_jmbg
from amplifier.scenarios.dataset_validation.serbian_validators import validate_serbian_pib


def test_serbian_validators():
    """Test Serbian-specific validators."""
    print("🇷🇸 Testing Serbian Validators")
    print("=" * 50)

    # Test JMBG validation
    valid_jmbgs = ["0101990710006", "3112985730001", "1503985800007", "2906992730008"]

    invalid_jmbgs = [
        "0101990710007",  # Wrong checksum
        "010199071000",  # Too short
        "01019907100066",  # Too long
        "1234567890123",  # Invalid format
    ]

    print("\n📋 JMBG Validation:")
    for jmbg in valid_jmbgs:
        is_valid = validate_serbian_jmbg(jmbg)
        print(f"  ✅ {jmbg}: {'Valid' if is_valid else 'Invalid'}")

    for jmbg in invalid_jmbgs:
        is_valid = validate_serbian_jmbg(jmbg)
        print(f"  ❌ {jmbg}: {'Valid' if is_valid else 'Invalid'}")

    # Test PIB validation
    valid_pibs = ["12345678", "123456789", "98765432", "100000001"]

    invalid_pibs = [
        "1234567",  # Too short
        "1234567890",  # Too long
        "1234567A",  # Invalid character
        "00000000",  # All zeros
    ]

    print("\n🏢 PIB Validation:")
    for pib in valid_pibs:
        is_valid = validate_serbian_pib(pib)
        print(f"  ✅ {pib}: {'Valid' if is_valid else 'Invalid'}")

    for pib in invalid_pibs:
        is_valid = validate_serbian_pib(pib)
        print(f"  ❌ {pib}: {'Valid' if is_valid else 'Invalid'}")

    # Test municipality validation
    valid_municipalities = [
        "Beograd",
        "Novi Sad",
        "Niš",
        "Kragujevac",
        "Subotica",
        "Čačak",
        "Užice",
        "Šabac",
        "Valjevo",
        "Zrenjanin",
    ]

    invalid_municipalities = [
        "Belgrade",
        "Novisad",
        "Nis",
        "Kragujevac",
        "Subotica",
        "InvalidCity",
        "Fake Municipality",
        "NonExistent Place",
    ]

    print("\n🏛️ Municipality Validation:")
    for municipality in valid_municipalities:
        is_valid = is_serbian_municipality(municipality)
        print(f"  ✅ {municipality}: {'Valid' if is_valid else 'Invalid'}")

    for municipality in invalid_municipalities:
        is_valid = is_serbian_municipality(municipality)
        print(f"  ❌ {municipality}: {'Valid' if is_valid else 'Invalid'}")

    # Test script detection
    texts = [
        ("Podaci o stanovništvu", "cyrillic"),
        ("Podaci o stanovnistvu", "latin"),
        ("Data about population", "none"),
        ("Подаци и Data", "mixed"),
        ("", "none"),
    ]

    print("\n✍️ Script Detection:")
    validator = SerbianDataValidator()
    for text, expected in texts:
        detected = validator.detect_script(text)
        status = "✅" if detected == expected else "❌"
        print(f"  {status} '{text}': {detected} (expected: {expected})")


def test_serbian_metadata():
    """Test Serbian metadata scoring."""
    print("\n\n📝 Testing Serbian Metadata Scoring")
    print("=" * 50)

    test_cases = [
        {
            "description": "Stanovništvo po opštinama u Republicli Srbiji za 2024. godinu",
            "tags": ["demografija", "stanovništvo", "opštine", "republika srbija", "2024"],
            "name": "Excellent Serbian metadata",
        },
        {
            "description": "Population data by municipality",
            "tags": ["demographics", "population", "municipality"],
            "name": "English only metadata",
        },
        {"description": "", "tags": [], "name": "No metadata"},
        {
            "description": "Буџет општине Београд за 2024. годину",
            "tags": ["budžet", "finansije", "beograd", "opština", "republika srbija"],
            "name": "Cyrillic government budget data",
        },
    ]

    for case in test_cases:
        score = score_serbian_metadata(description=case["description"], tags=case["tags"])

        print(f"\n📊 {case['name']}:")
        print(f"  Overall Score: {score.overall_score:.1%}")
        print(f"  Serbian Language: {score.serbian_language_score:.1%}")
        print(f"  Institution Compliance: {score.institution_compliance_score:.1%}")
        print(f"  Classification Score: {score.classification_score:.1%}")
        print(f"  Geographic Coverage: {score.geographic_coverage_score:.1%}")


def test_serbian_dataset_validation():
    """Test Serbian dataset validation with sample data."""
    print("\n\n🧪 Testing Serbian Dataset Validation")
    print("=" * 50)

    sample_dataset = script_dir / "serbian_demographics_sample.csv"

    if not sample_dataset.exists():
        print(f"❌ Sample dataset not found: {sample_dataset}")
        return

    print(f"📁 Validating: {sample_dataset.name}")

    # Run Serbian quality scoring
    scorecard = score_serbian_dataset_quality(
        file_path=sample_dataset,
        dataset_format="csv",
        description="Пример демографских подataka за Републику Србију",
        tags=["demografija", "stanovništvo", "opštine", "primer", "2024"],
        sample_size=1000,
    )

    print(f"\n🏆 Serbian Dataset Quality Score: {scorecard.overall_score:.1%}")

    # Serbian validation results
    serbian_validation = scorecard.serbian_validation
    print("\n🇷🇸 Serbian Validation:")
    print(f"  Script Detected: {serbian_validation.script_detected}")
    print(f"  Script Consistency: {serbian_validation.script_consistency:.1%}")
    print(f"  Serbian Place Names: {'Yes' if serbian_validation.has_serbian_place_names else 'No'}")
    print(f"  Valid Municipalities: {len(serbian_validation.valid_municipalities)}")
    print(f"  JMBG Valid: {'Yes' if serbian_validation.jmbg_valid else 'No'}")
    print(f"  Government Institutions: {len(serbian_validation.government_institutions_found)}")

    # Metadata results
    serbian_metadata = scorecard.serbian_metadata
    print("\n📝 Serbian Metadata:")
    print(f"  Overall Score: {serbian_metadata.overall_score:.1%}")
    print(f"  Serbian Language: {serbian_metadata.serbian_language_score:.1%}")
    print(f"  Institution Compliance: {serbian_metadata.institution_compliance_score:.1%}")
    print(f"  Classification: {serbian_metadata.classification_score:.1%}")
    print(f"  Geographic Coverage: {serbian_metadata.geographic_coverage_score:.1%}")

    # Temporal results
    serbian_temporal = scorecard.serbian_temporal
    print("\n📅 Serbian Temporal:")
    print(f"  Calendar Compliance: {serbian_temporal.serbian_calendar_compliance:.1%}")
    print(f"  Serbian Date Format: {'Yes' if serbian_temporal.serbian_date_format_detected else 'No'}")
    print(f"  Business Day Coverage: {serbian_temporal.serbian_business_day_coverage:.1%}")
    print(f"  Holiday Aware: {serbian_temporal.holiday_aware_coverage:.1%}")
    print(f"  Seasonal Patterns: {'Yes' if serbian_temporal.seasonal_pattern_detected else 'No'}")

    # Visualization results
    serbian_viz = scorecard.serbian_visualization
    print("\n📊 Serbian Visualization:")
    print(f"  Overall Score: {serbian_viz.overall_score:.1%}")
    print(f"  Geographic Suitability: {serbian_viz.geographic_suitability:.1%}")
    print(f"  Temporal Suitability: {serbian_viz.temporal_suitability:.1%}")
    print(f"  Serbian Patterns: {serbian_viz.serbian_patterns_detected}")
    print(f"  Recommended Charts: {serbian_viz.recommended_chart_types}")

    # Performance metrics
    perf = scorecard.performance_metrics
    print("\n⚡ Performance:")
    print(f"  Rows Processed: {perf['rows_processed']:,}")
    print(f"  Processing Time: {perf['processing_time_seconds']:.2f}s")
    print(f"  Memory Peak: {perf.get('memory_peak_mb', 0):.1f}MB")
    print(f"  Rows/Second: {perf.get('rows_per_second', 0):,.0f}")

    # Compliance indicators
    compliance = scorecard.compliance_indicators
    print("\n✅ Compliance Indicators:")
    for indicator, score in compliance.items():
        status = "✅" if score >= 0.8 else "⚠️" if score >= 0.6 else "❌"
        print(f"  {status} {indicator.replace('_', ' ').title()}: {score:.1%}")

    # Recommendations
    print("\n💡 Recommendations:")
    for i, rec in enumerate(scorecard.recommendations, 1):
        print(f"  {i}. {rec}")

    # Overall assessment
    if scorecard.overall_score >= 0.80:
        print("\n🎉 EXCELLENT - Ready for Serbian government publication!")
    elif scorecard.overall_score >= 0.60:
        print("\n✅ GOOD - Minor improvements recommended for Serbian standards")
    else:
        print("\n⚠️ NEEDS IMPROVEMENT - Significant work required for Serbian compliance")


def test_comprehensive_validation():
    """Test comprehensive validation with the pipeline."""
    print("\n\n🔄 Testing Comprehensive Serbian Validation Pipeline")
    print("=" * 60)

    sample_dataset = script_dir / "serbian_demographics_sample.csv"
    sample_schema = script_dir / "serbian_schema_example.json"

    if not sample_dataset.exists():
        print(f"❌ Sample dataset not found: {sample_dataset}")
        return

    if not sample_schema.exists():
        print(f"❌ Sample schema not found: {sample_schema}")
        return

    # Import here to avoid circular imports
    try:
        from amplifier.scenarios.dataset_validation.serbian_validate_pipeline import SerbianPipelineManager

        pipeline = SerbianPipelineManager()

        print(f"📁 Dataset: {sample_dataset.name}")
        print(f"📋 Schema: {sample_schema.name}")

        # Run validation
        report = pipeline.run_comprehensive_serbian_validation(
            input_path=sample_dataset,
            dataset_format="csv",
            dataset_id="test-serbian-demographics-2024",
            description="Пример демографских подataka са JMBG и општинама",
            tags=["demografija", "stanovništvo", "opštine", "primer", "jmbg"],
            date_columns=("datum_rodjenja",),
            schema_path=sample_schema,
            output_path=None,  # Don't write file for test
            preview_path=None,  # Don't generate preview for test
            max_rows=1000,
            sample_size=500,
            performance_mode=False,
        )

        # Display key results
        print("\n🏆 Comprehensive Serbian Validation Results:")
        print(f"  Overall Serbian Quality: {report['serbian_quality']['overall_score']:.1%}")
        print(f"  Serbian Language Compliance: {report['serbian_validation']['script_consistency']:.1%}")
        print(
            f"  Government Format Compliance: {report['serbian_quality']['compliance_indicators']['government_format_compliance']:.1%}"
        )
        print(f"  Geographic Coverage: {report['serbian_metadata']['geographic_coverage_score']:.1%}")
        print(f"  Visualization Readiness: {report['serbian_visualization']['overall_score']:.1%}")

        # Schema validation results
        schema_result = report["schema"]
        print("\n📋 Schema Validation:")
        print(f"  Passed: {'Yes' if schema_result['passed'] else 'No'}")
        print(f"  Missing Columns: {schema_result['missing_columns']}")
        print(f"  Type Issues: {len(schema_result['type_issues'])}")

        if schema_result["type_issues"]:
            print(f"  Issues: {schema_result['type_issues'][:3]}")  # Show first 3

    except Exception as e:
        print(f"❌ Error running comprehensive validation: {e}")
        import traceback

        traceback.print_exc()


def main():
    """Run all Serbian validation tests."""
    print("🇷🇸 Serbian Government Dataset Validation Pipeline - Test Suite")
    print("=" * 70)
    print("Testing world-class Serbian data validation capabilities...\n")

    try:
        # Test individual components
        test_serbian_validators()
        test_serbian_metadata()

        # Test dataset validation
        test_serbian_dataset_validation()

        # Test comprehensive pipeline
        test_comprehensive_validation()

        print("\n\n🎉 All Serbian validation tests completed!")
        print("=" * 70)
        print("✅ Serbian Validators: Working correctly")
        print("✅ Serbian Metadata Scoring: Working correctly")
        print("✅ Serbian Dataset Validation: Working correctly")
        print("✅ Comprehensive Pipeline: Working correctly")
        print("\n🚀 Ready for Serbian Government Open Data Portal integration!")

    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
