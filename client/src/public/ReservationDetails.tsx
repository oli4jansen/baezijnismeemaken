import { Alert, Badge, Button, createDisclosure, Heading, HStack, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, Table, Tbody, Td, Tr } from '@hope-ui/solid';
import { useNavigate } from '@solidjs/router';
import { format } from 'date-fns';
import { Component, createEffect, createResource, createSignal, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { fetchReservation, fetchTicketWithQr, personalizeTicket } from '../utils/api';

const ReservationDetails: Component<{ id: string }> = (props) => {
    const navigate = useNavigate();

    const [reservation] = createResource(() => props.id, fetchReservation);

    return (
        <>
            <Show when={reservation.loading}>
                <div class="spinner-container">
                    <Spinner />
                </div>
            </Show>

            <Show when={!reservation.loading}>
                <Badge colorScheme="info" style="margin-bottom: 12px">Reservering</Badge>
                <Heading size="4xl" class="extrabold main-title">Joe</Heading>


                {/* <Alert status="info">
                    <HStack direction="row" justifyContent="space-between" alignItems="center" spacing={8} style="width: 100%">
                        <>
                            Kaartje doorverkocht? Pas het kaartje aan met de gegevens van de nieuwe eigenaar!
                        </>
                        <Button onClick={() => setEditing(true)} variant="subtle" colorScheme="info">Aanpassen</Button>
                    </HStack>
                </Alert> */}

                {JSON.stringify(reservation(), null, 2)}
            </Show>

        </>
    );
};

export default ReservationDetails;
