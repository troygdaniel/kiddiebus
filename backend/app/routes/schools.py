from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import School, User

schools_bp = Blueprint('schools', __name__)


def require_operator_or_admin():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    return user and user.role in ['admin', 'operator']


@schools_bp.route('/', methods=['GET'])
@jwt_required()
def get_schools():
    """Get all schools. Operators see their own schools, admin sees all."""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    query = School.query.filter_by(is_active=True)

    # Operators can only see their own schools
    if current_user.role == 'operator':
        query = query.filter_by(operator_id=current_user_id)

    schools = query.order_by(School.name).all()
    return jsonify({'schools': [school.to_dict() for school in schools]}), 200


@schools_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_schools():
    """Get all active schools (for dropdowns). Available to all authenticated users."""
    schools = School.query.filter_by(is_active=True).order_by(School.name).all()
    return jsonify({'schools': [school.to_dict() for school in schools]}), 200


@schools_bp.route('/<int:school_id>', methods=['GET'])
@jwt_required()
def get_school(school_id):
    school = School.query.get(school_id)
    if not school:
        return jsonify({'error': 'School not found'}), 404

    return jsonify({'school': school.to_dict()}), 200


@schools_bp.route('/', methods=['POST'])
@jwt_required()
def create_school():
    if not require_operator_or_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    current_user_id = int(get_jwt_identity())
    data = request.get_json()

    if 'name' not in data:
        return jsonify({'error': 'School name is required'}), 400

    school = School(
        name=data['name'],
        address=data.get('address'),
        city=data.get('city', 'Mandeville'),
        parish=data.get('parish', 'Manchester'),
        phone=data.get('phone'),
        email=data.get('email'),
        operator_id=current_user_id
    )

    db.session.add(school)
    db.session.commit()

    return jsonify({
        'message': 'School created successfully',
        'school': school.to_dict()
    }), 201


@schools_bp.route('/<int:school_id>', methods=['PUT'])
@jwt_required()
def update_school(school_id):
    if not require_operator_or_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    school = School.query.get(school_id)
    if not school:
        return jsonify({'error': 'School not found'}), 404

    # Operators can only update their own schools
    if current_user.role == 'operator' and school.operator_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()

    if 'name' in data:
        school.name = data['name']
    if 'address' in data:
        school.address = data['address']
    if 'city' in data:
        school.city = data['city']
    if 'parish' in data:
        school.parish = data['parish']
    if 'phone' in data:
        school.phone = data['phone']
    if 'email' in data:
        school.email = data['email']

    db.session.commit()

    return jsonify({
        'message': 'School updated successfully',
        'school': school.to_dict()
    }), 200


@schools_bp.route('/<int:school_id>', methods=['DELETE'])
@jwt_required()
def delete_school(school_id):
    if not require_operator_or_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    school = School.query.get(school_id)
    if not school:
        return jsonify({'error': 'School not found'}), 404

    # Operators can only delete their own schools
    if current_user.role == 'operator' and school.operator_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    # Soft delete
    school.is_active = False
    db.session.commit()

    return jsonify({'message': 'School deleted successfully'}), 200


@schools_bp.route('/<int:school_id>/students', methods=['GET'])
@jwt_required()
def get_school_students(school_id):
    """Get all students for a specific school."""
    if not require_operator_or_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    school = School.query.get(school_id)
    if not school:
        return jsonify({'error': 'School not found'}), 404

    students = school.students.filter_by(is_active=True).all()
    return jsonify({
        'school_id': school_id,
        'students': [student.to_dict() for student in students]
    }), 200
