#!/usr/bin/env python3
"""Simple API server for dataset insights and discovery"""

import base64
import logging
from typing import Any

import pandas as pd
from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="Dataset API", description="API for dataset insights and discovery", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class InsightsRequest(BaseModel):
    csv_data: str
    filename: str
    language: str = "sr"


# Mock dataset database
DATASETS_DB = [
    {
        "id": 1,
        "title": "Population Statistics Serbia",
        "description": "Population data by municipalities in Serbia",
        "category": "Demographics",
        "tags": ["population", "serbia", "municipalities"],
        "size": 145000,
        "columns": 15,
        "format": "CSV",
        "source": "Statistical Office of Serbia",
        "date_added": "2024-01-15",
        "popularity": 85,
    },
    {
        "id": 2,
        "title": "Economic Indicators",
        "description": "Monthly economic indicators for Western Balkans",
        "category": "Economics",
        "tags": ["economics", "gdp", "inflation", "balkans"],
        "size": 89000,
        "columns": 22,
        "format": "CSV",
        "source": "World Bank",
        "date_added": "2024-01-20",
        "popularity": 72,
    },
    {
        "id": 3,
        "title": "Education Enrollment",
        "description": "School enrollment rates by region and age group",
        "category": "Education",
        "tags": ["education", "enrollment", "schools"],
        "size": 234000,
        "columns": 18,
        "format": "CSV",
        "source": "Ministry of Education",
        "date_added": "2024-02-01",
        "popularity": 63,
    },
    {
        "id": 4,
        "title": "Healthcare Facilities",
        "description": "Healthcare facilities distribution and capacity",
        "category": "Healthcare",
        "tags": ["healthcare", "hospitals", "clinics"],
        "size": 12300,
        "columns": 25,
        "format": "CSV",
        "source": "Health Insurance Fund",
        "date_added": "2024-02-10",
        "popularity": 58,
    },
    {
        "id": 5,
        "title": "Traffic Accident Data",
        "description": "Traffic accidents by location and severity",
        "category": "Transport",
        "tags": ["traffic", "accidents", "safety"],
        "size": 456000,
        "columns": 31,
        "format": "CSV",
        "source": "Traffic Safety Agency",
        "date_added": "2024-02-15",
        "popularity": 91,
    },
]


def generate_dataset_insights(csv_path: str, language: str = "sr") -> dict[str, Any]:
    """Generate insights from a CSV file"""
    try:
        # Read CSV from file path
        df = pd.read_csv(csv_path)

        # Basic info
        insights = {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "memory_usage_mb": round(df.memory_usage(deep=True).sum() / 1024 / 1024, 2),
            "columns": [],
        }

        # Column analysis with Serbian language support
        for col in df.columns:
            col_type = str(df[col].dtype)

            # Serbian column names
            serbian_names = {
                "ID": "ID",
                "Name": "Ime",
                "Age": "Godine",
                "City": "Grad",
                "Salary": "Plata",
                "Department": "Odeljenje",
                "Value": "Vrednost",
                "Category": "Kategorija",
                "Status": "Status",
                "Date": "Datum",
            }

            col_info = {
                "naziv": serbian_names.get(col, col) if language == "sr" else col,
                "original_name": col,
                "tip": col_type,
                "broj_vrednosti": df[col].count(),
                "jedinstvene_vrednosti": df[col].nunique(),
                "nedostajuce_vrednosti": df[col].isnull().sum(),
            }

            # Add examples for categorical columns
            if df[col].dtype == "object":
                examples = [str(x) for x in df[col].dropna().unique()[:5]]
                col_info["primeri_vrednosti"] = examples

            # Add statistics for numeric columns
            if df[col].dtype in ["int64", "float64"]:
                col_info["statistike"] = {
                    "minimum": float(df[col].min()),
                    "maksimum": float(df[col].max()),
                    "prosek": float(df[col].mean()),
                    "medijana": float(df[col].median()),
                }

            # Ensure all values are JSON serializable
            col_info["broj_vrednosti"] = int(col_info["broj_vrednosti"])
            col_info["jedinstvene_vrednosti"] = int(col_info["jedinstvene_vrednosti"])
            col_info["nedostajuce_vrednosti"] = int(col_info["nedostajuce_vrednosti"])

            insights["columns"].append(col_info)

        # Statistics
        numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
        categorical_cols = df.select_dtypes(include=["object"]).columns.tolist()

        insights["statistike"] = {"numericke_kolone": numeric_cols, "kategoricke_kolone": categorical_cols}

        # Correlations for numeric columns
        if len(numeric_cols) > 1:
            correlations = df[numeric_cols].corr().round(2)
            insights["statistike"]["korelacije"] = {}

            # Find strong correlations (> 0.5 or < -0.5)
            for i in range(len(numeric_cols)):
                for j in range(i + 1, len(numeric_cols)):
                    corr_val = correlations.iloc[i, j]
                    if abs(corr_val) > 0.5:
                        insights["statistike"]["korelacije"][f"{numeric_cols[i]} ↔ {numeric_cols[j]}"] = float(corr_val)

        # Missing values
        missing = df.isnull().sum()
        if missing.any():
            insights["nedostajuce_vrednosti"] = missing[missing > 0].to_dict()

        # Quality metrics (Serbian)
        insights["kvalitet"] = {
            "potpunost": round(100 * (1 - missing.sum() / (len(df) * len(df.columns))), 2),
            "jedinstveni_redovi": int(df.duplicated().sum() == 0),
        }

        return insights

    except Exception as e:
        logger.error(f"Error generating insights: {str(e)}")
        return {"error": str(e)}


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Dataset API Server", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": pd.Timestamp.now().isoformat()}


