import { Context } from '../../../../sandbox/src/types/module';
import { SUBGRAPH_ENDPOINTS } from './constants';

export const GQL_HEADERS = {
  'Content-Type': 'application/json',
};

export class GraphQLQuery {
  query: string;
  variables: any;

  constructor(query: string, variables: any | null = null) {
    this.query = query;
    this.variables = variables;
  }

  execute(ctx: Context, url: string, operationName = '') {
    return ctx.axios({
      url: url,
      method: 'POST',
      headers: GQL_HEADERS,
      data: {
        query: this.query,
        variables: this.variables,
        operationName: operationName,
      },
    });
  }
}

export function subgraph<T>(
  ctx: Context,
  subgraphEndpoint: string = SUBGRAPH_ENDPOINTS.STELLA,
  operationName: string,
  query: string,
  variables: any | null = null,
): Promise<T> {
  return new GraphQLQuery(query, variables)
    .execute(ctx, subgraphEndpoint, operationName)
    .then((data) => {
      if (data.data.errors) throw new Error(data.data.errors[0].message);
      return data.data.data;
    });
}
