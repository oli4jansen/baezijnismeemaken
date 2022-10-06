import { Component, createMemo, createResource, createSignal, ErrorBoundary } from 'solid-js';

import TicketShop from './public/TicketShop';
import { Navigate, Route, Routes, useLocation } from '@solidjs/router';
import CompletionForm from './public/CompletionForm';
import { Heading } from '@hope-ui/solid';
import Thanks from './public/Thanks';
import Login from './public/Login';
import Dashboard from './private/Dashboard';
import Tickets from './private/Tickets';
import Settings from './private/Settings';
import UpdateTicketType from './private/UpdateTicketType';
import CreateTicketType from './private/CreateTicketType';
import Scanner from './private/Scanner';
import TicketDetails from './private/TicketDetails';
import ReservationDetails from './private/ReservationDetails';
import RepersonalizeTicket from './public/RepersonalizeTicket';
import Repersonalized from './public/Repersonalized';

const App: Component = () => {
  const location = useLocation();

  const isPublic = createMemo(() => !location.pathname.startsWith('/admin'));

  return (
    <div class={isPublic() ? "small-viewport" : ""}>
      <ErrorBoundary fallback={(error) => <>{JSON.stringify(error)}</>}>
        <Routes>
          {/* Public routes */}
          <Route path="/" component={TicketShop} />
          <Route path="/reservation/:id" component={CompletionForm} />
          <Route path="/ticket/:qr" component={RepersonalizeTicket} />
          <Route path="/baedankt" component={Thanks} />
          <Route path="/repersonalized" component={Repersonalized} />
          <Route path="/admin" component={Login} />
          {/* Private routes */}
          <Route path="/admin/dashboard" component={Dashboard} />
          <Route path="/admin/settings" component={Settings} />
          <Route path="/admin/tickets" component={Tickets} />
          <Route path="/admin/tickets/:id" component={TicketDetails} />
          <Route path="/admin/reservations/:id" component={ReservationDetails} />
          <Route path="/admin/scanner" component={Scanner} />
          <Route path="/admin/settings/new" component={CreateTicketType} />
          <Route path="/admin/settings/:id" component={UpdateTicketType} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
};

export default App;


