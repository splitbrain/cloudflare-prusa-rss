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

    let data;
    if(new URL(request.url).pathname == '/makes') {
        data = getMakesGQL(USER);
    } else {
        data = getModelsGQL(USER);
    }

    // query the data
    const address = 'https://api.printables.com/graphql/';


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
    const rlist = rdata.data.userModels ? rdata.data.userModels.items : rdata.data.items;

    // build the feed
    const feed = createFeed(rlist[0].user, !!rlist[0].print);
    rlist.map(item => {
        let title, description, link;
        if(item.print) {
            // this is a make
            title = `${item.print.name} by ${item.print.user.publicUsername}`;
            description = item.print.summary;
            link = `https://www.printables.com/model/${item.print.id}-${item.print.slug}/comments/${item.id}`;
        } else {
            // this is a model
            title = item.name;
            description = item.summary;
            link = `https://www.printables.com/model/${item.id}-${item.slug}`;
        }

        feed.addItem({
            title: title,
            link: link,
            description: description,
            date: new Date(item.firstPublish)
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

/**
 * Create the feed object
 * @param {object} user The user info as returned from the API
 * @returns {Feed}
 */
function createFeed(user, isMake) {
    return new Feed({
        title: `Printables.com - ${user.publicUsername}`,
        description: isMake ? "Recent Makes" :  "Newest 3D Models",
        link: `https://www.printables.com/@${user.handle}/` + (isMake ? "makes" : "models"),
        language: "en",
    });
}

/**
 * Get the GraphQL query data to retrieve the user's models
 *
 * @param int userID
 * @returns {object}
 */
function getModelsGQL(userID) {
    return {
        "operationName": "UserModels",
        "variables": {
            "userId": userID,
            "ordering": "-first_publish",
            "paid": "free",
            "limit": 36,
            "cursor": null
        },
        "query": `query
            UserModels(
                $userId: ID!,
                $ordering: String,
                $limit: Int!
            ) {
                userModels(
                    userId: $userId
                    ordering: $ordering
                    limit: $limit
                ) {
                    items {
                      id
                      name
                      slug
                      summary
                      firstPublish

                      user {
                        id
                        publicUsername
                        handle
                      }
                    }
                }
            }
        `
    };
}

/**
 * Get the GraphQL query data to retrieve the user's makes
 *
 * @param int userID
 * @returns {object}
 */
function getMakesGQL(userID) {
    return {
        "operationName": "PrintSocialMakes",
        "variables": {
            "userId": userID,
            "limit": 36,
        },
        "query": `query
            PrintSocialMakes(
                $userId: ID!,
                $limit: Int,
            ){
                items: printComments(
                    userId: $userId
                    limit: $limit
                    makesOnly: true
                    ordering: {
                        orderBy: newest_parent,
                        sortOrder: descending
                    }
                ) {
                    id
                    firstPublish: created
                    user: author {
                        id
                        publicUsername
                        handle
                    }
                    print {
                      id
                      name
                      slug
                      summary
                      user {
                        id
                        publicUsername
                        handle
                      }
                    }
                }
            }
`
    }
}
