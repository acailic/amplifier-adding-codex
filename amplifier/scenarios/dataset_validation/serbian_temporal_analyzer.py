from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime
from datetime import timedelta
from typing import Any

from .models import ColumnStats
from .temporal_analyzer import TemporalCoverageResult

# Serbian date patterns
SERBIAN_DATETIME_PATTERNS = (
    # ISO formats
    "%Y-%m-%d",
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%d %H:%M:%S",
    "%Y/%m/%d",
    # Serbian Latin patterns
    "%d.%m.%Y",
    "%d. %m. %Y",
    "%d.%m.%Y.",
    "%d. %m. %Y.",
    "%d/%m/%Y",
    "%d-%m-%Y",
    # Serbian Cyrillic patterns (less common but important)
    "%d.%м.%Г",  # Using Cyrillic letters for month and year
    "%d. %м. %Г",
    # Serbian specific formats
    "%d. %b %Y",  # 15. jan 2024
    "%d. %B %Y",  # 15. januar 2024
    "%d. %b. %Y",  # 15. jan. 2024
    "%d. %B. %Y",  # 15. januar. 2024
    # Alternative formats
    "%d %m %Y",
    "%d %m %Y",
    "%d%m%Y",
    "%d%m%Y",
    # Time variations
    "%d.%m.%Y %H:%M",
    "%d.%m.%Y %H:%M:%S",
    "%d.%m.%Y. %H:%M",
    "%d.%m.%Y. %H:%M:%S",
)

# Serbian holidays (affect business day calculations)
SERBIAN_HOLIDAYS = {
    # Fixed holidays (month-day format)
    "01-01": "Nova Godina",
    "01-02": "Nova Godina",
    "01-07": "Božić",
    "02-15": "Dan državnosti Srbije",
    "02-16": "Dan državnosti Srbije",
    "05-01": "Praznik rada",
    "05-02": "Praznik rada",
    "11-11": "Dan primirja",  # Also known as Dan pobede u Prvom svetskom ratu
}


# Variable holidays (need to be calculated)
def calculate_serbian_variable_holidays(year: int) -> dict[str, str]:
    """Calculate Serbian variable holidays for a given year."""
    holidays = {}

    # Orthodox Easter calculation (Julian calendar)
    # This is a simplified calculation
    a = year % 4
    b = year % 7
    c = year % 19
    d = (19 * c + 15) % 30
    e = (2 * a + 4 * b - d + 34) % 7
    month = (d + e + 114) // 31
    day = ((d + e + 114) % 31) + 1

    # Convert to Gregorian date (approximate)
    easter_julian = datetime(year, month, day)
    easter_gregorian = easter_julian + timedelta(days=13)

    # Easter Monday
    easter_monday = easter_gregorian + timedelta(days=1)

    holidays[easter_gregorian.strftime("%m-%d")] = "Vaskrs"
    holidays[easter_monday.strftime("%m-%d")] = "Vaskrsni ponedeljak"

    return holidays


# Serbian business calendar
SERBIAN_BUSINESS_HOURS = {
    "standard": {"start": "09:00", "end": "17:00"},
    "summer": {"start": "08:00", "end": "16:00"},  # Approximate summer hours
    "government": {"start": "08:00", "end": "16:00"},
}


@dataclass
class SerbianTemporalResult:
    """Enhanced temporal analysis result with Serbian-specific insights."""

    base_result: TemporalCoverageResult
    serbian_date_format_detected: bool
    serbian_business_day_coverage: float
    holiday_aware_coverage: float
    seasonal_pattern_detected: bool
    serbian_calendar_compliance: float
    timezone_consistency: float
    data_collection_patterns: dict[str, Any]
    temporal_quality_indicators: dict[str, Any]


