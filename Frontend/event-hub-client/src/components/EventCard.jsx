import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

const categoryColors = {
  workshop: { bg: "#1337ec", text: "#fff" },
  hackathon: { bg: "#f59e0b", text: "#fff" },
  social: { bg: "#0ea5e9", text: "#fff" },
  academic: { bg: "#8b5cf6", text: "#fff" },
  seminar: { bg: "#10b981", text: "#fff" },
  other: { bg: "#555", text: "#fff" },
};

const categoryBackgrounds = {
  workshop:
    "https://images.unsplash.com/photo-1755053757569-1559444c1918?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1800",
  hackathon:
    "https://images.unsplash.com/photo-1552308995-2baac1ad5490?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1800",
  social:
    "https://images.unsplash.com/photo-1593896385987-16bcbf9451e5?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1800",
  academic:
    "https://images.unsplash.com/photo-1762512346988-045f4d5ad2b3?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1800",
  seminar:
    "https://images.unsplash.com/photo-1758270705183-cf829539e436?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1800",
  other:
    "https://cdn.pixabay.com/photo/2016/09/17/21/47/audience-1677028_1280.jpg",
};

const titleSpecificBackgrounds = {
  "Cybersecurity Capture Lab":
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&fm=jpg&q=80&w=1800",
  "CyberSecurity Capture Lab":
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&fm=jpg&q=80&w=1800",
  "Surgical Innovation Grand Round":
    "https://images.unsplash.com/photo-1727830968581-d5b47227ed1a?auto=format&fit=crop&fm=jpg&q=80&w=1800",
  "Ward Leadership Conference":
    "https://images.pexels.com/photos/6129436/pexels-photo-6129436.jpeg?auto=compress&cs=tinysrgb&w=1800",
  "Molecular Discovery Showcase":
    "https://images.pexels.com/photos/2399065/pexels-photo-2399065.jpeg?auto=compress&cs=tinysrgb&w=1800",
  "Maternal Care Seminar":
    "https://images.pexels.com/photos/35645507/pexels-photo-35645507.jpeg?auto=compress&cs=tinysrgb&w=1800",
};

const titleImageKeywords = {
  "Bridge Design Sprint": ["bridge", "engineering", "architecture"],
  "Embedded Systems Workshop": ["electronics", "microcontroller", "circuit"],
  "Robotics Demo Day": ["robotics", "robot", "technology"],
  "Green Building Forum": ["sustainable", "building", "architecture"],
  "Teaching Practicum Clinic": ["teacher", "classroom", "students"],
  "Inclusive Classroom Summit": ["education", "classroom", "students"],
  "Curriculum Innovation Roundtable": ["education", "meeting", "curriculum"],
  "Literacy Outreach Day": ["reading", "books", "students"],
  "Full Stack Build Sprint": ["code", "laptop", "programming", "developer"],
  "Cybersecurity Capture Lab": ["cybersecurity", "laptop", "padlock", "security"],
  "CyberSecurity Capture Lab": ["cybersecurity", "laptop", "padlock", "security"],
  "AI and Data Science Forum": ["artificial-intelligence", "data", "analytics"],
  "Cloud Computing Hack Night": ["cloud", "server", "coding"],
  "Clinical Skills Bootcamp": ["medical", "hospital", "training"],
  "Surgical Innovation Grand Round": ["doctor", "operating", "patient", "surgery"],
  "Research Ethics Colloquium": ["research", "laboratory", "science", "microscope"],
  "Community Health Screening": ["healthcare", "community", "clinic"],
  "Startup Pitch Arena": ["startup", "pitch", "business"],
  "Market Trends Briefing": ["finance", "market", "charts"],
  "Office Leadership Mixer": ["business", "networking", "office"],
  "Financial Modelling Lab": ["budget", "analysis", "financial", "report"],
  "Lab Safety and Technique Workshop": ["science", "laboratory", "equipment"],
  "Molecular Discovery Showcase": ["science", "molecule", "microscope"],
  "Science Communication Forum": ["science", "speaker", "audience"],
  "Experiment Night Live": ["science", "experiment", "students"],
  "Emergency Response Drill": ["ambulance", "emergency", "training"],
  "Maternal Care Seminar": ["doctor", "nurse", "maternity", "hospital"],
  "Ward Leadership Conference": ["doctor", "nurses", "meeting", "hospital-team"],
  "First Aid Community Camp": ["first-aid", "kit", "medical", "emergency"],
};

const titleStopWords = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "for",
  "of",
  "to",
  "in",
  "on",
  "with",
  "at",
  "by",
  "from",
  "event",
  "events",
  "campus",
]);

