from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models import Student, User, Boarding

students_bp = Blueprint('students', __name__)


def require_operator_or_admin():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    return user and user.role in ['admin', 'operator']


@students_bp.route('/', methods=['GET'])
@jwt_required()
def get_students():
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    query = Student.query.filter_by(is_active=True)

    # Parents can only see their own children
    if current_user.role == 'parent':
        query = query.filter_by(parent_id=current_user_id)

    # Filter by route if provided
    route_id = request.args.get('route_id')
    if route_id:
        query = query.filter_by(route_id=route_id)

    students = query.all()
    return jsonify({'students': [student.to_dict() for student in students]}), 200


@students_bp.route('/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student(student_id):
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    student = Student.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    # Parents can only view their own children
    if current_user.role == 'parent' and student.parent_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    return jsonify({'student': student.to_dict()}), 200


@students_bp.route('/', methods=['POST'])
@jwt_required()
def create_student():
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    data = request.get_json()

    # Validate required fields
    if 'first_name' not in data or 'last_name' not in data:
        return jsonify({'error': 'First name and last name are required'}), 400

    # Determine parent_id
    if current_user.role == 'parent':
        parent_id = current_user_id
    else:
        parent_id = data.get('parent_id')
        if not parent_id:
            return jsonify({'error': 'Parent ID is required'}), 400

    student = Student(
        first_name=data['first_name'],
        last_name=data['last_name'],
        grade=data.get('grade'),
        school_name=data.get('school_name'),
        school_id=data.get('school_id'),
        parent_id=parent_id,
        route_id=data.get('route_id'),
        pickup_address=data.get('pickup_address'),
        pickup_latitude=data.get('pickup_latitude'),
        pickup_longitude=data.get('pickup_longitude'),
        dropoff_address=data.get('dropoff_address'),
        dropoff_latitude=data.get('dropoff_latitude'),
        dropoff_longitude=data.get('dropoff_longitude')
    )

    # Parse date of birth if provided
    if data.get('date_of_birth'):
        try:
            student.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        except ValueError:
            pass

    # Generate card ID for check-in
    student.generate_card_id()

    db.session.add(student)
    db.session.commit()

    return jsonify({
        'message': 'Student registered successfully',
        'student': student.to_dict()
    }), 201


@students_bp.route('/<int:student_id>', methods=['PUT'])
@jwt_required()
def update_student(student_id):
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    student = Student.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    # Parents can only update their own children
    if current_user.role == 'parent' and student.parent_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()

    if 'first_name' in data:
        student.first_name = data['first_name']
    if 'last_name' in data:
        student.last_name = data['last_name']
    if 'grade' in data:
        student.grade = data['grade']
    if 'school_name' in data:
        student.school_name = data['school_name']
    if 'school_id' in data:
        student.school_id = data['school_id']
    if 'route_id' in data:
        student.route_id = data['route_id']
    if 'pickup_address' in data:
        student.pickup_address = data['pickup_address']
    if 'pickup_latitude' in data:
        student.pickup_latitude = data['pickup_latitude']
    if 'pickup_longitude' in data:
        student.pickup_longitude = data['pickup_longitude']
    if 'dropoff_address' in data:
        student.dropoff_address = data['dropoff_address']
    if 'dropoff_latitude' in data:
        student.dropoff_latitude = data['dropoff_latitude']
    if 'dropoff_longitude' in data:
        student.dropoff_longitude = data['dropoff_longitude']

    if data.get('date_of_birth'):
        try:
            student.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        except ValueError:
            pass

    db.session.commit()

    return jsonify({
        'message': 'Student updated successfully',
        'student': student.to_dict()
    }), 200


@students_bp.route('/<int:student_id>', methods=['DELETE'])
@jwt_required()
def delete_student(student_id):
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    student = Student.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    # Parents can only delete their own children
    if current_user.role == 'parent' and student.parent_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    # Soft delete
    student.is_active = False
    db.session.commit()

    return jsonify({'message': 'Student removed successfully'}), 200


@students_bp.route('/card/<card_id>', methods=['GET'])
@jwt_required()
def get_student_by_card(card_id):
    if not require_operator_or_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    student = Student.query.filter_by(card_id=card_id, is_active=True).first()
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    return jsonify({'student': student.to_dict()}), 200


@students_bp.route('/<int:student_id>/checkin', methods=['POST'])
@jwt_required()
def checkin_student(student_id):
    if not require_operator_or_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    current_user_id = int(get_jwt_identity())

    student = Student.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    data = request.get_json()

    if 'bus_id' not in data or 'boarding_type' not in data:
        return jsonify({'error': 'Bus ID and boarding type are required'}), 400

    boarding = Boarding(
        student_id=student_id,
        bus_id=data['bus_id'],
        route_id=data.get('route_id', student.route_id),
        boarding_type=data['boarding_type'],  # pickup or dropoff
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
        verified_by_id=current_user_id,
        verification_method=data.get('verification_method', 'card'),
        notes=data.get('notes')
    )

    db.session.add(boarding)
    db.session.commit()

    return jsonify({
        'message': f'Student {data["boarding_type"]} recorded successfully',
        'boarding': boarding.to_dict()
    }), 201


@students_bp.route('/<int:student_id>/boardings', methods=['GET'])
@jwt_required()
def get_student_boardings(student_id):
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    student = Student.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    # Parents can only view their own children's boardings
    if current_user.role == 'parent' and student.parent_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    # Get recent boardings (last 30 days by default)
    boardings = student.boardings.order_by(Boarding.boarding_time.desc()).limit(50).all()

    return jsonify({
        'student_id': student_id,
        'boardings': [boarding.to_dict() for boarding in boardings]
    }), 200
