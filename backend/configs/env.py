import os

class Env:
    APP_ENV = os.getenv("APP_ENV", "dev")
    if APP_ENV == "dev":
        pass
    elif APP_ENV == "prod":
        pass
    else:
        pass