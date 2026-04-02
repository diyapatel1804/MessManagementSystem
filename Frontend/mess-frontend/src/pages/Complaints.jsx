import { useEffect, useState } from "react";
import API from "../services/api";
import "./Complaints.css";

function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const res = await API.get("/Complaints");
      console.log(res.data); // 🔥 debug
      setComplaints(res?.data || []);
    } catch (err) {
      console.log(err);
      setComplaints([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text) return;

    try {
      if (editId) {
        await API.put(`/Complaints/${editId}`, {
          id: editId,
          message: text,
          status: "Open",
        });
        setEditId(null);
      } else {
        await API.post("/Complaints", {
          message: text,
          status: "Open",
          date: new Date().toISOString(),
        });
      }

      setText("");
      loadComplaints();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/Complaints/${id}`);
      loadComplaints();
      setSelected((prev) => prev.filter((i) => i !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selected.map((id) => API.delete(`/Complaints/${id}`)));
      setSelected([]);
      loadComplaints();
    } catch (err) {
      console.log(err);
    }
  };

  const filtered = complaints.filter((c) =>
    c.message?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="complaints-container">
      <h2 className="title">Complaints Management</h2>

      <input
        className="search"
        placeholder="Search complaints..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Write your complaint..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows="3"
          />
          <button className="btn">
            {editId ? "Update Complaint" : "Add Complaint"}
          </button>
        </form>
      </div>

      {selected.length > 0 && (
        <div className="bulk-actions">
          <button className="btn-delete" onClick={handleBulkDelete}>
            Delete Selected ({selected.length})
          </button>
        </div>
      )}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Complaint</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(c.id)}
                      onChange={() => handleSelect(c.id)}
                    />
                  </td>

                  <td>{c.id}</td>
                  <td>{c.message}</td>

                  <td>
                    <span className={`status ${c.status?.toLowerCase()}`}>
                      {c.status}
                    </span>
                  </td>

                  <td>
                    {c.date
                      ? new Date(c.date).toLocaleDateString("en-IN")
                      : "-"}
                  </td>

                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setEditId(c.id);
                        setText(c.message);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(c.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  No complaints found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Complaints;