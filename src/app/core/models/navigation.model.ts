export interface NavigationSub {
  name: string;
  route: string;
}

export interface NavigationSecondary {
  name: string;
  icon: string;
  route?: string;
  sub?: NavigationSub[];
}

export interface NavigationItem {
  primary_content: string;
  secondary_content: NavigationSecondary[];
}
