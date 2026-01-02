from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models import Route, User

routes_bp = Blueprint('routes', __name__)


def require_operator_or_admin():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    return user and user.role in ['admin', 'operator']


@routes_bp.route('/', methods=['GET'])
@jwt_required()
def get_routes():
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    query = Route.query

    # Filter by status
    status = request.args.get('status')
    if status:
        query = query.filter_by(status=status)

    # Filter by operator
    operator_id = request.args.get('operator_id')
    if operator_id:
        query = query.filter_by(operator_id=operator_id)

    # If operator, show only their routes
    if current_user.role == 'operator':
        query = query.filter_by(operator_id=current_user_id)

    routes = query.all()
    return jsonify({'routes': [route.to_dict() for route in routes]}), 200


@routes_bp.route('/<int:route_id>', methods=['GET'])
@jwt_required()
def get_route(route_id):
    route = Route.query.get(route_id)
    if not route:
        return jsonify({'error': 'Route not found'}), 404

    return jsonify({'route': route.to_dict()}), 200


@routes_bp.route('/', methods=['POST'])
@jwt_required()
def create_route():
    if not require_operator_or_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    current_user_id = int(get_jwt_identity())
    data = request.get_json()

    if 'name' not in data:
        return jsonify({'error': 'Route name is required'}), 400

    route = Route(
        name=data['name'],
        description=data.get('description'),
        bus_id=data.get('bus_id'),
        operator_id=data.get('operator_id', current_user_id),
        start_location=data.get('start_location'),
        end_location=data.get('end_location'),
        start_latitude=data.get('start_latitude'),
        start_longitude=data.get('start_longitude'),
        end_latitude=data.get('end_latitude'),
        end_longitude=data.get('end_longitude'),
        days_of_week=','.join(data.get('days_of_week', [])) if isinstance(data.get('days_of_week'), list) else data.get('days_of_week'),
        status=data.get('status', 'active'),
        is_morning_route=data.get('is_morning_route', True)
    )

    # Parse times if provided
    if data.get('scheduled_start_time'):
        try:
            route.scheduled_start_time = datetime.strptime(data['scheduled_start_time'], '%H:%M').time()
        except ValueError:
            pass

    if data.get('scheduled_end_time'):
        try:
            route.scheduled_end_time = datetime.strptime(data['scheduled_end_time'], '%H:%M').time()
        except ValueError:
            pass

    db.session.add(route)
    db.session.commit()

    return jsonify({
        'message': 'Route created successfully',
        'route': route.to_dict()
    }), 201


@routes_bp.route('/<int:route_id>', methods=['PUT'])
@jwt_required()
def update_route(route_id):
    if not require_operator_or_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    route = Route.query.get(route_id)
    if not route:
        return jsonify({'error': 'Route not found'}), 404

    data = request.get_json()

    if 'name' in data:
        route.name = data['name']
    if 'description' in data:
        route.description = data['description']
    if 'bus_id' in data:
        route.bus_id = data['bus_id']
    if 'start_location' in data:
        route.start_location = data['start_location']
    if 'end_location' in data:
        route.end_location = data['end_location']
    if 'start_latitude' in data:
        route.start_latitude = data['start_latitude']
    if 'start_longitude' in data:
        route.start_longitude = data['start_longitude']
    if 'end_latitude' in data:
        route.end_latitude = data['end_latitude']
    if 'end_longitude' in data:
        route.end_longitude = data['end_longitude']
    if 'days_of_week' in data:
        route.days_of_week = ','.join(data['days_of_week']) if isinstance(data['days_of_week'], list) else data['days_of_week']
    if 'status' in data:
        route.status = data['status']
    if 'is_morning_route' in data:
        route.is_morning_route = data['is_morning_route']

    if data.get('scheduled_start_time'):
        try:
            route.scheduled_start_time = datetime.strptime(data['scheduled_start_time'], '%H:%M').time()
        except ValueError:
            pass

    if data.get('scheduled_end_time'):
        try:
            route.scheduled_end_time = datetime.strptime(data['scheduled_end_time'], '%H:%M').time()
        except ValueError:
            pass

    db.session.commit()

    return jsonify({
        'message': 'Route updated successfully',
        'route': route.to_dict()
    }), 200


@routes_bp.route('/<int:route_id>', methods=['DELETE'])
@jwt_required()
def delete_route(route_id):
    if not require_operator_or_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    route = Route.query.get(route_id)
    if not route:
        return jsonify({'error': 'Route not found'}), 404

    # Soft delete
    route.status = 'inactive'
    db.session.commit()

    return jsonify({'message': 'Route deactivated successfully'}), 200


@routes_bp.route('/<int:route_id>/students', methods=['GET'])
@jwt_required()
def get_route_students(route_id):
    route = Route.query.get(route_id)
    if not route:
        return jsonify({'error': 'Route not found'}), 404

    students = route.students.filter_by(is_active=True).all()
    return jsonify({
        'route_id': route_id,
        'students': [student.to_dict() for student in students]
    }), 200
