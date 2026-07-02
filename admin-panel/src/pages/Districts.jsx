import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import PageHeader from "../components/PageHeader";
import DistrictModal from "../components/DistrictModal";
import api from "../services/api";
import "../styles/admin.css";

function Districts() {
  const [districts, setDistricts] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  useEffect(() => {
    fetchDistricts();
  }, []);

  useEffect(() => {
    const filtered = districts.filter((district) =>
      district.name.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredDistricts(filtered);
  }, [search, districts]);

  const fetchDistricts = async () => {
    try {
      const response = await api.get("/districts");
      setDistricts(response.data.districts);
      setFilteredDistricts(response.data.districts);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Districts"
        subtitle="Manage all service locations."
        buttonText="+ Add District"
        onButtonClick={() => {
          setSelectedDistrict(null);
          setShowModal(true);
        }}
      />

      <input
        className="search-box"
        placeholder="Search districts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th style={{ width: "180px" }}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredDistricts.length > 0 ? (
              filteredDistricts.map((district) => (
                <tr key={district.id}>
                  <td>{district.name}</td>

                  <td>{district.slug}</td>

                  <td>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => {
                        setSelectedDistrict(district);
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
                            "Delete this district?"
                          )
                        )
                          return;

                        try {
                          await api.delete(
                            `/districts/${district.id}`
                          );

                          fetchDistricts();
                        } catch (error) {
                          console.error(error);

                          alert(
                            "Failed to delete district."
                          );
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
                  No districts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <DistrictModal
          district={selectedDistrict}
          onClose={() => {
            setShowModal(false);
            setSelectedDistrict(null);
          }}
          onDistrictAdded={fetchDistricts}
        />
      )}
    </AdminLayout>
  );
}

export default Districts;