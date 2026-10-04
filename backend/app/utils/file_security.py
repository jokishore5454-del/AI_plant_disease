import os
import uuid
from fastapi import UploadFile, HTTPException, status
from PIL import Image

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024 # 10 MB

def validate_and_save_upload(file: UploadFile, upload_dir: str) -> str:
    # 1. Extension check
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension. Allowed extensions are: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # 2. Content type check
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid MIME type. Must be a valid JPEG, PNG, or WebP image."
        )

    # 3. Read content & check size limit
    content = file.file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum permitted threshold of 10 MB."
        )

    # 4. Verify actual image integrity using Pillow (detect corrupted uploads)
    import io
    try:
        img = Image.open(io.BytesIO(content))
        img.verify()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is corrupted or not a valid image format."
        )

    # 5. Generate secure random filename to prevent Path Traversal
    safe_filename = f"{uuid.uuid4().hex}{ext}"
    os.makedirs(upload_dir, exist_ok=True)
    full_path = os.path.join(upload_dir, safe_filename)

    with open(full_path, "wb") as f:
        f.write(content)

    return safe_filename
