import { capitalize } from "lodash";

interface Endpoint {
  name: string;
  route: string;
  method: "get" | "post" | "put" | "delete" | "patch" | "options";
}

const baseEndpoints: Endpoint[] = [
  { name: "login", route: "/auth/login", method: "post" },
  { name: "register", route: "/auth/register", method: "post" },
];

const resourceNames: string[] = [];

const generateCrudEndpoints = (
  resource: string,
  optionsLabel = "name"
): Endpoint[] => [
  {
    name: `get${capitalize(resource)}s`,
    route: `/${resource}s`,
    method: "get",
  },
  {
    name: `create${capitalize(resource)}`,
    route: `/${resource}s`,
    method: "post",
  },
  {
    name: `delete${capitalize(resource)}`,
    route: `/${resource}s/{id}`,
    method: "delete",
  },
  {
    name: `get${capitalize(resource)}Details`,
    route: `/${resource}s/{id}`,
    method: "get",
  },
  {
    name: `update${capitalize(resource)}`,
    route: `/${resource}s/{id}`,
    method: "put",
  },
  {
    name: `get${capitalize(resource)}Options`,
    route: `/${resource}s/options?label=${optionsLabel}`,
    method: "get",
  },
];

const endpoints: Endpoint[] = [
  ...baseEndpoints,
  ...resourceNames.flatMap((resource) => generateCrudEndpoints(resource)),
];

export const getEndpoint = (
  routeName = "",
  routeParams: Record<string, string> = {}
) => {
  const endpoint = endpoints.find((row) => row.name === routeName);
  if (!endpoint) throw new Error(`Invalid endpoint name '${routeName}'.`);

  const clonedEndpoint = { ...endpoint, route: endpoint.route };

  for (const paramName in routeParams) {
    clonedEndpoint.route = clonedEndpoint.route.replace(
      `{${paramName}}`,
      routeParams[paramName]
    );
  }

  return clonedEndpoint;
};
