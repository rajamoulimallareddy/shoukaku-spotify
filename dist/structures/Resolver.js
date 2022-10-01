"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-var-requires */
const petitio_1 = __importDefault(require("petitio"));
const spotify_url_info_1 = __importDefault(require("spotify-url-info"));
const undici_1 = require("undici");
const { getTracks, getData } = (0, spotify_url_info_1.default)(undici_1.fetch);
const Util_1 = __importDefault(require("../Util"));
class Resolver {
    constructor(node) {
        this.node = node;
        this.client = this.node.client;
        this.cache = new Map();
    }
    get token() {
        return this.node.client.token;
    }
    get playlistLimit() {
        return this.node.client.options.playlistLimit;
    }
    get autoResolve() {
        return this.node.client.options.autoResolve;
    }
    extract(url) {
        var p = /^(?:https:\/\/open\.spotify\.com\/(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track|artist|episode|show)(?:[/:])([A-Za-z0-9]+).*$/;
        if (url.match(p))
            return `https://open.spotify.com/artist/${url.match(p)[2]}`;
    }
    async getTrack(id) {
        if (this.node.client.options.fetchType === 'SCRAPE') {
            const tracks = await getTracks(`https://open.spotify.com/track/${id}`);
            const unresolvedTracks = this.buildUnresolved(tracks[0]);
            return this.buildResponse('TRACK_LOADED', this.autoResolve ? [await unresolvedTracks.resolve()] : [unresolvedTracks]);
        }
        if (!this.token)
            throw new Error('No Spotify access token.');
        const spotifyTrack = await (0, petitio_1.default)(`${this.node.client.baseURL}/tracks/${id}`).header('Authorization', this.token).json();
        const unresolvedTrack = this.buildUnresolved(spotifyTrack);
        return this.buildResponse('TRACK_LOADED', this.autoResolve ? [await unresolvedTrack.resolve()] : [unresolvedTrack]);
    }
    async getPlaylist(id) {
        if (this.node.client.options.fetchType === 'SCRAPE') {
            const tracks = await getTracks(`https://open.spotify.com/playlist/${id}`);
            const metaData = await getData(`https://open.spotify.com/playlist/${id}`);
            let unresolvedPlaylistTracks;
            if (typeof tracks[0] === 'object') {
                // @ts-expect-error no typings
                unresolvedPlaylistTracks = tracks.filter(x => x.track).map(track => this.buildUnresolved(track.track));
            }
            else {
                // @ts-expect-error no typings
                unresolvedPlaylistTracks = tracks.filter(x => x.track).map(track => this.buildUnresolved(track));
            }
            return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? (await Promise.all(unresolvedPlaylistTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedPlaylistTracks, metaData.name);
        }
        if (!this.token)
            throw new Error('No Spotify access token.');
        const spotifyPlaylist = await (0, petitio_1.default)(`${this.node.client.baseURL}/playlists/${id}`).header('Authorization', this.token).json();
        await this.getPlaylistTracks(spotifyPlaylist);
        const unresolvedPlaylistTracks = spotifyPlaylist.tracks.items.filter((x) => x.track !== null).map((x) => this.buildUnresolved(x.track));
        return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? (await Promise.all(unresolvedPlaylistTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedPlaylistTracks, spotifyPlaylist.name);
    }
    async getAlbum(id) {
        var _a, _b;
        if (this.node.client.options.fetchType === 'SCRAPE') {
            const tracks = await getTracks(`https://open.spotify.com/album/${id}`);
            const metaData = await getData(`https://open.spotify.com/album/${id}`);
            const unresolvedAlbumTracks = (_a = tracks.map((track) => track && this.buildUnresolved(track))) !== null && _a !== void 0 ? _a : [];
            return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? (await Promise.all(unresolvedAlbumTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedAlbumTracks, metaData.name);
        }
        if (!this.token)
            throw new Error('No Spotify access token.');
        const spotifyAlbum = await (0, petitio_1.default)(`${this.node.client.baseURL}/albums/${id}`, 'GET').header('Authorization', this.token).json();
        const unresolvedAlbumTracks = (_b = spotifyAlbum === null || spotifyAlbum === void 0 ? void 0 : spotifyAlbum.tracks.items.map((track) => this.buildUnresolved(track))) !== null && _b !== void 0 ? _b : [];
        return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? (await Promise.all(unresolvedAlbumTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedAlbumTracks, spotifyAlbum.name);
    }
    async getArtist(id) {
        var _a, _b;
        if (this.node.client.options.fetchType === 'SCRAPE') {
            const tracks = await getTracks(`https://open.spotify.com/artist/${id}`);
            const metaData = await getData(`https://open.spotify.com/artist/${id}`);
            const unresolvedArtistTracks = (_a = tracks.map((track) => track && this.buildUnresolved(track))) !== null && _a !== void 0 ? _a : [];
            return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? (await Promise.all(unresolvedArtistTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedArtistTracks, metaData.name);
        }
        if (!this.token)
            throw new Error('No Spotify access token.');
        const metaData = await (0, petitio_1.default)(`${this.node.client.baseURL}/artists/${id}`).header('Authorization', this.token).json();
        const spotifyArtis = await (0, petitio_1.default)(`${this.node.client.baseURL}/artists/${id}/top-tracks`).query('country', 'US').header('Authorization', this.token).json();
        const unresolvedArtistTracks = (_b = spotifyArtis.tracks.map(track => track && this.buildUnresolved(track))) !== null && _b !== void 0 ? _b : [];
        return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? (await Promise.all(unresolvedArtistTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedArtistTracks, metaData.name);
    }
    async getEpisode(id) {
        var _a;
        if (this.node.client.options.fetchType === 'SCRAPE') {
            const tracks = await getTracks(`https://open.spotify.com/episode/${id}`);
            const metaData = await getData(`https://open.spotify.com/episode/${id}`);
            const unresolvedEpisodeTracks = (_a = tracks.map((track) => track && this.buildUnresolved(track))) !== null && _a !== void 0 ? _a : [];
            return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? (await Promise.all(unresolvedEpisodeTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedEpisodeTracks, metaData.name);
        }
        if (!this.token)
            throw new Error('No Spotify access token.');
        const metaData = await (0, petitio_1.default)(`${this.node.client.baseURL}/episodes/${id}`, 'GET').query('market', 'US').header('Authorization', this.token).json();
        return this.getShow(metaData.show.id);
    }
    async getShow(id) {
        var _a;
        if (this.node.client.options.fetchType === 'SCRAPE') {
            const tracks = await getTracks(`https://open.spotify.com/show/${id}`);
            const metaData = await getData(`https://open.spotify.com/show/${id}`);
            const unresolvedShowEpisodes = (_a = tracks.map((track) => track && this.buildUnresolved(track))) !== null && _a !== void 0 ? _a : [];
            return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? (await Promise.all(unresolvedShowEpisodes.map((x) => x.resolve()))).filter(Boolean) : unresolvedShowEpisodes, metaData.name);
        }
        if (!this.token)
            throw new Error('No Spotify access token.');
        const spotifyShow = await (0, petitio_1.default)(`${this.node.client.baseURL}/shows/${id}`).query('market', 'US').header('Authorization', this.token).json();
        await this.getShowEpisodes(spotifyShow);
        const unresolvedShowEpisodes = spotifyShow.episodes.items.map((x) => this.buildUnresolved(x));
        return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? (await Promise.all(unresolvedShowEpisodes.map((x) => x.resolve()))).filter(Boolean) : unresolvedShowEpisodes, spotifyShow.name);
    }
    async getShowEpisodes(spotifyShow) {
        let nextPage = spotifyShow.episodes.next;
        let pageLoaded = 1;
        while (nextPage && (this.playlistLimit === 0 ? true : pageLoaded < this.playlistLimit)) {
            const spotifyEpisodePage = await (0, petitio_1.default)(nextPage).header('Authorization', this.token).json();
            spotifyShow.episodes.items.push(...spotifyEpisodePage.items);
            nextPage = spotifyEpisodePage.next;
            pageLoaded++;
        }
    }
    async getPlaylistTracks(spotifyPlaylist) {
        let nextPage = spotifyPlaylist.tracks.next;
        let pageLoaded = 1;
        while (nextPage && (this.playlistLimit === 0 ? true : pageLoaded < this.playlistLimit)) {
            const spotifyPlaylistPage = await (0, petitio_1.default)(nextPage).header('Authorization', this.token).json();
            spotifyPlaylist.tracks.items.push(...spotifyPlaylistPage.items);
            nextPage = spotifyPlaylistPage.next;
            pageLoaded++;
        }
    }
    async resolve(unresolvedTrack) {
        const cached = this.cache.get(unresolvedTrack.info.identifier);
        if (cached)
            return Util_1.default.structuredClone(cached);
        const lavaTrack = await this.retrieveTrack(unresolvedTrack);
        if (lavaTrack) {
            if (this.node.client.options.spotifyMetadata) {
                Object.assign(lavaTrack.info, {
                    title: unresolvedTrack.info.title,
                    author: unresolvedTrack.info.author,
                    uri: unresolvedTrack.info.uri
                });
            }
            this.cache.set(unresolvedTrack.info.identifier, Object.freeze(lavaTrack));
        }
        return Util_1.default.structuredClone(lavaTrack);
    }
    async retrieveTrack(unresolvedTrack) {
        const params = new URLSearchParams({ identifier: `ytsearch:${unresolvedTrack.info.author} - ${unresolvedTrack.info.title} ${this.node.client.options.audioResults ? 'Audio' : ''}` });
        const response = await (0, petitio_1.default)(`http${this.node.secure ? 's' : ''}://${this.node.url}/loadtracks?${params.toString()}`).header('Authorization', this.node.auth).json();
        return response.tracks[0];
    }
    buildUnresolved(spotifyTrack) {
        const _this = this; // eslint-disable-line
        return {
            info: {
                identifier: spotifyTrack.id,
                title: spotifyTrack.name,
                author: spotifyTrack.artists ? spotifyTrack.artists.map((x) => x.name).join(', ') : undefined !== null && undefined !== void 0 ? undefined : '',
                authorURI: spotifyTrack.artists ? spotifyTrack.artists.map((x) => this.extract(x.uri)).join(', ') : undefined !== null && undefined !== void 0 ? undefined : '',
                authorHyperLink: spotifyTrack.artists ? spotifyTrack.artists.map((x) => `[${x.name}](${this.extract(x.uri)})`).join(', ') : undefined !== null && undefined !== void 0 ? undefined : '',
                uri: spotifyTrack.external_urls.spotify,
                length: spotifyTrack.duration_ms
            },
            resolve() {
                return _this.resolve(this);
            }
        };
    }
    buildResponse(loadtype, tracks = [], playlistName, exceptionMsg) {
        return Object.assign({
            loadtype,
            tracks,
            playlistInfo: { name: playlistName }
        }, exceptionMsg ? { exception: { message: exceptionMsg, severity: 'COMMON' } } : {});
    }
}
exports.default = Resolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RydWN0dXJlcy9SZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHVEQUF1RDtBQUN2RCxzREFBOEI7QUFDOUIsd0VBQXNDO0FBQ3RDLG1DQUE4QjtBQUM5QixNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUEsMEJBQU8sRUFBQyxjQUFLLENBQUMsQ0FBQztBQUc5QyxtREFBMkI7QUFFM0IsTUFBcUIsUUFBUTtJQUl6QixZQUEwQixJQUFVO1FBQVYsU0FBSSxHQUFKLElBQUksQ0FBTTtRQUg3QixXQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDMUIsVUFBSyxHQUFHLElBQUksR0FBRyxFQUFpQixDQUFDO0lBRUEsQ0FBQztJQUV6QyxJQUFXLEtBQUs7UUFDWixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQU0sQ0FBQztJQUNuQyxDQUFDO0lBRUQsSUFBVyxhQUFhO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWMsQ0FBQztJQUNuRCxDQUFDO0lBRUQsSUFBVyxXQUFXO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVksQ0FBQztJQUNqRCxDQUFDO0lBRU8sT0FBTyxDQUFDLEdBQVE7UUFDcEIsSUFBSSxDQUFDLEdBQUcsMElBQTBJLENBQUM7UUFDbkosSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUFFLE9BQU8sbUNBQW1DLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtJQUNqRixDQUFDO0lBRU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFVO1FBQzVCLElBQUksSUFBSSxDQUFDLElBQUksQ0FB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