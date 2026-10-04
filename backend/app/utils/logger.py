from sqlalchemy.orm import Session
from app.models.logs import ActivityLog

def log_activity(db: Session, user_id: int, username: str, action: str, status: str = "SUCCESS"):
    try:
        log_entry = ActivityLog(
            user_id=user_id,
            username=username,
            action=action,
            status=status
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[ActivityLogger] Failed to record log: {e}")
