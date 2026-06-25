import { query } from "@/lib/db";

import { users as templateUsers, type UserRow } from "./_components/data";
import { Users } from "./_components/users";

type OperatorStatus = "active" | "inactive";

type OperatorRow = {
  operator_id: string;
  operator_name: string;
  league_id: string;
  operator_type: string | null;
  is_verified: boolean;
  is_current_user: boolean;
  status: OperatorStatus;
  league_name: string | null;
};

function mapOperatorToUserRow(operator: OperatorRow): UserRow {
  return {
    name: operator.operator_name,
    email: `${operator.operator_id}@autoledger.local`,
    role: operator.operator_type ?? "Operator",
    status: operator.status === "active" ? "Active" : "Deactivated",
    team: (operator.operator_type ?? "Platform") as UserRow["team"],
    workspace: [operator.league_name ?? operator.league_id],
    joinedDate: operator.is_current_user ? "Today" : "Unknown",
    lastActive: operator.is_current_user ? 0 : 90 * 24 * 60,
  };
}

export default async function Page() {
  try {
    const result = await query<OperatorRow>(
      `SELECT o.operator_id, o.operator_name, o.league_id, o.operator_type, o.is_verified, o.is_current_user, o.status, l.league_name FROM operators o LEFT JOIN leagues l ON o.league_id = l.league_id ORDER BY o.operator_name LIMIT 200`,
    );

    const users = result.rows.map(mapOperatorToUserRow);
    return <Users users={users} />;
  } catch (error) {
    console.error("Failed to load users from database:", error);
    return <Users users={templateUsers} />;
  }
}