const hashTitle = (title = "") => {
  let hash = 0;
  for (let index = 0; index < title.length; index += 1) {
    hash = (hash << 5) - hash + title.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const buildTitleImageUrl = (title = "", keywords = []) => {
  if (keywords.length === 0) {
    return "";
  }
  const encodedKeywords = keywords.map((keyword) => encodeURIComponent(keyword)).join(",");
  return `https://loremflickr.com/1600/900/${encodedKeywords}?lock=${hashTitle(title)}`;
};

const getTitleSpecificImage = (title = "") => {
  const keywords = titleImageKeywords[title];
  return keywords ? buildTitleImageUrl(title, keywords) : "";
};

const getTitleSearchImage = (title = "") => {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !titleStopWords.has(word))
    .slice(0, 4);

  if (words.length === 0) {
    return "";
  }

  return buildTitleImageUrl(title, [...words, "student", "event"]);
};

const getEventBackground = (event) => {
  const exactBackground = titleSpecificBackgrounds[event.title];
  if (exactBackground) {
    return exactBackground;
  }

  const exactTitleImage = getTitleSpecificImage(event.title);
  if (exactTitleImage) {
    return exactTitleImage;
  }

  const titleQueried = getTitleSearchImage(event.title);
  if (titleQueried) {
    return titleQueried;
  }

  return event.school?.background_image || categoryBackgrounds[event.category] || categoryBackgrounds.other;
};

function EventCard({ event }) {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();
  const cat = categoryColors[event.category] || { bg: "#555", text: "#fff" };
  const eventBackground = getEventBackground(event);

  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const dateStr = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const timeStr = `${startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })} - ${endDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;

  return (
    <div
      className="card h-100 border-0 rounded-3 overflow-hidden"
      style={{
        background: "#1b1f2f",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
      onClick={() => navigate({ to: "/EventDetailPage", search: { eventId: event.id } })}
    >
      <div
        className="position-relative"
        style={{
          height: 180,
          backgroundColor: "#1e2235",
          backgroundImage: `linear-gradient(180deg, rgba(7, 20, 38, 0.1), rgba(7, 20, 38, 0.7)), url(${eventBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {event.is_upcoming && (
          <span
            className="position-absolute top-0 start-0 m-2 badge text-uppercase"
            style={{ background: "#0e33f0", fontSize: "0.65rem", letterSpacing: 1 }}
          >
            Upcoming
          </span>
        )}
        <button
          className="position-absolute top-0 end-0 m-2 btn btn-sm rounded-circle d-flex align-items-center justify-content-center p-0"
          style={{
            width: 34,
            height: 34,
            background: liked ? "rgba(239,68,68,0.9)" : "rgba(30,34,53,0.85)",
            border: "none",
          }}
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
        >
          <i
            className={`bi ${liked ? "bi-heart-fill" : "bi-heart"} text-white`}
            style={{ fontSize: "0.85rem" }}
          ></i>
        </button>
      </div>

      <div className="card-body px-3 pt-3 pb-2">
        <div className="d-flex align-items-center gap-2 mb-2">
          <span
            className="badge text-uppercase"
            style={{
              background: cat.bg,
              color: cat.text,
              fontSize: "0.6rem",
              letterSpacing: 1,
            }}
          >
            {event.category}
          </span>
          <span className="text-secondary" style={{ fontSize: "0.75rem" }}>
            {dateStr} &bull; {timeStr}
          </span>
        </div>
        <h6 className="card-title text-white fw-bold mb-1">{event.title}</h6>
        <div className="mb-2" style={{ color: "#7dd3fc", fontSize: "0.76rem" }}>
          {event.school?.code} - {event.organizer_name || event.organizer_email}
        </div>
        <p
          className="card-text text-secondary mb-3"
          style={{ fontSize: "0.82rem", lineHeight: 1.5 }}
        >
          {event.description}
        </p>
      </div>

      <div className="card-footer border-0 bg-transparent px-3 pb-3 pt-0 d-flex justify-content-between align-items-center">
        <span className="text-secondary d-flex align-items-center gap-1" style={{ fontSize: "0.78rem" }}>
          <i className="bi bi-geo-alt"></i> {event.location || "TBD"}
        </span>
        <span
          className="text-primary fw-semibold d-flex align-items-center gap-1"
          style={{ fontSize: "0.82rem" }}
        >
          Details <i className="bi bi-chevron-right" style={{ fontSize: "0.7rem" }}></i>
        </span>
      </div>
    </div>
  );
}

export default EventCard;
