export type Ticket = {
  createdAt: Date | null;
  name: string;
  description: string;
  ticketTitle: string;
  ticketType: string;
  _id: string;
};

export type TicketFormValues = {
  outletId: any;
  ticketTitle: string;
  customerId: any;
  ticketType: any;
  description: string;
};
