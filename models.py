from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Proxy(db.Model):
    __tablename__ = 'proxies'

    id = db.Column(db.Integer, primary_key=True)
    ip = db.Column(db.String(45), nullable=False)
    port = db.Column(db.String(10), nullable=False)
    type = db.Column(db.String(20))
    https = db.Column(db.String(20))
    region = db.Column(db.String(100))
    last_checked = db.Column(db.DateTime)
    validated_ok = db.Column(db.Boolean)

    __table_args__ = (
        db.UniqueConstraint('ip', 'port', name='uix_ip_port'),
    ) 