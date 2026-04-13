from django.core.management.base import BaseCommand
from users.models import User
from events.models import Category, Event
from rsvp.models import RSVP
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Seed database with your exact 10 users, categories, events, RSVPs'

    def handle(self, *args, **options):
        self.stdout.write("Seeding EventHub...")

        # 1. Categories (exact 10)
        cat_names = ['Workshop','Hackathon','Seminar','Academic','Social','Conference','Training','Meetup','Webinar','Other']
        categories = {}
        for name in cat_names:
            cat, _ = Category.objects.get_or_create(name=name)
            categories[name] = cat

        # 2. Users (exact 10, secure Django hashing)
        users_data = [
            {"username":"wens chedo","email":"wens@gmail.com","password":"wens","full_name":"Wens Chedo","avatar":"avatars/wens_chedo.png"},
            {"username":"sam mtambo","email":"sam@gmail.com","password":"sam","full_name":"Sam Mtambo","avatar":"avatar/sam_mtambo.png"},
            {"username":"warui moche","email":"warui@gmail.com","password":"warui","full_name":"Warui Moche","avatar":"avatar/warui_moche.png"},
            {"username":"timoth kip","email":"timoth@gmail.com","password":"timoth","full_name":"Timoth Kip","avatar":"avatar/timoth_kip.png"},
            {"username":"john paul","email":"john@gmail.com","password":"john","full_name":"John Paul","avatar":"avatar/john_paul.png"},
            {"username":"charlse abongo","email":"charlse@gmail.com","password":"charles","full_name":"Charlse Abongo","avatar":"avatars/charlse_abongo.png"},
            {"username":"mary dafari","email":"mary@gmail.com","password":"mary","full_name":"Mary Dafari","avatar":"avatars/mary_dafari.png"},
            {"username":"mitshel atieno","email":"mishel@gmail.com","password":"mitchel","full_name":"Mishel Atieno","avatar":"avatars/mishel_atieno.png"},
            {"username":"joel ikapel","email":"joel@gmail.com","password":"joel","full_name":"Joel Ikapel","avatar":"avatars/joel_ikapel.png"},
            {"username":"steph wanya","email":"steph@gmail.com","password":"steph","full_name":"Steph Wanya","avatar":"avatars/steph_wanya.png"},
        ]
        users = []
        for data in users_data:
            user = User.objects.create(
                username=data["username"],
                email=data["email"],
                full_name=data["full_name"],
                avatar=data["avatar"]
            )
            user.set_password(data["password"])
            user.save()
            users.append(user)

        # 3. Events (exact 10, using categories)
        event_data = [
            ("Football Tournament","Interschool football event",1,50,0),
            ("Science Workshop","Workshop for kids",2,100,1),
            ("Health Awareness","Community health session",3,80,2),
            ("Music Concert","Local youth concert",4,60,3),
            ("Basketball Match","Friendly basketball game",5,40,4),
            ("Math Competition","Competition for students",6,70,5),
            ("Nutrition Talk","Nutrition awareness event",7,120,6),
            ("Drama Festival","Local drama and arts",8,30,7),
            ("Volleyball Game","Intercommunity volleyball",9,90,8),
            ("Coding Workshop","Introduction to coding",10,100,9),
        ]
        now = timezone.now()
        events = []
        for i, (title, desc, cat_idx, cap, org_idx) in enumerate(event_data):
            event = Event.objects.create(
                title=title,
                description=desc,
                start_time=now + timedelta(hours=i+1),
                end_time=now + timedelta(hours=i+3),
                location=["Bungoma","kakamega","Nairobi","Kakamega","kericho","Mombasa"][i%6],
                category=categories[cat_names[cat_idx-1]],
                capacity=cap,
                organizer=users[org_idx],
            )
            events.append(event)

        # 4. RSVP (exact 10)
        rsvp_data = [(0,0,"attending"),(1,1,"attending"),(2,2,"waitlisted"),(3,3,"attending"),
                     (4,4,"waitlisted"),(5,5,"attending"),(6,6,"attending"),(7,7,"attending"),
                     (8,8,"waitlisted"),(9,9,"attending")]
        for u_idx, e_idx, status in rsvp_data:
            RSVP.objects.get_or_create(user=users[u_idx], event=events[e_idx], defaults={"status": status})

        self.stdout.write(self.style.SUCCESS("✅ Seeded 10 categories, 10 users, 10 events, 10 RSVPs exactly as your SQL!"))