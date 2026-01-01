from app import db
from datetime import datetime


class Route(db.Model):
    __tablename__ = 'routes'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    bus_id = db.Column(db.Integer, db.ForeignKey('buses.id'), nullable=True)
    operator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    start_location = db.Column(db.String(200))
    end_location = db.Column(db.String(200))
    start_latitude = db.Column(db.Float)
    start_longitude = db.Column(db.Float)
    end_latitude = db.Column(db.Float)
    end_longitude = db.Column(db.Float)
    scheduled_start_time = db.Column(db.Time)
    scheduled_end_time = db.Column(db.Time)
    days_of_week = db.Column(db.String(50))  # e.g., "mon,tue,wed,thu,fri"
    status = db.Column(db.String(20), default='active')  # active, inactive, completed
    is_morning_route = db.Column(db.Boolean, default=True)  # morning pickup vs afternoon dropoff
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    operator = db.relationship('User', backref='routes')
    students = db.relationship('Student', backref='route', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'bus_id': self.bus_id,
            'bus': self.bus.to_dict() if self.bus else None,
            'operator_id': self.operator_id,
            'start_location': self.start_location,
            'end_location': self.end_location,
            'start_coordinates': {
                'latitude': self.start_latitude,
                'longitude': self.start_longitude
            } if self.start_latitude and self.start_longitude else None,
            'end_coordinates': {
                'latitude': self.end_latitude,
                'longitude': self.end_longitude
            } if self.end_latitude and self.end_longitude else None,
            'scheduled_start_time': self.scheduled_start_time.isoformat() if self.scheduled_start_time else None,
            'scheduled_end_time': self.scheduled_end_time.isoformat() if self.scheduled_end_time else None,
            'days_of_week': self.days_of_week.split(',') if self.days_of_week else [],
            'status': self.status,
            'is_morning_route': self.is_morning_route,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<Route {self.name}>'
