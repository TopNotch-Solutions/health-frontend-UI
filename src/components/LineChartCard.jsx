import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip, LabelList } from 'recharts';
import CircularProgress from "@mui/material/CircularProgress";
import { Box, Typography } from "@mui/material";

const LineChartCard = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 301 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 301 }}>
        <Typography variant="h6" gutterBottom>
          Monthly Registrations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No registration data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Monthly Registrations
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            label={{ value: 'Number of Registrations', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            name="Registrations"
            stroke="rgba(21, 78, 138, 1)"
            strokeWidth={2}
            activeDot={{ r: 8 }}
          >
            <LabelList dataKey="count" position="top" />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LineChartCard;