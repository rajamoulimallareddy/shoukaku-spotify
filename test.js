"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
const dist_1 = require("./dist");
const lavasfy = new dist_1.SpotifyClient({
    clientId: 'c7196edefc8143aab883e3c31c3def74',
    clientSecret: '220992beb8394e57ae8d1c304672ab64'
}, [
    {
        name: 'main',
        url: '144.172.71.238:2333',
        auth: 'teamindmoosicop'
    }
]);
(async () => {
    // We need to call this to get the Spotify API access token.
    await lavasfy.requestToken();
    // Select node to use with its id.
    //   const node = lavasfy.nodes.get("main");
    // fetch the current node.
    const node = lavasfy.getNode();
    // Use Node#load to load album, playlist, and track
    // const album = await node.load(
    //     'https://open.spotify.com/album/4sZni6V6NvVYhfUFGqKuR3'
    // );
    // console.log(album);
    // const playlist = await node.load(
    //     'https://open.spotify.com/playlist/2NdDBIGHUCu977yW5iKWQY'
    // );
    // console.log(playlist);
    const track = await node.load('hello');
    const { identifier, title, author, length, uri, authorURI, authorHyperLink } = track.tracks[0].info;
    console.log(title);
    // const artist = await node.load(
    //     'https://open.spotify.com/artist/2IGbyqqfidUAYqW19slJuR'
    // );
    // console.log(artist);
    // Response object: https://github.com/Allvaa/lava-spotify/blob/master/src/typings/Lavalink/index.ts#L25
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1REFBdUQ7QUFDdkQsNERBQTREO0FBQzVELHFFQUFxRTtBQUNyRSxpQ0FBdUM7QUFHdkMsTUFBTSxPQUFPLEdBQUcsSUFBSSxvQkFBYSxDQUM3QjtJQUNJLFFBQVEsRUFBRSxrQ0FBa0M7SUFDNUMsWUFBWSxFQUFFLGtDQUFrQztDQUNuRCxFQUNEO0lBQ0k7UUFDSSxJQUFJLEVBQUUsTUFBTTtRQUNaLEdBQUcsRUFBRSxxQkFBcUI7UUFDMUIsSUFBSSxFQUFFLGlCQUFpQjtLQUMxQjtDQUNKLENBQ0osQ0FBQztBQUVGLENBQUMsS0FBSyxJQUFJLEVBQUU7SUFDUiw0REFBNEQ7SUFDNUQsTUFBTSxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUM7SUFFN0Isa0NBQWtDO0lBQ2xDLDRDQUE0QztJQUU1QywwQkFBMEI7SUFDMUIsTUFBTSxJQUFJLEdBQVEsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBRXBDLG1EQUFtRDtJQUNuRCxpQ0FBaUM7SUFDakMsOERBQThEO0lBQzlELEtBQUs7SUFDTCxzQkFBc0I7SUFFdEIsb0NBQW9DO0lBQ3BDLGlFQUFpRTtJQUNqRSxLQUFLO0lBQ0wseUJBQXlCO0lBRXpCLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FDekIsdURBQXVELENBQzFELENBQUM7SUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFbEMsa0NBQWtDO0lBQ2xDLCtEQUErRDtJQUMvRCxLQUFLO0lBQ0wsdUJBQXVCO0lBRXZCLHdHQUF3RztBQUM1RyxDQUFDLENBQUMsRUFBRSxDQUFDIn0=