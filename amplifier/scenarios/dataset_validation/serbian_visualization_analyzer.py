from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

from .serbian_validators import SERBIAN_MUNICIPALITIES
from .serbian_validators import SerbianDataValidator

# Serbian chart type recommendations based on data patterns
SERBIAN_CHART_RECOMMENDATIONS = {
    "demographics": ["population_pyramid", "age_distribution", "migration_flow"],
    "economics": ["line_chart", "bar_chart", "gdp_comparison", "inflation_trend"],
    "regional": ["choropleth_map", "bubble_map", "regional_comparison"],
    "time_series": ["line_chart", "area_chart", "seasonal_decomposition"],
    "administrative": ["organizational_chart", "hierarchy_tree", "process_flow"],
    "geospatial": ["choropleth_map", "heat_map", "cluster_map"],
    "budget_finance": ["pie_chart", "budget_breakdown", "revenue_comparison"],
}

# Serbian data patterns and optimal visualizations
SERBIAN_DATA_PATTERNS = {
    "municipality_data": {
        "keywords": ["opština", "municipality", "grad"],
        "recommended_charts": ["choropleth_map", "bar_chart", "ranking"],
        "required_fields": ["municipality_name"],
        "ideal_numeric_fields": ["population", "area", "budget", "employment"],
    },
    "economic_indicators": {
        "keywords": ["gdp", "bdp", "inflacija", "nezaposlenost", "izvoz", "uvoz"],
        "recommended_charts": ["line_chart", "multi_line", "area_chart"],
        "required_fields": ["date", "value"],
        "ideal_numeric_fields": ["rate", "amount", "index", "percentage"],
    },
    "demographic_data": {
        "keywords": ["stanovništvo", "populacija", "godine", "starost", "pol"],
        "recommended_charts": ["population_pyramid", "age_groups", "gender_distribution"],
        "required_fields": ["age_group", "gender"],
        "ideal_numeric_fields": ["count", "percentage", "population"],
    },
    "budget_data": {
        "keywords": ["budžet", "prihodi", "rashodi", "finansije", "sredstva"],
        "recommended_charts": ["pie_chart", "stacked_bar", "waterfall"],
        "required_fields": ["category", "amount"],
        "ideal_numeric_fields": ["budget", "amount", "percentage"],
    },
    "regional_comparison": {
        "keywords": ["okrug", "region", "poređenje", "upoređivanje"],
        "recommended_charts": ["choropleth_map", "bubble_chart", "radar_chart"],
        "required_fields": ["region", "indicator"],
        "ideal_numeric_fields": ["value", "index", "rate"],
    },
}


@dataclass
class SerbianVisualizationAnalysis:
    """Results of Serbian data visualization compatibility analysis."""

    overall_score: float
    basic_viz_score: float  # From original visualization_tester
    serbian_patterns_detected: list[str]
    recommended_chart_types: list[str]
    data_completeness_for_visualization: float
    temporal_suitability: float
    geographic_suitability: float
    administrative_hierarchy_suitability: float
    serbian_chart_recommendations: dict[str, Any]
    field_mapping_suggestions: dict[str, str]
    visualization_readiness_details: dict[str, Any]


