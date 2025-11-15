import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import {
  toggleIsSubmittingTrue,
  toggleIsSubmittingfalse,
} from "../redux/reducers/submittingReducer";
import PeopleIcon from "@mui/icons-material/People";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PersonIcon from "@mui/icons-material/Person";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import HealingIcon from "@mui/icons-material/Healing";
import HelpIcon from "@mui/icons-material/Help";
import { ResponsivePie } from "@nivo/pie";
import { useDispatch } from "react-redux";
import LineChartCard from "../components/LineChartCard";
import fetchJSON from "../utils/fetchJSON";
import { toast } from "react-toastify";

function Dashboard() {
  const dispatch = useDispatch();

  const [totalUsers, setTotalUsers] = useState(0);
  const [patients, setPatients] = useState(0);
  const [healthProviders, setHealthProviders] = useState(0);
  const [totalTowns, setTotalTowns] = useState(0);
  const [totalSpecializations, setTotalSpecializations] = useState(0);
  const [totalAilments, setTotalAilments] = useState(0);
  const [totalFAQs, setTotalFAQs] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [topCategory, setTopCategory] = useState([]);
  const [lineData, setLineData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleIsSubmittingTrue());
      setIsLoading(true);
      try {
        // Fetch dashboard stats
        const statsResponse = await fetchJSON(
          "http://13.61.152.64:4000/api/portal/auth/dashboard-stats",
          "GET"
        );

        if (statsResponse.status === true && statsResponse.stats) {
          const stats = statsResponse.stats;
          setTotalUsers(stats.totalUsers || 0);
          setPatients(stats.patients || 0);
          setHealthProviders(stats.healthProviders || 0);
          setTotalTowns(stats.totalTowns || 0);
          // Ensure lineData is set properly
          const registrationData = stats.lineData || [];
          setLineData(registrationData);
          console.log('Line chart data:', registrationData);
          
          if (stats.topDepartments && stats.topDepartments.length > 0) {
            setTopCategory(stats.topDepartments);
          } else {
            setTopCategory([]);
          }
        }

        // Fetch specializations count
        try {
          const specResponse = await fetchJSON(
            "http://13.61.152.64:4000/api/portal/specialization/all-specializations",
            "GET"
          );
          if (specResponse.specializations) {
            setTotalSpecializations(specResponse.specializations.length || 0);
          }
        } catch (err) {
          console.error("Error fetching specializations:", err);
        }

        // Fetch ailments count
        try {
          const ailmentResponse = await fetchJSON(
            "http://13.61.152.64:4000/api/portal/aligment/all-alignments",
            "GET"
          );
          if (ailmentResponse.ailments) {
            setTotalAilments(ailmentResponse.ailments.length || 0);
          }
        } catch (err) {
          console.error("Error fetching ailments:", err);
        }

        // Fetch FAQs count
        try {
          const faqResponse = await fetchJSON(
            "http://13.61.152.64:4000/api/portal/faq/all-faq",
            "GET"
          );
          if (faqResponse.faqs) {
            setTotalFAQs(faqResponse.faqs.length || 0);
          }
        } catch (err) {
          console.error("Error fetching FAQs:", err);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
        dispatch(toggleIsSubmittingfalse());
      }
    };

    fetchData();
  }, [dispatch]);

  // Build pie chart data from topCategory, filtering out invalid entries
  const pieData = React.useMemo(() => {
    if (!topCategory || topCategory.length === 0) {
      return [];
    }
    
    const colors = [
      "hsl(83, 70%, 50%)",
      "hsl(155, 70%, 50%)",
      "hsl(276, 70%, 50%)",
      "hsl(147, 70%, 50%)",
      "hsl(193, 70%, 50%)",
    ];
    
    return topCategory
      .filter(item => item && item.primaryIndustry && item.industryCount !== undefined && item.industryCount !== null)
      .map((item, index) => ({
        id: item.primaryIndustry,
        label: item.primaryIndustry,
        value: item.industryCount,
        color: colors[index % colors.length],
      }));
  }, [topCategory]);

  return (
    <Grid container spacing={4} sx={{ p: { xs: 2, md: 4 } }}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all System Performance and Analytics
        </Typography>
      </Grid>

      {/* Statistics Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <Card raised sx={{ height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <PeopleIcon color="primary" fontSize="large" />
              <Box>
                <Typography variant="h4" component="div">
                  {isLoading ? "..." : totalUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total App Users
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card raised sx={{ height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <PersonIcon color="success" fontSize="large" />
              <Box>
                <Typography variant="h4" component="div">
                  {isLoading ? "..." : patients}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Patients
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card raised sx={{ height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <LocalHospitalIcon color="error" fontSize="large" />
              <Box>
                <Typography variant="h4" component="div">
                  {isLoading ? "..." : healthProviders}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Health Providers
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card raised sx={{ height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <LocationCityIcon color="warning" fontSize="large" />
              <Box>
                <Typography variant="h4" component="div">
                  {isLoading ? "..." : totalTowns}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Performing Regions
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Charts Row */}
      <Grid item xs={12} md={7}>
        <Card raised sx={{ height: '100%' }}>
          <CardContent>
            <LineChartCard data={lineData} isLoading={isLoading} />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={5}>
        <Card raised sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top 5 Performing Regions
            </Typography>
            {pieData && pieData.length > 0 ? (
              <Box sx={{ height: 300 }}>
                <ResponsivePie
                  data={pieData}
                  margin={{ top: 30, right: 10, bottom: 30, left: 40 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  borderWidth={1}
                  borderColor={{
                    from: "color",
                    modifiers: [["darker", 0.2]],
                  }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#333333"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: "color" }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{
                    from: "color",
                    modifiers: [["darker", 8]],
                  }}
                  defs={[
                    {
                      id: "dots",
                      type: "patternDots",
                      background: "inherit",
                      color: "rgba(255, 255, 255, 0.3)",
                      size: 4,
                      padding: 1,
                      stagger: true,
                    },
                    {
                      id: "lines",
                      type: "patternLines",
                      background: "inherit",
                      color: "rgba(255, 255, 255, 0.3)",
                      rotation: -45,
                      lineWidth: 6,
                      spacing: 10,
                    },
                  ]}
                  fill={[
                    {
                      match: {
                        id: "ruby",
                      },
                      id: "dots",
                    },
                    {
                      match: {
                        id: "c",
                      },
                      id: "dots",
                    },
                    {
                      match: {
                        id: "go",
                      },
                      id: "dots",
                    },
                    {
                      match: {
                        id: "python",
                      },
                      id: "dots",
                    },
                    {
                      match: {
                        id: "scala",
                      },
                      id: "lines",
                    },
                    {
                      match: {
                        id: "lisp",
                      },
                      id: "lines",
                    },
                    {
                      match: {
                        id: "elixir",
                      },
                      id: "lines",
                    },
                    {
                      match: {
                        id: "javascript",
                      },
                      id: "lines",
                    },
                  ]}
                />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                {isLoading ? (
                  <CircularProgress />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No region data available
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Additional Analytics Cards */}
      <Grid item xs={12} sm={6} md={4}>
        <Card raised sx={{ height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <LocalHospitalIcon color="secondary" fontSize="large" />
              <Box>
                <Typography variant="h4" component="div">
                  {isLoading ? "..." : totalSpecializations}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Specializations
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Card raised sx={{ height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <HealingIcon color="error" fontSize="large" />
              <Box>
                <Typography variant="h4" component="div">
                  {isLoading ? "..." : totalAilments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ailments
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Card raised sx={{ height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <HelpIcon color="info" fontSize="large" />
              <Box>
                <Typography variant="h4" component="div">
                  {isLoading ? "..." : totalFAQs}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  FAQs
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Grid>
  );
}

export default Dashboard;