import {Feed} from "feed";

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request) {
    // The user ID to query
    const USER = 965;

    // query the data
    const address = 'https://www.prusaprinters.org/graphql/'
    const data = {
        query: `query {
              prints (userId: ${USER} ) {
                id
                name
                slug
                summary
                datePublished
              }
            }`
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
    const feed = createFeed();
    rdata.data.prints.map(print => {
        feed.addItem({
            title: print.name,
            link: `https://prusaprinters.org/prints/${print.id}-${print.slug}`,
            description: print.summary,
            date: new Date(print.datePublished)
        });
    });

    return new Response(feed.rss2(), {headers: {"Content-Type": "application/xml+rss"}})
}

function createFeed() {
    return new Feed({
        title: "PrusaPrinters Andreas Gohr",
        description: "Newest 3D Models",
        link: "https://www.prusaprinters.org/social/965-andreas-gohr/prints",
        language: "en",
    });
}

