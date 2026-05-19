import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeData } from "@/lib/dashboardAuth";
import { readAll } from "@/lib/store";
import { getAllUsers } from "@/lib/adminStore";
import type { Lead, CRMTask, Ticket, CRMUpdate } from "@/types/dashboard";

interface TeamTicket extends Ticket {
  isInternal?: boolean;
  raisedAgainst?: string;
  raisedBy?: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  if (!await authorizeData(extractToken(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = params;

  const users = await getAllUsers();
  const member = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (!member) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [leads, tasks, tickets, crmUpdates] = await Promise.all([
    readAll<Lead>("leads"),
    readAll<CRMTask>("crm_tasks"),
    readAll<TeamTicket>("tickets"),
    readAll<CRMUpdate>("crm_updates"),
  ]);

  const leadsAssigned   = leads.filter((l) => l.assignedTo === member.username).length;
  const leadsWon        = leads.filter((l) => l.assignedTo === member.username && l.status === "won").length;
  const tasksAssigned   = tasks.filter((t) => t.assignedTo === member.username).length;
  const tasksDone       = tasks.filter((t) => t.assignedTo === member.username && t.status === "done").length;
  const ticketsAssigned = tickets.filter((t) => t.assignedTo === member.username).length;

  const internalTickets = tickets.filter(
    (t) => t.isInternal === true && t.raisedAgainst === member.username
  );
  const internalIssuesRaisedAgainst = internalTickets.length;
  const internalIssuesOpen          = internalTickets.filter((t) => t.status !== "resolved").length;

  const blogPosts  = tasks.filter(
    (t) => t.assignedTo === member.username && t.linkedEntityType === "blog"
  ).length;
  const crmUpdatesCount = crmUpdates.filter((u) => u.createdBy === member.username).length;

  const recentActivity = crmUpdates
    .filter((u) => u.createdBy === member.username)
    .slice(0, 20)
    .map((u) => ({ type: u.type, content: u.content, createdAt: u.createdAt }));

  const internalIssues = internalTickets.slice(0, 10);

  return NextResponse.json({
    member:  { username: member.username, role: member.role },
    stats: {
      leadsAssigned,
      leadsWon,
      tasksAssigned,
      tasksDone,
      ticketsAssigned,
      ticketsResolved: tickets.filter(
        (t) => t.assignedTo === member.username && t.status === "resolved"
      ).length,
      internalIssuesRaisedAgainst,
      internalIssuesOpen,
      blogPosts,
      crmUpdates: crmUpdatesCount,
    },
    recentActivity,
    internalIssues,
  });
}
