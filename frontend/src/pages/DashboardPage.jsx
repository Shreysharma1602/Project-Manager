import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [projects, setProjects] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [filter, setFilter] = useState({ project_id: "", user_id: "" });
  const [users, setUsers] = useState([]);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filter.project_id) params.set("project_id", filter.project_id);
    if (filter.user_id) params.set("user_id", filter.user_id);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }, [filter]);

  const fetchData = async () => {
    const [projectsRes, dashboardRes, usersRes] = await Promise.all([
      api.get("/projects"),
      api.get(`/dashboard${query}`),
      api.get("/users")
    ]);
    setProjects(projectsRes.data);
    setDashboard(dashboardRes.data);
    setUsers(usersRes.data);
  };

  useEffect(() => {
    fetchData();
  }, [query]);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <div className="bg-white border rounded p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <select
          className="border rounded px-3 py-2"
          value={filter.project_id}
          onChange={(e) => setFilter({ ...filter, project_id: e.target.value })}
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2"
          value={filter.user_id}
          onChange={(e) => setFilter({ ...filter, user_id: e.target.value })}
        >
          <option value="">All users</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <button className="bg-slate-200 rounded px-3 py-2" onClick={() => setFilter({ project_id: "", user_id: "" })}>
          Reset filters
        </button>
      </div>

      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border rounded p-4">
            <p className="text-sm text-slate-500">Total tasks</p>
            <p className="text-2xl font-bold">{dashboard.total_tasks}</p>
          </div>
          <div className="bg-white border rounded p-4">
            <p className="text-sm text-slate-500">Overdue tasks</p>
            <p className="text-2xl font-bold text-red-600">{dashboard.overdue_tasks}</p>
          </div>
          <div className="bg-white border rounded p-4">
            <p className="text-sm text-slate-500">Status breakdown</p>
            <p className="text-sm">Todo: {dashboard.status_breakdown.todo ?? 0}</p>
            <p className="text-sm">In progress: {dashboard.status_breakdown["in-progress"] ?? 0}</p>
            <p className="text-sm">Done: {dashboard.status_breakdown.done ?? 0}</p>
          </div>
        </div>
      )}

      <div className="bg-white border rounded p-4 mb-6">
        <h2 className="font-semibold mb-3">Projects</h2>
        <div className="space-y-2">
          {projects.map((project) => (
            <div key={project.id} className="flex items-center justify-between border rounded px-3 py-2">
              <div>
                <p className="font-medium">{project.name}</p>
                <p className="text-sm text-slate-500">{project.description}</p>
              </div>
              <Link className="text-blue-600" to={`/projects/${project.id}`}>
                Open
              </Link>
            </div>
          ))}
        </div>
      </div>

      {user?.role === "admin" && <CreateProjectCard onCreated={fetchData} />}

      <div className="bg-white border rounded p-4 mt-6">
        <h2 className="font-semibold mb-3">Tasks</h2>
        <div className="space-y-2">
          {dashboard?.tasks?.map((task) => (
            <div key={task.id} className="border rounded px-3 py-2">
              <p className="font-medium">{task.title}</p>
              <p className="text-sm text-slate-500">{task.status}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

function CreateProjectCard({ onCreated }) {
  const [form, setForm] = useState({ name: "", description: "" });

  const onSubmit = async (e) => {
    e.preventDefault();
    await api.post("/projects", form);
    setForm({ name: "", description: "" });
    onCreated();
  };

  return (
    <form className="bg-white border rounded p-4" onSubmit={onSubmit}>
      <h2 className="font-semibold mb-3">Create project</h2>
      <div className="grid md:grid-cols-2 gap-3">
        <input
          className="border rounded px-3 py-2"
          placeholder="Project name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <button className="mt-3 bg-blue-600 text-white rounded px-4 py-2">Create</button>
    </form>
  );
}
