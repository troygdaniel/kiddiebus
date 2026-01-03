from app import db
from datetime import datetime


class School(db.Model):
    __tablename__ = 'schools'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200))
    city = db.Column(db.String(50), default='Mandeville')
    parish = db.Column(db.String(50), default='Manchester')
    phone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    operator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    operator = db.relationship('User', backref='schools')
    students = db.relationship('Student', backref='school', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'city': self.city,
            'parish': self.parish,
            'phone': self.phone,
            'email': self.email,
            'operator_id': self.operator_id,
            'is_active': self.is_active,
            'student_count': self.students.filter_by(is_active=True).count(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<School {self.name}>'
