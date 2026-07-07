import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import PageHeader from "../components/PageHeader";
import StudioModal from "../components/StudioModal";
import api from "../services/api";
import "../styles/admin.css";

function Studios() {
  const [studios, setStudios] = useState([]);
  const [filteredStudios, setFilteredStudios] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedStudio, setSelectedStudio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudios();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredStudios(
      studios.filter(
        (studio) =>
          (studio.city || "").toLowerCase().includes(q) ||
          (studio.address || "").toLowerCase().includes(q),
      ),
    );
  }, [search, studios]);

  const fetchStudios = async () => {
    setLoading(true);
    try {
      const response = await api.get("/studios");
      const list = response.data.studios || [];
      setStudios(list);
      setFilteredStudios(list);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Studio Locations"
        subtitle="Branch addresses on the Contact page — The Studios section. Section heading text is edited in Website Editor → Contact — Studios section."
        buttonText="+ Add Branch"
        onButtonClick={() => {
          setSelectedStudio(null);
          setShowModal(true);
        }}
      />

      <p className="studios-verify">
        Verify on site:{" "}
        <a
          href={`${import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:3000"}/Contact.html#locations`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Contact page → The Studios
        </a>
      </p>

      <input
        className="search-box"
        placeholder="Search by city or address..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "48px" }}>#</th>
              <th>City</th>
              <th>Address</th>
              <th>Phone</th>
              <th style={{ width: "180px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "48px" }}>
                  Loading branches…
                </td>
              </tr>
            ) : filteredStudios.length > 0 ? (
              filteredStudios.map((studio) => (
                <tr key={studio.id}>
                  <td>{studio.display_order || "—"}</td>
                  <td>{studio.city}</td>
                  <td className="studios-table__addr">{studio.address || "—"}</td>
                  <td>{studio.phone_display || studio.phone || "—"}</td>
                  <td>
                    <button
                      type="button"
                      className="action-btn edit-btn"
                      onClick={() => {
                        setSelectedStudio(studio);
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="action-btn delete-btn"
                      onClick={async () => {
                        if (
                          !window.confirm(
                            `Remove ${studio.city} from studio locations?`,
                          )
                        ) {
                          return;
                        }
                        try {
                          await api.delete(`/studios/${studio.id}`);
                          fetchStudios();
                        } catch (error) {
                          console.error(error);
                          alert("Failed to delete branch.");
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
                  }}
                >
                  No studio branches yet. Add one, or run{" "}
                  <code>node database/seed-studios.js</code> in interior-backend
                  to import from Contact.html.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <StudioModal
          studio={selectedStudio}
          onClose={() => {
            setShowModal(false);
            setSelectedStudio(null);
          }}
          onSaved={fetchStudios}
        />
      )}
    </AdminLayout>
  );
}

export default Studios;
