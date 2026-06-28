import { MapPin, Store } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { query } from "@/lib/db";

type ShopRow = {
  operator_name: string;
  operator_type: string;
};

async function getShops() {
  try {
    const result = await query<ShopRow>(`
      SELECT operator_name , operator_type
      FROM operators
      ORDER BY operator_name ASC
    `);

    return result.rows;
  } catch (error) {
    console.error("Failed to load shops:", error);
    return [];
  }
}

export default async function Page() {
  const shops = await getShops();

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="size-5" />
            <CardTitle>Shops</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3">
            {shops.map((shop, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div className="font-medium">{shop.operator_name}</div>

                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <MapPin className="size-4" />
                  {shop.operator_type}
                </div>
              </div>
            ))}
          </div>

          {shops.length === 0 && <p className="text-muted-foreground text-sm">No shops found.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
