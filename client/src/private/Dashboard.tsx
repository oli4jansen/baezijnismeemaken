import { Heading } from "@hope-ui/solid";
import { useNavigate } from "@solidjs/router";
import { ApexOptions } from "apexcharts";
import { format } from "date-fns";
import { SolidApexCharts } from 'solid-apexcharts';
import { Component, createSignal, onCleanup, onMount } from "solid-js";
import { createStatisticsStream, TicketStatistics, TicketStatisticsSalesPerDay, TicketType } from "../utils/api";
import { ensureLoggedIn } from "../utils/auth";
import AdminMenu from "./AdminMenu";
import { SALES_PER_DAY_CHART, TOTALS_CHART } from "./chart-config";
import SalesPerDayChart from "./SalesPerDayChart";
import TotalsChart from "./TotalsCharts";


const Dashboard: Component = () => {
  const navigate = useNavigate();

  /**
   * 1. Set up the Apex charts.
   * We're showing one for the sales per day (vertical bar chart) and one for the totals (horizontal bar chart)
   */
  //  const [salesPerDayOptions, setSalesPerDayOptions] = createSignal<ApexOptions>({
  //   ...SALES_PER_DAY_CHART,
  //   xaxis: { categories: [] }
  // });

  // const [salesPerDaySeries, setSalesPerDaySeries] = createSignal({
  //   list: [] as ApexAxisChartSeries,
  // });

  // const [totalsOptions, setTotalsOptions] = createSignal<ApexOptions>({
  //   ...TOTALS_CHART,
  //   xaxis: { categories: [] }
  // });

  // const [totalsSeries, setTotalsSeries] = createSignal({
  //   list: [] as ApexAxisChartSeries,
  // });



  /**
   * 2. Function to feed the statistics into the charts
   */
  // const parseStatistics = (stats: TicketStatistics) => {
  //   console.log(stats);
  //   if (!stats || typeof stats !== 'object') {
  //     console.log('Not continuing');
  //     return;
  //   }


  //   const dates = [...stats.sales_per_day.reduce((acc, cur) => { acc.add(format(new Date(cur.date), 'yyyy-MM-dd')); return acc; }, new Set())].sort();

  //   setSalesPerDayOptions({
  //     ...SALES_PER_DAY_CHART,
  //     xaxis: {
  //       ...SALES_PER_DAY_CHART.xaxis,
  //       categories: dates,
  //     }
  //   });

  //   const ticketTypeToStatsByDay: { [tt: string]: { name: string; data: number[]; } } = {};

  //   stats.sales_per_day.forEach(s => {
  //     if (!ticketTypeToStatsByDay[s.ticket_type]) {
  //       ticketTypeToStatsByDay[s.ticket_type] = {
  //         name: s.name,
  //         data: new Array(dates.length).fill(0)
  //       };
  //     }
  //     const index = dates.indexOf(format(new Date(s.date), 'yyyy-MM-dd'));
  //     if (index === -1) {
  //       console.log('error', s, dates);
  //     }
  //     ticketTypeToStatsByDay[s.ticket_type].data[index] = s.amount;
  //   });

  //   setSalesPerDaySeries({
  //     list: Object.values(ticketTypeToStatsByDay)
  //   });
  // };

  const [salesPerDay, setSalesPerDay] = createSignal<TicketStatisticsSalesPerDay[]>([]);
  const [ticketTypes, setTicketTypes] = createSignal<TicketType[]>([]);

  /**
   * 3. Connect to a stream of statistics data from the backend
   */
  const [connect, disconnect] = createStatisticsStream<TicketStatistics>((data) => {
    setSalesPerDay(data.sales_per_day);
    setTicketTypes(data.totals);
  });

  onMount(async () => {
    ensureLoggedIn(() => navigate('/admin'));
    connect();
  });

  onCleanup(() => disconnect());


  return (
    <>
      <AdminMenu></AdminMenu>

      <Heading size="2xl" class="admin-title">Dashboard</Heading>

      <pre>{ salesPerDay().length }</pre>

      {/* <SolidApexCharts width="100%" height="300px" type="bar" options={salesPerDayOptions()} series={salesPerDaySeries().list} /> */}
      <SalesPerDayChart statistics={salesPerDay()}></SalesPerDayChart>
      <TotalsChart tickets={ticketTypes()}></TotalsChart>

      <p>Bovenstaande grafiek toont het aantal verkochte kaartjes op de dagen dat er verkocht is. De betaling moet succesvol afgerond zijn voor de gereserveerde kaartjes meegeteld worden.</p>


    </>
  );

};

export default Dashboard;