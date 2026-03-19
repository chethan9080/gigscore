import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import numpy as np

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="GigScore API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    model = joblib.load("model.pkl")
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    model = None

class ScoreRequest(BaseModel):
    orders: int = Field(..., ge=0)
    rating: float = Field(..., ge=0.0, le=5.0)
    tenure: int = Field(..., ge=0)
    income: float = Field(..., ge=0)
    upi: int = Field(..., ge=0)

class ScoreResponse(BaseModel):
    score: int
    probability: float
    tips: list[str]
    explanation: str

def compute_score(prob: float) -> int:
    return int(300 + prob * 600)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def home():
    return {"message": "GigScore API running"}

@app.post("/score", response_model=ScoreResponse)
def score(data: ScoreRequest):
    logger.info(f"Incoming request: {data.model_dump()}")
    if model is None:
        raise HTTPException(status_code=503, detail="Model not available")
    features = np.array([[data.orders, data.rating, data.tenure, data.income, data.upi]])
    prob = float(model.predict_proba(features)[0][1])
    credit_score = compute_score(prob)
    tips = []
    if data.rating < 4.5:
        tips.append("Improve your customer rating to boost your score")
    if data.income < 20000:
        tips.append("Increasing your monthly income will positively impact your score")
    if data.orders < 500:
        tips.append("Completing more orders builds a stronger credit profile")
    explanation = (
        f"Your score is primarily influenced by your rating ({data.rating}) "
        f"and monthly income (Rs.{data.income:,.0f}). "
        f"Repayment probability: {prob:.1%}."
    )
    logger.info(f"Score computed: {credit_score}, probability: {prob:.4f}")
    return ScoreResponse(score=credit_score, probability=prob, tips=tips, explanation=explanation)
