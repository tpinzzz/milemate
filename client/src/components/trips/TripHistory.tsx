import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { formatMileage, generateCsvData } from "@/lib/utils";
import { type Trip } from "@shared/schema";

export default function TripHistory() {
  const { data: trips, isLoading } = useQuery<Trip[]>({
    queryKey: ["/api/trips"],
  });

  const handleExport = () => {
    if (!trips) return;
    
    const csvContent = generateCsvData(trips);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `mileage_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <div>Loading trips...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Trip History</h2>
        <Button onClick={handleExport} variant="outline" className="flex gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Miles</TableHead>
              <TableHead>Purpose</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trips?.map((trip) => (
              <TableRow key={trip.id}>
                <TableCell>
                  {new Date(trip.tripDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{formatMileage(Number(trip.startMileage))}</TableCell>
                <TableCell>{formatMileage(Number(trip.endMileage))}</TableCell>
                <TableCell>
                  {formatMileage(
                    Number(trip.endMileage) - Number(trip.startMileage)
                  )}
                </TableCell>
                <TableCell>{trip.purpose}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
