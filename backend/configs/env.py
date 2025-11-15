import os

class Env:
    APP_ENV = os.getenv("APP_ENV", "dev")
    if APP_ENV == "dev":
        HEADLESS = False
    elif APP_ENV == "prod":
        HEADLESS = True
    else:
        HEADLESS = False