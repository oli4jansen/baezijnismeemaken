import { Alert, Badge, Button, createDisclosure, Heading, HStack, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, Table, Tbody, Td, Tr } from '@hope-ui/solid';
import { useNavigate } from '@solidjs/router';
import { format } from 'date-fns';
import { Component, createEffect, createResource, createSignal, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { fetchTicketWithQr, personalizeTicket } from '../utils/api';

const RepersonalizeTicketForm: Component<{ qr: string }> = (props) => {
    const navigate = useNavigate();

    // Call the API for the required information
    const [ticket] = createResource(() => props.qr, fetchTicketWithQr);

    const [form, setForm] = createStore<{ owner_email: string; owner_first_name: string; owner_last_name: string }>({
        owner_email: '',
        owner_first_name: '',
        owner_last_name: ''
    });

    const [editing, setEditing] = createSignal(false);
    const [saving, setSaving] = createSignal(false);
    const { isOpen, onOpen, onClose } = createDisclosure()

    createEffect(() => {
        if (ticket() !== undefined) {
            setFormToTicket(ticket());
        }
    });

    const setFormToTicket = (ticket: { owner_first_name: string; owner_last_name: string; owner_email: string }) => {
        setForm({
            owner_email: ticket.owner_email,
            owner_first_name: ticket.owner_first_name,
            owner_last_name: ticket.owner_last_name,
        });
    };

    const save = async () => {
        setSaving(true);
        await personalizeTicket(props.qr, form.owner_email, form.owner_first_name, form.owner_last_name);
        navigate('/repersonalized');
        setSaving(false);
    };

    return (
        <>
            <Show when={ticket.loading}>
                <div class="spinner-container">
                    <Spinner />
                </div>
            </Show>

            <Show when={!ticket.loading}>
                <Badge colorScheme="info" style="margin-bottom: 12px">Kaartje</Badge>
                <Heading size="4xl" class="extrabold main-title">{ticket().ticket_name}</Heading>


                <form onSubmit={e => { e.preventDefault(); onOpen() }}>
                    <Table>
                        <Tbody>
                            <Tr>
                                <Td style="opacity: 0.75; font-size: 14px">Voornaam</Td>
                                <Td numeric>
                                    <Show when={editing()} fallback={ticket().owner_first_name}>
                                        <Input id="owner_first_name" type="text" value={form.owner_first_name} onInput={e => setForm({ owner_first_name: e.currentTarget.value })} />
                                    </Show>
                                </Td>
                            </Tr>

                            <Tr>
                                <Td style="opacity: 0.75; font-size: 14px">Achternaam</Td>
                                <Td numeric>
                                    <Show when={editing()} fallback={ticket().owner_last_name}>
                                        <Input id="owner_last_name" type="text" value={form.owner_last_name} onInput={e => setForm({ owner_last_name: e.currentTarget.value })} />
                                    </Show>
                                </Td>
                            </Tr>

                            <Tr>
                                <Td style="opacity: 0.75; font-size: 14px">E-mailadres</Td>
                                <Td numeric>
                                    <Show when={editing()} fallback={ticket().owner_email}>
                                        <Input id="owner_email" type="email" value={form.owner_email} onInput={e => setForm({ owner_email: e.currentTarget.value })} />
                                    </Show>
                                </Td>
                            </Tr>

                            <Tr>
                                <Td style="opacity: 0.75; font-size: 14px">Aankoopdatum</Td>
                                <Td numeric>
                                    {format(new Date(ticket().created_at), 'yyyy-MM-dd')} {format(new Date(ticket().created_at), 'HH:mm')}
                                </Td>
                            </Tr>

                        </Tbody>
                    </Table>

                    <br />

                    <Show when={editing()}>
                        <HStack justifyContent="end" spacing={6}>
                            <Button type="submit" colorScheme="info" variant="ghost" disabled={saving()} onClick={() => { setEditing(false); setFormToTicket(ticket()) }}>
                                <span>Annuleer</span>
                            </Button>
                            <Button type="submit" colorScheme="info" disabled={form.owner_first_name === ticket().owner_first_name && form.owner_last_name === ticket().owner_last_name && form.owner_email === ticket().owner_email} loading={saving()} loadingText="Aan het opslaan...">
                                <span>Opslaan</span>
                            </Button>
                        </HStack>
                    </Show>

                    <Modal opened={isOpen()} onClose={() => { }}>
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader><b>Weet je het zeker?</b></ModalHeader>
                            <ModalBody>
                                <p>Je staat op het punt de persoonlijke gegevens op dit kaartje aan te passen.</p>
                                <br />
                                <p>Je huidige QR-code wordt ongeldig en een nieuwe QR-code zal naar het nieuwe e-mailadres verstuurd worden.</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button colorScheme="info" variant="ghost" onClick={onClose}>Annuleer</Button>
                                <Button colorScheme="info" onClick={() => { onClose(); save(); }}>Ga door</Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>

                </form>

                <br />

                <Show when={!editing()}>
                    <Alert status="info">
                        <HStack direction="row" justifyContent="space-between" alignItems="center" spacing={8} style="width: 100%">
                            <>
                                Kaartje doorverkocht? Pas het kaartje aan met de gegevens van de nieuwe eigenaar!
                            </>
                            <Button onClick={() => setEditing(true)} variant="subtle" colorScheme="info">Aanpassen</Button>
                        </HStack>
                    </Alert>
                </Show>
            </Show>

        </>
    );
};

export default RepersonalizeTicketForm;
