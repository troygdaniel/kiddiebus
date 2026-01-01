from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Notification, User

notifications_bp = Blueprint('notifications', __name__)


def require_operator_or_admin():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return user and user.role in ['admin', 'operator']


@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    current_user_id = get_jwt_identity()

    # Get filter params
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'
    notification_type = request.args.get('type')
    limit = request.args.get('limit', 50, type=int)

    query = Notification.query.filter_by(recipient_id=current_user_id)

    if unread_only:
        query = query.filter_by(is_read=False)

    if notification_type:
        query = query.filter_by(notification_type=notification_type)

    notifications = query.order_by(Notification.created_at.desc()).limit(limit).all()

    # Count unread
    unread_count = Notification.query.filter_by(
        recipient_id=current_user_id,
        is_read=False
    ).count()

    return jsonify({
        'notifications': [n.to_dict() for n in notifications],
        'unread_count': unread_count
    }), 200


@notifications_bp.route('/<int:notification_id>', methods=['GET'])
@jwt_required()
def get_notification(notification_id):
    current_user_id = get_jwt_identity()

    notification = Notification.query.get(notification_id)
    if not notification:
        return jsonify({'error': 'Notification not found'}), 404

    # Users can only view their own notifications
    if notification.recipient_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    return jsonify({'notification': notification.to_dict()}), 200


@notifications_bp.route('/', methods=['POST'])
@jwt_required()
def create_notification():
    if not require_operator_or_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    current_user_id = get_jwt_identity()
    data = request.get_json()

    # Validate required fields
    if 'recipient_id' not in data or 'title' not in data or 'message' not in data:
        return jsonify({'error': 'Recipient ID, title, and message are required'}), 400

    notification = Notification(
        sender_id=current_user_id,
        recipient_id=data['recipient_id'],
        title=data['title'],
        message=data['message'],
        notification_type=data.get('notification_type', 'general'),
        priority=data.get('priority', 'normal'),
        delivery_method=data.get('delivery_method', 'in_app'),
        related_route_id=data.get('related_route_id'),
        related_student_id=data.get('related_student_id')
    )

    db.session.add(notification)
    db.session.commit()

    # TODO: Trigger Twilio/SendGrid based on delivery_method

    return jsonify({
        'message': 'Notification sent successfully',
        'notification': notification.to_dict()
    }), 201


@notifications_bp.route('/broadcast', methods=['POST'])
@jwt_required()
def broadcast_notification():
    if not require_operator_or_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    current_user_id = get_jwt_identity()
    data = request.get_json()

    if 'title' not in data or 'message' not in data:
        return jsonify({'error': 'Title and message are required'}), 400

    # Get recipients based on criteria
    recipients_query = User.query.filter_by(is_active=True)

    # Filter by role if specified
    if data.get('recipient_role'):
        recipients_query = recipients_query.filter_by(role=data['recipient_role'])

    # Filter by route if specified
    if data.get('route_id'):
        from app.models import Student
        parent_ids = db.session.query(Student.parent_id).filter_by(
            route_id=data['route_id'],
            is_active=True
        ).distinct()
        recipients_query = recipients_query.filter(User.id.in_(parent_ids))

    recipients = recipients_query.all()

    notifications_created = []
    for recipient in recipients:
        notification = Notification(
            sender_id=current_user_id,
            recipient_id=recipient.id,
            title=data['title'],
            message=data['message'],
            notification_type=data.get('notification_type', 'general'),
            priority=data.get('priority', 'normal'),
            delivery_method=data.get('delivery_method', 'in_app'),
            related_route_id=data.get('route_id')
        )
        db.session.add(notification)
        notifications_created.append(notification)

    db.session.commit()

    return jsonify({
        'message': f'Notification sent to {len(notifications_created)} recipients',
        'recipient_count': len(notifications_created)
    }), 201


@notifications_bp.route('/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(notification_id):
    current_user_id = get_jwt_identity()

    notification = Notification.query.get(notification_id)
    if not notification:
        return jsonify({'error': 'Notification not found'}), 404

    if notification.recipient_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    notification.mark_as_read()
    db.session.commit()

    return jsonify({
        'message': 'Notification marked as read',
        'notification': notification.to_dict()
    }), 200


@notifications_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_as_read():
    current_user_id = get_jwt_identity()

    Notification.query.filter_by(
        recipient_id=current_user_id,
        is_read=False
    ).update({'is_read': True})

    db.session.commit()

    return jsonify({'message': 'All notifications marked as read'}), 200


@notifications_bp.route('/<int:notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    current_user_id = get_jwt_identity()

    notification = Notification.query.get(notification_id)
    if not notification:
        return jsonify({'error': 'Notification not found'}), 404

    if notification.recipient_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    db.session.delete(notification)
    db.session.commit()

    return jsonify({'message': 'Notification deleted'}), 200
