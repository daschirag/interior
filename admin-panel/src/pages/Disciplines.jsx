import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import PageHeader from "../components/PageHeader";
import DisciplineModal from "../components/DisciplineModal";
import api from "../services/api";
import "../styles/admin.css";

function Disciplines() {
  const [disciplines, setDisciplines] = useState([]);
  const [filteredDisciplines, setFilteredDisciplines] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);

  useEffect(() => {
    fetchDisciplines();
  }, []);

  useEffect(() => {
    const filtered = disciplines.filter((discipline) =>
      (discipline.title || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    setFilteredDisciplines(filtered);
  }, [search, disciplines]);

  const fetchDisciplines = async () => {
    try {
      const response = await api.get("/disciplines");

      console.log(response.data);

      setDisciplines(response.data.disciplines || []);
      setFilteredDisciplines(response.data.disciplines || []);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Disciplines"
        subtitle="Manage all interior design disciplines."
        buttonText="+ Add Discipline"
        onButtonClick={() => {
          setSelectedDiscipline(null);
          setShowModal(true);
        }}
      />

      <input
        className="search-box"
        placeholder="Search disciplines..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th style={{ width: "180px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredDisciplines.length > 0 ? (
              filteredDisciplines.map((discipline) => (
                <tr key={discipline.id}>
                  <td>{discipline.title}</td>

                  <td>{discipline.slug}</td>

                  <td>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => {
                        setSelectedDiscipline(discipline);
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="action-btn delete-btn"
                      onClick={async () => {
                        const confirmDelete = window.confirm(
                          "Are you sure you want to delete this discipline?"
                        );

                        if (!confirmDelete) return;

                        try {
                          await api.delete(
                            `/disciplines/${discipline.id}`
                          );

                          fetchDisciplines();
                        } catch (error) {
                          console.error(error);
                          alert("Failed to delete discipline.");
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
                  colSpan="3"
                  style={{
                    textAlign: "center",
                    padding: "60px",
                    color: "#8d97a6",
                  }}
                >
                  No disciplines found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <DisciplineModal
          discipline={selectedDiscipline}
          onClose={() => {
            setShowModal(false);
            setSelectedDiscipline(null);
          }}
          onDisciplineAdded={fetchDisciplines}
        />
      )}
    </AdminLayout>
  );
}

export default Disciplines;