class SerbianVisualizationAnalyzer:
    """World-class visualization analyzer for Serbian government data."""

    def __init__(self):
        self.validator = SerbianDataValidator()

        # Serbian field name patterns
        self.date_field_patterns = [r"^datum", r"^date", r"^vreme", r"^time", r"godina", r"mesec", r"dan"]
        self.location_field_patterns = [
            r"^opština",
            r"^grad",
            r"^municipality",
            r"^lokacija",
            r"^mesto",
            r"^okrug",
            r"^region",
            r"^područje",
        ]
        self.value_field_patterns = [
            r"^vrednost",
            r"^iznos",
            r"^količina",
            r"^broj",
            r"^stanovništvo",
            r"^populacija",
            r"^procenat",
            r"^stopa",
            r"^indeks",
        ]

    def detect_serbian_data_patterns(self, records: list[dict[str, Any]]) -> list[str]:
        """Detect specific Serbian data patterns."""
        if not records:
            return []

        patterns_detected = []
        all_text = " ".join(
            str(value).lower()
            for record in records[:100]  # Sample for performance
            for value in record.values()
            if isinstance(value, str)
        )

        for pattern_name, pattern_info in SERBIAN_DATA_PATTERNS.items():
            keyword_matches = sum(1 for keyword in pattern_info["keywords"] if keyword.lower() in all_text)

            if keyword_matches >= 2:  # Require at least 2 keyword matches
                patterns_detected.append(pattern_name)

        return patterns_detected

    def analyze_field_mapping_suggestions(
        self, records: list[dict[str, Any]], numeric_fields: list[str], time_field: str | None
    ) -> dict[str, str]:
        """Suggest field mappings for Serbian visualization standards."""
        if not records:
            return {}

        field_names = list(records[0].keys())
        mappings = {}

        # Date/Time field mapping
        if not time_field:
            for field in field_names:
                field_lower = field.lower()
                if any(re.search(pattern, field_lower) for pattern in self.date_field_patterns):
                    mappings["suggested_time_field"] = field
                    break

        # Location field mapping
        for field in field_names:
            field_lower = field.lower()
            if any(re.search(pattern, field_lower) for pattern in self.location_field_patterns):
                # Check if this field contains Serbian municipalities
                sample_values = [record.get(field) for record in records[:20]]
                municipality_matches = sum(
                    1
                    for value in sample_values
                    if isinstance(value, str) and self.validator.validate_municipality(value)
                )

                if municipality_matches >= 2:
                    mappings["suggested_location_field"] = field
                    mappings["location_type"] = "municipality"
                elif any("beograd" in str(value).lower() for value in sample_values):
                    mappings["suggested_location_field"] = field
                    mappings["location_type"] = "city"
                else:
                    mappings["suggested_location_field"] = field
                    mappings["location_type"] = "general"
                break

        # Value/Measure field mapping
        for field in numeric_fields:
            field_lower = field.lower()
            if any(re.search(pattern, field_lower) for pattern in self.value_field_patterns):
                mappings["suggested_primary_measure"] = field
                break

        return mappings

    def calculate_temporal_suitability(
        self, records: list[dict[str, Any]], time_field: str | None, patterns_detected: list[str]
    ) -> float:
        """Calculate temporal suitability for Serbian time series visualization."""
        if not time_field:
            return 0.3  # Low suitability without time field

        score = 0.0

        # Check if time field exists and has good coverage
        time_values = [record.get(time_field) for record in records if record.get(time_field)]
        time_coverage = len(time_values) / len(records) if records else 0
        score += min(time_coverage * 0.6, 0.6)

        # Check for temporal patterns
        if any(pattern in patterns_detected for pattern in ["economic_indicators", "demographic_data"]):
            score += 0.3

        # Check for Serbian business calendar considerations
        if time_values:
            # Simple check for consistent time intervals
            try:
                # Extract years from time field
                years = set()
                for value in time_values[:100]:
                    if isinstance(value, str):
                        year_match = re.search(r"\b(19|20)\d{2}\b", value)
                        if year_match:
                            years.add(int(year_match.group()))

                if len(years) >= 1:
                    score += 0.1
            except Exception:
                pass

        return min(score, 1.0)

    def calculate_geographic_suitability(self, records: list[dict[str, Any]], field_mappings: dict[str, str]) -> float:
        """Calculate geographic suitability for Serbian geospatial visualization."""
        score = 0.0

        location_field = field_mappings.get("suggested_location_field")
        location_type = field_mappings.get("location_type")

        if location_field:
            score += 0.4  # Base score for having location field

            # Bonus points for specific Serbian geographic types
            if location_type == "municipality":
                score += 0.4
            elif location_type == "city":
                score += 0.3
            else:
                score += 0.2

            # Check geographic coverage
            location_values = [record.get(location_field) for record in records[:100]]
            unique_locations = len(set(str(v) for v in location_values if v))

            if unique_locations >= 10:
                score += 0.2
            elif unique_locations >= 5:
                score += 0.1

        else:
            # Check if we can infer geographic information from other fields
            all_text = " ".join(
                str(value).lower() for record in records[:50] for value in record.values() if isinstance(value, str)
            )

            # Check for Serbian place names
            place_name_count = sum(1 for municipality in SERBIAN_MUNICIPALITIES if municipality.lower() in all_text)

            if place_name_count >= 3:
                score += 0.2
            elif place_name_count >= 1:
                score += 0.1

        return min(score, 1.0)

    def calculate_administrative_hierarchy_suitability(
        self, records: list[dict[str, Any]], patterns_detected: list[str]
    ) -> float:
        """Calculate suitability for Serbian administrative hierarchy visualization."""
        score = 0.0

        # Check for administrative hierarchy indicators
        all_text = " ".join(
            str(value).lower() for record in records[:50] for value in record.values() if isinstance(value, str)
        )

        # Hierarchy keywords
        hierarchy_keywords = ["opština", "grad", "okrug", "region", "republika", "municipality", "district", "county"]
        hierarchy_matches = sum(1 for keyword in hierarchy_keywords if keyword in all_text)

        if hierarchy_matches >= 2:
            score += 0.3
        elif hierarchy_matches >= 1:
            score += 0.1

        # Check for administrative data patterns
        admin_patterns = ["budget_data", "administrative_hierarchy"]
        admin_pattern_matches = sum(1 for pattern in admin_patterns if pattern in patterns_detected)

        if admin_pattern_matches >= 1:
            score += 0.4

        # Check for hierarchical relationships in data structure
        if records:
            sample_record = records[0]
            hierarchical_fields = [
                "parent",
                "child",
                "level",
                "hierarchy",
                "tip",
                "vrsta",
                "kategorija",
                "nivo",
                "struktura",
            ]
            hierarchy_field_count = sum(
                1 for field in hierarchical_fields if any(field in key.lower() for key in sample_record.keys())
            )

            if hierarchy_field_count >= 1:
                score += 0.3

        return min(score, 1.0)

    def calculate_data_completeness_for_visualization(
        self,
        records: list[dict[str, Any]],
        numeric_fields: list[str],
        time_field: str | None,
        field_mappings: dict[str, str],
    ) -> float:
        """Calculate completeness specifically for visualization purposes."""
        if not records:
            return 0.0

        score = 0.0

        # Numeric fields completeness
        if numeric_fields:
            numeric_completeness = sum(
                1 for record in records if any(record.get(field) is not None for field in numeric_fields)
            ) / len(records)
            score += numeric_completeness * 0.3

        # Time field completeness
        if time_field:
            time_completeness = sum(1 for record in records if record.get(time_field) is not None) / len(records)
            score += time_completeness * 0.2

        # Location field completeness
        location_field = field_mappings.get("suggested_location_field")
        if location_field:
            location_completeness = sum(1 for record in records if record.get(location_field) is not None) / len(
                records
            )
            score += location_completeness * 0.2

        # Data density (overall record completeness)
        total_fields = len(records[0]) if records else 1
        total_values = sum(sum(1 for value in record.values() if value is not None) for record in records)
        expected_values = len(records) * total_fields
        density = total_values / expected_values if expected_values > 0 else 0

        score += density * 0.3

        return min(score, 1.0)

    def generate_serbian_chart_recommendations(
        self,
        patterns_detected: list[str],
        field_mappings: dict[str, str],
        temporal_suitability: float,
        geographic_suitability: float,
        administrative_suitability: float,
    ) -> dict[str, Any]:
        """Generate Serbian-specific chart recommendations."""
        recommendations = []

        # Base recommendations from detected patterns
        for pattern in patterns_detected:
            pattern_info = SERBIAN_DATA_PATTERNS.get(pattern, {})
            recommendations.extend(pattern_info.get("recommended_charts", []))

        # Add recommendations based on field analysis
        if field_mappings.get("suggested_location_field") and geographic_suitability > 0.6:
            recommendations.append("choropleth_map")
            recommendations.append("regional_comparison")

        if temporal_suitability > 0.6:
            recommendations.append("time_series")
            recommendations.append("trend_analysis")

        if administrative_suitability > 0.6:
            recommendations.append("hierarchical_view")
            recommendations.append("organizational_chart")

        # Serbian-specific recommendations
        serbian_specific = []

        if geographic_suitability > 0.7:
            serbian_specific.extend(["serbia_municipalities_map", "okrug_comparison", "regional_ranking"])

        if administrative_suitability > 0.5:
            serbian_specific.extend(
                ["administrative_hierarchy", "municipal_government_structure", "budget_allocation_treemap"]
            )

        # Remove duplicates and prioritize
        unique_recommendations = list(dict.fromkeys(recommendations))
        unique_serbian = list(dict.fromkeys(serbian_specific))

        return {
            "recommended_charts": unique_recommendations[:8],  # Top 8 recommendations
            "serbian_specific_charts": unique_serbian[:5],  # Top 5 Serbian-specific
            "confidence_scores": {
                "geographic_viz": round(geographic_suitability, 3),
                "temporal_viz": round(temporal_suitability, 3),
                "administrative_viz": round(administrative_suitability, 3),
            },
            "implementation_priority": self._prioritize_charts(
                unique_recommendations, geographic_suitability, temporal_suitability
            ),
        }

    def _prioritize_charts(
        self, chart_types: list[str], geographic_suitability: float, temporal_suitability: float
    ) -> list[str]:
        """Prioritize charts based on data characteristics."""
        priority_map = {
            "bar_chart": 1,
            "line_chart": temporal_suitability,
            "choropleth_map": geographic_suitability,
            "pie_chart": 0.7,
            "scatter_plot": 0.8,
            "time_series": temporal_suitability,
            "regional_comparison": geographic_suitability,
            "population_pyramid": 0.9,
        }

        scored_charts = []
        for chart in chart_types:
            score = priority_map.get(chart, 0.5)
            scored_charts.append((chart, score))

        # Sort by score and return chart names
        scored_charts.sort(key=lambda x: x[1], reverse=True)
        return [chart for chart, score in scored_charts]

    def analyze_serbian_visualization_compatibility(
        self,
        records: list[dict[str, Any]],
        numeric_fields: list[str],
        time_field: str | None,
        basic_viz_score: float = 0.0,
    ) -> SerbianVisualizationAnalysis:
        """Comprehensive Serbian visualization compatibility analysis."""
        if not records:
            return SerbianVisualizationAnalysis(
                overall_score=0.0,
                basic_viz_score=0.0,
                serbian_patterns_detected=[],
                recommended_chart_types=[],
                data_completeness_for_visualization=0.0,
                temporal_suitability=0.0,
                geographic_suitability=0.0,
                administrative_hierarchy_suitability=0.0,
                serbian_chart_recommendations={},
                field_mapping_suggestions={},
                visualization_readiness_details={},
            )

        # Detect Serbian data patterns
        serbian_patterns_detected = self.detect_serbian_data_patterns(records)

        # Analyze field mappings
        field_mapping_suggestions = self.analyze_field_mapping_suggestions(records, numeric_fields, time_field)

        # Calculate suitability scores
        temporal_suitability = self.calculate_temporal_suitability(records, time_field, serbian_patterns_detected)
        geographic_suitability = self.calculate_geographic_suitability(records, field_mapping_suggestions)
        administrative_suitability = self.calculate_administrative_hierarchy_suitability(
            records, serbian_patterns_detected
        )

        # Calculate data completeness for visualization
        data_completeness = self.calculate_data_completeness_for_visualization(
            records, numeric_fields, time_field, field_mapping_suggestions
        )

        # Generate chart recommendations
        serbian_chart_recommendations = self.generate_serbian_chart_recommendations(
            serbian_patterns_detected,
            field_mapping_suggestions,
            temporal_suitability,
            geographic_suitability,
            administrative_suitability,
        )

        # Calculate overall score
        weights = {
            "basic_viz": 0.2,
            "data_completeness": 0.25,
            "temporal_suitability": 0.2,
            "geographic_suitability": 0.2,
            "administrative_suitability": 0.15,
        }

        overall_score = (
            basic_viz_score * weights["basic_viz"]
            + data_completeness * weights["data_completeness"]
            + temporal_suitability * weights["temporal_suitability"]
            + geographic_suitability * weights["geographic_suitability"]
            + administrative_suitability * weights["administrative_suitability"]
        )

        return SerbianVisualizationAnalysis(
            overall_score=round(overall_score, 4),
            basic_viz_score=round(basic_viz_score, 4),
            serbian_patterns_detected=serbian_patterns_detected,
            recommended_chart_types=serbian_chart_recommendations["recommended_charts"],
            data_completeness_for_visualization=round(data_completeness, 4),
            temporal_suitability=round(temporal_suitability, 4),
            geographic_suitability=round(geographic_suitability, 4),
            administrative_hierarchy_suitability=round(administrative_suitability, 4),
            serbian_chart_recommendations=serbian_chart_recommendations,
            field_mapping_suggestions=field_mapping_suggestions,
            visualization_readiness_details={
                "record_count": len(records),
                "numeric_field_count": len(numeric_fields),
                "has_time_field": time_field is not None,
                "has_location_field": "suggested_location_field" in field_mapping_suggestions,
                "serbian_patterns_count": len(serbian_patterns_detected),
                "data_density": data_completeness,
            },
        )


# Utility function for integration
def analyze_serbian_visualization(
    records: list[dict[str, Any]], numeric_fields: list[str], time_field: str | None, basic_viz_score: float = 0.0
) -> SerbianVisualizationAnalysis:
    """Convenience function for Serbian visualization analysis."""
    analyzer = SerbianVisualizationAnalyzer()
    return analyzer.analyze_serbian_visualization_compatibility(records, numeric_fields, time_field, basic_viz_score)
