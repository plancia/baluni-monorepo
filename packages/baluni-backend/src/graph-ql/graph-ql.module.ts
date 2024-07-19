import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: 'gql',
      useFactory: async () => {
        const UNISWAP_GRAPHQL_ENDPOINT = process.env.UNISWAP_GRAPHQL_ENDPOINT;
        const client = new ApolloClient({
          uri: UNISWAP_GRAPHQL_ENDPOINT,
          cache: new InMemoryCache(),
        });
        return client;
      },
    },
  ],
})
export class GraphQlModule {}
