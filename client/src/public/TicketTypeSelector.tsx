import { Component } from 'solid-js';
import { Heading, HStack, IconButton } from '@hope-ui/solid';
import AddIcon from '@suid/icons-material/Add';
import RemoveIcon from '@suid/icons-material/Remove';

import { TicketType } from '../utils/api';

/**
 * Shows metadata of a ticket type and a selector bar to add to basket.
 * To be used by the TicketShop component.
 */
const TicketTypeSelector: Component<{
  ticketType: TicketType;
  inBasket: number;
  decrease: () => void;
  increase: () => void;
}> = (props) => {

  return (
    <div class="ticket-type">
      <HStack direction="row" justifyContent="space-between" alignItems="start" spacing={2}>
        <Heading class="name" size="xl">{props.ticketType.name}</Heading>
        <span style="margin-right: 18px; opacity: 0.5">{props.ticketType.amount_left - (props.inBasket)}/{props.ticketType.amount_available}</span>
      </HStack>

      <div class="description">{props.ticketType.description}</div>

      <HStack direction="row" justifyContent="space-between" alignItems="center" spacing={2} class="price-and-actions">
        <h3 class="price">&euro;{(props.ticketType.price / 100).toFixed(2)}</h3>

        <HStack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
          <IconButton aria-label="Remove ticket" icon={<RemoveIcon />} onClick={props.decrease} disabled={props.inBasket === 0} />
          <span class="amount">{props.inBasket}</span>
          <IconButton aria-label="Add ticket" icon={<AddIcon />} onClick={props.increase} disabled={props.ticketType.amount_left === 0 || props.inBasket === props.ticketType.amount_left} />
        </HStack>
      </HStack>
    </div>
  );
};

export default TicketTypeSelector;
