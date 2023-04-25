import { ApexOptions } from "apexcharts";
import { SolidApexCharts } from 'solid-apexcharts';
import { Component, createEffect, createSignal } from "solid-js";
import { TicketType } from "../utils/api";
import { SALES_PER_DAY_CHART, TOTALS_CHART } from "./chart-config";

const TotalsChart: Component<{ tickets: TicketType[] }> = (props) => {

  // Signals to create the chart and set the data
  const [options, setOptions] = createSignal<ApexOptions>({
    ...TOTALS_CHART,
    xaxis: { categories: [] }
  });

  const [series, setSeries] = createSignal([] as any);

  // Set the chart data when the component receives new statistics
  createEffect(() => {
    if (!props.tickets || typeof props.tickets !== 'object') {
      return <div>Not continuing..</div>;
    }  

    const ticketTypes = props.tickets.map(t => t.name);

    setOptions({
      ...TOTALS_CHART,
      xaxis: {
        ...SALES_PER_DAY_CHART.xaxis,
        categories: ticketTypes,
      }
    });

    setSeries([{
      name: 'Verkocht',
      data: props.tickets.map(tt => tt.amount_available - tt.amount_left)
    }, {
      name: 'Beschikbaar',
      data: props.tickets.map(tt => tt.amount_left)
    }]);
  });

  return (
    <SolidApexCharts width="100%" height="300px" type="bar" options={options()} series={series()} />
  );

};

export default TotalsChart;