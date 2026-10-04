from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime, timezone
from app.core.database import Base

class DatasetMetadata(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    source = Column(String(255), nullable=False)
    version = Column(String(50), default="1.0.0", nullable=False)
    description = Column(Text, nullable=True)
    downloaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    sample_count = Column(Integer, default=0, nullable=False)
    status = Column(String(50), default="Active", nullable=False) # Active, Training, Ready
