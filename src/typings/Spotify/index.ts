import { ArtistsEntity } from 'spotify-url-info';

export interface SpotifyArtist {
    name: string;
}

export interface SpotifyAlbum {
    artists: SpotifyArtist[];
    name: string;
    tracks: {
        items: SpotifyTrack[];
        next: string | null;
        previous: string | null;
    };
}

export interface SpotifyPlaylist {
    name: string;
    tracks: {
        items: Array<{ track: SpotifyTrack }>;
        next: string | null;
        previous: string | null;
    };
}

export interface SpotifyTrack {
    artists: ArtistsEntity[];
    duration_ms: number;
    external_urls: {
        spotify: string;
    };
    id: string;
    name: string;
}

export interface SpotifyArtist {
    tracks: SpotifyTrack[];
}

export interface SpotifyEpisode {
    external_urls: {
        spotify: string;
    };
    id: string;
    name: string;
    show: {
        id: string;
        name: string;
        external_urls: {
            spotify: string;
        };
    };
}

export interface SpotifyShow {
    episodes: {
        items: Array<{
            name: string;
            external_urls: {
                spotify: string;
            };
            id: string;
            duration_ms: number;
            artist: null | undefined;
        }>;
        next: string | null;
        previous: string | null;
    };
    external_urls: {
        spotify: string;
    };
    id: string;
    name: string;
}
