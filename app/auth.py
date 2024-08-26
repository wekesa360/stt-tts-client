import os

def verify_api_key(app_id: str, app_key: str) -> bool:
    return app_id == os.environ.get("APP_ID") and app_key == os.environ.get("APP_KEY")
