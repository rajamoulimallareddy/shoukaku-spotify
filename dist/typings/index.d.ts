import { Track } from './Lavalink';
export type fetchType = 'SCRAPE' | 'API'
export interface ClientOptions {
    /** Spotify client ID */
    clientID?: string;
    /** Spotify client Secret */
    clientSecret?: string;
    /**
     * Maximum pages of playlist to load (each page contains 100 tracks)
     * @default 2
     */
    playlistLoadLimit?: number;
    /**
     * This will filter the search to video that only contains audio of the Spotify track (likely)
     * @default false
     */
    audioOnlyResults?: boolean;
    /**
     * The original value of title, author, and uri in {@link Track} will be replaced to Spotify's
     * @default false
     */
    useSpotifyMetadata?: boolean;
    /**
     * Auto resolve the Spotify track to Lavalink track
     *
     * It's not recommended to enable this option, enabling it will spam HTTP requests to YouTube and take a while for large playlists to load.
     * @default false
     */
    autoResolve?: boolean;
    /**
     * fetchStrategy is options for you to fetch data from api or scrape
     *
     * @param 'SCRAPE' | 'API'
     */
    fetchStrategy?: string;
}
export interface UnresolvedTrack {
    info: {
        identifier: string;
        title: string;
        author: string;
        length: number;
        uri: string;
    };
    resolve: () => Promise<Track | undefined>;
}
export * from './Lavalink';
export * from './Spotify';
