import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";
import { AppColors } from "../../constant/appColors";
import { AccessTime, CheckCircle, EventBusy } from "@mui/icons-material";

/* ---------------- DATA ---------------- */
const DATA = {
  ongoing: [
    {
      id: 1,
      title: "YUBIT New Year Mystery Box Festival",
      subtitle: "Trade & Win – Share 1,000,000 USDT",
      time: "2026-01-01 08:30:00 ~ 2026-01-31 08:29:59",
      image:
        "https://images.unsplash.com/photo-1604594849809-dfedbc827105",
      status: "Ongoing",
    },
    {
      id: 2,
      title: "MMTUSDT Futures Listing Event",
      subtitle: "Get a chance to win up to 100 USDT bonus!",
      time: "2025-12-31 08:30:00 ~ 2026-01-10 08:29:59",
      image:
        "https://images.unsplash.com/photo-1622630998477-20aa696ecb05",
      status: "Ongoing",
    },
  ],

  ended: [
    {
      id: 3,
      title: "Christmas Trading Carnival",
      subtitle: "Event has ended",
      time: "2025-12-01 ~ 2025-12-25",
      image:
        "https://images.unsplash.com/photo-1513151233558-d860c5398176",
      status: "Ended",
    },
  ],

  participated: [
    {
      id: 4,
      title: "Welcome Bonus Campaign",
      subtitle: "You participated in this event",
      time: "2025-11-01 ~ 2025-11-30",
      image:
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e",
      status: "Joined",
    },
  ],
};

/* ---------------- MAIN COMPONENT ---------------- */
export default function FeaturedActivities() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { key: "ongoing", label: "Ongoing" },
    { key: "ended", label: "Ended" },
    { key: "participated", label: "My Participations" },
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const currentTabKey = tabs[activeTab].key;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 0 } }}>
      {/* TITLE */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          mb: 4,
          color: AppColors.TXT_MAIN,
          fontSize: { xs: "1.75rem", md: "2.25rem" },
          background: `linear-gradient(135deg, ${AppColors.TXT_MAIN} 0%, ${AppColors.GOLD_PRIMARY} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Featured Activities
      </Typography>

      {/* TABS */}
      <Box
        sx={{
          borderBottom: `1px solid ${AppColors.HLT_NONE}`,
          mb: 4,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            "& .MuiTabs-indicator": {
              height: 2,
              background: `linear-gradient(90deg, ${AppColors.GOLD_PRIMARY}, ${AppColors.GOLD_LIGHT})`,
              borderRadius: 1,
            },
            "& .MuiTab-root": {
              color: AppColors.TXT_SUB,
              textTransform: "none",
              fontSize: "0.938rem",
              fontWeight: 500,
              minHeight: 48,
              transition: "all 0.3s ease",
              "&:hover": {
                color: AppColors.GOLD_PRIMARY,
                bgcolor: `${AppColors.GOLD_PRIMARY}10`,
              },
              "&.Mui-selected": {
                color: AppColors.GOLD_PRIMARY,
                fontWeight: 600,
              },
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.key} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {/* LIST */}
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {DATA[currentTabKey].map((item) => (
          <Grid size={{ xs: 12 }} key={item.id}>
            <ActivityCard item={item} />
          </Grid>
        ))}

        {DATA[currentTabKey].length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                color: AppColors.TXT_SUB,
              }}
            >
              <Typography variant="body1">No activities available.</Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

/* ---------------- CARD ---------------- */
function ActivityCard({ item }) {
  const isOngoing = item.status === "Ongoing";
  const isEnded = item.status === "Ended";
  const isJoined = item.status === "Joined";

  return (
    <Card
      sx={{
        bgcolor: AppColors.BG_CARD,
        border: `1px solid ${isOngoing ? AppColors.GOLD_PRIMARY : AppColors.HLT_NONE}40`,
        borderRadius: 3,
        overflow: "hidden",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: isOngoing
            ? `linear-gradient(90deg, ${AppColors.GOLD_PRIMARY} 0%, ${AppColors.GOLD_LIGHT} 100%)`
            : "transparent",
        },
        "&:hover": {
          borderColor: isOngoing ? AppColors.GOLD_PRIMARY : AppColors.HLT_NONE,
          transform: isOngoing ? "translateY(-4px)" : "none",
          boxShadow: isOngoing
            ? `0 12px 32px ${AppColors.GOLD_PRIMARY}25`
            : `0 4px 16px ${AppColors.HLT_NONE}20`,
        },
      }}
    >
      {/* IMAGE */}
      <CardMedia
        component="img"
        image={item.image}
        alt={item.title}
        sx={{
          width: { xs: "100%", md: 320 },
          height: { xs: 240, md: "100%" },
          objectFit: "cover",
          borderRight: { md: `1px solid ${AppColors.HLT_NONE}40` },
          borderBottom: { xs: `1px solid ${AppColors.HLT_NONE}40`, md: "none" },
        }}
      />

      {/* CONTENT */}
      <CardContent
        sx={{
          flex: 1,
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              mb: 2,
              gap: 2,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: AppColors.TXT_MAIN,
                fontSize: { xs: "1.25rem", md: "1.5rem" },
                flex: 1,
              }}
            >
              {item.title}
            </Typography>

            <Chip
              icon={
                isOngoing ? (
                  <AccessTime sx={{ fontSize: 16 }} />
                ) : isEnded ? (
                  <EventBusy sx={{ fontSize: 16 }} />
                ) : (
                  <CheckCircle sx={{ fontSize: 16 }} />
                )
              }
              label={item.status}
              sx={{
                bgcolor: isOngoing
                  ? `${AppColors.SUCCESS}20`
                  : isEnded
                    ? `${AppColors.HLT_NONE}30`
                    : `${AppColors.GOLD_PRIMARY}20`,
                color: isOngoing
                  ? AppColors.SUCCESS
                  : isEnded
                    ? AppColors.TXT_SUB
                    : AppColors.GOLD_PRIMARY,
                fontWeight: 600,
                fontSize: "0.75rem",
                height: 28,
              }}
            />
          </Box>

          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              mb: 1.5,
              color: AppColors.TXT_MAIN,
              fontSize: "0.938rem",
            }}
          >
            {item.subtitle}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: AppColors.TXT_SUB,
            }}
          >
            <AccessTime sx={{ fontSize: 16 }} />
            <Typography variant="body2" sx={{ fontSize: "0.813rem" }}>
              Activity time: {item.time}
            </Typography>
          </Box>
        </Box>

        {/* CTA */}
        <Box sx={{ mt: 3 }}>
          <Button
            disabled={!isOngoing}
            className={isOngoing ? "btn-primary" : ""}
            sx={{
              py: 1.5,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.938rem",
              borderRadius: 2,
              ...(!isOngoing && {
                bgcolor: AppColors.HLT_NONE,
                color: AppColors.TXT_SUB,
                opacity: 0.5,
                "&:disabled": {
                  bgcolor: AppColors.HLT_NONE,
                  color: AppColors.TXT_SUB,
                },
              }),
            }}
          >
            {isOngoing ? "Join Now" : "Closed"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
