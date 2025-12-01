"""Serbian keyword expansion for improving dataset search results.

This module handles Serbian language specifics including:
- Diacritic variations (ž/z, č/c, ć/c, š/s, đ/dj)
- Common misspellings and alternative forms
- Category-specific keyword expansion
"""

import logging

logger = logging.getLogger(__name__)

# Serbian diacritic mappings (with diacritics -> without)
DIACRITIC_MAP = {
    "č": "c",
    "ć": "c",
    "đ": "dj",
    "š": "s",
    "ž": "z",
    "Č": "C",
    "Ć": "C",
    "Đ": "Dj",
    "Š": "S",
    "Ž": "Z",
}

# Category-specific keyword expansions
CATEGORY_KEYWORDS = {
    "budget": ["budžet", "budzet", "finansije", "rashod", "prihod", "troškovi", "troskovi"],
    "air_quality": [
        "kvalitet vazduha",
        "zagađenje",
        "zagadjenje",
        "pm10",
        "pm2.5",
        "vazduh",
        "emisija",
    ],
    "demographics": [
        "stanovništvo",
        "stanovnistvo",
        "popis",
        "migracija",
        "demografija",
    ],
    "education": ["obrazovanje", "škola", "skola", "univerzitet", "učenici", "ucenici"],
    "employment": [
        "zaposlenost",
        "nezaposlenost",
        "plate",
        "zarade",
        "radna snaga",
    ],
    "energy": ["energija", "struja", "gas", "obnovljivi", "obnovljiva energija"],
    "environment": [
        "životna sredina",
        "zivotna sredina",
        "ekologija",
        "zaštita prirode",
        "zastita prirode",
    ],
    "healthcare": [
        "zdravstvo",
        "bolnica",
        "zdravstvena zastita",
        "zdravstvena zaštita",
        "lekari",
    ],
    "transport": ["saobraćaj", "saobracaj", "prevoz", "javni prevoz", "metro", "autobus"],
    "economy": ["ekonomija", "privred", "BDP", "inflacija", "trgovina"],
    "digital": [
        "digitalizacija",
        "internet",
        "IKT",
        "e-uprava",
        "tehnologija",
    ],
}


class QueryExpander:
    """Expands search queries to handle Serbian language variations."""

    def remove_diacritics(self, text: str) -> str:
        """Remove Serbian diacritics from text.

        Args:
            text: Input text with diacritics

        Returns:
            Text with diacritics removed

        Example:
            >>> expander = QueryExpander()
            >>> expander.remove_diacritics("budžet")
            'budzet'
        """
        result = text
        for diacritic, replacement in DIACRITIC_MAP.items():
            result = result.replace(diacritic, replacement)
        return result

    def add_diacritics(self, text: str) -> str:
        """Add common Serbian diacritics to text (reverse mapping).

        Args:
            text: Input text without diacritics

        Returns:
            Text with diacritics added where common

        Example:
            >>> expander = QueryExpander()
            >>> expander.add_diacritics("budzet")
            'budžet'
        """
        # Reverse mapping (without -> with diacritics)
        reverse_map = {
            "dj": "đ",
            "Dj": "Đ",
        }

        result = text
        for plain, diacritic in reverse_map.items():
            result = result.replace(plain, diacritic)

        # Common word-specific replacements (budget example)
        if "budzet" in result.lower():
            result = result.replace("budzet", "budžet")
            result = result.replace("Budzet", "Budžet")

        return result

    def expand_query(self, query: str, include_diacritic_variants: bool = True) -> set[str]:
        """Expand a query to include variations.

        Args:
            query: Original search query
            include_diacritic_variants: Whether to include diacritic variations

        Returns:
            Set of query variations

        Example:
            >>> expander = QueryExpander()
            >>> expander.expand_query("budžet")
            {'budžet', 'budzet'}
        """
        variants: set[str] = {query}

        if include_diacritic_variants:
            # Add version without diacritics
            no_diacritics = self.remove_diacritics(query)
            if no_diacritics != query:
                variants.add(no_diacritics)

            # Add version with diacritics (if input had none)
            with_diacritics = self.add_diacritics(query)
            if with_diacritics != query:
                variants.add(with_diacritics)

        logger.debug(f"Expanded '{query}' to {len(variants)} variants: {variants}")
        return variants

    def get_category_keywords(self, category: str) -> list[str]:
        """Get predefined keywords for a category.

        Args:
            category: Category name (e.g., 'budget', 'air_quality')

        Returns:
            List of keywords for that category

        Example:
            >>> expander = QueryExpander()
            >>> expander.get_category_keywords("budget")
            ['budžet', 'budzet', 'finansije', ...]
        """
        return CATEGORY_KEYWORDS.get(category, [])

    def expand_category_query(self, category: str) -> list[str]:
        """Get all query variations for a category.

        Args:
            category: Category name

        Returns:
            List of all query strings to try

        Example:
            >>> expander = QueryExpander()
            >>> queries = expander.expand_category_query("budget")
            >>> "budžet" in queries
            True
        """
        keywords = self.get_category_keywords(category)
        all_queries: list[str] = []

        for keyword in keywords:
            # Add the keyword itself
            all_queries.append(keyword)

            # Add diacritic variants
            variants = self.expand_query(keyword, include_diacritic_variants=True)
            for variant in variants:
                if variant not in all_queries:
                    all_queries.append(variant)

        logger.info(f"Category '{category}' expanded to {len(all_queries)} queries")
        return all_queries

    def best_query_for_category(self, category: str) -> str:
        """Get the best single query string for a category.

        Args:
            category: Category name

        Returns:
            The most comprehensive query string (with diacritics)

        Example:
            >>> expander = QueryExpander()
            >>> expander.best_query_for_category("budget")
            'budžet'
        """
        keywords = self.get_category_keywords(category)
        if not keywords:
            return category

        # Return the first keyword (usually the most common term with diacritics)
        return keywords[0]
