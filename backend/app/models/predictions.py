from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class DiseasePrediction(Base):
    __tablename__ = "disease_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    crop_name = Column(String(100), nullable=False)
    disease_name = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    image_path = Column(String(255), nullable=False)
    top_predictions = Column(JSON, nullable=False) # List of dicts [{"label": ..., "confidence": ...}]
    recommendation = Column(Text, nullable=True)
    detection_mode = Column(String(50), default="upload", nullable=False) # 'upload' or 'webcam'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="disease_predictions")

class HealthPrediction(Base):
    __tablename__ = "health_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    input_parameters = Column(JSON, nullable=False)
    predicted_health = Column(String(100), nullable=False) # Optimal, Moderate Stress, Severe Stress
    probabilities = Column(JSON, nullable=False)
    important_features = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="health_predictions")

class YieldPrediction(Base):
    __tablename__ = "yield_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    input_parameters = Column(JSON, nullable=False)
    predicted_yield = Column(Float, nullable=False)
    unit = Column(String(50), default="tons/ha", nullable=False)
    important_features = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="yield_predictions")
