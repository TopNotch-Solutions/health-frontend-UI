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
import TodayIcon from "@mui/icons-material/Today";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import { ResponsivePie } from "@nivo/pie";
import { useDispatch } from "react-redux";
import LineChartCard from "../components/LineChartCard";
import PurchaseYoYLineChart from "../components/PurchaseYoYLineChart";
import fetchJSON from "../utils/fetchJSON";
import { toast } from "react-toastify";

const emptyPurchasePeriod = { total: 0, count: 0 };

const formatPurchaseTotal = (value) =>
  `N$ ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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
  const [purchaseDay, setPurchaseDay] = useState(emptyPurchasePeriod);
  const [purchaseWeek, setPurchaseWeek] = useState(emptyPurchasePeriod);
  const [purchaseMonth, setPurchaseMonth] = useState(emptyPurchasePeriod);
  const [purchaseYear, setPurchaseYear] = useState(emptyPurchasePeriod);
  const [purchaseYoYLineData, setPurchaseYoYLineData] = useState([]);
  const [purchaseCurrentYear, setPurchaseCurrentYear] = useState(
    new Date().getFullYear(),
  );
  const [purchasePreviousYear, setPurchasePreviousYear] = useState(
    new Date().getFullYear() - 1,
  );

  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleIsSubmittingTrue());
      setIsLoading(true);
      try {
        // Fetch dashboard stats
        const statsResponse = await fetchJSON(
          "https://apihealthconnect.kopanovertex.com/api/portal/auth/dashboard-stats",
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

          const purchaseStats = stats.purchaseStats || {};
          setPurchaseDay(purchaseStats.day || emptyPurchasePeriod);
          setPurchaseWeek(purchaseStats.week || emptyPurchasePeriod);
          setPurchaseMonth(purchaseStats.month || emptyPurchasePeriod);
          setPurchaseYear(purchaseStats.year || emptyPurchasePeriod);
          setPurchaseYoYLineData(purchaseStats.yoYLineData || []);
          setPurchaseCurrentYear(
            purchaseStats.currentYear || new Date().getFullYear(),
          );
          setPurchasePreviousYear(
            purchaseStats.previousYear || new Date().getFullYear() - 1,
          );
        }

        // Fetch specializations count
        try {
          const specResponse = await fetchJSON(
            "https://apihealthconnect.kopanovertex.com/api/portal/specialization/all-specializations",
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
            "https://apihealthconnect.kopanovertex.com/api/portal/aligment/all-alignments",
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
            "https://apihealthconnect.kopanovertex.com/api/portal/faq/all-faq",
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

      {/* Purchase statistics — completed purchases only */}
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom sx={{ mt: 1 }}>
          Purchase statistics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Completed package purchases only (day / week / month / year)
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card raised sx={{ height: "100%", borderTop: "4px solid #1674BB" }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <TodayIcon sx={{ color: "#1674BB" }} fontSize="large" />
              <Box>
                <Typography variant="h5" component="div">
                  {isLoading ? "..." : formatPurchaseTotal(purchaseDay.total)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Today
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isLoading ? "" : `${purchaseDay.count || 0} purchases`}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card raised sx={{ height: "100%", borderTop: "4px solid #28a745" }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <DateRangeIcon sx={{ color: "#28a745" }} fontSize="large" />
              <Box>
                <Typography variant="h5" component="div">
                  {isLoading ? "..." : formatPurchaseTotal(purchaseWeek.total)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This week
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isLoading ? "" : `${purchaseWeek.count || 0} purchases`}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card raised sx={{ height: "100%", borderTop: "4px solid #ff9800" }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <CalendarMonthIcon sx={{ color: "#ff9800" }} fontSize="large" />
              <Box>
                <Typography variant="h5" component="div">
                  {isLoading ? "..." : formatPurchaseTotal(purchaseMonth.total)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This month
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isLoading ? "" : `${purchaseMonth.count || 0} purchases`}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card raised sx={{ height: "100%", borderTop: "4px solid #9c27b0" }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <EventAvailableIcon sx={{ color: "#9c27b0" }} fontSize="large" />
              <Box>
                <Typography variant="h5" component="div">
                  {isLoading ? "..." : formatPurchaseTotal(purchaseYear.total)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This year
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isLoading ? "" : `${purchaseYear.count || 0} purchases`}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card raised>
          <CardContent>
            <PurchaseYoYLineChart
              data={purchaseYoYLineData}
              isLoading={isLoading}
              currentYear={purchaseCurrentYear}
              previousYear={purchasePreviousYear}
            />
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