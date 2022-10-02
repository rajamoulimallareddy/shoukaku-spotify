import { UnresolvedTrack } from '..';
export declare type LoadType = 'TRACK_LOADED' | 'PLAYLIST_LOADED' | 'SEARCH_RESULT' | 'NO_MATCHES' | 'LOAD_FAILED';
export interface NodeOptions {
    name: string;
    url: string;
    auth: string;
    secure?: boolean;
}
export interface Track {
    track: string;
    info: {
        identifier: string;
        isSeekable: boolean;
        author: string;
        length: number;
        isStream: boolean;
        position: number;
        title: string;
        uri: string;
        sourceName: string;
        authorURI: string;
        authorHyperLink: string;
    };
}
export interface LavalinkTrackResponse<T = UnresolvedTrack | Track | null> {
    loadType: LoadType;
    playlistInfo: {
        name?: string;
    };
    tracks: T[];
    exception?: {
        message: string;
        severity: string;
    };
}