class SerbianTemporalAnalyzer:
    """World-class temporal analyzer for Serbian government datasets."""

    def __init__(self):
        # Serbian month names in Latin and Cyrillic
        self.serbian_months_latin = {
            "januar",
            "februar",
            "mart",
            "april",
            "maj",
            "jun",
            "jul",
            "avgust",
            "septembar",
            "oktobar",
            "novembar",
            "decembar",
            "jan",
            "feb",
            "mar",
            "apr",
            "avg",
            "sep",
            "okt",
            "nov",
            "dec",
        }
        self.serbian_months_cyrillic = {
            "јануар",
            "фебруар",
            "март",
            "април",
            "мај",
            "јун",
            "јул",
            "август",
            "септембар",
            "октобар",
            "новембар",
            "децембар",
            "јан",
            "феб",
            "мар",
            "апр",
            "авг",
            "сеп",
            "окт",
            "нов",
            "дец",
        }

        # Serbian temporal keywords
        self.temporal_keywords = {
            "godina",
            "mesec",
            "dan",
            "sat",
            "minut",
            "kvartal",
            "polugodište",
            "godišnje",
            "mesečno",
            "nedeljno",
            "dnevno",
            "godine",
            "meseci",
            "dana",
        }

        # Business hours patterns
        self.business_hours_pattern = re.compile(r"^([0-9]{1,2}):([0-5][0-9])$")

    def parse_serbian_date(self, value: Any) -> datetime | None:
        """Parse date with Serbian format support."""
        if value is None:
            return None

        if isinstance(value, datetime):
            return value

        if isinstance(value, (int, float)):
            # Avoid treating numeric columns as dates
            return None

        if not isinstance(value, str):
            return None

        text = value.strip()
        if not text:
            return None

        # ISO-8601 first
        try:
            return datetime.fromisoformat(text)
        except ValueError:
            pass

        # Try Serbian-specific patterns
        for pattern in SERBIAN_DATETIME_PATTERNS:
            try:
                return datetime.strptime(text, pattern)
            except ValueError:
                continue

        # Try to handle Serbian month names
        text_lower = text.lower()
        for month_name in self.serbian_months_latin:
            if month_name in text_lower:
                # Replace Serbian month name with English for parsing
                english_month = self._serbian_to_english_month(month_name)
                modified_text = text_lower.replace(month_name, english_month)
                for pattern in SERBIAN_DATETIME_PATTERNS:
                    try:
                        return datetime.strptime(modified_text, pattern)
                    except ValueError:
                        continue

        # Try Cyrillic month names
        for month_name in self.serbian_months_cyrillic:
            if month_name in text_lower:
                english_month = self._serbian_to_english_month(month_name)
                modified_text = text_lower.replace(month_name, english_month)
                for pattern in SERBIAN_DATETIME_PATTERNS:
                    try:
                        return datetime.strptime(modified_text, pattern)
                    except ValueError:
                        continue

        return None

    def _serbian_to_english_month(self, serbian_month: str) -> str:
        """Convert Serbian month name to English."""
        month_mapping = {
            "januar": "january",
            "jan": "january",
            "februar": "february",
            "feb": "february",
            "mart": "march",
            "mar": "march",
            "april": "april",
            "apr": "april",
            "maj": "may",
            "jun": "june",
            "jul": "july",
            "avgust": "august",
            "avg": "august",
            "septembar": "september",
            "sep": "september",
            "oktobar": "october",
            "okt": "october",
            "novembar": "november",
            "nov": "november",
            "decembar": "december",
            "dec": "december",
            # Cyrillic
            "јануар": "january",
            "јан": "january",
            "фебруар": "february",
            "феб": "february",
            "март": "march",
            "мар": "march",
            "април": "april",
            "апр": "april",
            "мај": "may",
            "јун": "june",
            "јул": "july",
            "август": "august",
            "авг": "august",
            "септембар": "september",
            "сеп": "september",
            "октобар": "october",
            "окт": "october",
            "новембар": "november",
            "нов": "november",
            "децембар": "december",
            "дец": "december",
        }
        return month_mapping.get(serbian_month.lower(), serbian_month)

    def is_serbian_holiday(self, date: datetime) -> bool:
        """Check if a date is a Serbian holiday."""
        date_str = date.strftime("%m-%d")

        # Check fixed holidays
        if date_str in SERBIAN_HOLIDAYS:
            return True

        # Check variable holidays
        year_holidays = calculate_serbian_variable_holidays(date.year)
        return date_str in year_holidays

    def is_serbian_business_day(self, date: datetime) -> bool:
        """Check if a date is a Serbian business day."""
        # Weekends (Saturday = 5, Sunday = 6)
        if date.weekday() >= 5:
            return False

        # Holidays
        if self.is_serbian_holiday(date):
            return False

        return True

    def calculate_business_day_coverage(self, dates: list[datetime]) -> float:
        """Calculate coverage of Serbian business days."""
        if not dates:
            return 0.0

        date_range = max(dates) - min(dates)
        total_days = date_range.days + 1

        if total_days <= 0:
            return 0.0

        business_days = 0
        current_date = min(dates)

        while current_date <= max(dates):
            if self.is_serbian_business_day(current_date):
                business_days += 1
            current_date += timedelta(days=1)

        return business_days / total_days

    def calculate_holiday_aware_coverage(self, dates: list[datetime]) -> float:
        """Calculate temporal coverage considering Serbian holidays."""
        if not dates:
            return 0.0

        unique_dates = set(date.date() for date in dates)
        total_unique = len(unique_dates)

        if total_unique <= 1:
            return 1.0

        holiday_dates = 0
        weekend_dates = 0

        for date_obj in unique_dates:
            date = datetime.combine(date_obj, datetime.min.time())
            if self.is_serbian_holiday(date):
                holiday_dates += 1
            elif date.weekday() >= 5:  # Weekend
                weekend_dates += 1

        # Score higher if data collection avoids holidays/weekends when appropriate
        special_days_ratio = (holiday_dates + weekend_dates) / total_unique

        # For some datasets, weekend/holiday data is expected (e.g., emergency services)
        # So we don't penalize heavily, just note the pattern
        return 1.0 - (special_days_ratio * 0.2)  # Max 20% reduction

    def detect_seasonal_patterns(self, dates: list[datetime]) -> bool:
        """Detect seasonal patterns in the data."""
        if len(dates) < 12:  # Need at least one year of data
            return False

        # Group by month
        monthly_counts = {}
        for date in dates:
            month = date.month
            monthly_counts[month] = monthly_counts.get(month, 0) + 1

        # Check for significant variation
        if len(monthly_counts) < 2:
            return False

        counts = list(monthly_counts.values())
        mean_count = sum(counts) / len(counts)
        variance = sum((count - mean_count) ** 2 for count in counts) / len(counts)

        # If variance is high, there might be seasonal patterns
        return variance > (mean_count**2) * 0.5

    def calculate_timezone_consistency(self, dates: list[datetime]) -> float:
        """Calculate timezone consistency (Belgrade time zone)."""
        if not dates:
            return 0.0

        # Most Serbian data should be in CET/CEST timezone
        # For simplicity, we check time consistency
        hours = [date.hour for date in dates if isinstance(date, datetime)]
        if not hours:
            return 0.0

        # Check if times are consistent with business hours
        business_hour_count = sum(
            1
            for hour in hours
            if 8 <= hour <= 18  # Extended business hours range
        )

        return business_hour_count / len(hours)

    def analyze_data_collection_patterns(
        self, dates: list[datetime], values: list[Any] | None = None
    ) -> dict[str, Any]:
        """Analyze Serbian data collection patterns."""
        if not dates:
            return {}

        patterns = {}

        # Collection frequency
        if len(dates) > 1:
            dates_sorted = sorted(dates)
            intervals = [(dates_sorted[i + 1] - dates_sorted[i]).days for i in range(len(dates_sorted) - 1)]

            if intervals:
                avg_interval = sum(intervals) / len(intervals)
                patterns["average_interval_days"] = round(avg_interval, 1)

                if avg_interval <= 1.5:
                    patterns["collection_frequency"] = "daily"
                elif avg_interval <= 8:
                    patterns["collection_frequency"] = "weekly"
                elif avg_interval <= 32:
                    patterns["collection_frequency"] = "monthly"
                elif avg_interval <= 95:
                    patterns["collection_frequency"] = "quarterly"
                else:
                    patterns["collection_frequency"] = "yearly"

        # Time of day patterns
        hours = [date.hour for date in dates]
        if hours:
            hour_counts = {}
            for hour in hours:
                hour_counts[hour] = hour_counts.get(hour, 0) + 1

            most_common_hour = max(hour_counts, key=hour_counts.get)
            patterns["peak_collection_hour"] = most_common_hour

            # Check if data is collected during business hours
            business_hour_count = sum(1 for hour in hours if 8 <= hour <= 17)
            patterns["business_hour_percentage"] = round(business_hour_count / len(hours), 3)

        # Day of week patterns
        weekdays = [date.weekday() for date in dates]  # 0=Monday, 6=Sunday
        if weekdays:
            day_counts = {}
            for day in weekdays:
                day_counts[day] = day_counts.get(day, 0) + 1

            most_common_day = max(day_counts, key=day_counts.get)
            day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            patterns["peak_collection_day"] = day_names[most_common_day]

        return patterns

    def analyze_serbian_temporal_coverage(
        self, column_stats: dict[str, ColumnStats], row_count: int, sample_dates: list[datetime] | None = None
    ) -> SerbianTemporalResult:
        """Comprehensive Serbian temporal analysis."""
        from .temporal_analyzer import analyze_temporal_coverage

        # Get base temporal analysis
        base_result = analyze_temporal_coverage(column_stats, row_count)

        # Collect all dates for Serbian-specific analysis
        all_dates = []
        for stats in column_stats.values():
            if stats.date_values > 0 and stats.date_min and stats.date_max:
                # We don't have individual dates in ColumnStats, so we'll use sample_dates
                pass

        # Use sample dates if provided
        dates = sample_dates if sample_dates else []

        # Serbian-specific analysis
        serbian_date_format_detected = self._detect_serbian_date_patterns(column_stats)
        serbian_business_day_coverage = self.calculate_business_day_coverage(dates) if dates else 0.0
        holiday_aware_coverage = self.calculate_holiday_aware_coverage(dates) if dates else 0.0
        seasonal_pattern_detected = self.detect_seasonal_patterns(dates) if dates else False
        timezone_consistency = self.calculate_timezone_consistency(dates) if dates else 0.0

        # Serbian calendar compliance (combined score)
        serbian_calendar_compliance = (
            serbian_business_day_coverage * 0.4 + holiday_aware_coverage * 0.3 + timezone_consistency * 0.3
        )

        # Data collection patterns
        data_collection_patterns = self.analyze_data_collection_patterns(dates)

        # Temporal quality indicators
        temporal_quality_indicators = {
            "serbian_date_format": serbian_date_format_detected,
            "business_day_awareness": serbian_business_day_coverage,
            "holiday_consideration": holiday_aware_coverage,
            "seasonal_patterns": seasonal_pattern_detected,
            "timezone_consistency": timezone_consistency,
            "collection_regularity": data_collection_patterns.get("collection_frequency", "unknown"),
            "business_hour_collection": data_collection_patterns.get("business_hour_percentage", 0.0),
        }

        return SerbianTemporalResult(
            base_result=base_result,
            serbian_date_format_detected=serbian_date_format_detected,
            serbian_business_day_coverage=round(serbian_business_day_coverage, 4),
            holiday_aware_coverage=round(holiday_aware_coverage, 4),
            seasonal_pattern_detected=seasonal_pattern_detected,
            serbian_calendar_compliance=round(serbian_calendar_compliance, 4),
            timezone_consistency=round(timezone_consistency, 4),
            data_collection_patterns=data_collection_patterns,
            temporal_quality_indicators=temporal_quality_indicators,
        )

    def _detect_serbian_date_patterns(self, column_stats: dict[str, ColumnStats]) -> bool:
        """Detect if Serbian date patterns are present."""
        # This is a simplified detection based on column names
        serbian_date_keywords = ["datum", "vreme", "dan", "mesec", "godina"]

        for column_name in column_stats:
            column_lower = column_name.lower()
            if any(keyword in column_lower for keyword in serbian_date_keywords):
                return True

        return False


# Utility function for integration
def analyze_serbian_temporal_coverage(
    column_stats: dict[str, ColumnStats], row_count: int, sample_dates: list[datetime] | None = None
) -> SerbianTemporalResult:
    """Convenience function for Serbian temporal analysis."""
    analyzer = SerbianTemporalAnalyzer()
    return analyzer.analyze_serbian_temporal_coverage(column_stats, row_count, sample_dates)
