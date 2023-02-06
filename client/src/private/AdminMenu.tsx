import { Button, HStack, IconButton } from "@hope-ui/solid";
import { useNavigate } from "@solidjs/router";
import Home from "@suid/icons-material/Home";
import Logout from "@suid/icons-material/Logout";
import Settings from "@suid/icons-material/Settings";
import { Component } from "solid-js";

const AdminMenu: Component<{ active?: string }> = (props) => {
  const navigate = useNavigate();

  const signOut = () => {
    localStorage.removeItem('token');
    navigate('/admin');
  }

  return (
    <>
      <HStack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <span>

          <IconButton colorScheme="info" variant="ghost" aria-label="Dashboard" icon={<Home />} onClick={() => navigate('/admin/dashboard')} />
          <Button colorScheme="info" size="sm" mr="-1px" variant={props.active === 'tickets' ? 'subtle' : 'ghost'} onClick={() => navigate('/admin/tickets')}>
            Kaartjes
          </Button>
          <Button colorScheme="info" size="sm" mr="-1px" variant={props.active === 'scanner' ? 'subtle' : 'ghost'} onClick={() => navigate('/admin/scanner')}>
            Scannen
          </Button>

        </span>
        <span>
          <IconButton colorScheme="info" variant={props.active === 'settings' ? 'subtle' : 'ghost'} aria-label="Instellingen" onClick={() => navigate('/admin/settings')} icon={<Settings />} />
          <IconButton colorScheme="info" variant="ghost" aria-label="Uitloggen" onClick={signOut} icon={<Logout />} />
        </span>
      </HStack>
      <br />
    </>
  );

};

export default AdminMenu;