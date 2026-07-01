import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import PageHeader from "../components/PageHeader";
import ProjectModal from "../components/ProjectModal";
import api from "../services/api";
import "../styles/admin.css";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const filtered = projects.filter((project) =>
      project.title.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredProjects(filtered);
  }, [search, projects]);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(response.data.projects);
      setFilteredProjects(response.data.projects);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Projects"
        subtitle="Manage all interior design projects."
        buttonText="+ Add Project"
        onButtonClick={() => {
          setSelectedProject(null);
          setShowModal(true);
        }}
      />

      <input
        className="search-box"
        placeholder="Search projects..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Location</th>
              <th>Year</th>
              <th>Featured</th>
              <th style={{ width: "180px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td>{project.title}</td>
                  <td>{project.location}</td>
                  <td>{project.year}</td>
                  <td>{project.is_featured ? "Yes" : "No"}</td>

                  <td>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => {
                        setSelectedProject(project);
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="action-btn delete-btn"
                      onClick={async () => {
                        if (
                          !window.confirm(
                            "Delete this project?"
                          )
                        )
                          return;

                        try {
                          await api.delete(
                            `/projects/${project.id}`
                          );
                          fetchProjects();
                        } catch (error) {
                          console.error(error);
                          alert("Failed to delete project.");
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    padding: "60px",
                    color: "#8d97a6",
                    fontSize: "16px",
                  }}
                >
                  No projects available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ProjectModal
          project={selectedProject}
          onClose={() => {
            setShowModal(false);
            setSelectedProject(null);
          }}
          onProjectAdded={fetchProjects}
        />
      )}
    </AdminLayout>
  );
}

export default Projects;