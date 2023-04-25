import { Heading } from "@hope-ui/solid";
import { useNavigate } from "@solidjs/router";
import { Component, Show, createEffect, createResource, createSignal, onCleanup, onMount } from "solid-js";
import { fetchStatistics, TicketStatistics, TicketStatisticsSalesPerDay, TicketType } from "../utils/api";
import { ensureLoggedIn } from "../utils/auth";
import AdminMenu from "./AdminMenu";
import SalesPerDayChart from "./SalesPerDayChart";
import TotalsChart from "./TotalsCharts";


const Dashboard: Component = () => {
  const navigate = useNavigate();

  const [salesPerDay, setSalesPerDay] = createSignal<TicketStatisticsSalesPerDay[]>([]);
  const [ticketTypes, setTicketTypes] = createSignal<TicketType[]>([]);

  const [statistics] = createResource(fetchStatistics);

  onMount(async () => {
    ensureLoggedIn(() => navigate('/admin'));
  });

  createEffect(() => {
    const stats = statistics();
    if (stats) {
      setSalesPerDay(stats.sales_per_day);
      setTicketTypes(stats.totals);
    }
  });

  return (
    <>
      <AdminMenu></AdminMenu>

      <Heading size="2xl" class="admin-title">Dashboard</Heading>

      <pre>{ salesPerDay().length }</pre>

      <Show when={salesPerDay()}>
        <SalesPerDayChart statistics={salesPerDay()}></SalesPerDayChart>
        <TotalsChart tickets={ticketTypes()}></TotalsChart>

        <p>Bovenstaande grafiek toont het aantal verkochte kaartjes op de dagen dat er verkocht is. De betaling moet succesvol afgerond zijn voor de gereserveerde kaartjes meegeteld worden.</p>
      </Show>
    </>
  );

};

export default Dashboard;