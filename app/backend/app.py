import os
import time
from datetime import datetime
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from models import db, Doctor, Appointment

app = Flask(__name__)
CORS(app)

DB_HOST = os.environ.get("DB_HOST")
DB_NAME = os.environ.get("DB_NAME", "medibook")
DB_USER = os.environ.get("DB_USER", "medibook")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "medibook")

if DB_HOST:
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:5432/{DB_NAME}"
    )
else:
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///medibook.db"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)


def init_db():
    with app.app_context():
        retries = 30
        while retries > 0:
            try:
                db.create_all()
                if Doctor.query.count() == 0:
                    from seed import seed_doctors
                    seed_doctors()
                return
            except Exception as e:
                retries -= 1
                if retries == 0:
                    raise
                time.sleep(1)


init_db()


@app.before_request
def _ensure_db():
    if not hasattr(g, '_db_checked'):
        try:
            db.session.execute(db.text('SELECT 1'))
        except Exception:
            init_db()
        g._db_checked = True


@app.route("/api/doctors")
def get_doctors():
    query = Doctor.query
    specialty = request.args.get("specialty")
    if specialty:
        query = query.filter(Doctor.specialty.ilike(f"%{specialty}%"))
    doctors = query.all()
    return jsonify([d.to_dict() for d in doctors])


@app.route("/api/appointments", methods=["GET"])
def get_appointments():
    appointments = Appointment.query.order_by(Appointment.date.desc()).all()
    return jsonify([a.to_dict() for a in appointments])


@app.route("/api/appointments", methods=["POST"])
def create_appointment():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Données JSON requises"}), 400

    required = ["patient_name", "doctor_id", "date", "time_slot"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Champ manquant : {field}"}), 400

    doctor = db.session.get(Doctor, data["doctor_id"])
    if not doctor:
        return jsonify({"error": "Médecin introuvable"}), 404

    try:
        parsed_date = datetime.strptime(data["date"], "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return jsonify({"error": "Format de date invalide (attendu : YYYY-MM-DD)"}), 400

    appointment = Appointment(
        patient_name=data["patient_name"],
        doctor_id=data["doctor_id"],
        date=parsed_date,
        time_slot=data["time_slot"],
        reason=data.get("reason", ""),
        status="pending",
    )
    db.session.add(appointment)
    db.session.commit()
    return jsonify(appointment.to_dict()), 201


@app.route("/api/appointments/<int:appointment_id>", methods=["DELETE"])
def delete_appointment(appointment_id):
    appointment = db.session.get(Appointment, appointment_id)
    if not appointment:
        return jsonify({"error": "Rendez-vous introuvable"}), 404
    db.session.delete(appointment)
    db.session.commit()
    return jsonify({"message": "Rendez-vous annulé"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
