import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { api } from "../api";

const STEP = 25;

export default function ProgressTracker({ studentId, career }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId || !career) {
      setLoading(false);
      return;
    }
    load();
  }, [studentId, career]);

  function load() {
    setLoading(true);
    api
      .getProgress(studentId, career.id)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  async function adjust(skillRow, delta) {
    const next = Math.max(0, Math.min(100, skillRow.progressPercent + delta));
    try {
      await api.updateProgress(skillRow.id, { progressPercent: next });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  if (!studentId) {
    return (
      <div>
        <h1 className="section-heading">Progress</h1>
        <div className="empty-state">Create your profile first.</div>
      </div>
    );
  }
  if (!career) {
    return (
      <div>
        <h1 className="section-heading">Progress</h1>
        <div className="empty-state">
          Choose a target career from <Link to="/recommendations">Recommendations</Link> first.
        </div>
      </div>
    );
  }

  const chartData = data
    ? [
        { name: "Complete", value: data.overallProgressPercent },
        { name: "Remaining", value: 100 - data.overallProgressPercent }
      ]
    : [];

  return (
    <div>
      <h1 className="section-heading">Progress toward {career.name}</h1>
      <p className="section-sub">
        Update as you complete each skill. This drives your overall readiness score below.
      </p>

      {error && <div className="error-banner">{error}</div>}
      {loading && <p>Loading…</p>}

      {data && data.skills.length === 0 && (
        <div className="empty-state">
          No plan yet — visit <Link to="/learning-plan">Learning Plan</Link> to generate one.
        </div>
      )}

      {data && data.skills.length > 0 && (
        <div style={{ display: "flex", gap: 40, alignItems: "center", marginBottom: 32 }}>
          <div style={{ width: 140, height: 140, position: "relative" }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={48}
                  outerRadius={68}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  <Cell fill="var(--teal)" />
                  <Cell fill="var(--border)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontSize: 22,
                fontWeight: 700
              }}
            >
              {data.overallProgressPercent}%
            </div>
          </div>
          <div>
            <div className="summary-stat">{data.overallProgressPercent}%</div>
            <p style={{ margin: 0 }}>overall readiness for {career.name}</p>
          </div>
        </div>
      )}

      {data &&
        data.skills.map((s) => (
          <div className="progress-row" key={s.id}>
            <div className="progress-row-head">
              <span className="skill-name">{s.skill}</span>
              <span className="skill-meta">{s.progressPercent}% · {s.status.replace("_", " ")}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${s.progressPercent}%` }} />
            </div>
            <div className="progress-controls">
              <button onClick={() => adjust(s, -STEP)}>-25%</button>
              <button onClick={() => adjust(s, STEP)}>+25%</button>
              <button onClick={() => adjust(s, 100)}>Mark complete</button>
            </div>
          </div>
        ))}
    </div>
  );
}
