import { Badge, Box, Heading, HStack } from "@hope-ui/solid";
import { useNavigate } from "@solidjs/router";
import { Component, createResource, createSignal, For, onCleanup, onMount } from "solid-js";
import { fetchTicketTypes, TicketStatistics } from "../utils/api";
import { ensureLoggedIn } from "../utils/auth";
import AdminMenu from "./AdminMenu";
import { SolidApexCharts } from 'solid-apexcharts';
import { ApexOptions } from "apexcharts";
import { format } from "date-fns";
import createWebsocket from "../utils/websocket";
import { CHART } from "./chart-config";



const Dashboard: Component = () => {
  const navigate = useNavigate();

  const [ticketTypes] = createResource(fetchTicketTypes);

  const [options, setOptions] = createSignal<ApexOptions>({
    ...CHART,
    xaxis: { categories: [] }
  });

  const [series, setSeries] = createSignal({
    list: [] as ApexAxisChartSeries,
  });

  const token = localStorage.getItem('token') || "";

  const onOpen = () => {
    send(token);
  };

  const [connect, disconnect, send, state] = createWebsocket(
    "ws://localhost:8080/live",
    msg => {
      try {
        const data = JSON.parse(msg.data);
        parseStatistics(data);
      } catch (error) {
        console.error(error);
      }
    },
    msg => console.log(msg),
    onOpen
  );

  onMount(async () => {
    ensureLoggedIn(() => navigate('/admin'));
    connect();
  });

  onCleanup(() => disconnect());

  const parseStatistics = (stats: TicketStatistics[]) => {
    console.log(stats);
    if (!stats || typeof stats !== 'object' || !stats.length) {
      console.log('Not continuing');
      return;
    }
    const dates = [...stats.reduce((acc, cur) => { acc.add(format(new Date(cur.date), 'yyyy-MM-dd')); return acc; }, new Set())].sort();

    setOptions({
      ...CHART,
      xaxis: {
        ...CHART.xaxis,
        categories: dates,
      }
    });

    const ticketTypeToStatsByDay: { [tt: string]: { name: string; data: number[]; } } = {};

    stats.forEach(s => {
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
  };

  return (
    <>
      <AdminMenu></AdminMenu>

      <Heading size="2xl" class="admin-title">Dashboard</Heading>

      <SolidApexCharts width="100%" height="300px" type="bar" options={options()} series={series().list} />

      <HStack spacing="12px">
        <For each={ticketTypes()}>{(tt: any) =>
          <Box
            maxW="$sm"
            borderWidth="1px"
            borderColor="$neutral6"
            borderRadius="$lg"
            overflow="hidden"
          >
            <Box p="$6">
              <Box display="flex" alignItems="baseline">
                <Badge px="$2" colorScheme="success" rounded="$full">
                  &euro;{(tt.price / 100).toFixed(2)}
                </Badge>
              </Box>

              <Box mt="8px" mb="2px" noOfLines={1}>
                <h4>{tt.name}</h4>
              </Box>

              <Box>
                {tt.amount_available - tt.amount_left} verkocht &nbsp;
                <Box as="span" color="$neutral11" fontSize="$sm">
                  / {tt.amount_available} totaal
                </Box>
              </Box>
            </Box>
          </Box>
        }</For>
      </HStack>
    </>
  );

};

export default Dashboard;