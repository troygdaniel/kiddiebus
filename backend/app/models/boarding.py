from app import db
from datetime import datetime


class Boarding(db.Model):
    __tablename__ = 'boardings'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    bus_id = db.Column(db.Integer, db.ForeignKey('buses.id'), nullable=False)
    route_id = db.Column(db.Integer, db.ForeignKey('routes.id'), nullable=False)
    boarding_type = db.Column(db.String(20), nullable=False)  # pickup, dropoff
    boarding_time = db.Column(db.DateTime, default=datetime.utcnow)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    verified_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    verification_method = db.Column(db.String(20), default='card')  # card, manual
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    route = db.relationship('Route', backref='boardings')
    verified_by = db.relationship('User', backref='verified_boardings')

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student': self.student.to_dict() if self.student else None,
            'bus_id': self.bus_id,
            'route_id': self.route_id,
            'boarding_type': self.boarding_type,
            'boarding_time': self.boarding_time.isoformat() if self.boarding_time else None,
            'location': {
                'latitude': self.latitude,
                'longitude': self.longitude
            } if self.latitude and self.longitude else None,
            'verified_by_id': self.verified_by_id,
            'verification_method': self.verification_method,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<Boarding {self.student_id} - {self.boarding_type}>'
