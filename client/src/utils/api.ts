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

export const fetchReservations = () =>
  errorThrowingCall(`/reservations/`, { headers: tokenToHeaders(localStorage.getItem('token') || "") });

export const fetchReservation = (id: string) =>
  errorThrowingCall(`/reservations/${id}`);


/* TICKET TYPES */

export const fetchTicketTypes = (): Promise<TicketType[]> => alwaysSucceedingCall(`/ticket_types/`);

export const fetchTicketType = (id: string): Promise<TicketType> => errorThrowingCall(`/ticket_types/${id}`);

export const createTicketType = (tt: { name: string; description: string; price: number; amount_available: number; }): Promise<TicketType> => errorThrowingCall(`/ticket_types`, {
  method: 'POST',
  headers: {
    ...tokenToHeaders(localStorage.getItem('token') || ""),
    "Content-Type": "application/json",
  },
  body: JSON.stringify(tt),
});

export const putTicketType = (tt: Partial<TicketType>): Promise<TicketType> => errorThrowingCall(`/ticket_types/${tt.id}`, {
  method: 'PUT',
  headers: {
    ...tokenToHeaders(localStorage.getItem('token') || ""),
    "Content-Type": "application/json",
  },
  body: JSON.stringify(tt),
});

export const deleteTicketType = (id: string): Promise<string> => errorThrowingCall(`/ticket_types/${id}`, {
  method: 'DELETE',
  headers: tokenToHeaders(localStorage.getItem('token') || "")
});


/* COMPLETIONS */

export const fetchCompletion = (completion: string) =>
  alwaysSucceedingCall(`/completions/${completion}`);

export const fetchCompletionWithAuth = (completion: string) =>
  errorThrowingCall(`/completions/${completion}`, {
    headers: {
      ...tokenToHeaders(localStorage.getItem('token') || ""),
      "Content-Type": "application/json",
    }
  });

export const postCompletion = (reservation: string, email: string, first_name: string, last_name: string) =>
  errorThrowingCall(`/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reservation, email, first_name, last_name
    }),
  });

/* PAYMENTS */

export const fetchPayment = (reservation: string) =>
  alwaysSucceedingCall(`/payments/${reservation}`);

export const fetchPaymentWithAuth = (reservation: string) =>
  errorThrowingCall(`/payments/${reservation}`, {
    headers: {
      ...tokenToHeaders(localStorage.getItem('token') || ""),
      "Content-Type": "application/json",
    }
  });

export const postPayment = (reservation: string) =>
  errorThrowingCall(`/payments/${reservation}`, { method: "POST" });

/* TICKETS */

export const fetchTicket = (id: string) =>
  errorThrowingCall(`/tickets/${id}`, { headers: tokenToHeaders(localStorage.getItem('token') || "") });

export const fetchTicketWithQr = (qr: string) =>
  errorThrowingCall(`/tickets/${qr}`);

export const fetchTickets = () =>
  errorThrowingCall(`/tickets/`, { headers: tokenToHeaders(localStorage.getItem('token') || "") });

export const personalizeTicketAsAdmin = (id: string, owner_email: string, owner_first_name: string, owner_last_name: string) =>
  errorThrowingCall(`/tickets/${id}`, {
    method: 'PUT',
    headers: {
      ...tokenToHeaders(localStorage.getItem('token') || ""),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      owner_email,
      owner_first_name,
      owner_last_name
    })
  });

export const personalizeTicket = (qr: string, owner_email: string, owner_first_name: string, owner_last_name: string) =>
  errorThrowingCall(`/tickets/${qr}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      owner_email,
      owner_first_name,
      owner_last_name
    })
  });

/* TICKET SCANS */

export const createTicketScan = (qr: string): Promise<TicketScan> => alwaysSucceedingCall(`/ticket_scans`, {
  method: 'POST',
  headers: {
    ...tokenToHeaders(localStorage.getItem('token') || ""),
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ qr }),
});

/* STATISTICS */

export const fetchTicketStatistics = (): Promise<TicketStatistics[]> => alwaysSucceedingCall(`/statistics/`, {
  headers: {
    ...tokenToHeaders(localStorage.getItem('token') || ""),
    "Content-Type": "application/json",
  }
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
    const response = await fetch(`${apiUrl}${path}`, options);
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
  const response = await fetch(`${apiUrl}${path}`, options);
  if (!response.ok) {
    throw new Error((await response.json())?.error);
  }
  return await response.json();
};

const apiUrl = `https://7ba30413e2a0e8.lhr.life`;
