import pandas as pd
import numpy as np
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

def train_enhanced_model(csv_file_path):
    """
    Trains a yield prediction model using FAOSTAT-like data.
    """
    print("Starting model training...")

    if not os.path.exists(csv_file_path):
        print(f"File not found: {csv_file_path}")
        return

    print("Loading data...")
    df = pd.read_csv(csv_file_path, low_memory=False)
    print(f"Loaded {len(df)} rows and {len(df.columns)} columns.")

    required_columns = ['Area', 'Item', 'Element', 'Year', 'Value']
    if not all(col in df.columns for col in required_columns):
        print("Missing required columns.")
        return

    yield_elements = [e for e in df['Element'].unique() if 'yield' in str(e).lower()]
    if not yield_elements:
        print("No yield element found.")
        return

    yield_element = yield_elements[0]
    df_yield = df[df['Element'] == yield_element].copy()
    df_yield = df_yield.dropna(subset=['Value'])
    df_yield = df_yield[df_yield['Value'] > 0]
    df_yield = df_yield[df_yield['Year'] >= 1961]

    baseline_year = df_yield['Year'].min()
    df_yield['Years_Since_Start'] = df_yield['Year'] - baseline_year
    df_yield['Decade'] = (df_yield['Year'] // 10) * 10
    df_yield['Year_Sin'] = np.sin(2 * np.pi * df_yield['Year'] / 10)
    df_yield['Year_Cos'] = np.cos(2 * np.pi * df_yield['Year'] / 10)
    df_yield['Era'] = pd.cut(
        df_yield['Year'],
        bins=[0, 1990, 2000, 2010, 2020, np.inf],
        labels=['Pre_1990', '1990s', '2000s', '2010s', '2020s+'],
        include_lowest=True
    )

    trend_data = []
    grouped = df_yield.groupby(['Area', 'Item'])

    for (area, item), group in grouped:
        group = group.sort_values('Year')
        if len(group) >= 3:
            x, y = group['Year'].values, group['Value'].values
            n = len(x)
            denom = n * np.sum(x**2) - np.sum(x)**2
            slope = ((n * np.sum(x * y) - np.sum(x) * np.sum(y)) / denom) if denom != 0 else 0
            avg_last_5 = group['Value'].tail(5).mean()
            volatility = group['Value'].std()
            first_val, last_val = group['Value'].iloc[0], group['Value'].iloc[-1]
            years_span = group['Year'].iloc[-1] - group['Year'].iloc[0]
            growth_rate = ((last_val / first_val)**(1/years_span) - 1) * 100 if first_val > 0 and years_span > 0 else 0
        else:
            slope, avg_last_5, volatility, growth_rate = 0, group['Value'].mean(), 0, 0

        for idx in group.index:
            trend_data.append({
                'index': idx,
                'Historical_Trend': slope,
                'Avg_Yield_Last_5Y': avg_last_5,
                'Volatility': 0 if np.isnan(volatility) else volatility,
                'Growth_Rate': growth_rate
            })

    trend_df = pd.DataFrame(trend_data).set_index('index')
    df_yield = df_yield.join(trend_df)

    for col in ['Historical_Trend', 'Avg_Yield_Last_5Y', 'Volatility', 'Growth_Rate']:
        df_yield[col] = df_yield[col].fillna(0 if col != 'Avg_Yield_Last_5Y' else df_yield['Value'])

    le_area = LabelEncoder()
    le_item = LabelEncoder()
    le_era = LabelEncoder()
    df_yield['Area_enc'] = le_area.fit_transform(df_yield['Area'])
    df_yield['Item_enc'] = le_item.fit_transform(df_yield['Item'])
    df_yield['Era_enc'] = le_era.fit_transform(df_yield['Era'])

    features = [
        'Area_enc', 'Item_enc', 'Year', 'Years_Since_Start',
        'Decade', 'Year_Sin', 'Year_Cos', 'Era_enc',
        'Historical_Trend', 'Avg_Yield_Last_5Y', 'Volatility', 'Growth_Rate'
    ]
    X, y = df_yield[features], df_yield['Value']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        max_features='sqrt',
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    y_pred_test = model.predict(X_test)
    print(f"Test MAE: {mean_absolute_error(y_test, y_pred_test):.2f}")
    print(f"Test R²: {r2_score(y_test, y_pred_test):.3f}")

    joblib.dump(model, "model_global_enhanced.pkl")
    joblib.dump(le_area, "le_area_enhanced.pkl")
    joblib.dump(le_item, "le_item_enhanced.pkl")
    joblib.dump(le_era, "le_era_enhanced.pkl")
    joblib.dump(features, "feature_columns.pkl")
    joblib.dump(baseline_year, "baseline_year.pkl")

    metadata = {
        'yield_element': yield_element,
        'baseline_year': baseline_year,
        'num_countries': len(le_area.classes_),
        'num_crops': len(le_item.classes_),
        'training_samples': len(X_train),
        'test_mae': mean_absolute_error(y_test, y_pred_test),
        'test_r2': r2_score(y_test, y_pred_test)
    }
    joblib.dump(metadata, "model_metadata.pkl")

    summary = df_yield.groupby(['Area', 'Item']).agg({
        'Historical_Trend': 'first',
        'Avg_Yield_Last_5Y': 'first',
        'Volatility': 'first',
        'Growth_Rate': 'first'
    }).reset_index()
    summary.to_csv("country_crop_trends.csv", index=False)

    return model, le_area, le_item, le_era, metadata

if __name__ == "__main__":
    files = [
        "Production_Crops_Livestock_E_All_Data_(Normalized).csv",
        "Production_Crops_Livestock_E_All_Data_Normalized.csv",
        "faostat_data.csv"
    ]

    found_file = next((f for f in files if os.path.exists(f)), None)

    if found_file:
        print(f"Found data file: {found_file}")
        train_enhanced_model(found_file)
    else:
        print("No data file found. Please place one of the expected files in the working directory:")
        for f in files:
            print(f"  - {f}")
