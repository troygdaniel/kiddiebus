from app import db
from datetime import datetime


class Bus(db.Model):
    __tablename__ = 'buses'

    id = db.Column(db.Integer, primary_key=True)
    registration_number = db.Column(db.String(20), unique=True, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    make = db.Column(db.String(50))
    model = db.Column(db.String(50))
    year = db.Column(db.Integer)
    status = db.Column(db.String(20), default='active')  # active, maintenance, inactive
    current_latitude = db.Column(db.Float)
    current_longitude = db.Column(db.Float)
    last_location_update = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    routes = db.relationship('Route', backref='bus', lazy='dynamic')
    boardings = db.relationship('Boarding', backref='bus', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'registration_number': self.registration_number,
            'capacity': self.capacity,
            'make': self.make,
            'model': self.model,
            'year': self.year,
            'status': self.status,
            'current_location': {
                'latitude': self.current_latitude,
                'longitude': self.current_longitude,
                'updated_at': self.last_location_update.isoformat() if self.last_location_update else None
            } if self.current_latitude and self.current_longitude else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<Bus {self.registration_number}>'
