const BASE_URL = "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  createStudent: (data) => request("/students", { method: "POST", body: JSON.stringify(data) }),
  getStudent: (id) => request(`/students/${id}`),
  getCareers: () => request("/careers"),
  getRecommendations: (studentId) => request(`/recommend/${studentId}`),
  getSkillGap: (studentId, careerId) => request(`/skillgap/${studentId}/${careerId}`),
  getLearningPlan: (studentId, careerId) => request(`/learning-plan/${studentId}/${careerId}`),
  getProgress: (studentId, careerId) => request(`/progress/${studentId}/${careerId}`),
  updateProgress: (id, data) => request(`/progress/${id}`, { method: "PATCH", body: JSON.stringify(data) })
};
