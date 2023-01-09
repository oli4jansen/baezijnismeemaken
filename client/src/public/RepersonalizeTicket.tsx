import { useParams } from '@solidjs/router';
import { Component, ErrorBoundary } from 'solid-js';
import Header from './Header';
import RepersonalizeTicketForm from './RepersonalizeTicketForm';

const RepersonalizeTicket: Component = () => {
  const params = useParams();

  return (
    <>
      <Header />

      <br />
      <br />

      <ErrorBoundary fallback={() => <>Dit kaartje bestaat niet, is doorverkocht of is al gescand.</>}>
        <RepersonalizeTicketForm qr={params.qr} />
      </ErrorBoundary>
    </>
  );
};

export default RepersonalizeTicket;
