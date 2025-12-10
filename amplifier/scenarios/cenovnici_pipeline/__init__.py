"""
Cenovnici Data Processing Pipeline

A comprehensive pipeline for processing Serbian retailers' price lists (cenovnici)
from data.gov.rs and transforming them to vizualni-admin compatible format.

Modules:
- core: Data models and shared utilities
- config: Configuration management
- fetchers: Data fetching from retailers
- transformers: Data transformation pipeline
- generators: Sample data and insight generation
- main: Pipeline orchestration

Usage:
    from amplifier.scenarios.cenovnici_pipeline import CenovniciPipeline

    pipeline = CenovniciPipeline()
    results = pipeline.run_full_pipeline()
"""

from .main import CenovniciPipeline

__all__ = ["CenovniciPipeline"]
