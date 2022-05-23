import { ApolloClient, InMemoryCache } from '@apollo/client'

const client = new ApolloClient({
    uri: process.env.STEPZEN_URI,
    headers: {
        Authorization: `Apikey ${process.env.STEPZEN_APIKEY}`,
    },
    cache: new InMemoryCache(),
})

export default client