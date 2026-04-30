import React from "react";

const categories = [
  { label: "All Events", icon: "bi-grid-fill", value: "all" }, 
  { label: "Workshop", icon: "bi-code-slash", value: "workshop" },
  { label: "Hackathon", icon: "bi-terminal-fill", value: "hackathon" },
  { label: "Social", icon: "bi-people-fill", value: "social" },
  { label: "Academic", icon: "bi-mortarboard-fill", value: "academic" },
  { label: "Seminar", icon: "bi-chat-dots-fill", value: "seminar" },
  { label: "Other", icon: "bi-three-dots", value: "other" },
];

function CategoryFilter({ active, onChange }) {
  return (
    <div
      className="d-flex gap-2 overflow-auto pb-1"
      style={{ scrollbarWidth: "none" }}
    >
      {categories.map((cat) => (
        <button
          key={cat.value}
          type="button" 
          aria-pressed={active === cat.value}
          className="btn d-flex align-items-center gap-2 text-nowrap rounded-pill px-4"
          style={{
            height: 40,
            background: active === cat.value ? "#1337ec" : "#1e2235",
            color: active === cat.value ? "#fff" : "#94a3b8",
            border: active === cat.value ? "none" : "1px solid #2a3050",
            fontWeight: active === cat.value ? 600 : 400,
            fontSize: "0.85rem",
            boxShadow:
              active === cat.value
                ? "0 4px 16px rgba(19,55,236,0.3)"
                : "none",
            transition: "all 0.2s",
          }}
          onClick={() => onChange(cat.value)}
        >
          <i className={`bi ${cat.icon}`}></i>
          {cat.label}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;