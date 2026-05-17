from app.database import SessionLocal, engine
from app.models import Sales, Base
import pandas as pd

# THIS LINE CREATES THE TABLE FIRST
Base.metadata.create_all(bind=engine)

# create database session
db = SessionLocal()

# load all data from the new CSV file
df = pd.read_csv("data/sales.csv")

# convert date column to proper date format
df['date'] = pd.to_datetime(df['date'])

# loop through every row in CSV and insert into database
for _, row in df.iterrows():
    record = Sales(
        date=row['date'],
        product_id=row['product_id'],
        location=row['location'],
        sales=row['sales'],
        price=row['price'],
        revenue=row['revenue'],
        inventory_level=row['inventory_level'],
        reorder_level=row['reorder_level'],
        replenishment_triggered=row['replenishment_triggered'],
        stock_out_risk=row['stock_out_risk'],
        lead_time_days=row['lead_time_days'],
        is_promotion=row['is_promotion'],
        promotion_discount_pct=row['promotion_discount_pct'],
        seasonal_factor=row['seasonal_factor']
    )
    db.add(record)

# save all records to database
db.commit()

# close connection
db.close()

print("Data inserted successfully ✅")