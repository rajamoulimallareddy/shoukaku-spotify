/* eslint-disable @typescript-eslint/no-var-requires */
// import petitio from 'petitio';
import Spotify from 'spotify-url-info'
import { fetch } from 'undici'
const { getTracks, getData } = Spotify(fetch);
import { Tracks } from 'spotify-url-info';
import { Track, LavalinkTrackResponse, SpotifyAlbum, SpotifyArtist, SpotifyPlaylist, SpotifyTrack, UnresolvedTrack, SpotifyEpisode, SpotifyShow } from '../typings';
import Util from '../Util';
import Node from './Node';
export default class Resolver {
    public cache = new Map<string, Track>();

    public constructor(public node: Node) { }

    public get token(): string {
        return this.node.client.token!;
    }

    public get playlistLimit(): number {
        return this.node.client.options.playlistLimit!;
    }

    public get autoResolve(): boolean {
        return this.node.client.options.autoResolve!;
    }

    private extract(url: any) {
        var p = /^(?:https:\/\/open\.spotify\.com\/(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track|artist|episode|show)(?:[/:])([A-Za-z0-9]+).*$/;
        if (url.match(p)) return `https://open.spotify.com/artist/${url.match(p)[2]}`
    }

    public async getTrack(id: string): Promise<LavalinkTrackResponse | any> {
        try {
            if (this.node.client.options.fetchType === 'SCRAPE') {
                const tracks = await getTracks(`https://open.spotify.com/track/${id}`);
                const unresolvedTracks = this.buildUnresolved(tracks[0]);
                return this.buildResponse('TRACK_LOADED', this.autoResolve ? ([await unresolvedTracks.resolve()] as Track[]) : [unresolvedTracks]);
            }
            if (!this.token) throw new Error('No Spotify access token.');
            const response: any = await fetch(`${this.node.client.baseURL}/tracks/${id}`, { headers: { Authorization: this.token } });
            const spotifyTrack: SpotifyTrack = await response.json();
            const unresolvedTrack = this.buildUnresolved(spotifyTrack as Tracks);
            return this.buildResponse('TRACK_LOADED', this.autoResolve ? ([await unresolvedTrack.resolve()] as Track[]) : [unresolvedTrack]);
        } catch (e: any) {
            return this.buildResponse(e.body?.error.message === "invalid id" ? "NO_MATCHES" : "LOAD_FAILED", [], undefined, e.body?.error.message ?? e.message);
        }
    }

    public async getPlaylist(id: string): Promise<LavalinkTrackResponse | any> {
        try {
            if (this.node.client.options.fetchType === 'SCRAPE') {
                const tracks = await getTracks(`https://open.spotify.com/playlist/${id}`);
                const metaData = await getData(`https://open.spotify.com/playlist/${id}`);
                // @ts-expect-error no typings
                const unresolvedPlaylistTracks = tracks.filter(x => x.track).map(track => this.buildUnresolved(track));
                return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? ((await Promise.all(unresolvedPlaylistTracks.map((x: { resolve: () => any }) => x.resolve()))).filter(Boolean) as Track[]) : unresolvedPlaylistTracks, metaData.name);
            }
            if (!this.token) throw new Error('No Spotify access token.');
            const response: any = await fetch(`${this.node.client.baseURL}/playlists/${id}`, { headers: { Authorization: this.token } });
            const spotifyPlaylist: SpotifyPlaylist = await response.json();
            await this.getPlaylistTracks(spotifyPlaylist);
            const unresolvedPlaylistTracks = spotifyPlaylist.tracks.items.filter((x) => x.track !== null).map((x) => this.buildUnresolved(x.track as Tracks));
            return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? ((await Promise.all(unresolvedPlaylistTracks.map((x: any) => x.resolve()))).filter(Boolean) as Track[]) : unresolvedPlaylistTracks, spotifyPlaylist.name);
        } catch (e: any) {
            return this.buildResponse(e.status === 404 ? "NO_MATCHES" : "LOAD_FAILED", [], undefined, e.body?.error.message ?? e.message);
        }
    }

    public async getAlbum(id: string): Promise<LavalinkTrackResponse | any> {
        try {
            if (this.node.client.options.fetchType === 'SCRAPE') {
                const tracks = await getTracks(`https://open.spotify.com/album/${id}`);
                const metaData = await getData(`https://open.spotify.com/album/${id}`);
                const unresolvedAlbumTracks = tracks.map((track: any) => track && this.buildUnresolved(track)) ?? [];
                return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? ((await Promise.all(unresolvedAlbumTracks.map((x: { resolve: () => any }) => x.resolve()))).filter(Boolean) as Track[]) : unresolvedAlbumTracks, metaData.name);
            }
            if (!this.token) throw new Error('No Spotify access token.');
            const response: any = await fetch(`${this.node.client.baseURL}/albums/${id}`, { headers: { Authorization: this.token } });
            const spotifyAlbum: SpotifyAlbum = await response.json();
            const unresolvedAlbumTracks = spotifyAlbum?.tracks.items.map((track) => this.buildUnresolved(track as Tracks)) ?? [];
            return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? ((await Promise.all(unresolvedAlbumTracks.map((x) => x.resolve()))).filter(Boolean) as Track[]) : unresolvedAlbumTracks, spotifyAlbum.name);
        } catch (e: any) {
            return this.buildResponse(e.status === 404 ? "NO_MATCHES" : "LOAD_FAILED", [], undefined, e.body?.error.message ?? e.message);
        }
    }

    public async getArtist(id: string): Promise<LavalinkTrackResponse | any> {
        try {
            if (this.node.client.options.fetchType === 'SCRAPE') {
                const tracks = await getTracks(`https://open.spotify.com/artist/${id}`);
                const metaData = await getData(`https://open.spotify.com/artist/${id}`);
                const unresolvedArtistTracks = tracks.map((track: any) => track && this.buildUnresolved(track)) ?? [];
                return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? ((await Promise.all(unresolvedArtistTracks.map((x: { resolve: () => any }) => x.resolve()))).filter(Boolean) as Track[]) : unresolvedArtistTracks, metaData.name);
            };
            if (!this.token) throw new Error('No Spotify access token.');
            const metaData = await fetch(`${this.node.client.baseURL}/artists/${id}`, { headers: { Authorization: this.token } });
            const meta_data: any = await metaData.json();
            const response: any = await fetch(`${this.node.client.baseURL}/artists/${id}/top-tracks?country=US`, { headers: { Authorization: this.token } });
            const spotifyArtis: SpotifyArtist = await response.json();
            const unresolvedArtistTracks = spotifyArtis.tracks.map(track => track && this.buildUnresolved(track as Tracks)) ?? [];
            return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? ((await Promise.all(unresolvedArtistTracks.map((x) => x.resolve()))).filter(Boolean) as Track[]) : unresolvedArtistTracks, meta_data.name);
        } catch (e: any) {
            return this.buildResponse(e.status === 404 ? "NO_MATCHES" : "LOAD_FAILED", [], undefined, e.body?.error.message ?? e.message);
        }
    }

    public async getEpisode(id: string): Promise<LavalinkTrackResponse | any> {
        try {
            if (this.node.client.options.fetchType === 'SCRAPE') {
                const tracks = await getTracks(`https://open.spotify.com/episode/${id}`);
                const metaData = await getData(`https://open.spotify.com/episode/${id}`);
                const unresolvedEpisodeTracks = tracks.map((track: any) => track && this.buildUnresolved(track)) ?? [];
                return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? ((await Promise.all(unresolvedEpisodeTracks.map((x: { resolve: () => any }) => x.resolve()))).filter(Boolean) as Track[]) : unresolvedEpisodeTracks, metaData.name);
            }
            if (!this.token) throw new Error('No Spotify access token.');
            const response: any = await fetch(`${this.node.client.baseURL}/episodes/${id}?market=US`, { method: 'GET', headers: { Authorization: this.token } });
            const metaData: SpotifyEpisode = await response.json();
            return this.getShow(metaData.show.id);
        } catch (e: any) {
            return this.buildResponse(e.status === 404 ? "NO_MATCHES" : "LOAD_FAILED", [], undefined, e.body?.error.message ?? e.message);
        }
    }

    public async getShow(id: string): Promise<LavalinkTrackResponse | any> {
        try {
            if (this.node.client.options.fetchType === 'SCRAPE') {
                const tracks = await getTracks(`https://open.spotify.com/show/${id}`);
                const metaData = await getData(`https://open.spotify.com/show/${id}`);
                const unresolvedShowEpisodes = tracks.map((track: any) => track && this.buildUnresolved(track)) ?? [];
                return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? ((await Promise.all(unresolvedShowEpisodes.map((x: { resolve: () => any }) => x.resolve()))).filter(Boolean) as Track[]) : unresolvedShowEpisodes, metaData.name);
            }
            if (!this.token) throw new Error('No Spotify access token.');
            const response: any = await fetch(`${this.node.client.baseURL}/shows/${id}?market=US`, { headers: { Authorization: this.token } })
            const spotifyShow: SpotifyShow = response.json();
            await this.getShowEpisodes(spotifyShow);
            const unresolvedShowEpisodes = spotifyShow.episodes.items.map((x) => this.buildUnresolved(x as any));
            return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? ((await Promise.all(unresolvedShowEpisodes.map((x) => x.resolve()))).filter(Boolean) as Track[]) : unresolvedShowEpisodes, spotifyShow.name);
        } catch (e: any) {
            return this.buildResponse(e.status === 404 ? "NO_MATCHES" : "LOAD_FAILED", [], undefined, e.body?.error.message ?? e.message);
        }
    }

    private async getShowEpisodes(spotifyShow: SpotifyShow): Promise<void> {
        let nextPage = spotifyShow.episodes.next;
        let pageLoaded = 1;
        while (nextPage && (this.playlistLimit === 0 ? true : pageLoaded < this.playlistLimit)) {
            const response: any = await fetch(nextPage, { headers: { Authorization: this.token } });
            const spotifyEpisodePage: SpotifyShow['episodes'] = await response.json();
            spotifyShow.episodes.items.push(...spotifyEpisodePage.items);
            nextPage = spotifyEpisodePage.next;
            pageLoaded++;
        }
    }

    private async getPlaylistTracks(spotifyPlaylist: SpotifyPlaylist): Promise<void> {
        let nextPage = spotifyPlaylist.tracks.next;
        let pageLoaded = 1;
        while (nextPage && (this.playlistLimit === 0 ? true : pageLoaded < this.playlistLimit)) {
            const response: any = await fetch(nextPage, { headers: { Authorization: this.token } });
            const spotifyPlaylistPage: SpotifyPlaylist['tracks'] = await response.json();

            spotifyPlaylist.tracks.items.push(...spotifyPlaylistPage.items);
            nextPage = spotifyPlaylistPage.next;
            pageLoaded++;
        }
    }

    private async resolve(unresolvedTrack: UnresolvedTrack): Promise<Track | undefined> {
        const cached = this.cache.get(unresolvedTrack.info.identifier);
        if (cached) return Util.structuredClone(cached);

        const lavaTrack = await this.retrieveTrack(unresolvedTrack);
        if (lavaTrack) {
            if (this.node.client.options.spotifyMetadata) {
                Object.assign(lavaTrack.info, {
                    title: unresolvedTrack.info.title,
                    author: unresolvedTrack.info.author,
                    uri: unresolvedTrack.info.uri,
                    authorURI: unresolvedTrack.info.authorURI,
                    authorHyperLink: unresolvedTrack.info.authorHyperLink
                });
            }
            this.cache.set(unresolvedTrack.info.identifier, Object.freeze(lavaTrack));
        }
        return Util.structuredClone(lavaTrack);
    }

    private async retrieveTrack(unresolvedTrack: UnresolvedTrack): Promise<Track | undefined> {
        const params = new URLSearchParams({ identifier: `ytsearch:${unresolvedTrack.info.author} - ${unresolvedTrack.info.title} ${this.node.client.options.audioResults ? 'Audio' : ''}` });
        const request = await fetch(`http${this.node.secure ? 's' : ''}://${this.node.url}/loadtracks?${params.toString()}`, { headers: { Authorization: this.node.auth } });
        const response: LavalinkTrackResponse<Track> = await request.json();
        return await response.tracks[0];
    }

    private buildUnresolved(spotifyTrack: Tracks): UnresolvedTrack {
        const _this = this; // eslint-disable-line
        return {
            info: {
                identifier: spotifyTrack.id,
                title: spotifyTrack.name,
                author: spotifyTrack.artists ? spotifyTrack.artists.map((x: { name: any }) => x.name).join(', ') : undefined ?? '',
                authorURI: spotifyTrack.artists ? spotifyTrack.artists.map((x: { uri: any }) => this.extract(x.uri)).join(', ') : undefined ?? '',
                authorHyperLink: spotifyTrack.artists ? spotifyTrack.artists.map((x: any) => `[${x.name}](${this.extract(x.uri)})`).join(', ') : undefined ?? '',
                uri: spotifyTrack.external_urls.spotify,
                length: spotifyTrack.duration_ms
            },
            resolve(): Promise<Track | undefined> {
                return _this.resolve(this);
            }
        };
    }

    private buildResponse(loadType: LavalinkTrackResponse['loadType'], tracks: Array<UnresolvedTrack | Track> = [], playlistName?: string, exceptionMsg?: string): LavalinkTrackResponse {
        return Object.assign(
            {
                loadType,
                tracks,
                playlistInfo: playlistName ? { name: playlistName } : {}
            },
            exceptionMsg ? { exception: { message: exceptionMsg, severity: 'COMMON' } } : {}
        );
    }
}
