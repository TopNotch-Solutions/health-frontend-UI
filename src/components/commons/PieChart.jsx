import React from 'react';
import { ResponsivePie } from '@nivo/pie';
import { Box } from "@mui/material";

function PieChart() {
    const data = [
        {
          "id": "financial market",
          "label": "financial",
          "value": 312,
          "color": "hsl(118, 70%, 50%)"
        },
        {
          "id": "elixir",
          "label": "elixir",
          "value": 586,
          "color": "hsl(283, 70%, 50%)"
        },
        {
          "id": "scala",
          "label": "scala",
          "value": 429,
          "color": "hsl(342, 70%, 50%)"
        },
        {
          "id": "php",
          "label": "php",
          "value": 334,
          "color": "hsl(168, 70%, 50%)"
        },
        {
          "id": "lisp",
          "label": "lisp",
          "value": 298,
          "color": "hsl(103, 70%, 50%)"
        }
      ]
  return (
    <Box height="280px">
    <ResponsivePie
          data={data}
          theme={{
            axis: {
              domain: {
                line: {
                  stroke: 'red',
                },
              },
              legend: {
                text: {
                  fill: 'red',
                },
              },
              ticks: {
                line: {
                  stroke:'red',
                  strokeWidth: 1,
                },
                text: {
                  fill: 'red',
                },
              },
            },
            legends: {
              text: {
                fill: 'red',
              },
            },
          }}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          borderColor={{
            from: "color",
            modifiers: [["darker", 0.2]],
          }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor={'red'}
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          enableArcLabels={false}
          arcLabelsRadiusOffset={0.4}
          arcLabelsSkipAngle={7}
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
          legends={[
            {
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 56,
              itemsSpacing: 0,
              itemWidth: 73,
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
    </Box>
  )
}

export default PieChart