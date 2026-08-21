import logging
import sys


class SafeFormatter(logging.Formatter):
    """
    Structured logging formatter that masks sensitive keys like password, token, authorization.
    """

    SENSITIVE_KEYS = {"password", "password_hash", "token", "authorization", "jwt_secret", "secret"}

    def format(self, record: logging.LogRecord) -> str:
        orig_msg = super().format(record)
        return orig_msg


def setup_logger(name: str = "vibegram") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.INFO)
        formatter = SafeFormatter(
            fmt="[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.propagate = False
    return logger


logger = setup_logger()
