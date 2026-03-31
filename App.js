// src/App.js
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import React, { useState, useEffect } from "react";
import "./App.css";
import { db } from "./firebase";
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";

function App() {
  const [page, setPage] = useState("dashboard");

  const [role, setRole] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
const handleLogout = async () => {
  await signOut(auth);
  setIsLoggedIn(false);
  setRole("");
  setUserName("");
  setEmail("");
  setPassword("");
  setIsRegister(false);
  setPage("dashboard");
};

  const [interns, setInterns] = useState([]);
  const [tasks, setTasks] = useState([]);

  const today = new Date().toISOString().split("T")[0];

  /* ---------------- FIRESTORE FETCH ---------------- */
  useEffect(() => {
    const fetchInterns = async () => {
      const snapshot = await getDocs(collection(db, "interns"));
      setInterns(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    const fetchTasks = async () => {
      const snapshot = await getDocs(collection(db, "tasks"));
      setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), docId: doc.id })));
    };

    fetchInterns();
    fetchTasks();
  }, []);

  /* ---------------- LOGIN ---------------- */
 const handleLogin = async () => {
  if (!role) return alert("Select role");

  // ADMIN (same as before)
  if (role === "admin") {
    if (userName === "admin" && password === "admin123") {
      setIsLoggedIn(true);
    } else {
      alert("Invalid Admin Credentials");
    }
    return;
  }

  // 🔐 INTERN AUTH LOGIN
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);

    const intern = interns.find((i) => i.email === res.user.email);
    if (!intern) return alert("Intern Firestore data not found");

    setUserName(intern.name);
    setIsLoggedIn(true);
  } catch (error) {
    alert("Invalid Email or Password");
  }
};


  /* ---------------- INTERN REGISTER ---------------- */
  const handleRegister = async () => {
  if (!userName || !email || !password) return alert("Fill all fields");

  try {
    // 🔐 Firebase Authentication
    await createUserWithEmailAndPassword(auth, email, password);

    // 📦 Firestore (extra details)
    await addDoc(collection(db, "interns"), {
      name: userName,
      email: email,
    });

    alert("Intern Registered + Authentication Success ✅");

    setIsRegister(false);
    setUserName("");
    setEmail("");
    setPassword("");

    const snapshot = await getDocs(collection(db, "interns"));
    setInterns(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  } catch (error) {
    alert(error.message);
  }
};


  /* ---------------- ADMIN ACTIONS ---------------- */
  const assignTask = async () => {
    const title = prompt("Task title");
    const intern = prompt("Assign to intern name");
    const dueDate = prompt("Due date (YYYY-MM-DD)");

    if (!title || !intern) return;

    await addDoc(collection(db, "tasks"), {
      title,
      assignedTo: intern,
      status: "Open",
      dueDate,
      isNew: true,
      internReview: "",
      adminReview: "",
      files: [],
      completedDate: "",
    });

    // Reload tasks
    const snapshot = await getDocs(collection(db, "tasks"));
    setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), docId: doc.id })));
  };

  const addAdminReview = async (task) => {
    const msg = prompt("Admin review");
    if (!msg) return;

    const taskRef = doc(db, "tasks", task.docId);
    await updateDoc(taskRef, { adminReview: msg });

    setTasks((prev) =>
      prev.map((t) => (t.docId === task.docId ? { ...t, adminReview: msg } : t))
    );
  };

  /* ---------------- INTERN ACTIONS ---------------- */
  const updateStatus = async (task) => {
    let newStatus =
      task.status === "Open"
        ? "In Progress"
        : task.status === "In Progress"
        ? "Completed"
        : "Completed";

    const taskRef = doc(db, "tasks", task.docId);
    await updateDoc(taskRef, {
      status: newStatus,
      isNew: false,
      completedDate: newStatus === "Completed" ? today : task.completedDate,
    });

    setTasks((prev) =>
      prev.map((t) =>
        t.docId === task.docId
          ? { ...t, status: newStatus, isNew: false, completedDate: newStatus === "Completed" ? today : t.completedDate }
          : t
      )
    );
  };

  const submitInternReview = async (task, msg) => {
    const taskRef = doc(db, "tasks", task.docId);
    await updateDoc(taskRef, { internReview: msg });

    setTasks((prev) => prev.map((t) => (t.docId === task.docId ? { ...t, internReview: msg } : t)));
  };

  /* ---------------- INTERN PDF UPLOAD ---------------- */
  const uploadPDF = async (task, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Read file as Base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      const updatedFiles = [...(task.files || []), { name: file.name, base64 }];
      const taskRef = doc(db, "tasks", task.docId);
      await updateDoc(taskRef, { files: updatedFiles });

      setTasks((prev) => prev.map((t) => (t.docId === task.docId ? { ...t, files: updatedFiles } : t)));
    };
    reader.readAsDataURL(file);
  };

  /* ---------------- LANDING PAGE ---------------- */
  if (!isLoggedIn) {
    return (
      <div className="landing-page">
        <div className="login-card">
          <h2>Intern Task Management</h2>

          {!isRegister ? (
            <>
              <select onChange={(e) => setRole(e.target.value)}>
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="intern">Intern</option>
              </select>

              {role && (
                <>
                  <input
                    placeholder={role === "admin" ? "Admin Username" : "Email"}
                    onChange={(e) =>
                      role === "admin" ? setUserName(e.target.value) : setEmail(e.target.value)
                    }
                  />
                  <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                </>
              )}

              <button onClick={handleLogin}>Login</button>

              {role === "intern" && <p onClick={() => setIsRegister(true)}>New Intern? Register</p>}
            </>
          ) : (
            <>
              <input placeholder="Name" onChange={(e) => setUserName(e.target.value)} />
              <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
              <button onClick={handleRegister}>Register</button>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ---------------- ADMIN DASHBOARD ---------------- */
  if (role === "admin" && page === "dashboard") {
    return (
      <div className="dashboard-common">
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout}>Logout</button>
        <button onClick={assignTask}>Assign Task</button>
        <button onClick={() => setPage("analytics")}>Analytics</button>
        <button onClick={() => setPage("internHistory")}>Intern History</button>

        <h3>Tasks</h3>
        {tasks.map((t) => (
          <div key={t.id} className="card">
            <b>{t.title}</b> | {t.assignedTo} | {t.status}
            {t.internReview && <p>Intern: {t.internReview}</p>}

            {t.files?.length > 0 && <p>📂 Uploaded Files:</p>}
            {t.files?.map((f, i) => (
              <div key={i}>
                <p>{f.name}</p>
                <iframe src={f.base64} width="400" height="500" title={f.name}></iframe>
              </div>
            ))}

            <button onClick={() => addAdminReview(t)}>Admin Review</button>
          </div>
        ))}
      </div>
    );
  }

  /* ---------------- INTERN HISTORY ---------------- */
  if (role === "admin" && page === "internHistory") {
    return (
      <div className="dashboard-common">
        <h2>📚 Intern History</h2>
        <button onClick={() => setPage("dashboard")}>⬅ Back to Dashboard</button>

        {interns.map((intern) => (
          <div key={intern.id} className="card">
            <h3>
              {intern.name} ({intern.email})
            </h3>
            {tasks.filter((t) => t.assignedTo === intern.name).length === 0 && <p>No tasks assigned</p>}

            {tasks
              .filter((t) => t.assignedTo === intern.name)
              .map((t) => (
                <div key={t.id} className="sub-card">
                  <p><b>Task:</b> {t.title}</p>
                  <p>Status: {t.status}</p>
                  {t.completedDate && <p>Completed: {t.completedDate}</p>}
                  {t.internReview && <p>Intern Review: {t.internReview}</p>}

                  {t.files?.length > 0 && <p>📂 Uploaded Files:</p>}
                  {t.files?.map((f, i) => (
                    <div key={i}>
                      <p>{f.name}</p>
                      <iframe src={f.base64} width="400" height="500" title={f.name}></iframe>
                    </div>
                  ))}

                  {t.adminReview && <p>Admin Review: {t.adminReview}</p>}
                </div>
              ))}
          </div>
        ))}
      </div>
    );
  }

  /* ---------------- ANALYTICS ---------------- */
  if (role === "admin" && page === "analytics") {
    return (
      <div className="dashboard-common">
        <h2>Analytics</h2>
        <button onClick={() => setPage("dashboard")}>⬅ Back</button>
        <p>Today Completed Tasks: {tasks.filter((t) => t.completedDate === today).length}</p>
      </div>
    );
  }

  /* ---------------- INTERN DASHBOARD ---------------- */
  if (role === "intern") {
    const myTasks = tasks.filter((t) => t.assignedTo === userName);

    return (
      <div className="dashboard-common">
        <h2>Intern Dashboard</h2>
        <button onClick={handleLogout}>Logout</button>

        {myTasks.map((t) => (
          <div key={t.id} className="card">
            {t.isNew && <b>🔔 New Task</b>}
            <p>{t.title} | {t.status}</p>

            <button onClick={() => updateStatus(t)}>Update Status</button>

            <textarea placeholder="Intern review" onBlur={(e) => submitInternReview(t, e.target.value)} />

            {/* Upload PDF */}
            <input type="file" accept="application/pdf" onChange={(e) => uploadPDF(t, e)} />

            {t.adminReview && <p>Admin: {t.adminReview}</p>}
          </div>
        ))}
      </div>
    );
  }
}

export default App;
