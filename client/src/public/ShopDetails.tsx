import { createSignal, createContext, useContext, Component, createResource, JSXElement, Resource } from "solid-js";
import { fetchShopDetails } from "../utils/api";

const ShopDetailsContext = createContext<Resource<{
  name: string;
  shop_open: boolean;
  shop_opens_at_timestamp: number;
}>>();

export const ShopDetailsProvider: Component<{ children: any }> = (props) => {
  // TODO: fetch tenant based on domain
  const tenant = 'bae';

  const [shopDetails, { refetch }] = createResource(() => fetchShopDetails(tenant));

  return (
    <ShopDetailsContext.Provider value={shopDetails}>
      {props.children}
    </ShopDetailsContext.Provider>
  );
}

export function useShopDetails() { return useContext(ShopDetailsContext); }