# main.py - FastAPI with FAOSTAT structure for Docker
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import os

class PredictRequest(BaseModel):
    country: str  # Will map to Area in FAOSTAT
    year: int
    crop: str     # Will map to Item in FAOSTAT

class PredictResponse(BaseModel):
    yield_kg_per_ha: float
    confidence_level: str
    prediction_method: str
    country: str
    crop: str
    year: int

app = FastAPI(title="Enhanced FAOSTAT Yield Predictor", version="2.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and encoders
model = None
le_area = None
le_item = None
le_era = None
feature_columns = None
baseline_year = None
trends_df = None
metadata = None

@app.on_event("startup")
async def load_models():
    """Load enhanced models and data on startup"""
    global model, le_area, le_item, le_era, feature_columns, baseline_year, trends_df, metadata
    
    try:
        print("🚀 Loading enhanced models...")
        
        # Debug: list available files
        print("Available files in /app:")
        for file in os.listdir("/app"):
            print(f"  - {file}")
        
        # Load model and encoders directly from /app
        model = joblib.load("model_global_enhanced.pkl")
        le_area = joblib.load("le_area_enhanced.pkl")
        le_item = joblib.load("le_item_enhanced.pkl")
        le_era = joblib.load("le_era_enhanced.pkl")
        feature_columns = joblib.load("feature_columns.pkl")
        baseline_year = joblib.load("baseline_year.pkl")
        metadata = joblib.load("model_metadata.pkl")
        
        # Load trends data
        if os.path.exists("country_crop_trends.csv"):
            trends_df = pd.read_csv("country_crop_trends.csv")
            print(f"✅ Loaded trends for {len(trends_df)} country-crop combinations")
        else:
            print("⚠️ No trends file found, will use defaults")
            trends_df = pd.DataFrame()
        
        print("✅ Enhanced models loaded successfully!")
        print(f"📊 Model covers {metadata['num_countries']} countries and {metadata['num_crops']} crops")
        print(f"📅 Baseline year: {baseline_year}")
        print(f"🎯 Model accuracy (R²): {metadata['test_r2']:.3f}")
        
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        print("Available files in /app:")
        for file in os.listdir("/app"):
            print(f"  - {file}")
        raise e

def create_temporal_features(year, baseline_year):
    """Create temporal features for a given year"""
    years_since_start = year - baseline_year
    decade = (year // 10) * 10
    year_sin = np.sin(2 * np.pi * year / 10)
    year_cos = np.cos(2 * np.pi * year / 10)
    
    # Era mapping
    if year < 1990:
        era = 0  # Pre_1990
    elif year < 2000:
        era = 1  # 1990s
    elif year < 2010:
        era = 2  # 2000s
    elif year < 2020:
        era = 3  # 2010s
    else:
        era = 4  # 2020s+
    
    return years_since_start, decade, year_sin, year_cos, era

def get_country_crop_trends(country, crop):
    """Get historical trends for country-crop combination"""
    if trends_df is not None and len(trends_df) > 0:
        # FAOSTAT uses 'Area' and 'Item' instead of 'Country' and 'Crop'
        trend_row = trends_df[
            (trends_df['Area'] == country) & 
            (trends_df['Item'] == crop)
        ]
        
        if len(trend_row) > 0:
            return (
                float(trend_row['Historical_Trend'].iloc[0]),
                float(trend_row['Avg_Yield_Last_5Y'].iloc[0]),
                float(trend_row['Volatility'].iloc[0]),
                float(trend_row['Growth_Rate'].iloc[0])
            )
    
    # Default values for unknown combinations
    return 0.0, 3000.0, 500.0, 0.0

def determine_confidence(year):
    """Determine confidence level based on prediction year"""
    current_year = 2024
    years_ahead = year - current_year
    
    if years_ahead <= 0:
        return "HIGH"  # Historical/current data
    elif years_ahead <= 3:
        return "MEDIUM"  # Near future (1-3 years)
    elif years_ahead <= 10:
        return "LOW"  # Medium future (4-10 years)
    else:
        return "VERY_LOW"  # Far future (10+ years)

def get_prediction_method(year):
    """Determine prediction method based on year"""
    if year <= 2023:
        return "historical_interpolation"
    elif year <= 2030:
        return "trend_extrapolation"
    else:
        return "long_term_projection"

@app.get("/health")
def health_check():
    """Health check endpoint"""
    model_status = "loaded" if model is not None else "not_loaded"
    
    return {
        "status": "healthy", 
        "service": "enhanced-faostat-yield-predictor",
        "version": "2.0.0",
        "model_status": model_status,
        "features": "temporal_trends_faostat_enabled",
        "baseline_year": int(baseline_year) if baseline_year else None,
        "countries_supported": metadata['num_countries'] if metadata else 0,
        "crops_supported": metadata['num_crops'] if metadata else 0
    }

@app.post("/predict-global", response_model=PredictResponse)
def predict_yield_global(data: PredictRequest):
    """Main prediction endpoint with enhanced features"""
    
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Validate inputs
        if data.year < 1961 or data.year > 2050:
            raise HTTPException(status_code=400, detail="Year must be between 1961 and 2050")
        
        # Map country/crop names for FAOSTAT (case sensitive)
        country_mapped = data.country
        crop_mapped = data.crop
        
        # Encode country (Area) and crop (Item)
        try:
            encoded_area = le_area.transform([country_mapped])[0]
            encoded_item = le_item.transform([crop_mapped])[0]
        except ValueError as e:
            # Try to find similar matches
            available_countries = list(le_area.classes_)
            available_crops = list(le_item.classes_)
            
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid country '{data.country}' or crop '{data.crop}'. "
                      f"Use /countries and /crops endpoints to see available options."
            )
        
        # Create temporal features
        years_since_start, decade, year_sin, year_cos, era_enc = create_temporal_features(
            data.year, baseline_year
        )
        
        # Get country-crop specific trends
        historical_trend, avg_yield_last_5y, volatility, growth_rate = get_country_crop_trends(
            country_mapped, crop_mapped
        )
        
        # Create feature vector (matching training order)
        features = [
            encoded_area,             # Area_enc (was Country_enc)
            encoded_item,             # Item_enc (was Crop_enc)
            data.year,                # Year
            years_since_start,        # Years_Since_Start
            decade,                   # Decade
            year_sin,                 # Year_Sin
            year_cos,                 # Year_Cos
            era_enc,                  # Era_enc
            historical_trend,         # Historical_Trend
            avg_yield_last_5y,        # Avg_Yield_Last_5Y
            volatility,               # Volatility
            growth_rate               # Growth_Rate
        ]
        
        # Create input DataFrame
        input_df = pd.DataFrame([features], columns=feature_columns)
        
        # Make prediction
        prediction = model.predict(input_df)[0]
        
        # Ensure positive prediction
        prediction = max(prediction, 0.0)
        
        # Determine confidence and method
        confidence = determine_confidence(data.year)
        method = get_prediction_method(data.year)
        
        return PredictResponse(
            yield_kg_per_ha=float(prediction),
            confidence_level=confidence,
            prediction_method=method,
            country=data.country,
            crop=data.crop,
            year=data.year
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal prediction error: {str(e)}")

@app.get("/countries")
def get_countries():
    """Get list of supported countries (Areas in FAOSTAT)"""
    if le_area is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    countries = sorted(le_area.classes_.tolist())
    return {
        "countries": countries,
        "count": len(countries),
        "note": "These are FAOSTAT Area names - use exact spelling"
    }

@app.get("/crops") 
def get_crops():
    """Get list of supported crops (Items in FAOSTAT)"""
    if le_item is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    crops = sorted(le_item.classes_.tolist())
    return {
        "crops": crops,
        "count": len(crops),
        "note": "These are FAOSTAT Item names - use exact spelling"
    }

@app.get("/model-info")
def get_model_info():
    """Get detailed information about enhanced model"""
    if metadata is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    return {
        "model_type": "Enhanced RandomForest with Temporal Features",
        "version": "2.0.0",
        "data_source": "FAOSTAT Production_Crops_Livestock",
        "yield_element": metadata.get('yield_element', 'Unknown'),
        "features": feature_columns,
        "baseline_year": int(baseline_year),
        "supported_years": "1961-2050",
        "countries_count": metadata['num_countries'],
        "crops_count": metadata['num_crops'],
        "training_samples": metadata['training_samples'],
        "test_accuracy_r2": round(metadata['test_r2'], 3),
        "test_mae": round(metadata['test_mae'], 2),
        "enhancement_features": [
            "temporal_trends",
            "cyclical_patterns", 
            "historical_volatility",
            "era_classification",
            "country_crop_specific_trends",
            "growth_rate_analysis"
        ]
    }

@app.get("/")
def root():
    """Root endpoint with basic info"""
    return {
        "service": "Enhanced FAOSTAT Yield Predictor",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "predict": "/predict-global",
            "countries": "/countries", 
            "crops": "/crops",
            "info": "/model-info",
            "health": "/health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)