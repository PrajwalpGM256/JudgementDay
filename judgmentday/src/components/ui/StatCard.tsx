import Card from "./Card";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  color?: "blue" | "green" | "yellow" | "purple" | "red";
}

export default function StatCard({ label, value, subtitle, color = "blue" }: StatCardProps) {
  const colorStyles = {
    blue: "text-blue-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
    purple: "text-purple-400",
    red: "text-red-400"
  };

  return (
    <Card>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={`text-3xl font-bold ${colorStyles[color]}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </Card>
  );
}
