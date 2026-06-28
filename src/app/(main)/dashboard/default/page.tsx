import { CheckCircle2, CircleDollarSign, Home, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { query } from "@/lib/db";

type MetricRow = {
  total: string;
  active: string;
  verified: string;
  current: string;
};

type LeagueCount = {
  league_name: string;
  count: string;
};

type StandingRow = {
  entry_id: string;
  rank: number;
  operator_name: string;
  league_name: string | null;
  zip_code: string;
  rep_score: number;
  rank_delta_30d: number;
  distance_miles: number | string;
  time_window: string;
  status: string;
  is_verified: boolean;
};

const EMPTY_METRICS: MetricRow = {
  total: "0",
  active: "0",
  verified: "0",
  current: "0",
};

async function getDashboardData() {
  try {
    const [metricsResult, leagueResult, standingsResult] = await Promise.all([
      query<MetricRow>(
        `SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active, SUM(CASE WHEN is_verified THEN 1 ELSE 0 END) AS verified, SUM(CASE WHEN is_current_user THEN 1 ELSE 0 END) AS current FROM operators`,
      ),
      query<LeagueCount>(
        `SELECT l.league_name, COUNT(*) AS count FROM operators o JOIN leagues l ON o.league_id = l.league_id GROUP BY l.league_name ORDER BY count DESC LIMIT 5`,
      ),
      query<StandingRow>(
        `SELECT
      s.entry_id,
      s.rank,
      s.operator_name,
      s.league_name,
      s.zip_code,
      s.rep_score,
      s.rank_delta_30d,
      s.distance_miles,
      s.time_window,
      s.status,
      o.is_verified
   FROM standings_page_rows s
   JOIN operators o
     ON s.operator_id = o.operator_id
   WHERE s.league_id = 'auto'
     AND s.zip_code = '11237'
     AND s.time_window = 'Last 30 days'
   ORDER BY s.rank ASC
   LIMIT 10`,
      ),
    ]);

    return {
      metrics: metricsResult.rows[0] ?? EMPTY_METRICS,
      leagues: leagueResult.rows,
      standings: standingsResult.rows,
    };
  } catch (error) {
    console.error("Failed to load default dashboard data:", error);
    return {
      metrics: EMPTY_METRICS,
      leagues: [],
      standings: [],
    };
  }
}

export default async function Page() {
  const { metrics, leagues, standings } = await getDashboardData();

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CircleDollarSign className="size-5" />
              <CardTitle>Total Shops</CardTitle>
            </div>
            <CardDescription>Registered shop records in your database.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{metrics?.total ?? "0"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="size-5" />
              <CardTitle>Active Shops</CardTitle>
            </div>
            <CardDescription>Shops currently active.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{metrics?.active ?? "0"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5" />
              <CardTitle>Verified Shops</CardTitle>
            </div>
            <CardDescription>Verified operators.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{metrics?.verified ?? "0"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Home className="size-5" />
              <CardTitle>Current User Shops</CardTitle>
            </div>
            <CardDescription>Favorite shops.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{metrics?.current ?? "0"}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <MapPin className="size-5" />
              <CardTitle>Local Standings</CardTitle>
            </div>
            <CardDescription>Top ranked auto shops in ZIP 11237 for the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>30d Delta</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings.map((row) => (
                  <TableRow key={row.entry_id}>
                    <TableCell>#{row.rank}</TableCell>

                    <TableCell>{row.operator_name}</TableCell>

                    <TableCell>{row.rep_score}</TableCell>

                    <TableCell>{row.rank_delta_30d > 0 ? `+${row.rank_delta_30d}` : row.rank_delta_30d}</TableCell>

                    <TableCell>{Number(row.distance_miles).toFixed(1)} mi</TableCell>

                    <TableCell>
                      <Badge
                        className={
                          row.status === "active"
                            ? "bg-green-600 hover:bg-green-600 text-white"
                            : "bg-gray-500 hover:bg-gray-500 text-white"
                        }
                      >
                        {row.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          row.is_verified
                            ? "bg-blue-600 hover:bg-blue-600 text-white"
                            : "bg-gray-500 hover:bg-gray-500 text-white"
                        }
                      >
                        {row.is_verified ? "Verified" : "No"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leagues</CardTitle>
            <CardDescription>Top leagues by shop count.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 py-2">
            {leagues.map((league) => (
              <div key={league.league_name} className="flex items-center justify-between gap-2 rounded-lg border p-4">
                <div>
                  <p className="font-semibold">{league.league_name}</p>
                  <p className="text-sm text-muted-foreground">Shops in this league</p>
                </div>
                <Badge>{league.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
