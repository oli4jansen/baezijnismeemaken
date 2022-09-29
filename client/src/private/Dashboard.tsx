import { Badge, Box, Heading, HStack } from "@hope-ui/solid";
import { useNavigate } from "@solidjs/router";
import { Component, createMemo, createResource, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { fetchTicketTypes } from "../utils/api";
import { ensureLoggedIn } from "../utils/auth";
import AdminMenu from "./AdminMenu";
import ReservationsLog from "./ReservationsLog";

const Dashboard: Component = () => {
  const navigate = useNavigate();

  const [ticketTypes] = createResource(fetchTicketTypes);

  onMount(() => {
    ensureLoggedIn(() => navigate('/admin'));
  });

  return (
    <>
      <AdminMenu></AdminMenu>

      <Heading size="2xl" class="admin-title">Dashboard</Heading>

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


      {/* <ReservationsLog></ReservationsLog> */}
    </>
  );

};

export default Dashboard;