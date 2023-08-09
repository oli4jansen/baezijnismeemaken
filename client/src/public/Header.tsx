import { HStack } from "@hope-ui/solid";
import { Link } from "@solidjs/router";
import { Component } from "solid-js";

import logoUrl from '../assets/orca.png';

/**
 * Component that renders the header with a logo
 */
const Header: Component<{ disableLink?: boolean }> = (props) => {
  return (
    <HStack spacing={48}>
      <Link href={props.disableLink ? '#' : '/'}>
        <img src={logoUrl} style="width: 150px; height: auto" />
      </Link>
    </HStack>
  );
};

export default Header;
