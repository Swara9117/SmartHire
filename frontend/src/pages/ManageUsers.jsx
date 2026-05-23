import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import toast from "react-hot-toast";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);

  const fetchUsers = () => {
    apiFetch("/api/admin/users")
      .then((data) => setUsers(data.users || []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (id, role) => {
    try {
      await apiFetch(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      toast.success("Role updated");
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: "DELETE" });
      toast.success("User deleted");
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-400 mb-8">Manage Users</h1>
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-800 rounded-xl">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-gray-700">
                  <td className="p-4">{u.username}</td>
                  <td className="p-4">{u.emailid}</td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u._id, e.target.value)}
                      className="bg-gray-700 rounded p-1"
                    >
                      <option>Candidate</option>
                      <option>Recruiter</option>
                      <option>Admin</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => deleteUser(u._id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
