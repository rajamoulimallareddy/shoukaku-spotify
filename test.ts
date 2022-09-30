/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { SpotifyClient } from './dist';


const lavasfy = new SpotifyClient(
    {
        clientId: 'c7196edefc8143aab883e3c31c3def74',
        clientSecret: '220992beb8394e57ae8d1c304672ab64'
    },
    [
        {
            name: 'main',
            url: '144.172.71.238:2333',
            auth: 'teamindmoosicop'
        }
    ]
);

(async () => {
    // We need to call this to get the Spotify API access token.
    await lavasfy.requestToken();

    // Select node to use with its id.
    //   const node = lavasfy.nodes.get("main");

    // fetch the current node.
    const node: any = lavasfy.getNode();

    // Use Node#load to load album, playlist, and track
    // const album = await node.load(
    //     'https://open.spotify.com/album/4sZni6V6NvVYhfUFGqKuR3'
    // );
    // console.log(album);

    // const playlist = await node.load(
    //     'https://open.spotify.com/playlist/2NdDBIGHUCu977yW5iKWQY'
    // );
    // console.log(playlist);

    const track = await node.load(
        'https://open.spotify.com/track/4zsxBgPkUFYEoOGDncGIBd'
    );
    console.log(track.tracks[0].info);

    // const artist = await node.load(
    //     'https://open.spotify.com/artist/2IGbyqqfidUAYqW19slJuR'
    // );
    // console.log(artist);

    // Response object: https://github.com/Allvaa/lava-spotify/blob/master/src/typings/Lavalink/index.ts#L25
})();
