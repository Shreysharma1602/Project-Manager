import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";

const statuses = ["todo", "in-progress", "done"];

export default function ProjectPage() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "todo",
    due_date: "",
    assigned_to: ""
  });
  const [memberId, setMemberId] = useState("");

  const loadData = async () => {
    const [taskRes, usersRes] = await Promise.all([api.get(`/projects/${id}/tasks`), api.get("/users")]);
    setTasks(taskRes.data);
    setUsers(usersRes.data);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const createTask = async (e) => {
    e.preventDefault();
    const payload = {
      ...newTask,
      assigned_to: newTask.assigned_to ? Number(newTask.assigned_to) : null,
      due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : null
    };
    await api.post(`/projects/${id}/tasks`, payload);
    setNewTask({ title: "", description: "", status: "todo", due_date: "", assigned_to: "" });
    loadData();
  };

  const updateStatus = async (taskId, status) => {
    await api.put(`/projects/${id}/tasks/${taskId}`, { status });
    loadData();
  };

  const addMember = async (e) => {
    e.preventDefault();
    await api.post(`/projects/${id}/members`, { user_id: Number(memberId) });
    setMemberId("");
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Project #{id}</h1>

      {user?.role === "admin" && (
        <form onSubmit={addMember} className="bg-white border rounded p-4 mb-6 flex gap-3 items-end">
          <div className="grow">
            <label className="text-sm block mb-1">Add member</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              required
            >
              <option value="">Select user</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
          <button className="bg-blue-600 text-white rounded px-4 py-2">Add</button>
        </form>
      )}

      <form onSubmit={createTask} className="bg-white border rounded p-4 mb-6 grid md:grid-cols-2 gap-3">
        <input
          className="border rounded px-3 py-2"
          placeholder="Task title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          required
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Task description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        />
        <select
          className="border rounded px-3 py-2"
          value={newTask.status}
          onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <input
          className="border rounded px-3 py-2"
          type="date"
          value={newTask.due_date}
          onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
        />
        <select
          className="border rounded px-3 py-2"
          value={newTask.assigned_to}
          onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
        >
          <option value="">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <button className="bg-slate-900 text-white rounded px-4 py-2">Create task</button>
      </form>

      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-3">Tasks</h2>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="border rounded px-3 py-2 flex items-center justify-between">
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-slate-500">{task.description}</p>
              </div>
              <select
                className="border rounded px-2 py-1"
                value={task.status}
                onChange={(e) => updateStatus(task.id, e.target.value)}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