@app.get("/api/v1/datasets/categories")
async def get_categories():
    """Get available dataset categories"""
    categories = sorted(list(set(d["category"] for d in DATASETS_DB)))
    return categories


@app.get("/api/v1/datasets/search")
async def search_datasets(
    q: str | None = None,
    category: str | None = None,
    limit: int = 20,
    offset: int = 0,
    sort_by: str = "relevance",
):
    """Search datasets"""
    # Filter datasets
    results = DATASETS_DB.copy()

    if q:
        q_lower = q.lower()
        results = [
            d
            for d in results
            if q_lower in d["title"].lower()
            or q_lower in d["description"].lower()
            or any(q_lower in tag.lower() for tag in d["tags"])
        ]

    if category:
        results = [d for d in results if d["category"] == category]

    # Sort results
    if sort_by == "popularity":
        results.sort(key=lambda x: x["popularity"], reverse=True)
    elif sort_by == "recent":
        results.sort(key=lambda x: x["date_added"], reverse=True)
    elif sort_by == "size":
        results.sort(key=lambda x: x["size"], reverse=True)

    # Pagination
    total = len(results)
    paginated_results = results[offset : offset + limit]

    return {
        "datasets": paginated_results,
        "total": total,
        "limit": limit,
        "offset": offset,
        "page_size": len(paginated_results),
    }


@app.get("/api/v1/datasets/{dataset_id}")
async def get_dataset_details(dataset_id: int):
    """Get details for a specific dataset"""
    dataset = next((d for d in DATASETS_DB if d["id"] == dataset_id), None)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset


@app.post("/api/v1/datasets/insights")
async def generate_insights(request: InsightsRequest):
    """Generate insights from CSV data"""
    try:
        # Decode base64 data
        csv_bytes = base64.b64decode(request.csv_data)
        csv_content = csv_bytes.decode("utf-8")

        # Create a temporary file
        import tempfile

        with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
            f.write(csv_content)
            temp_path = f.name

        try:
            # Generate insights
            insights = generate_dataset_insights(temp_path, request.language)

            # Add metadata
            insights["metadata"] = {
                "filename": request.filename,
                "language": request.language,
                "processed_at": pd.Timestamp.now().isoformat(),
            }

            return insights

        finally:
            # Clean up
            import os

            os.unlink(temp_path)

    except Exception as e:
        logger.error(f"Error processing CSV: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error processing CSV: {str(e)}")


@app.get("/api/v1/stats")
async def get_api_stats():
    """Get API statistics"""
    return {
        "total_datasets": len(DATASETS_DB),
        "categories": len(set(d["category"] for d in DATASETS_DB)),
        "total_rows": sum(d["size"] for d in DATASETS_DB),
        "average_columns": sum(d["columns"] for d in DATASETS_DB) / len(DATASETS_DB),
    }


if __name__ == "__main__":
    import uvicorn

    # Install required packages if not available
    try:
        import fastapi
    except ImportError:
        import subprocess
        import sys

        subprocess.check_call([sys.executable, "-m", "pip", "install", "fastapi", "uvicorn"])

    print("Starting Dataset API Server...")
    print("Server will be available at: http://localhost:8000")
    print("API documentation at: http://localhost:8000/docs")

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
