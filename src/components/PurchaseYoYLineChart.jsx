import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import CircularProgress from "@mui/material/CircularProgress";
import { Box, Typography } from "@mui/material";

const formatCurrency = (value) =>
  `N$ ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const PurchaseYoYLineChart = ({
  data,
  isLoading,
  currentYear,
  previousYear,
}) => {
  if (isLoading) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 320,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const hasData =
    Array.isArray(data) &&
    data.some(
      (row) => Number(row.currentYear) > 0 || Number(row.previousYear) > 0,
    );

  if (!hasData) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: 320,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Purchase revenue — {currentYear} vs {previousYear}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No completed purchase data available yet
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Purchase revenue — {currentYear} vs {previousYear}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Monthly totals for completed package purchases
      </Typography>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" />
          <YAxis
            tickFormatter={(v) =>
              Number(v).toLocaleString(undefined, { notation: "compact" })
            }
          />
          <Tooltip
            formatter={(value, name) => [formatCurrency(value), name]}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="currentYear"
            name={`${currentYear}`}
            stroke="#1674BB"
            strokeWidth={3}
            dot={{ r: 4, fill: "#1674BB" }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="previousYear"
            name={`${previousYear}`}
            stroke="#28a745"
            strokeWidth={3}
            strokeDasharray="6 4"
            dot={{ r: 4, fill: "#28a745" }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PurchaseYoYLineChart;
