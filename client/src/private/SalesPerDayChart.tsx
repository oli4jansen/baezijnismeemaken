import { ApexOptions } from "apexcharts";
import { format } from "date-fns";
import { SolidApexCharts } from 'solid-apexcharts';
import { Component, createEffect, createSignal } from "solid-js";
import { TicketStatisticsSalesPerDay } from "../utils/api";
import { SALES_PER_DAY_CHART } from "./chart-config";


const SalesPerDayChart: Component<{ statistics: TicketStatisticsSalesPerDay[] }> = (props) => {

  // Signals to create the chart and set the data
  const [options, setOptions] = createSignal<ApexOptions>({
    ...SALES_PER_DAY_CHART,
    xaxis: { categories: [] }
  });

  const [series, setSeries] = createSignal({
    list: [] as ApexAxisChartSeries
  });

  // Set the chart data when the component receives new statistics
  createEffect(() => {
    if (!props.statistics || typeof props.statistics !== 'object') {
      return <div>Not continuing..</div>;
    }  

    const dates = [...props.statistics.reduce((acc, cur) => { acc.add(format(new Date(cur.date), 'yyyy-MM-dd')); return acc; }, new Set())].sort();

    setOptions({
      ...SALES_PER_DAY_CHART,
      xaxis: {
        ...SALES_PER_DAY_CHART.xaxis,
        categories: dates,
      }
    });

    const ticketTypeToStatsByDay: { [tt: string]: { name: string; data: number[]; } } = {};

    props.statistics.forEach(s => {
      if (!ticketTypeToStatsByDay[s.ticket_type]) {
        ticketTypeToStatsByDay[s.ticket_type] = {
          name: s.name,
          data: new Array(dates.length).fill(0)
        };
      }
      const index = dates.indexOf(format(new Date(s.date), 'yyyy-MM-dd'));
      if (index === -1) {
        console.log('error', s, dates);
      }
      ticketTypeToStatsByDay[s.ticket_type].data[index] = s.amount;
    });

    setSeries({
      list: Object.values(ticketTypeToStatsByDay)
    });
  });

  return (
    <SolidApexCharts width="100%" height="300px" type="bar" options={options()} series={series().list} />
  );

};

export default SalesPerDayChart;