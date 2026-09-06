'use client';
"use client";

import { AdminLayout } from "@/components/layout/adminLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";

// Mock role data (based on project charter's 8 user roles)
const roles = [
  { name: "Super Admin", permissions: ["All permissions"], description: "Full system access" },
  { name: "Admin", permissions: ["Manage users", "Manage chapters", "Manage announcements", "View reports"], description: "Platform administration" },
  { name: "Chapter Leader", permissions: ["Manage chapter members", "Post announcements", "View chapter reports"], description: "Leads a chapter" },
  { name: "Mentor", permissions: ["View mentees", "Provide feedback", "Access learning resources"], description: "Guides members" },
  { name: "Eagle", permissions: ["View dashboard", "Access learning", "Participate in events"], description: "Full member" },
  { name: "Rising", permissions: ["View dashboard", "Access basic learning", "View directory"], description: "Developing member" },
  { name: "Nestling", permissions: ["View limited dashboard", "Access onboarding content"], description: "New member" },
  { name: "Applicant", permissions: ["View application status", "Edit own application"], description: "Has applied, not yet approved" },
];

export default function RolesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
              Roles & Permissions
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Manage user roles and their permissions.
            </p>
          </div>
          <Button variant="primary" onClick={() => alert("Add role form coming soon")}>
            ➕ Add Role
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-ink-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Role</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Description</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Permissions</th>
                <th className="px-4 py-3 text-right font-medium text-ink-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {roles.map((role) => (
                <tr key={role.name} className="hover:bg-ink-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-ink-900">{role.name}</td>
                  <td className="px-4 py-3 text-ink-600">{role.description}</td>
                  <td className="px-4 py-3 text-ink-600">
                    <ul className="list-disc list-inside">
                      {role.permissions.map((perm, idx) => (
                        <li key={idx} className="text-xs">{perm}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => alert("Edit role: " + role.name)} className="text-sky-600 hover:underline mr-2">Edit</button>
                    <button onClick={() => alert("Delete role: " + role.name)} className="text-clay-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
