from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

from .serbian_validators import SERBIAN_GOVERNMENT_INSTITUTIONS
from .serbian_validators import SERBIAN_REGIONS
from .serbian_validators import SerbianDataValidator

# Serbian government data standards
SERBIAN_DATA_CLASSIFICATIONS = {
    "Javni podaci",
    "Ograničen pristup",
    "Poverljivi podaci",
    "Tajni podaci",
    "Vrlo poverljivi podaci",
}

SERBIAN_DATA_TYPES = {
    "Administrativni podaci",
    "Statistički podaci",
    "Geoprostorni podaci",
    "Regulatorni podaci",
    "Finansijski podaci",
    "Demografski podaci",
    "Ekonomski podaci",
    "Obrazovni podaci",
    "Zdravstveni podaci",
    "Poljoprivredni podaci",
    "Saobraćajni podaci",
    "Energetski podaci",
}

SERBIAN_UPDATE_FREQUENCIES = {
    "Dnevno",
    "Nedeljno",
    "Mesečno",
    "Kvartalno",
    "Polugodišnje",
    "Godišnje",
    "Neplanirano",
    "Po potrebi",
    "U realnom vremenu",
}

SERBIAN_LANGUAGES = {
    "Srpski (ćirilica)",
    "Srpski (latinica)",
    "Engleski",
    "Mađarski",
    "Slovački",
    "Rumunski",
    "Hrvatski",
    "Bosanski",
    "Albanski",
}


@dataclass
class SerbianMetadataScore:
    """Serbian-specific metadata scoring results."""

    overall_score: float
    basic_score: float  # From original metadata_scorer
    serbian_language_score: float
    institution_compliance_score: float
    classification_score: float
    geographic_coverage_score: float
    temporal_coverage_score: float
    data_quality_score: float
    standards_compliance_score: float
    details: dict[str, Any]


