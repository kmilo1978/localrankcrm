"use client";

import { useState, useEffect } from "react";
import { Check, Clock, Crown, Mail, MoreHorizontal, Plus, Shield, Trash2, UserPlus, Users, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type Member = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "manager" | "member" | "viewer";
  avatar: string;
  status: "active" | "invited" | "inactive";
  joinedAt: string;
  assignedTasks: number;
  assignedContacts: number;
};

type Invitation = {
  id: string;
  email: string;
  role: Member["role"];
  sentAt: string;
  status: "pending" | "accepted" | "expired";
};

const ROLES = {
  owner: { label: "Propietario", color: "bg-amber-100 text-amber-700", icon: Crown },
  admin: { label: "Administrador", color: "bg-purple-100 text-purple-700", icon: Shield },
  manager: { label: "Manager", color: "bg-blue-100 text-blue-700", icon: Users },
  member: { label: "Miembro", color: "bg-green-100 text-green-700", icon: Users },
  viewer: { label: "Solo lectura", color: "bg-gray-100 text-gray-700", icon: Users },
};

const SEED_MEMBERS: Member[] = [
  { id: "mb1", name: "Camilo Rivera", email: "camilo@localrank.co", role: "owner", avatar: "CR", status: "active", joinedAt: "2026-01-15", assignedTasks: 12, assignedContacts: 45 },
  { id: "mb2", name: "Ana López", email: "ana@localrank.co", role: "admin", avatar: "AL", status: "active", joinedAt: "2026-03-01", assignedTasks: 8, assignedContacts: 32 },
  { id: "mb3", name: "Juan Pérez", email: "juan@localrank.co", role: "manager", avatar: "JP", status: "active", joinedAt: "2026-04-10", assignedTasks: 15, assignedContacts: 28 },
  { id: "mb4", name: "María Gómez", email: "maria@localrank.co", role: "member", avatar: "MG", status: "active", joinedAt: "2026-05-20", assignedTasks: 6, assignedContacts: 15 },
  { id: "mb5", name: "Carlos Díaz", email: "carlos@equipo.com", role: "member", avatar: "CD", status: "invited", joinedAt: "", assignedTasks: 0, assignedContacts: 0 },
];

