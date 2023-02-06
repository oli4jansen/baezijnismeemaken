import { Heading } from "@hope-ui/solid";
import { useNavigate } from "@solidjs/router";
import { Component, createSignal, onCleanup, onMount } from "solid-js";
import { createStatisticsStream, TicketStatistics, TicketStatisticsSalesPerDay, TicketType } from "../utils/api";
import { ensureLoggedIn } from "../utils/auth";
import AdminMenu from "./AdminMenu";
import SalesPerDayChart from "./SalesPerDayChart";
import TotalsChart from "./TotalsCharts";


const Dashboard: Component = () => {
  const navigate = useNavigate();

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

      <SalesPerDayChart statistics={salesPerDay()}></SalesPerDayChart>
      <TotalsChart tickets={ticketTypes()}></TotalsChart>

      <p>Bovenstaande grafiek toont het aantal verkochte kaartjes op de dagen dat er verkocht is. De betaling moet succesvol afgerond zijn voor de gereserveerde kaartjes meegeteld worden.</p>
    </>
  );

};

export default Dashboard;