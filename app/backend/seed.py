from models import db, Doctor

doctors_data = [
    {"name": "Dr. Sophie Martin",  "specialty": "Généraliste",     "avatar_url": "https://api.dicebear.com/9.x/avataaars/svg?seed=doctor1"},
    {"name": "Dr. Thomas Bernard", "specialty": "Cardiologue",     "avatar_url": "https://api.dicebear.com/9.x/avataaars/svg?seed=doctor2"},
    {"name": "Dr. Claire Dubois",  "specialty": "Pédiatre",        "avatar_url": "https://api.dicebear.com/9.x/avataaars/svg?seed=doctor3"},
    {"name": "Dr. Antoine Petit",  "specialty": "Dermatologue",    "avatar_url": "https://api.dicebear.com/9.x/avataaars/svg?seed=doctor4"},
    {"name": "Dr. Émilie Moreau",  "specialty": "Ophtalmologue",   "avatar_url": "https://api.dicebear.com/9.x/avataaars/svg?seed=doctor5"},
    {"name": "Dr. Julien Laurent", "specialty": "Gynécologue",     "avatar_url": "https://api.dicebear.com/9.x/avataaars/svg?seed=doctor6"},
]


def seed_doctors():
    if Doctor.query.count() == 0:
        for d in doctors_data:
            db.session.add(Doctor(**d))
        db.session.commit()
        print("✓ Base seedée avec 6 médecins.")
    else:
        print("→ Base déjà initialisée, seed ignoré.")


if __name__ == "__main__":
    from app import app
    with app.app_context():
        db.create_all()
        seed_doctors()
