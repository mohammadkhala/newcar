import type { NavLabelKey } from "@/components/store/header/nav-config";

export type DesktopNavSchemaItem =
  | {
      id: "vehiclePanel";
      kind: "vehicle-panel";
      labelKey: NavLabelKey;
    }
  | {
      id: "featuredCollection";
      kind: "featured-collection";
    };

export const DESKTOP_NAV_SCHEMA: DesktopNavSchemaItem[] = [
  {
    id: "vehiclePanel",
    kind: "vehicle-panel",
    labelKey: "shopByVehicle",
  },
  {
    id: "featuredCollection",
    kind: "featured-collection",
  },
];

export type MobileDrawerSectionSchemaItem = {
  id: "vehicleLinks" | "categoriesGrid" | "featuredTree";
  titleKey: NavLabelKey;
};

export const MOBILE_DRAWER_SECTION_SCHEMA: MobileDrawerSectionSchemaItem[] = [
  {
    id: "vehicleLinks",
    titleKey: "shopByVehicle",
  },
  {
    id: "categoriesGrid",
    titleKey: "shopMenu",
  },
  {
    id: "featuredTree",
    titleKey: "categoriesMenu",
  },
];

