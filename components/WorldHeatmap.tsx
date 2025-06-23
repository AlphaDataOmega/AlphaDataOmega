import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function WorldHeatmap({ data }: { data: Record<string, number> }) {
  const values = Object.values(data);
  const max = values.length ? Math.max(...values) : 0;
  const color = scaleLinear<string>().domain([0, max || 1]).range(["#ffedea", "#ff5233"]);

  return (
    <ComposableMap projectionConfig={{ scale: 150 }}>
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const code = (geo.properties as any).ISO_A2 as string;
            const val = data[code] || 0;
            return (
              <Geography key={geo.rsmKey} geography={geo} fill={val ? color(val) : "#EEE"} />
            );
          })
        }
      </Geographies>
    </ComposableMap>
  );
}
