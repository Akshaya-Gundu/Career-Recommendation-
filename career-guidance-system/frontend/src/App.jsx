import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import ProfileForm from "./pages/ProfileForm.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import SkillGap from "./pages/SkillGap.jsx";
import LearningPlan from "./pages/LearningPlan.jsx";
import ProgressTracker from "./pages/ProgressTracker.jsx";

export default function App() {
  const [studentId, setStudentId] = useState(() => localStorage.getItem("studentId") || null);
  const [studentName, setStudentName] = useState(() => localStorage.getItem("studentName") || "");
  const [selectedCareer, setSelectedCareer] = useState(() => {
    const raw = localStorage.getItem("selectedCareer");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (studentId) localStorage.setItem("studentId", studentId);
  }, [studentId]);

  useEffect(() => {
    if (studentName) localStorage.setItem("studentName", studentName);
  }, [studentName]);

  useEffect(() => {
    if (selectedCareer) localStorage.setItem("selectedCareer", JSON.stringify(selectedCareer));
  }, [selectedCareer]);

  function handleProfileCreated(student) {
    setStudentId(String(student.id));
    setStudentName(student.name);
  }

  return (
    <div className="app-shell">
      <Sidebar studentName={studentName} />
      <main className="main">
        <Routes>
          <Route path="/" element={<ProfileForm onCreated={handleProfileCreated} />} />
          <Route
            path="/recommendations"
            element={
              <Recommendations
                studentId={studentId}
                onSelectCareer={setSelectedCareer}
              />
            }
          />
          <Route
            path="/skill-gap"
            element={<SkillGap studentId={studentId} career={selectedCareer} />}
          />
          <Route
            path="/learning-plan"
            element={<LearningPlan studentId={studentId} career={selectedCareer} />}
          />
          <Route
            path="/progress"
            element={<ProgressTracker studentId={studentId} career={selectedCareer} />}
          />
        </Routes>
      </main>
    </div>
  );
}
