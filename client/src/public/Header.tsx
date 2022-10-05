import { HStack } from "@hope-ui/solid";
import { Link } from "@solidjs/router";
import { Component } from "solid-js";

import logoUrl from '../assets/logo.svg';

/**
 * Component that renders the header with a logo
 */
const Header: Component<{ disableLink?: boolean }> = (props) => {
  return (
    <HStack spacing={48}>
      <Link href={props.disableLink ? '#' : '/'}>
        <img src={logoUrl} style="width: 100px; height: auto; transform: rotate(-5deg)" />
      </Link>
    </HStack>
  );
};

export default Header;
