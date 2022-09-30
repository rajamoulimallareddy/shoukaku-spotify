import { Track } from './Lavalink';
export interface ClientOptions {
    /** Spotify client ID */
    clientId?: string;
    /** Spotify client Secret */
    clientSecret?: string;
    /**
     * Maximum pages of playlist to load (each page contains 100 tracks)
     * @default 2
     */
    playlistLimit?: number;
    /**
     * This will filter the search to video that only contains audio of the Spotify track (likely)
     * @default false
     */
    audioResults?: boolean;
    /**
     * The original value of title, author, and uri in {@link Track} will be replaced to Spotify's
     * @default false
     */
    spotifyMetadata?: boolean;
    /**
     * Auto resolve the Spotify track to Lavalink track
     *
     * It's not recommended to enable this option, enabling it will spam HTTP requests to YouTube and take a while for large playlists to load.
     * @default false
     */
    autoResolve?: boolean;
    /**
     * fetchType is options for you to fetch data from api or scrape
     *
     * @param "SCRAPE" | "API"
     */
    fetchType?: string;
}
export interface UnresolvedTrack {
    info: {
        identifier: string;
        title: string;
        author: string;
        length: number;
        uri: string;
        authorURI: string;
        authorHyperLink: string;
    };
    resolve: () => Promise<Track | undefined>;
}
export * from './Lavalink';
export * from './Spotify';
