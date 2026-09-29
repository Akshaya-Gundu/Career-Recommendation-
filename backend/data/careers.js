// Static "knowledge base" the recommendation engine scores students against.
// weight: 1 (nice-to-have) - 3 (core requirement)
module.exports = [
  {
    name: "Software Developer",
    description:
      "Designs, builds and maintains software applications and systems.",
    skills: {
      "Data Structures & Algorithms": 3,
      "OOP": 3,
      "Java": 2,
      "Git": 2,
      "SQL": 1,
      "Problem Solving": 3
    },
    interests: ["coding", "backend", "problem-solving", "software"]
  },
  {
    name: "Data Analyst",
    description:
      "Collects, cleans and interprets data to help organizations make decisions.",
    skills: {
      "SQL": 3,
      "Excel": 2,
      "Python": 2,
      "Statistics": 3,
      "Data Visualization": 3,
      "Power BI": 2
    },
    interests: ["data", "analytics", "business", "statistics"]
  },
  {
    name: "Web Developer",
    description:
      "Builds and maintains websites and web applications, front-end and back-end.",
    skills: {
      "HTML": 3,
      "CSS": 3,
      "JavaScript": 3,
      "React": 3,
      "Git": 2,
      "Node.js": 2
    },
    interests: ["frontend", "design", "coding", "web"]
  },
  {
    name: "ML Engineer",
    description:
      "Builds, trains and deploys machine learning models into production systems.",
    skills: {
      "Python": 3,
      "Machine Learning": 3,
      "Statistics": 2,
      "Deep Learning": 2,
      "SQL": 1,
      "Git": 2
    },
    interests: ["ai", "data", "research", "machine-learning"]
  },
  {
    name: "UI/UX Designer",
    description:
      "Designs intuitive, user-centered interfaces and experiences for digital products.",
    skills: {
      "Figma": 3,
      "User Research": 2,
      "Wireframing": 2,
      "Prototyping": 2,
      "Communication": 2
    },
    interests: ["design", "creativity", "user-experience"]
  },
  {
    name: "DevOps Engineer",
    description:
      "Automates and manages infrastructure, deployment pipelines and system reliability.",
    skills: {
      "Linux": 3,
      "Docker": 3,
      "CI/CD": 3,
      "Git": 2,
      "Cloud (AWS/Azure)": 2,
      "Scripting": 2
    },
    interests: ["infrastructure", "automation", "systems"]
  }
];
