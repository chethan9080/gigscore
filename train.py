print("🔥 Running train.py")

from faker import Faker
import random
import pandas as pd
from xgboost import XGBClassifier
import joblib

data = []

for _ in range(1000):
    orders = random.randint(100, 3000)
    rating = round(random.uniform(3.5, 5.0), 2)
    tenure = random.randint(1, 60)
    income = random.randint(10000, 40000)
    upi = random.randint(50, 200)

    repayment = 1 if (rating > 4.2 and income > 18000) else 0

    data.append([orders, rating, tenure, income, upi, repayment])

df = pd.DataFrame(data, columns=[
    "orders", "rating", "tenure", "income", "upi", "repayment"
])

X = df.drop("repayment", axis=1)
y = df["repayment"]

model = XGBClassifier()
model.fit(X, y)

joblib.dump(model, "model.pkl")

print("✅ Model trained & saved")