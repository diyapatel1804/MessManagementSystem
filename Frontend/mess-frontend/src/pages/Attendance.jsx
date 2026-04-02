import { useEffect, useState } from "react";
import API from "../services/api";

function Attendance() {

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState(""); // new manual name
  const [date, setDate] = useState("");
  const [mealType, setMealType] = useState("Breakfast");

  const [search, setSearch] = useState("");

  useEffect(() => {
    loadStudents();
    loadAttendance();
  }, []);

  const loadStudents = async () => {
    try {
      const res = await API.get("/Students");
      setStudents(res?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const loadAttendance = async () => {
    try {
      const res = await API.get("/MealAttendances");
      setAttendance(res?.data || []);
    } catch (err) {
      console.log(err);
      setAttendance([]);
    }
  };

  // ✅ ADD ATTENDANCE
  const markAttendance = async (e) => {
    e.preventDefault();

    if ((!studentId && !studentName) || !date || !mealType) {
      alert("Fill all fields");
      return;
    }

    try {
      await API.post("/MealAttendances", {
        studentId: studentId || null,
        studentName: studentName || null, // use manual name if no ID
        date,
        mealType
      });

      setStudentId("");
      setStudentName("");
      setDate("");
      setMealType("Breakfast");

      loadAttendance();
      alert("Attendance Marked");

    } catch (err) {
      console.log(err);
    }
  };

  // ❌ DELETE
  const handleDelete = async (id) => {
    try {
      await API.delete(`/MealAttendances/${id}`);
      loadAttendance();
    } catch (err) {
      console.log(err);
    }
  };

  // 🔍 SEARCH
  const filtered = attendance.filter(a =>
    a.studentId?.toString().includes(search) ||
    a.studentName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "20px" }}>

      <h2>Meal Attendance</h2>

      {/* 🔍 SEARCH */}
      <input
        placeholder="Search by Student ID or Name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "8px",
          marginBottom: "15px",
          width: "250px"
        }}
      />

      {/* 📝 FORM */}
      <div style={{
        background: "#fff",
        padding: "15px",
        borderRadius: "10px",
        marginBottom: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <form onSubmit={markAttendance}>

          {/* Dropdown + Manual Name */}
          <select
            value={studentId}
            onChange={(e) => {
              setStudentId(e.target.value);
              setStudentName(""); // clear manual name if dropdown is used
            }}
            style={{ marginRight: "10px", padding: "8px" }}
          >
            <option value="">Select Student</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Or enter student name"
            value={studentName}
            onChange={(e) => {
              setStudentName(e.target.value);
              setStudentId(""); // clear dropdown if manual name is used
            }}
            style={{ marginRight: "10px", padding: "8px" }}
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ marginRight: "10px", padding: "8px" }}
          />

          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            style={{ marginRight: "10px", padding: "8px" }}
          >
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
          </select>

          <button style={{
            padding: "8px 15px",
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: "6px"
          }}>
            Mark
          </button>

        </form>
      </div>

      {/* 📊 TABLE */}
      <div style={{
        background: "#fff",
        padding: "15px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Date</th>
              <th>Meal</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((a) => {
                const student = students.find(s => s.id === a.studentId);
                const nameToShow = student ? student.name : a.studentName || a.studentId;

                return (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{nameToShow}</td>
                    <td>
                      {a.date
                        ? new Date(a.date + "T00:00:00").toLocaleDateString("en-IN")
                        : "-"}
                    </td>
                    <td>{a.mealType}</td>

                    <td>
                      <button
                        onClick={() => handleDelete(a.id)}
                        style={{
                          background: "red",
                          color: "#fff",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "5px"
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No attendance found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Attendance;