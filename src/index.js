/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import {Feed} from "feed";

export default {
    async fetch(request, env, ctx) {
        return handleRequest(request);
    },
};


/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request) {
    // The user ID to query
    const USER = 965;

    // query the data
    const address = 'https://api.printables.com/graphql/';
    const data = {
        "operationName": "UserModels",
        "variables": {
            "userId": "965",
            "ordering": "-first_publish",
            "paid": "free",
            "limit": 36,
            "cursor": null
        },
        "query": `query
         UserModels(
            $userId: ID!,
            $ordering: String,
            $query: String,
            $paid: PaidEnum!,
            $limit: Int!,
            $cursor: String,
            $excludedIds: [ID]) {
                userModels(
                    userId: $userId
                    ordering: $ordering
                    query: $query
                    paid: $paid
                    limit: $limit
                    cursor: $cursor
                    excludedIds: $excludedIds
                ) {
                    cursor
                    items {
                          ...PrintListFragment
                          __typename
                    }
                    __typename
                }
            }

            fragment PrintListFragment on PrintType {
                id
                name
                slug
                firstPublish
                user {
                    ...AvatarUserFragment
                    __typename
                }
                __typename
            }

            fragment AvatarUserFragment on UserType {
                id
                publicUsername
                avatarFilePath
                handle
                company
                verified
                badgesProfileLevel {
                    profileLevel
                    __typename
                }
                __typename
            }
        `
    };

    // fetch data
    const response = await fetch(address, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const rdata = await response.json();

    // build the feed
    const feed = createFeed(rdata.data.userModels.items[0].user);
    rdata.data.userModels.items.map(print => {
        feed.addItem({
            title: print.name,
            link: `https://www.printables.com/model/${print.id}-${print.slug}`,
            description: print.summary,
            date: new Date(print.firstPublish)
        });
    });

    return new Response(feed.rss2(), {
        status: 200,
        statusText: 'ok',
        headers: {
            "Content-Type": "application/rss+xml"
        }
    });
}

function createFeed(user) {
    return new Feed({
        title: `Printables.com - ${user.publicUsername}`,
        description: "Newest 3D Models",
        link: `https://www.printables.com/@${user.handle}/models`,
        language: "en",
    });
}
