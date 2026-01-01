from app import db
from datetime import datetime


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50), default='general')  # general, delay, emergency, boarding
    priority = db.Column(db.String(20), default='normal')  # low, normal, high, urgent
    is_read = db.Column(db.Boolean, default=False)
    read_at = db.Column(db.DateTime)
    delivery_method = db.Column(db.String(20), default='in_app')  # in_app, sms, email, all
    sms_sent = db.Column(db.Boolean, default=False)
    email_sent = db.Column(db.Boolean, default=False)
    related_route_id = db.Column(db.Integer, db.ForeignKey('routes.id'), nullable=True)
    related_student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    related_route = db.relationship('Route', backref='notifications')
    related_student = db.relationship('Student', backref='notifications')

    def mark_as_read(self):
        self.is_read = True
        self.read_at = datetime.utcnow()

    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'recipient_id': self.recipient_id,
            'title': self.title,
            'message': self.message,
            'notification_type': self.notification_type,
            'priority': self.priority,
            'is_read': self.is_read,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'delivery_method': self.delivery_method,
            'related_route_id': self.related_route_id,
            'related_student_id': self.related_student_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<Notification {self.title}>'