const SEED_INVITATIONS: Invitation[] = [
  { id: "inv1", email: "carlos@equipo.com", role: "member", sentAt: "2026-07-16", status: "pending" },
  { id: "inv2", email: "laura@agencia.co", role: "viewer", sentAt: "2026-07-10", status: "expired" },
];

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [showDelegate, setShowDelegate] = useState<string | null>(null);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "member" as Member["role"] });
  const [delegateForm, setDelegateForm] = useState({ tasks: "", contacts: "", notes: "" });

  useEffect(() => {
    setMembers(loadFromStorage("team_members", SEED_MEMBERS));
    setInvitations(loadFromStorage("team_invitations", SEED_INVITATIONS));
  }, []);

  function saveMembers(u: Member[]) { setMembers(u); saveToStorage("team_members", u); }
  function saveInvitations(u: Invitation[]) { setInvitations(u); saveToStorage("team_invitations", u); }

  function sendInvitation() {
    if (!inviteForm.email.trim()) return;
    const inv: Invitation = { id: generateId(), email: inviteForm.email, role: inviteForm.role, sentAt: new Date().toISOString().split("T")[0]!, status: "pending" };
    saveInvitations([inv, ...invitations]);
    // Also add as invited member
    const newMember: Member = { id: generateId(), name: inviteForm.email.split("@")[0] || "Invitado", email: inviteForm.email, role: inviteForm.role, avatar: inviteForm.email.slice(0, 2).toUpperCase(), status: "invited", joinedAt: "", assignedTasks: 0, assignedContacts: 0 };
    saveMembers([...members, newMember]);
    setInviteForm({ email: "", role: "member" });
    setShowInvite(false);
  }

  function changeRole(memberId: string, role: Member["role"]) {
    saveMembers(members.map((m) => m.id === memberId ? { ...m, role } : m));
  }

  function removeMember(id: string) {
    saveMembers(members.filter((m) => m.id !== id));
  }

  function resendInvitation(id: string) {
    saveInvitations(invitations.map((i) => i.id === id ? { ...i, sentAt: new Date().toISOString().split("T")[0]!, status: "pending" as const } : i));
  }

  function cancelInvitation(id: string) {
    saveInvitations(invitations.filter((i) => i.id !== id));
    // Also remove the invited member
    const inv = invitations.find((i) => i.id === id);
    if (inv) saveMembers(members.filter((m) => m.email !== inv.email || m.status !== "invited"));
  }

  function handleDelegate(memberId: string) {
    // Simulate assigning work
    saveMembers(members.map((m) => m.id === memberId ? { ...m, assignedTasks: m.assignedTasks + (parseInt(delegateForm.tasks) || 0), assignedContacts: m.assignedContacts + (parseInt(delegateForm.contacts) || 0) } : m));
    setDelegateForm({ tasks: "", contacts: "", notes: "" });
    setShowDelegate(null);
  }

  const activeMembers = members.filter((m) => m.status === "active");
  const pendingInvites = invitations.filter((i) => i.status === "pending");

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Equipo</h1>
            <p className="text-sm text-muted-foreground">{activeMembers.length} miembros activos · {pendingInvites.length} invitaciones pendientes</p>
          </div>
          <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-colors">
            <UserPlus className="h-4 w-4" />Invitar miembro
          </button>
        </div>

        {/* Invite form */}
        {showInvite && (
          <div className="mb-6 rounded-lg border bg-white p-5">
            <h3 className="mb-4 font-semibold flex items-center gap-2"><Mail className="h-4 w-4 text-brand" />Enviar invitación</h3>
            <div className="flex gap-3">
              <input value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} placeholder="email@ejemplo.com" type="email" className="flex-1 rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <select value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as Member["role"] })} className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none">
                <option value="admin">Administrador</option>
                <option value="manager">Manager</option>
                <option value="member">Miembro</option>
                <option value="viewer">Solo lectura</option>
              </select>
              <button onClick={sendInvitation} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">Enviar</button>
              <button onClick={() => setShowInvite(false)} className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-3 rounded border bg-gray-50 p-3 text-xs text-muted-foreground">
              <p><strong>Roles:</strong></p>
              <p>• <strong>Admin</strong> — Control total: configuración, miembros, datos</p>
              <p>• <strong>Manager</strong> — Gestionar contactos, pipeline, equipo asignado</p>
              <p>• <strong>Miembro</strong> — Trabajar con sus contactos y tareas asignadas</p>
              <p>• <strong>Solo lectura</strong> — Ver dashboards y reportes sin editar</p>
            </div>
          </div>
        )}

        {/* Members list */}
        <div className="rounded-lg border bg-white overflow-hidden">
          <table className="w-full">
            <thead className="border-b bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Miembro</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Rol</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Tareas</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Contactos</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const roleInfo = ROLES[m.role];
                const RoleIcon = roleInfo.icon;
                return (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-text">{m.avatar}</div>
                        <div>
                          <p className="text-sm font-medium">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {m.role === "owner" ? (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${roleInfo.color}`}><Crown className="h-3 w-3" />{roleInfo.label}</span>
                      ) : (
                        <select value={m.role} onChange={(e) => changeRole(m.id, e.target.value as Member["role"])} className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 ${roleInfo.color}`}>
                          <option value="admin">Administrador</option>
                          <option value="manager">Manager</option>
                          <option value="member">Miembro</option>
                          <option value="viewer">Solo lectura</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium">{m.assignedTasks}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium">{m.assignedContacts}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${m.status === "active" ? "bg-green-100 text-green-700" : m.status === "invited" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                        {m.status === "active" ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {m.status === "active" ? "Activo" : m.status === "invited" ? "Invitado" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setShowDelegate(m.id)} className="rounded px-2 py-1 text-xs text-brand hover:bg-brand-tint font-medium">Delegar</button>
                        {m.role !== "owner" && <button onClick={() => removeMember(m.id)} className="rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pending invitations */}
        {invitations.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold flex items-center gap-2"><Mail className="h-4 w-4" />Invitaciones</h3>
            <div className="space-y-2">
              {invitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Mail className={`h-4 w-4 ${inv.status === "pending" ? "text-amber-500" : "text-gray-400"}`} />
                    <div>
                      <p className="text-sm font-medium">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">Enviada: {inv.sentAt} · Rol: {ROLES[inv.role].label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${inv.status === "pending" ? "bg-amber-100 text-amber-700" : inv.status === "accepted" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {inv.status === "pending" ? "Pendiente" : inv.status === "accepted" ? "Aceptada" : "Expirada"}
                    </span>
                    {inv.status !== "accepted" && <button onClick={() => resendInvitation(inv.id)} className="text-xs text-brand hover:underline">Reenviar</button>}
                    <button onClick={() => cancelInvitation(inv.id)} className="text-xs text-red-500 hover:underline">Cancelar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Advanced Permissions */}
      <div className="mt-6 rounded-lg border bg-white p-5">
        <h3 className="mb-4 font-semibold flex items-center gap-2"><Shield className="h-4 w-4 text-brand" />Permisos avanzados por rol</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b">
              <th className="pb-2 text-left font-medium text-muted-foreground w-40">Permiso</th>
              <th className="pb-2 text-center font-medium text-amber-700">Owner</th>
              <th className="pb-2 text-center font-medium text-purple-700">Admin</th>
              <th className="pb-2 text-center font-medium text-blue-700">Manager</th>
              <th className="pb-2 text-center font-medium text-green-700">Miembro</th>
              <th className="pb-2 text-center font-medium text-gray-700">Viewer</th>
            </tr></thead>
            <tbody>
              {[
                { perm: "Ver dashboard y analytics", roles: [true, true, true, true, true] },
                { perm: "Ver contactos y empresas", roles: [true, true, true, true, true] },
                { perm: "Crear/editar contactos", roles: [true, true, true, true, false] },
                { perm: "Eliminar contactos", roles: [true, true, true, false, false] },
                { perm: "Ver pipeline completo", roles: [true, true, true, false, false] },
                { perm: "Mover deals entre etapas", roles: [true, true, true, true, false] },
                { perm: "Crear/editar propuestas", roles: [true, true, true, true, false] },
                { perm: "Enviar propuestas", roles: [true, true, true, false, false] },
                { perm: "Ver conversaciones (todos)", roles: [true, true, true, false, false] },
                { perm: "Ver solo sus conversaciones", roles: [true, true, true, true, false] },
                { perm: "Enviar mensajes", roles: [true, true, true, true, false] },
                { perm: "Importar datos/archivos", roles: [true, true, true, false, false] },
                { perm: "Exportar datos", roles: [true, true, false, false, false] },
                { perm: "Gestionar equipo", roles: [true, true, false, false, false] },
                { perm: "Enviar invitaciones", roles: [true, true, true, false, false] },
                { perm: "Configurar integraciones", roles: [true, true, false, false, false] },
                { perm: "Configurar marca/branding", roles: [true, true, false, false, false] },
                { perm: "API keys y webhooks", roles: [true, true, false, false, false] },
                { perm: "Eliminar workspace", roles: [true, false, false, false, false] },
                { perm: "Transferir ownership", roles: [true, false, false, false, false] },
              ].map((row) => (
                <tr key={row.perm} className="border-b last:border-0">
                  <td className="py-2 text-xs">{row.perm}</td>
                  {row.roles.map((v, i) => (
                    <td key={i} className="py-2 text-center">{v ? <Check className="inline h-3.5 w-3.5 text-green-500" /> : <X className="inline h-3.5 w-3.5 text-gray-300" />}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Los permisos se aplican automáticamente según el rol asignado. Para permisos personalizados por usuario, contacta soporte.</p>
      </div>

      {/* Delegate modal */}
      {showDelegate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowDelegate(null)}>
          <div className="w-full max-w-md rounded-lg border bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 font-semibold">Delegar trabajo</h3>
            <p className="mb-3 text-sm text-muted-foreground">Asigna tareas, contactos o responsabilidades a <strong>{members.find((m) => m.id === showDelegate)?.name}</strong></p>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium">Cantidad de tareas a asignar</label>
                <input value={delegateForm.tasks} onChange={(e) => setDelegateForm({ ...delegateForm, tasks: e.target.value })} type="number" placeholder="0" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Cantidad de contactos a asignar</label>
                <input value={delegateForm.contacts} onChange={(e) => setDelegateForm({ ...delegateForm, contacts: e.target.value })} type="number" placeholder="0" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Notas de delegación</label>
                <textarea value={delegateForm.notes} onChange={(e) => setDelegateForm({ ...delegateForm, notes: e.target.value })} placeholder="Instrucciones o contexto..." rows={3} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowDelegate(null)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={() => handleDelegate(showDelegate)} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">Delegar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
