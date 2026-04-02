import { useEffect, useState } from "react";
import API from "../services/api";
import "./Payments.css";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);

  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState(""); // new manual name
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");

  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);

  // TREND CHART STATES
  const [trend, setTrend] = useState("daily");
  const [trendData, setTrendData] = useState([]);
  const [scaleFactor, setScaleFactor] = useState(10);

  useEffect(() => {
    loadPayments();
    loadStudents();
  }, []);

  useEffect(() => {
    calculateTrend();
  }, [payments, trend]);

  const loadPayments = async () => {
    const res = await API.get("/Payments");
    setPayments(res.data);
  };

  const loadStudents = async () => {
    const res = await API.get("/Students");
    setStudents(res.data);
  };

  // ADD / UPDATE PAYMENT
  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!studentId && !studentName) || !amount || !paymentDate) return;

    const data = {
      studentId: studentId || null,
      studentName: studentName || null, // use manual name if no ID
      amount,
      paymentDate
    };

    if (editId) {
      await API.put(`/Payments/${editId}`, { id: editId, ...data });
      setEditId(null);
    } else {
      await API.post("/Payments", data);
    }

    setStudentId("");
    setStudentName("");
    setAmount("");
    setPaymentDate("");
    loadPayments();
  };

  // DELETE PAYMENT
  const handleDelete = async (id) => {
    await API.delete(`/Payments/${id}`);
    loadPayments();
  };

  // FILTER PAYMENTS
  const filtered = payments.filter(p =>
    p.studentId?.toString().includes(search) ||
    p.studentName?.toLowerCase().includes(search.toLowerCase())
  );

  // TOTAL AMOUNT
  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  // CALCULATE TREND DATA
  const calculateTrend = () => {
    let data = [];
    const today = new Date();

    if (trend === "daily") {
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - i);
        return d;
      }).reverse();

      data = last7Days.map(d => {
        const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        const total = payments
          .filter(p => new Date(p.paymentDate).toDateString() === d.toDateString())
          .reduce((sum, p) => sum + Number(p.amount), 0);
        return { label, total };
      });

    } else if (trend === "weekly") {
      data = Array.from({ length: 4 }).map((_, i) => {
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay() - 7 * i);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const total = payments.reduce((sum, p) => {
          const pd = new Date(p.paymentDate);
          return pd >= start && pd <= end ? sum + Number(p.amount) : sum;
        }, 0);
        const label = `W${4-i}`;
        return { label, total };
      }).reverse();

    } else if (trend === "monthly") {
      data = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const total = payments.reduce((sum, p) => {
          const pd = new Date(p.paymentDate);
          return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear() ? sum + Number(p.amount) : sum;
        }, 0);
        const label = d.toLocaleString("en-IN", { month: "short" });
        return { label, total };
      }).reverse();
    }

    const maxTotal = Math.max(...data.map(d => d.total));
    setScaleFactor(maxTotal > 0 ? maxTotal / 200 : 1);
    setTrendData(data);
  };

  return (
    <div className="payments-container">
      <h2 className="title">Payments Management</h2>

      {/* STATS */}
      <div className="stats">
        <div>Total Payments: {payments.length}</div>
        <div>Total Amount: ₹{totalAmount}</div>
      </div>

      {/* SEARCH */}
      <input
        className="search"
        placeholder="Search by Student ID or Name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* PAYMENT FORM */}
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Dropdown for existing students */}
            <select
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                setStudentName(""); // clear manual name if dropdown is used
              }}
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            {/* Manual student name input */}
            <input
              type="text"
              placeholder="Or enter student name"
              value={studentName}
              onChange={(e) => {
                setStudentName(e.target.value);
                setStudentId(""); // clear dropdown if manual name is used
              }}
            />

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </div>

          <button className="btn">
            {editId ? "Update Payment" : "Add Payment"}
          </button>
        </form>
      </div>

      {/* TREND SELECTOR */}
      <div className="trend-selector">
        <label>View Trend: </label>
        <select value={trend} onChange={(e) => setTrend(e.target.value)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* TREND CHART */}
      <div className="chart-card">
        <h3>Payments Overview ({trend})</h3>
        <div className="chart">
          {trendData.map(item => (
            <div key={item.label} className="bar-container">
              <div
                className="bar"
                style={{ height: `${Math.min(item.total / scaleFactor, 200)}px` }}
                title={`₹${item.total}`}
              ></div>
              <span className="bar-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PAYMENTS TABLE */}
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((p) => {
                const student = students.find(s => s.id === p.studentId);
                const nameToShow = student ? student.name : p.studentName || p.studentId;
                return (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{nameToShow}</td>
                    <td>₹{p.amount}</td>
                    <td>{p.paymentDate
                      ? new Date(p.paymentDate + "T00:00:00").toLocaleDateString("en-IN")
                      : "-"
                    }</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setEditId(p.id);
                          setStudentId(p.studentId);
                          setStudentName(p.studentName || "");
                          setAmount(p.amount);
                          setPaymentDate(p.paymentDate?.slice(0,10));
                        }}
                      >Edit</button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(p.id)}
                      >Delete</button>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="5" className="no-data">No payments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Payments;