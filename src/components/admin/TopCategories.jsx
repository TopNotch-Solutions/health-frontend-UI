import React from "react";
import { ResponsivePie } from "@nivo/pie";
import { useMediaQuery, useTheme } from "@mui/material";

function TopCategories() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const data = [
    {
      id: "php",
      label: "php",
      value: 190,
      color: "hsl(83, 70%, 50%)",
    },
    {
      id: "rust",
      label: "rust",
      value: 493,
      color: "hsl(155, 70%, 50%)",
    },
    {
      id: "java",
      label: "java",
      value: 389,
      color: "hsl(276, 70%, 50%)",
    },
    {
      id: "sass",
      label: "sass",
      value: 485,
      color: "hsl(147, 70%, 50%)",
    },
    {
      id: "erlang",
      label: "erlang",
      value: 464,
      color: "hsl(193, 70%, 50%)",
    },
  ];

  return (
    <ResponsivePie
      data={data}
      margin={{ top: 10, right: 60, bottom: 70, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderWidth={1}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.2]],
      }}
      arcLinkLabelsSkipAngle={360}
      arcLinkLabelsTextColor="#333333"
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{
        from: "color",
        modifiers: [["darker", 2]],
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
      legends={[
        {
          anchor: "bottom",
          direction: "row",
          justify: false,
          translateX: isSmallScreen ? 0 : -10,
          translateY: 56,
          itemsSpacing: 0,
          itemWidth: 60,
          itemHeight: 18,
          itemTextColor: "#999",
          itemDirection: "left-to-right",
          itemOpacity: 1,
          symbolSize: 18,
          symbolShape: "circle",
          effects: [
            {
              on: "hover",
              style: {
                itemTextColor: "#000",
              },
            },
          ],
        },
      ]}
    />
  );
}

export default TopCategories;
