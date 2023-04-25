import { isLoggedIn } from "./auth";

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  amount_available: number;
  amount_left: number;
}

interface TicketScan {
  id: string;
  rtt_id: string;
  index: number;
  created_at: string;
}

export interface TicketStatistics {
  sales_per_day: TicketStatisticsSalesPerDay[];
  totals: TicketType[];
}

export interface TicketStatisticsSalesPerDay {
  date: string;
  ticket_type: string;
  name: string;
  amount: number;
  revenue: number;
}

const tokenToHeaders = (token: string) => ({ "Authorization": `Bearer ${token}` });


/* RESERVATIONS */

export const createReservation = (tickets: { [id: string]: number }) =>
  errorThrowingCall(`/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(tickets)
  });

export const fetchReservations = () => errorThrowingCall(`/reservations/`);

export const fetchReservation = (id: string) => errorThrowingCall(`/reservations/${id}`);


/* TICKET TYPES */

export const fetchTicketTypes = (): Promise<TicketType[]> => {
  const path = `/ticket_types/`;
  return errorThrowingCall(path);
};

export const fetchTicketType = (id: string): Promise<TicketType> => errorThrowingCall(`/ticket_types/${id}`);

export const createTicketType = (tt: { name: string; description: string; price: number; amount_available: number; }): Promise<TicketType> => errorThrowingCall(`/ticket_types`, {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(tt),
});

export const putTicketType = (tt: Partial<TicketType>): Promise<TicketType> => errorThrowingCall(`/ticket_types/${tt.id}`, {
  method: 'PUT',
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(tt),
});

export const deleteTicketType = (id: string): Promise<string> => errorThrowingCall(`/ticket_types/${id}`, {
  method: 'DELETE'
});


/* COMPLETIONS */

export const fetchCompletion = (completion: string) =>
  alwaysSucceedingCall(`/completions/${completion}`);

export const postCompletion = (reservation: string, email: string, first_name: string, last_name: string, society: string) =>
  errorThrowingCall(`/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reservation, email, first_name, last_name, society
    }),
  });

/* PAYMENTS */

export const fetchPayment = (reservation: string) => alwaysSucceedingCall(`/payments/${reservation}`);

export const postPayment = (reservation: string) => errorThrowingCall(`/payments/${reservation}`, { method: "POST" });

/* TICKETS */

export const fetchTicket = (id: string) => errorThrowingCall(`/tickets/${id}`);

export const fetchTicketWithQr = (qr: string) => errorThrowingCall(`/tickets/${qr}`);

export const fetchTickets = () => errorThrowingCall(`/tickets/`);

export const personalizeTicketAsAdmin = (id: string, owner_email: string, owner_first_name: string, owner_last_name: string, owner_society: string) =>
  errorThrowingCall(`/tickets/${id}`, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      owner_email,
      owner_first_name,
      owner_last_name,
      owner_society
    })
  });


/* TICKET SCANS */

export const createTicketScan = (qr: string): Promise<TicketScan> => alwaysSucceedingCall(`/ticket_scans`, {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ qr }),
});


/* STATISTICS (ADMIN) */

export const fetchStatistics = (): Promise<any> => alwaysSucceedingCall(`/statistics`, {
  headers: {
    "Content-Type": "application/json",
  },
});


/* SETTINGS */

export const fetchShopOpened = (): Promise<{ open: boolean; opensAtTimestamp: number }> => alwaysSucceedingCall(`/settings/open`);

export const changeShopOpened = (body: { open: boolean; opensAtTimestamp: number; }): Promise<{ open: boolean; opensAtTimestamp: number; }> => alwaysSucceedingCall(`/settings/open`, {
  method: 'PUT',
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body)
});


/* AUTHENTICATION */

export const getToken = (user: string, password: string) =>
  errorThrowingCall(`/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user,
      password,
    }),
  });


/* HELPER FUNCTIONS */

const alwaysSucceedingCall = async (
  path: string,
  options?: RequestInit,
): Promise<any> => {
  try {
    let response;
    if (isLoggedIn()) {
      response = await fetch(`${apiUrl}${path}`, {
        ...options,
        headers: {
          ...(options?.headers || {}),
          ...tokenToHeaders(localStorage.getItem('token') || "")
        }
      });
    } else {
      response = await fetch(`${apiUrl}${path}`, options);
    }
    return await response.json();
  } catch (error) {
    console.log(error);
    return error;
  }
};

const errorThrowingCall = async (
  path: string,
  options?: RequestInit,
): Promise<any> => {
  let response;
  if (isLoggedIn()) {
    response = await fetch(`${apiUrl}${path}`, {
      ...options,
      headers: {
        ...(options?.headers || {}),
        ...tokenToHeaders(localStorage.getItem('token') || "")
      }
    });
  } else {
    response = await fetch(`${apiUrl}${path}`, options);
  }

  if (!response.ok) {
    throw new Error((await response.json())?.error);
  }
  return await response.json();
};

const apiUrl = import.meta.env.BAEZIJNISMEEMAKEN_API;
