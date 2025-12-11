from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

# Serbian administrative divisions
SERBIAN_MUNICIPALITIES = {
    # Grad Beograd - Beogradski okrug
    "Beograd",
    "Novi Beograd",
    "Palilula",
    "Rakovica",
    "Savski Venac",
    "Stari Grad",
    "Voždovac",
    "Vračar",
    "Zemun",
    "Zvezdara",
    "Barajevo",
    "Grocka",
    "Lazarevac",
    "Mladenovac",
    "Obrenovac",
    "Sopot",
    "Surčin",
    # Severnobanatski okrug
    "Ada",
    "Kikinda",
    "Kovačica",
    "Novi Kneževac",
    "Nova Crnja",
    "Senta",
    "Kanjiža",
    "Čoka",
    "Plandište",
    "Alibunar",
    "Vršac",
    "Bela Crkva",
    "Sečanj",
    "Žitište",
    "Zrenjanin",
    # Srednjebanatski okrug
    "Novi Bečej",
    "Žabalj",
    "Srbobran",
    "Bačka Topola",
    "Mali Iđoš",
    "Kula",
    "Odžaci",
    "Bačka Palanka",
    "Sombor",
    "Apatin",
    # Južnobanatski okrug
    "Pančevo",
    "Bela Crnja",
    "Opovo",
    "Kovin",
    # Severnobački okrug
    "Subotica",
    # Srednjobanatski okrug
    "Temerin",
    "Bečej",
    # Južnobački okrug
    "Novi Sad",
    "Bački Petrovac",
    "Beočin",
    "Irig",
    "Sremski Karlovci",
    "Sremska Mitrovica",
    "Stara Pazova",
    "Šid",
    "Titel",
    "Vrbas",
    # Sremski okrug
    "Inđija",
    "Pećinci",
    "Ruma",
    # Mačvanski okrug
    "Šabac",
    "Bogatić",
    "Koceljeva",
    "Krupanj",
    "Ljubovija",
    "Loznica",
    "Mali Zvornik",
    "Vladimirci",
    # Kolubarski okrug
    "Valjevo",
    "Lajkovac",
    "Ljig",
    "Mionica",
    "Osečina",
    "Ub",
    # Podunavski okrug
    "Smederevo",
    "Smederevska Palanka",
    "Velika Plana",
    "Požarevac",
    "Žabari",
    "Žagubica",
    "Kostolac",
    "Petrovac na Mlavi",
    "Kučevo",
    "Veliko Gradište",
    "Golubac",
    "Dunđerski",
    # Braničevski okrug
    # Šumadijski okrug
    "Kragujevac",
    "Aranđelovac",
    "Batočina",
    "Knić",
    "Lapovo",
    "Rača",
    "Topola",
    # Rasinski okrug
    "Kruševac",
    "Aleksandrovac",
    "Brus",
    "Varvarin",
    "Ćićevac",
    "Trstenik",
    # Pomoravski okrug
    "Ćuprija",
    "Despotovac",
    "Jagodina",
    "Paraćin",
    "Rekovac",
    "Svilajnac",
    # Borski okrug
    "Bor",
    "Kladovo",
    "Majdanpek",
    "Negotin",
    # Zaječarski okrug
    "Zaječar",
    "Boljevac",
    "Knjaževac",
    "Sokobanja",
    # Zlatiborski okrug
    "Užice",
    "Arilje",
    "Bajina Bašta",
    "Kosjerić",
    "Nova Varoš",
    "Požega",
    "Priboj",
    "Prijepolje",
    "Sjenica",
    "Čajetina",
    # Moravički okrug
    "Čačak",
    "Gornji Milanovac",
    "Ivanjica",
    "Lučani",
    # Raški okrug
    "Kraljevo",
    "Vrnjačka Banja",
    "Novi Pazar",
    "Raška",
    "Tutin",
    # Nišavski okrug
    "Niš",
    "Aleksinac",
    "Svrljig",
    "Merošina",
    "Gadžin Han",
    "Doljevac",
    "Medveđa",
    "Bela Palanka",
    "Pirot",
    "Babušnica",
    # Toplički okrug
    "Prokuplje",
    "Blace",
    "Kuršumlija",
    "Žitorađa",
    # Pirotski okrug
    "Dimitrovgrad",
    # Jablanički okrug
    "Leskovac",
    "Bojnik",
    "Vlasotince",
    "Lebane",
    "Crna Trava",
    # Pčinjski okrug
    "Vranje",
    "Bujanovac",
    "Vladicin Han",
    "Surdulica",
    "Bosilegrad",
    "Trgovište",
    "Kosovska Kamenica",
    "Novi Brdo",
    "Ranilug",
    # Kosovo i Metohija (UNMIK administration)
    "Priština",
    "Kosovska Mitrovica",
    "Peć",
    "Đakovica",
    "Prizren",
    "Kosovsko Polje",
    "Uroševac",
    "Glogovac",
    "Lipljan",
    "Vučitrn",
    "Orahovac",
    "Novo Brdo",
    "Kačanik",
    "Štimlje",
    "Štrpce",
    "Dečani",
    "Zvečan",
    "Leposavić",
    "Zubin Potok",
    "Istok",
    "Srbica",
    "Vitina",
    "Klina",
    "Gnjilane",
}

