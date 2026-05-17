import pandas as pd
def load_sales_data():
    df = pd.read_csv("data/sales.csv")
    df['date'] = pd.to_datetime(df['date'])
    return df