class SerbianMetadataScorer:
    """World-class metadata scorer for Serbian government datasets."""

    def __init__(self):
        self.validator = SerbianDataValidator()

        # Serbian text patterns
        self.cyrillic_pattern = re.compile(r"[А-Ша-шЂђЈјКкЉљЊњЋћЏџ]")
        self.serbian_institution_keywords = {
            "republika srbija",
            "republike srbije",
            "vlada srbije",
            "narodna skupština",
            "grad beograd",
            "ministarstvo",
        }

    def score_serbian_language_presence(self, description: str, tags: list[str]) -> float:
        """Score Serbian language presence in metadata."""
        score = 0.0
        text = f"{description} {' '.join(tags)}"

        if not text.strip():
            return 0.0

        # Check for Cyrillic script presence
        if self.cyrillic_pattern.search(text):
            score += 0.6

        # Check for Serbian-specific terms
        serbian_terms = ["podaci", "republika", "srbija", "beograd", "opština", "grad"]
        serbian_count = sum(1 for term in serbian_terms if term.lower() in text.lower())
        score += min(serbian_count * 0.1, 0.3)

        # Check for Serbian keywords
        serbian_keywords = ["podatak", "informacija", "baza", "registrovan", "službeni"]
        keyword_count = sum(1 for keyword in serbian_keywords if keyword.lower() in text.lower())
        score += min(keyword_count * 0.05, 0.1)

        return min(score, 1.0)

    def score_institution_compliance(self, description: str, tags: list[str]) -> float:
        """Score compliance with Serbian government institution standards."""
        score = 0.0
        text = f"{description} {' '.join(tags)}".lower()

        if not text.strip():
            return 0.0

        # Check for official government institutions
        for institution in SERBIAN_GOVERNMENT_INSTITUTIONS:
            if institution.lower() in text:
                score += 0.4
                break

        # Check for government keywords
        gov_matches = sum(1 for keyword in self.serbian_institution_keywords if keyword in text)
        score += min(gov_matches * 0.2, 0.4)

        # Check for institutional terms
        institutional_terms = ["uprava", "agencija", "zavod", "direktorat", "komisija", "odbor"]
        institutional_count = sum(1 for term in institutional_terms if term in text)
        score += min(institutional_count * 0.05, 0.2)

        return min(score, 1.0)

    def score_data_classification(self, tags: list[str], description: str) -> float:
        """Score presence of proper data classification."""
        score = 0.0
        text = f"{description} {' '.join(tags)}"

        # Check for official Serbian classifications
        for classification in SERBIAN_DATA_CLASSIFICATIONS:
            if classification.lower() in text.lower():
                score += 0.6
                break

        # Check for classification keywords
        classification_keywords = ["javni", "poverljiv", "tajni", "ograničen", "pristup"]
        keyword_count = sum(1 for keyword in classification_keywords if keyword.lower() in text.lower())
        score += min(keyword_count * 0.1, 0.4)

        return min(score, 1.0)

    def score_geographic_coverage(self, description: str, tags: list[str]) -> float:
        """Score geographic coverage metadata quality."""
        score = 0.0
        text = f"{description} {' '.join(tags)}"

        if not text.strip():
            return 0.0

        # Check for Serbian regions
        for region in SERBIAN_REGIONS:
            if region.lower() in text.lower():
                score += 0.3
                break

        # Check for major cities
        major_cities = ["beograd", "novi sad", "niš", "kragujevac", "subotica"]
        city_count = sum(1 for city in major_cities if city.lower() in text.lower())
        score += min(city_count * 0.1, 0.3)

        # Check for geographic terms
        geo_terms = ["opština", "grad", "okrug", "region", "teritorija", "područje", "celokupna teritorija"]
        geo_count = sum(1 for term in geo_terms if term.lower() in text.lower())
        score += min(geo_count * 0.05, 0.2)

        # Check for specific geographic indicators
        if any(indicator in text.lower() for indicator in ["srbija", "republika srbije", "rs"]):
            score += 0.2

        return min(score, 1.0)

    def score_temporal_coverage(self, description: str, tags: list[str]) -> float:
        """Score temporal coverage metadata quality."""
        score = 0.0
        text = f"{description} {' '.join(tags)}"

        if not text.strip():
            return 0.0

        # Check for Serbian update frequencies
        for frequency in SERBIAN_UPDATE_FREQUENCIES:
            if frequency.lower() in text.lower():
                score += 0.4
                break

        # Check for temporal indicators
        temporal_terms = ["period", "godina", "mesec", "dan", "kvartal", "sezona", "vremenski period"]
        temporal_count = sum(1 for term in temporal_terms if term.lower() in text.lower())
        score += min(temporal_count * 0.05, 0.3)

        # Check for specific years in Serbian context
        year_pattern = re.compile(r"\b(19|20)\d{2}\b")
        years = year_pattern.findall(text)
        if years:
            score += 0.2

        # Check for temporal coverage indicators
        coverage_indicators = ["od-do", "period od", "pokriva", "vremenski okvir", "pokrivenost"]
        coverage_count = sum(1 for indicator in coverage_indicators if indicator.lower() in text.lower())
        score += min(coverage_count * 0.05, 0.1)

        return min(score, 1.0)

    def score_data_quality_indicators(self, description: str, tags: list[str]) -> float:
        """Score data quality indicators presence."""
        score = 0.0
        text = f"{description} {' '.join(tags)}"

        if not text.strip():
            return 0.0

        # Check for data type specifications
        for data_type in SERBIAN_DATA_TYPES:
            if data_type.lower() in text.lower():
                score += 0.3
                break

        # Check for quality indicators
        quality_terms = ["kvalitet", "provera", "tačnost", "potpunost", "validnost", "izvor"]
        quality_count = sum(1 for term in quality_terms if term.lower() in text.lower())
        score += min(quality_count * 0.08, 0.4)

        # Check for methodology or source indicators
        methodology_terms = ["metodologija", "izvor", "sakupljanje", "obrada", "standard", "protocol"]
        methodology_count = sum(1 for term in methodology_terms if term.lower() in text.lower())
        score += min(methodology_count * 0.1, 0.3)

        return min(score, 1.0)

    def score_standards_compliance(self, description: str, tags: list[str]) -> float:
        """Score compliance with Serbian government data standards."""
        score = 0.0
        text = f"{description} {' '.join(tags)}"

        if not text.strip():
            return 0.0

        # Check for ISO standards
        iso_patterns = [r"\bISO\s*\d+", r"\bISO-\d+", r"\b\d{4}-\d{2}-\d{2}\b"]
        for pattern in iso_patterns:
            if re.search(pattern, text):
                score += 0.2
                break

        # Check for Serbian government standards
        serbian_standards = ["standard", "protokol", "propis", "zakon", "uredba", "pravilnik"]
        standards_count = sum(1 for standard in serbian_standards if standard.lower() in text.lower())
        score += min(standards_count * 0.1, 0.4)

        # Check for format and encoding standards
        format_terms = ["utf-8", "utf8", "csv", "json", "xml", "encoding", "kodiranje"]
        format_count = sum(1 for term in format_terms if term.lower() in text.lower())
        score += min(format_count * 0.05, 0.2)

        # Check for language specifications
        language_terms = ["jezik", "latinica", "ćirilica", "alphabet", "script"]
        language_count = sum(1 for term in language_terms if term.lower() in text.lower())
        score += min(language_count * 0.1, 0.2)

        return min(score, 1.0)

    def score_serbian_metadata(
        self, description: str | None, tags: list[str] | None, basic_score: float = 0.0
    ) -> SerbianMetadataScore:
        """Comprehensive Serbian metadata scoring."""
        desc = description or ""
        tag_list = tags or []

        # Calculate individual scores
        serbian_language_score = self.score_serbian_language_presence(desc, tag_list)
        institution_compliance_score = self.score_institution_compliance(desc, tag_list)
        classification_score = self.score_data_classification(tag_list, desc)
        geographic_coverage_score = self.score_geographic_coverage(desc, tag_list)
        temporal_coverage_score = self.score_temporal_coverage(desc, tag_list)
        data_quality_score = self.score_data_quality_indicators(desc, tag_list)
        standards_compliance_score = self.score_standards_compliance(desc, tag_list)

        # Weighted average for overall score
        weights = {
            "basic": 0.20,
            "serbian_language": 0.15,
            "institution_compliance": 0.20,
            "classification": 0.10,
            "geographic_coverage": 0.10,
            "temporal_coverage": 0.10,
            "data_quality": 0.10,
            "standards_compliance": 0.05,
        }

        overall_score = (
            basic_score * weights["basic"]
            + serbian_language_score * weights["serbian_language"]
            + institution_compliance_score * weights["institution_compliance"]
            + classification_score * weights["classification"]
            + geographic_coverage_score * weights["geographic_coverage"]
            + temporal_coverage_score * weights["temporal_coverage"]
            + data_quality_score * weights["data_quality"]
            + standards_compliance_score * weights["standards_compliance"]
        )

        return SerbianMetadataScore(
            overall_score=round(overall_score, 4),
            basic_score=round(basic_score, 4),
            serbian_language_score=round(serbian_language_score, 4),
            institution_compliance_score=round(institution_compliance_score, 4),
            classification_score=round(classification_score, 4),
            geographic_coverage_score=round(geographic_coverage_score, 4),
            temporal_coverage_score=round(temporal_coverage_score, 4),
            data_quality_score=round(data_quality_score, 4),
            standards_compliance_score=round(standards_compliance_score, 4),
            details={
                "description_length": len(desc),
                "tag_count": len(tag_list),
                "has_serbian_institutions": any(
                    inst.lower() in (desc + " ".join(tag_list)).lower() for inst in SERBIAN_GOVERNMENT_INSTITUTIONS
                ),
                "has_classification": any(
                    cls.lower() in (desc + " ".join(tag_list)).lower() for cls in SERBIAN_DATA_CLASSIFICATIONS
                ),
                "has_serbian_regions": any(
                    region.lower() in (desc + " ".join(tag_list)).lower() for region in SERBIAN_REGIONS
                ),
                "cyrillic_detected": bool(self.cyrillic_pattern.search(desc + " ".join(tag_list))),
            },
        )


# Utility function for integration
def score_serbian_metadata(
    description: str | None, tags: list[str] | None, basic_score: float = 0.0
) -> SerbianMetadataScore:
    """Convenience function for Serbian metadata scoring."""
    scorer = SerbianMetadataScorer()
    return scorer.score_serbian_metadata(description, tags, basic_score)
