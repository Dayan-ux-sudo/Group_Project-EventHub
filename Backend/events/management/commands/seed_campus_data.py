from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from events.models import Event, School
from rsvp.models import RSVP
from users.models import User


SCHOOLS = [
    {
        "code": "SEBE",
        "name": "School of Engineering and Building Environment",
        "description": "Engineering design, infrastructure, robotics, and built environment innovation.",
        "background_image": "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1600&q=80",
        "admin": {"email": "sebe.admin@eventhub.local", "full_name": "SEBE Organizer"},
        "events": [
            ("Bridge Design Sprint", "academic", "Civil lab teams prototype resilient bridge concepts."),
            ("Embedded Systems Workshop", "workshop", "Hands-on microcontroller programming and sensor integration."),
            ("Robotics Demo Day", "academic", "Student robotics teams showcase autonomous campus solutions."),
            ("Green Building Forum", "seminar", "Talks on sustainable construction and smart building systems."),
        ],
    },
    {
        "code": "SEDU",
        "name": "School of Education",
        "description": "Teaching practice, pedagogy, classroom leadership, and educational research.",
        "background_image": "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80",
        "admin": {"email": "sedu.admin@eventhub.local", "full_name": "SEDU Organizer"},
        "events": [
            ("Teaching Practicum Clinic", "workshop", "Peer coaching on lesson planning and classroom delivery."),
            ("Inclusive Classroom Summit", "academic", "Strategies for accessible learning environments."),
            ("Curriculum Innovation Roundtable", "seminar", "Faculty and students review emerging curriculum trends."),
            ("Literacy Outreach Day", "social", "Community reading mentorship with local schools."),
        ],
    },
    {
        "code": "SCI",
        "name": "School of Computing and Informatics",
        "description": "Software engineering, cybersecurity, data systems, AI, and practical computing innovation.",
        "background_image": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1600&q=80",
        "admin": {"email": "sci.admin@eventhub.local", "full_name": "SCI Organizer"},
        "events": [
            ("Full Stack Build Sprint", "workshop", "Student teams build and deploy end-to-end web applications."),
            ("Cybersecurity Capture Lab", "academic", "Hands-on secure systems challenge with incident response tasks."),
            ("AI and Data Science Forum", "seminar", "Discussions on machine learning workflows and responsible AI."),
            ("Cloud Computing Hack Night", "social", "Collaborative cloud engineering session with live coding stations."),
        ],
    },
    {
        "code": "SME",
        "name": "School of Medicine",
        "description": "Clinical excellence, patient safety, surgical practice, and medical research.",
        "background_image": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1600&q=80",
        "admin": {"email": "sme.admin@eventhub.local", "full_name": "SME Organizer"},
        "events": [
            ("Clinical Skills Bootcamp", "workshop", "Simulation stations for acute care and patient assessment."),
            ("Surgical Innovation Grand Round", "academic", "Emerging surgical tools and operative case reviews."),
            ("Research Ethics Colloquium", "seminar", "Responsible conduct and consent in medical studies."),
            ("Community Health Screening", "social", "Volunteer-led screening and public health awareness."),
        ],
    },
    {
        "code": "SOBE",
        "name": "School of Business and Economics",
        "description": "Entrepreneurship, finance, strategy, economics, and professional networking.",
        "background_image": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=80",
        "admin": {"email": "sobe.admin@eventhub.local", "full_name": "SOBE Organizer"},
        "events": [
            ("Startup Pitch Arena", "academic", "Students present business models to alumni mentors."),
            ("Market Trends Briefing", "seminar", "Economic outlook and investment insights for campus founders."),
            ("Office Leadership Mixer", "social", "Networking with industry managers and entrepreneurs."),
            ("Financial Modelling Lab", "workshop", "Spreadsheet-driven valuation and budgeting session."),
        ],
    },
    {
        "code": "SONAS",
        "name": "School of Natural Sciences",
        "description": "Laboratory science, experimentation, scientific communication, and discovery.",
        "background_image": "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1600&q=80",
        "admin": {"email": "sonas.admin@eventhub.local", "full_name": "SONAS Organizer"},
        "events": [
            ("Lab Safety and Technique Workshop", "workshop", "Safe handling, calibration, and experiment setup."),
            ("Molecular Discovery Showcase", "academic", "Student posters on biology and chemistry research."),
            ("Science Communication Forum", "seminar", "Translating complex findings for public audiences."),
            ("Experiment Night Live", "social", "Interactive science demos and collaborative challenges."),
        ],
    },
    {
        "code": "SONMAPS",
        "name": "School of Nursing, MidWifery and Paramedic Services",
        "description": "Emergency response, patient care, maternal health, and field practice.",
        "background_image": "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1600&q=80",
        "admin": {"email": "sonmaps.admin@eventhub.local", "full_name": "SONMAPS Organizer"},
        "events": [
            ("Emergency Response Drill", "workshop", "Paramedic teams rehearse trauma and ambulance response."),
            ("Maternal Care Seminar", "seminar", "Midwifery students discuss safe delivery practices."),
            ("Ward Leadership Conference", "academic", "Patient flow, care coordination, and documentation."),
            ("First Aid Community Camp", "social", "Practical first aid services and outreach training."),
        ],
    },
]


class Command(BaseCommand):
    help = "Seed schools, organizers, events, and the EventHub superuser."

    def handle(self, *args, **options):
        now = timezone.now()

        superuser, _ = User.objects.update_or_create(
            email="superuser@eventhub.local",
            defaults={
                "username": "eventhub.superuser",
                "full_name": "EventHub Superuser",
                "role": "superuser_manager",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        superuser.set_password("SuperAdmin123!")
        superuser.save()

        attendee, _ = User.objects.update_or_create(
            email="student@eventhub.local",
            defaults={
                "username": "eventhub.student",
                "full_name": "Campus Student",
                "role": "student",
            },
        )
        attendee.set_password("Student123!")
        attendee.save()
        RSVP.objects.filter(user=attendee).update(status="cancelled")

        for school_index, school_data in enumerate(SCHOOLS):
            school, _ = School.objects.update_or_create(
                code=school_data["code"],
                defaults={
                    "name": school_data["name"],
                    "description": school_data["description"],
                    "background_image": school_data["background_image"],
                },
            )

            admin_defaults = {
                "username": school_data["admin"]["email"].split("@")[0],
                "full_name": school_data["admin"]["full_name"],
                "role": "organizer",
                "school": school,
                "is_staff": True,
            }
            organizer, _ = User.objects.update_or_create(
                email=school_data["admin"]["email"],
                defaults=admin_defaults,
            )
            organizer.set_password("Organizer123!")
            organizer.save()

            for event_index, (title, category, description) in enumerate(school_data["events"]):
                start_time = now + timedelta(days=(school_index * 4) + event_index + 1, hours=9 + event_index)
                end_time = start_time + timedelta(hours=2)
                event, _ = Event.objects.update_or_create(
                    school=school,
                    title=title,
                    defaults={
                        "description": description,
                        "start_time": start_time,
                        "end_time": end_time,
                        "location": f"{school.code} Innovation Hub",
                        "latitude": -1.286389 + (school_index * 0.01),
                        "longitude": 36.817223 + (event_index * 0.01),
                        "category": category,
                        "capacity": 120 + (event_index * 20),
                        "organizer": organizer,
                        "is_public": True,
                    },
                )
        self.stdout.write(self.style.SUCCESS("Seeded schools, organizers, events, and superuser."))
        self.stdout.write("Superuser login: superuser@eventhub.local / SuperAdmin123!")