SERBIAN_REGIONS = {"Vojvodina", "Šumadija i Zapadna Srbija", "Južna i Istočna Srbija", "Beograd", "Kosovo i Metohija"}

SERBIAN_GOVERNMENT_INSTITUTIONS = {
    "Narodna skupština Republike Srbije",
    "Vlada Republike Srbije",
    "Predsednik Republike Srbije",
    "Ustavni sud Republike Srbije",
    "Narodna banka Srbije",
    "Republički zavod za statistiku",
    "Ministarstvo finansija",
    "Ministarstvo unutrašnjih poslova",
    "Ministarstvo zdravlja",
    "Ministarstvo prosvete",
    "Ministarstvo privrede",
}


@dataclass
class SerbianValidationResult:
    """Results of Serbian-specific data validation."""

    script_detected: str | None  # 'cyrillic', 'latin', 'mixed'
    script_consistency: float
    has_serbian_place_names: bool
    valid_municipalities: set[str]
    invalid_municipalities: set[str]
    jmbg_valid: bool
    pib_valid: bool
    address_format_score: float
    government_institutions_found: set[str]
    serbian_language_detected: bool


class SerbianDataValidator:
    """World-class validator for Serbian government datasets."""

    def __init__(self):
        # Cyrillic and Latin character patterns
        self.cyrillic_pattern = re.compile(r"[А-Ша-шЂђЈјКкЉљЊњЋћЏџ]")
        self.latin_pattern = re.compile(r"[A-Za-z]")
        self.serbian_chars_cyrillic = re.compile(r"[А-Ша-шЂђЈјКкЉљЊњЋћЏџ]")
        self.serbian_chars_latin = re.compile(r"[ČĆŽŠĐčćžšđ]")

        # JMBG pattern (13 digits)
        self.jmbg_pattern = re.compile(r"^\d{13}$")

        # PIB pattern (8 or 9 digits)
        self.pib_pattern = re.compile(r"^\d{8,9}$")

        # Serbian address patterns
        self.address_patterns = [
            re.compile(r"^[A-ZČĆŽŠĐ][a-zčćžšđ]+(?:\s+[A-ZČĆŽŠĐ][a-zčćžšđ]+)*\s+\d+[A-Z]?$"),  # Ulica broj
            re.compile(r"^[A-ZČĆŽŠĐ][a-zčćžšđ]+(?:\s+[A-ZČĆŽŠĐ][a-zčćžšđ]+)*\s+bb\.?$"),  # BB
            re.compile(r"^[А-Ш][а-ш]+(?:\s+[А-Ш][а-ш]+)*\s+\d+[А-Ш]?$"),  # Cyrillic
        ]

        # Serbian government institution keywords
        self.gov_keywords = {
            "ministarstvo",
            "republika",
            "srbija",
            "zavod",
            "agencija",
            "uprava",
            "direktorat",
            "sekretarijat",
            "odbor",
            "komisija",
            "институција",
            "министарство",
            "република",
            "србија",
            "управа",
        }

    def detect_script(self, text: str) -> str:
        """Detect if text is Cyrillic, Latin, or mixed."""
        if not text or not isinstance(text, str):
            return "none"

        has_cyrillic = bool(self.cyrillic_pattern.search(text))
        has_latin = bool(self.latin_pattern.search(text))

        if has_cyrillic and has_latin:
            return "mixed"
        if has_cyrillic:
            return "cyrillic"
        if has_latin:
            return "latin"
        return "none"

    def validate_script_consistency(self, texts: list[str]) -> float:
        """Check script consistency across dataset (0.0-1.0)."""
        scripts = [self.detect_script(text) for text in texts if text and isinstance(text, str)]
        if not scripts:
            return 1.0

        # Filter out 'none' and 'mixed' for consistency check
        pure_scripts = [s for s in scripts if s in ["cyrillic", "latin"]]
        if not pure_scripts:
            return 0.5  # Mixed or no readable content

        # Calculate consistency (higher if mostly one script)
        cyrillic_count = pure_scripts.count("cyrillic")
        latin_count = pure_scripts.count("latin")
        total = len(pure_scripts)

        consistency = max(cyrillic_count, latin_count) / total
        return consistency

    def validate_jmbg(self, jmbg: str) -> bool:
        """Validate Serbian JMBG (Unique Master Citizen Number)."""
        if not self.jmbg_pattern.match(jmbg):
            return False

        try:
            # Extract components
            day = int(jmbg[0:2])
            month = int(jmbg[2:4])
            int(jmbg[4:7])

            # Basic date validation
            if month < 1 or month > 12:
                return False
            if day < 1 or day > 31:
                return False

            # Validate checksum
            weights = [7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
            checksum = 0
            for i in range(12):
                checksum += int(jmbg[i]) * weights[i]

            remainder = checksum % 11
            control_digit = (11 - remainder) % 10

            return control_digit == int(jmbg[12])
        except (ValueError, IndexError):
            return False

    def validate_pib(self, pib: str) -> bool:
        """Validate Serbian PIB (Tax Identification Number)."""
        if not self.pib_pattern.match(pib):
            return False

        # Calculate control digit for 8-digit PIB
        if len(pib) == 8:
            try:
                digits = [int(d) for d in pib]
                weights = [8, 7, 6, 5, 4, 3, 2]
                checksum = sum(d * w for d, w in zip(digits[:7], weights, strict=False))
                remainder = checksum % 11

                if remainder == 0:
                    control_digit = 0
                elif remainder == 1:
                    return False  # Invalid PIB
                else:
                    control_digit = 11 - remainder

                return control_digit == digits[7]
            except (ValueError, IndexError):
                return False

        return len(pib) == 9  # 9-digit PIBs are considered valid

    def validate_municipality(self, name: str) -> bool:
        """Validate if place name is a Serbian municipality."""
        if not name or not isinstance(name, str):
            return False
        return name.strip() in SERBIAN_MUNICIPALITIES

    def validate_address(self, address: str) -> float:
        """Score address format validity (0.0-1.0)."""
        if not address or not isinstance(address, str):
            return 0.0

        # Check against Serbian address patterns
        for pattern in self.address_patterns:
            if pattern.match(address.strip()):
                return 1.0

        # Partial scoring
        address_lower = address.lower()
        if any(keyword in address_lower for keyword in ["ulica", "bulevar", "улица", "булевар"]):
            return 0.7
        if any(char.isdigit() for char in address):
            return 0.5

        return 0.2

    def detect_government_institution(self, text: str) -> list[str]:
        """Detect government institution mentions in text."""
        if not text or not isinstance(text, str):
            return []

        found = []
        text_lower = text.lower()

        for institution in SERBIAN_GOVERNMENT_INSTITUTIONS:
            if institution.lower() in text_lower:
                found.append(institution)

        # Check for government keywords
        if any(keyword in text_lower for keyword in self.gov_keywords):
            found.append("Government Institution Detected")

        return found

    def validate_serbian_dataset(
        self, records: list[dict[str, Any]], text_columns: list[str] | None = None
    ) -> SerbianValidationResult:
        """Comprehensive validation of Serbian government dataset."""
        if not records:
            return SerbianValidationResult(
                script_detected=None,
                script_consistency=0.0,
                has_serbian_place_names=False,
                valid_municipalities=set(),
                invalid_municipalities=set(),
                jmbg_valid=False,
                pib_valid=False,
                address_format_score=0.0,
                government_institutions_found=set(),
                serbian_language_detected=False,
            )

        text_columns = text_columns or list(records[0].keys())

        # Collect all text for script analysis
        all_texts = []
        place_names = set()
        addresses = []
        jmbg_values = []
        pib_values = []
        gov_institutions = set()
        serbian_chars_found = False

        for record in records:
            for col in text_columns:
                value = record.get(col)
                if isinstance(value, str):
                    value = value.strip()
                    if not value:
                        continue

                    all_texts.append(value)

                    # Check for Serbian characters
                    if self.serbian_chars_cyrillic.search(value) or self.serbian_chars_latin.search(value):
                        serbian_chars_found = True

                    # Detect place names (municipalities)
                    if self.validate_municipality(value):
                        place_names.add(value)
                    elif any(municipality.lower() in value.lower() for municipality in SERBIAN_MUNICIPALITIES):
                        # Extract municipality from longer strings
                        for municipality in SERBIAN_MUNICIPALITIES:
                            if municipality.lower() in value.lower():
                                place_names.add(municipality)

                    # Detect addresses
                    if any(keyword in value.lower() for keyword in ["ulica", "bulevar", "улица", "булевар"]):
                        addresses.append(value)

                    # Detect JMBG
                    if self.jmbg_pattern.match(value.replace(".", "").replace("-", "")):
                        jmbg_values.append(value.replace(".", "").replace("-", ""))

                    # Detect PIB
                    if self.pib_pattern.match(value.replace(".", "").replace("-", "")):
                        pib_values.append(value.replace(".", "").replace("-", ""))

                    # Detect government institutions
                    institutions = self.detect_government_institution(value)
                    gov_institutions.update(institutions)

        # Analyze script usage
        script_distribution = dict.fromkeys(["cyrillic", "latin", "mixed", "none"], 0)
        for text in all_texts[:1000]:  # Sample for performance
            script = self.detect_script(text)
            script_distribution[script] += 1

        primary_script = (
            max(script_distribution, key=script_distribution.get) if any(script_distribution.values()) else None
        )
        script_consistency = self.validate_script_consistency(all_texts[:1000])

        # Validate JMBG and PIB
        valid_jmbg_count = sum(1 for jmbg in jmbg_values[:100] if self.validate_jmbg(jmbg))
        jmbg_valid = valid_jmbg_count > 0 and valid_jmbg_count / min(len(jmbg_values), 100) > 0.8

        valid_pib_count = sum(1 for pib in pib_values[:100] if self.validate_pib(pib))
        pib_valid = valid_pib_count > 0 and valid_pib_count / min(len(pib_values), 100) > 0.8

        # Score addresses
        address_scores = [self.validate_address(addr) for addr in addresses[:100]]
        address_format_score = sum(address_scores) / len(address_scores) if address_scores else 0.0

        # Identify invalid municipalities
        all_municipalities_found = set()
        invalid_municipalities = set()

        for text in all_texts[:500]:
            words = text.split()
            for word in words:
                word_clean = word.strip(".,;:!?()[]{}\"'")
                if word_clean and len(word_clean) > 2:
                    if word_clean in SERBIAN_MUNICIPALITIES:
                        all_municipalities_found.add(word_clean)
                    elif any(municipality.lower() in word_clean.lower() for municipality in SERBIAN_MUNICIPALITIES):
                        pass  # Already handled above
                    elif word_clean[0].isupper() and len(word_clean) > 3:
                        # Potential municipality that doesn't match our list
                        invalid_municipalities.add(word_clean)

        # Filter out obvious non-municipalities
        invalid_municipalities = {
            m
            for m in invalid_municipalities
            if not any(
                m.lower() in common.lower() or common.lower() in m.lower()
                for common in ["Beograd", "Srbija", "Republika", "Ministarstvo", "Uprava", "Srbije", "Godine", "Mesec"]
            )
        }

        return SerbianValidationResult(
            script_detected=primary_script,
            script_consistency=script_consistency,
            has_serbian_place_names=len(place_names) > 0,
            valid_municipalities=place_names,
            invalid_municipalities=invalid_municipalities,
            jmbg_valid=jmbg_valid,
            pib_valid=pib_valid,
            address_format_score=address_format_score,
            government_institutions_found=gov_institutions,
            serbian_language_detected=serbian_chars_found,
        )


# Utility functions for integration
def validate_serbian_dataset(
    records: list[dict[str, Any]], text_columns: list[str] | None = None
) -> SerbianValidationResult:
    """Convenience function for Serbian dataset validation."""
    validator = SerbianDataValidator()
    return validator.validate_serbian_dataset(records, text_columns)


def detect_serbian_script(text: str) -> str:
    """Detect script in Serbian text."""
    validator = SerbianDataValidator()
    return validator.detect_script(text)


def validate_serbian_jmbg(jmbg: str) -> bool:
    """Validate Serbian JMBG."""
    validator = SerbianDataValidator()
    return validator.validate_jmbg(jmbg)


def validate_serbian_pib(pib: str) -> bool:
    """Validate Serbian PIB."""
    validator = SerbianDataValidator()
    return validator.validate_pib(pib)


def is_serbian_municipality(name: str) -> bool:
    """Check if place name is a Serbian municipality."""
    validator = SerbianDataValidator()
    return validator.validate_municipality(name)
