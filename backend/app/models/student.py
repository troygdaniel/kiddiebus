from app import db
from datetime import datetime
import uuid


class Student(db.Model):
    __tablename__ = 'students'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    date_of_birth = db.Column(db.Date)
    grade = db.Column(db.String(20))
    school_name = db.Column(db.String(100))
    parent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    route_id = db.Column(db.Integer, db.ForeignKey('routes.id'), nullable=True)
    school_id = db.Column(db.Integer, db.ForeignKey('schools.id'), nullable=True)
    card_id = db.Column(db.String(50), unique=True)  # For card/fob check-in
    pickup_address = db.Column(db.String(200))
    pickup_latitude = db.Column(db.Float)
    pickup_longitude = db.Column(db.Float)
    dropoff_address = db.Column(db.String(200))
    dropoff_latitude = db.Column(db.Float)
    dropoff_longitude = db.Column(db.Float)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    boardings = db.relationship('Boarding', backref='student', lazy='dynamic')

    def generate_card_id(self):
        self.card_id = str(uuid.uuid4())[:8].upper()
        return self.card_id

    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': f'{self.first_name} {self.last_name}',
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'grade': self.grade,
            'school_name': self.school.name if self.school else self.school_name,
            'school_id': self.school_id,
            'parent_id': self.parent_id,
            'route_id': self.route_id,
            'card_id': self.card_id,
            'pickup_address': self.pickup_address,
            'pickup_coordinates': {
                'latitude': self.pickup_latitude,
                'longitude': self.pickup_longitude
            } if self.pickup_latitude and self.pickup_longitude else None,
            'dropoff_address': self.dropoff_address,
            'dropoff_coordinates': {
                'latitude': self.dropoff_latitude,
                'longitude': self.dropoff_longitude
            } if self.dropoff_latitude and self.dropoff_longitude else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<Student {self.first_name} {self.last_name}>'
