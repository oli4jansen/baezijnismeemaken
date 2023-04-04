import { Component, createMemo, ErrorBoundary } from 'solid-js';

import { Route, Routes, useLocation } from '@solidjs/router';
import AdminReservationDetails from './private/AdminReservationDetails';
import CreateTicketType from './private/CreateTicketType';
import Dashboard from './private/Dashboard';
import Scanner from './private/Scanner';
import Settings from './private/Settings';
import TicketDetails from './private/TicketDetails';
import Tickets from './private/Tickets';
import UpdateTicketType from './private/UpdateTicketType';
import CompletionForm from './public/CompletionForm';
import Login from './public/Login';
import Thanks from './public/Thanks';
import TicketShop from './public/TicketShop';

const App: Component = () => {
  const location = useLocation();

  const isPublic = createMemo(() => !location.pathname.startsWith('/admin'));

  return (
    <div class={isPublic() ? "small-viewport" : ""}>
      <ErrorBoundary fallback={(error) => <>{JSON.stringify(error)}</>}>
        <Routes>
          {/* Public routes */}
          <Route path="/" component={TicketShop} />
          <Route path="/complete/:id" component={CompletionForm} />
          <Route path="/baedankt/:id" component={Thanks} />
          <Route path="/admin" component={Login} />
          {/* Private routes */}
          <Route path="/admin/dashboard" component={Dashboard} />
          <Route path="/admin/settings" component={Settings} />
          <Route path="/admin/tickets" component={Tickets} />
          <Route path="/admin/tickets/:id" component={TicketDetails} />
          <Route path="/admin/reservations/:id" component={AdminReservationDetails} />
          <Route path="/admin/scanner" component={Scanner} />
          <Route path="/admin/settings/new" component={CreateTicketType} />
          <Route path="/admin/settings/:id" component={UpdateTicketType} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
};

export default App;


