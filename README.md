# lavasfy [![npm](https://img.shields.io/npm/v/lavasfy)](https://npmjs.com/package/lavasfy "lavasfy")

Spotify album, playlist, and track resolver for Lavalink.

## Installing

```sh
# npm
npm i rajamoulimallareddy/shoukaku-spotify

# yarn
yarn add rajamoulimallareddy/shoukaku-spotify
```

## Example Usage

```js
const { SpotifyClient } = require("shoukaku-spotify");

const lavasfy = new SpotifyClient(
  {
    clientID: "a client id",
    clientSecret: "a client secret",
  },
  [
    {
      name: "main",
      url: "localhost:2333",
      auth: "youshallnotpass",
    },
  ]
);

(async () => {
  // We need to call this to get the Spotify API access token.
  await lavasfy.requestToken();

  // Select node to use with its id.
  const node = lavasfy.nodes.get("main");

  // fetch the current node.
  const node = lavasfy.getNode();

  // Use Node#load to load album, playlist, and track
  const album = await node.load(
    "https://open.spotify.com/album/4sZni6V6NvVYhfUFGqKuR3"
  );
  console.log(album);

  const playlist = await node.load(
    "https://open.spotify.com/playlist/2NdDBIGHUCu977yW5iKWQY"
  );
  console.log(playlist);

  const track = await node.load(
    "https://open.spotify.com/track/4zsxBgPkUFYEoOGDncGIBd"
  );
  console.log(track);

  const artist = await node.load(
    "https://open.spotify.com/artist/2IGbyqqfidUAYqW19slJuR"
  );
  console.log(artist);

  // Response object: https://github.com/Allvaa/lava-spotify/blob/master/src/typings/Lavalink/index.ts#L25
})();
```

[Documentation](https://allvaa.github.io/lava-spotify "Documentaion")

## Note

This updated version of allvaa/lavasfy & noxzym/lava-spotify
i have just made small changes other than that rest are from these only
