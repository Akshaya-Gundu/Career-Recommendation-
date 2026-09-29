import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Profile", end: true },
  { to: "/recommendations", label: "Recommendations" },
  { to: "/skill-gap", label: "Skill Gap" },
  { to: "/learning-plan", label: "Learning Plan" },
  { to: "/progress", label: "Progress" }
];

export default function Sidebar({ studentName }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        Path<span>finder</span>
      </div>
      <nav className="sidebar-nav">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        {studentName ? `Signed in as ${studentName}` : "No profile yet — start on Profile"}
      </div>
    </aside>
  );
}
