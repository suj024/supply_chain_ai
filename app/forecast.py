import os
import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

import logging
logging.getLogger('prophet').setLevel(logging.ERROR)
logging.getLogger('cmdstanpy').setLevel(logging.ERROR)

# ── Absolute path to CSV — works regardless of where uvicorn is run from ──
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, '..', 'data', 'sales.csv')


def load_product_data(product_id, location):
    df = pd.read_csv(CSV_PATH)
    df['date'] = pd.to_datetime(df['date'])
    df = df[(df['product_id'] == product_id) & (df['location'] == location)].copy()
    df = df.sort_values('date').reset_index(drop=True)
    return df


def forecast_demand(product_id, location, days=30):
    """
    AI Forecasting using Facebook Prophet.
    Accounts for: weekly seasonality, promotions, seasonal factors.
    Returns probabilistic forecast with confidence intervals.
    """
    try:
        df = load_product_data(product_id, location)

        if df.empty or len(df) < 10:
            print(f"Not enough data for {product_id} / {location}")
            return _fallback_forecast(50, days)

        # ── Build Prophet dataframe (use .values to avoid index mismatch) ──
        prophet_df = pd.DataFrame({
            'ds':              pd.to_datetime(df['date'].values),
            'y':               df['sales'].astype(float).values,
            'promotion':       df['is_promotion'].astype(float).values,
            'seasonal_factor': df['seasonal_factor'].astype(float).values,
        })

        # ── Train Prophet model ──
        from prophet import Prophet
        model = Prophet(
            yearly_seasonality=False,
            weekly_seasonality=True,
            daily_seasonality=False,
            interval_width=0.95,
            changepoint_prior_scale=0.05,
            seasonality_prior_scale=10.0,
        )
        model.add_regressor('promotion')
        model.add_regressor('seasonal_factor')
        model.fit(prophet_df)

        # ── Build future dataframe ──
        future = model.make_future_dataframe(periods=days)
        future['promotion']       = 0.0
        future['seasonal_factor'] = float(df['seasonal_factor'].mean())

        # ── Predict ──
        forecast   = model.predict(future)
        result_df  = forecast.tail(days)[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].reset_index(drop=True)

        output = []
        for i, row in result_df.iterrows():
            output.append({
                "day":   i + 1,
                "date":  str(row['ds'].date()),
                "value": round(max(0, float(row['yhat'])),       2),
                "lower": round(max(0, float(row['yhat_lower'])), 2),
                "upper": round(max(0, float(row['yhat_upper'])), 2),
            })

        return output

    except Exception as e:
        print(f"Prophet forecast error for {product_id}/{location}: {e}")
        import traceback
        traceback.print_exc()
        # Fallback to weighted moving average
        try:
            df  = load_product_data(product_id, location)
            avg = float(df['sales'].tail(14).mean()) if not df.empty else 50
            return _fallback_forecast(avg, days)
        except:
            return _fallback_forecast(50, days)


def _fallback_forecast(base, days):
    """Weekly weighted fallback with dates."""
    from datetime import date, timedelta
    output = []
    today  = date.today()
    for i in range(days):
        day_of_week    = i % 7
        weekly_factor  = [1.0, 0.95, 0.98, 1.02, 1.05, 1.15, 1.1][day_of_week]
        value          = round(base * weekly_factor, 2)
        forecast_date  = today + timedelta(days=i+1)
        output.append({
            "day":   i + 1,
            "date":  str(forecast_date),
            "value": value,
            "lower": round(value * 0.85, 2),
            "upper": round(value * 1.15, 2),
        })
    return output