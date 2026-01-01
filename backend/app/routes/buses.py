from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models import Bus, User

buses_bp = Blueprint('buses', __name__)


def require_operator_or_admin():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return user and user.role in ['admin', 'operator']


@buses_bp.route('/', methods=['GET'])
@jwt_required()
def get_buses():
    status = request.args.get('status')
    query = Bus.query

    if status:
        query = query.filter_by(status=status)

    buses = query.all()
    return jsonify({'buses': [bus.to_dict() for bus in buses]}), 200


@buses_bp.route('/<int:bus_id>', methods=['GET'])
@jwt_required()
def get_bus(bus_id):
    bus = Bus.query.get(bus_id)
    if not bus:
        return jsonify({'error': 'Bus not found'}), 404

    return jsonify({'bus': bus.to_dict()}), 200


@buses_bp.route('/', methods=['POST'])
@jwt_required()
def create_bus():
    if not require_operator_or_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()

    # Validate required fields
    if 'registration_number' not in data or 'capacity' not in data:
        return jsonify({'error': 'Registration number and capacity are required'}), 400

    # Check for duplicate registration
    if Bus.query.filter_by(registration_number=data['registration_number']).first():
        return jsonify({'error': 'Bus with this registration number already exists'}), 409

    bus = Bus(
        registration_number=data['registration_number'],
        capacity=data['capacity'],
        make=data.get('make'),
        model=data.get('model'),
        year=data.get('year'),
        status=data.get('status', 'active')
    )

    db.session.add(bus)
    db.session.commit()

    return jsonify({
        'message': 'Bus created successfully',
        'bus': bus.to_dict()
    }), 201


@buses_bp.route('/<int:bus_id>', methods=['PUT'])
@jwt_required()
def update_bus(bus_id):
    if not require_operator_or_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    bus = Bus.query.get(bus_id)
    if not bus:
        return jsonify({'error': 'Bus not found'}), 404

    data = request.get_json()

    if 'registration_number' in data:
        # Check for duplicate registration
        existing = Bus.query.filter_by(registration_number=data['registration_number']).first()
        if existing and existing.id != bus_id:
            return jsonify({'error': 'Bus with this registration number already exists'}), 409
        bus.registration_number = data['registration_number']

    if 'capacity' in data:
        bus.capacity = data['capacity']
    if 'make' in data:
        bus.make = data['make']
    if 'model' in data:
        bus.model = data['model']
    if 'year' in data:
        bus.year = data['year']
    if 'status' in data:
        bus.status = data['status']

    db.session.commit()

    return jsonify({
        'message': 'Bus updated successfully',
        'bus': bus.to_dict()
    }), 200


@buses_bp.route('/<int:bus_id>/location', methods=['PUT'])
@jwt_required()
def update_bus_location(bus_id):
    if not require_operator_or_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    bus = Bus.query.get(bus_id)
    if not bus:
        return jsonify({'error': 'Bus not found'}), 404

    data = request.get_json()

    if 'latitude' not in data or 'longitude' not in data:
        return jsonify({'error': 'Latitude and longitude are required'}), 400

    bus.current_latitude = data['latitude']
    bus.current_longitude = data['longitude']
    bus.last_location_update = datetime.utcnow()

    db.session.commit()

    return jsonify({
        'message': 'Location updated successfully',
        'bus': bus.to_dict()
    }), 200


@buses_bp.route('/<int:bus_id>', methods=['DELETE'])
@jwt_required()
def delete_bus(bus_id):
    if not require_operator_or_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    bus = Bus.query.get(bus_id)
    if not bus:
        return jsonify({'error': 'Bus not found'}), 404

    # Soft delete - set to inactive
    bus.status = 'inactive'
    db.session.commit()

    return jsonify({'message': 'Bus deactivated successfully'}), 200
