import os
from dotenv import load_dotenv

load_dotenv()

from app import create_app, db
from app.models import User, Bus, Route, Student, Notification, Boarding

app = create_app(os.environ.get('FLASK_ENV', 'development'))


@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'User': User,
        'Bus': Bus,
        'Route': Route,
        'Student': Student,
        'Notification': Notification,
        'Boarding': Boarding
    }


if __name__ == '__main__':
    app.run(debug=True, port=5000)
