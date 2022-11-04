"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-var-requires */
// import petitio from 'petitio';
const spotify_url_info_1 = __importDefault(require("spotify-url-info"));
const undici_1 = require("undici");
const { getTracks, getData } = (0, spotify_url_info_1.default)(undici_1.fetch);
const Util_1 = __importDefault(require("../Util"));
class Resolver {
    constructor(node) {
        this.node = node;
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
        var _a, _b, _c;
        try {
            if (this.node.client.options.fetchType === 'SCRAPE') {
                const tracks = await getTracks(`https://open.spotify.com/track/${id}`);
                const unresolvedTracks = this.buildUnresolved(tracks[0]);
                return this.buildResponse('TRACK_LOADED', this.autoResolve ? [await unresolvedTracks.resolve()] : [unresolvedTracks]);
            }
            if (!this.token)
                throw new Error('No Spotify access token.');
            const response = await (0, undici_1.fetch)(`${this.node.client.baseURL}/tracks/${id}`, { headers: { Authorization: this.token } });
            const spotifyTrack = await response.json();
            const unresolvedTrack = this.buildUnresolved(spotifyTrack);
            return this.buildResponse('TRACK_LOADED', this.autoResolve ? [await unresolvedTrack.resolve()] : [unresolvedTrack]);
        }
        catch (e) {
            return this.buildResponse(((_a = e.body) === null || _a === void 0 ? void 0 : _a.error.message) === "invalid id" ? "NO_MATCHES" : "LOAD_FAILED", [], undefined, (_c = (_b = e.body) === null || _b === void 0 ? void 0 : _b.error.message) !== null && _c !== void 0 ? _c : e.message);
        }
    }
    async getPlaylist(id) {
        var _a, _b;
        try {
            if (this.node.client.options.fetchType === 'SCRAPE') {
                const tracks = await getTracks(`https://open.spotify.com/playlist/${id}`);
                const metaData = await getData(`https://open.spotify.com/playlist/${id}`);
                // @ts-expect-error no typings
                const unresolvedPlaylistTracks = tracks.filter(x => x.track).map(track => this.buildUnresolved(track));
                return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? (await Promise.all(unresolvedPlaylistTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedPlaylistTracks, metaData.name);
            }
            if (!this.token)
                throw new Error('No Spotify access token.');
            const response = await (0, undici_1.fetch)(`${this.node.client.baseURL}/playlists/${id}`, { headers: { Authorization: this.token } });
            const spotifyPlaylist = await response.json();
            await this.getPlaylistTracks(spotifyPlaylist);
            const unresolvedPlaylistTracks = spotifyPlaylist.tracks.items.filter((x) => x.track !== null).map((x) => this.buildUnresolved(x.track));
            return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? (await Promise.all(unresolvedPlaylistTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedPlaylistTracks, spotifyPlaylist.name);
        }
        catch (e) {
            return this.buildResponse(e.status === 404 ? "NO_MATCHES" : "LOAD_FAILED", [], undefined, (_b = (_a = e.body) === null || _a === void 0 ? void 0 : _a.error.message) !== null && _b !== void 0 ? _b : e.message);
        }
    }
    async getAlbum(id) {
        var _a, _b, _c, _d;
        try {
            if (this.node.client.options.fetchType === 'SCRAPE') {
                const tracks = await getTracks(`https://open.spotify.com/album/${id}`);
                const metaData = await getData(`https://open.spotify.com/album/${id}`);
                const unresolvedAlbumTracks = (_a = tracks.map((track) => track && this.buildUnresolved(track))) !== null && _a !== void 0 ? _a : [];
                return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? (await Promise.all(unresolvedAlbumTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedAlbumTracks, metaData.name);
            }
            if (!this.token)
                throw new Error('No Spotify access token.');
            const response = await (0, undici_1.fetch)(`${this.node.client.baseURL}/albums/${id}`, { headers: { Authorization: this.token } });
            const spotifyAlbum = await response.json();
            const unresolvedAlbumTracks = (_b = spotifyAlbum === null || spotifyAlbum === void 0 ? void 0 : spotifyAlbum.tracks.items.map((track) => this.buildUnresolved(track))) !== null && _b !== void 0 ? _b : [];
            return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? (await Promise.all(unresolvedAlbumTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedAlbumTracks, spotifyAlbum.name);
        }
        catch (e) {
            return this.buildResponse(e.status === 404 ? "NO_MATCHES" : "LOAD_FAILED", [], undefined, (_d = (_c = e.body) === null || _c === void 0 ? void 0 : _c.error.message) !== null && _d !== void 0 ? _d : e.message);
        }
    }
    async getArtist(id) {
        var _a, _b, _c, _d;
        try {
            if (this.node.client.options.fetchType === 'SCRAPE') {
                const tracks = await getTracks(`https://open.spotify.com/artist/${id}`);
                const metaData = await getData(`https://open.spotify.com/artist/${id}`);
                const unresolvedArtistTracks = (_a = tracks.map((track) => track && this.buildUnresolved(track))) !== null && _a !== void 0 ? _a : [];
                return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? (await Promise.all(unresolvedArtistTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedArtistTracks, metaData.name);
            }
            ;
            if (!this.token)
                throw new Error('No Spotify access token.');
            const metaData = await (0, undici_1.fetch)(`${this.node.client.baseURL}/artists/${id}`, { headers: { Authorization: this.token } });
            const meta_data = await metaData.json();
            const response = await (0, undici_1.fetch)(`${this.node.client.baseURL}/artists/${id}/top-tracks?country=US`, { headers: { Authorization: this.token } });
            const spotifyArtis = await response.json();
            const unresolvedArtistTracks = (_b = spotifyArtis.tracks.map(track => track && this.buildUnresolved(track))) !== null && _b !== void 0 ? _b : [];
            return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? (await Promise.all(unresolvedArtistTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedArtistTracks, meta_data.name);
        }
        catch (e) {
            return this.buildResponse(e.status === 404 ? "NO_MATCHES" : "LOAD_FAILED", [], undefined, (_d = (_c = e.body) === null || _c === void 0 ? void 0 : _c.error.message) !== null && _d !== void 0 ? _d : e.message);
        }
    }
    async getEpisode(id) {
        var _a, _b, _c;
        try {
            if (this.node.client.options.fetchType === 'SCRAPE') {
                const tracks = await getTracks(`https://open.spotify.com/episode/${id}`);
                const metaData = await getData(`https://open.spotify.com/episode/${id}`);
                const unresolvedEpisodeTracks = (_a = tracks.map((track) => track && this.buildUnresolved(track))) !== null && _a !== void 0 ? _a : [];
                return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? (await Promise.all(unresolvedEpisodeTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedEpisodeTracks, metaData.name);
            }
            if (!this.token)
                throw new Error('No Spotify access token.');
            const response = await (0, undici_1.fetch)(`${this.node.client.baseURL}/episodes/${id}?market=US`, { method: 'GET', headers: { Authorization: this.token } });
            const metaData = await response.json();
            return this.getShow(metaData.show.id);
        }
        catch (e) {
            return this.buildResponse(e.status === 404 ? "NO_MATCHES" : "LOAD_FAILED", [], undefined, (_c = (_b = e.body) === null || _b === void 0 ? void 0 : _b.error.message) !== null && _c !== void 0 ? _c : e.message);
        }
    }
    async getShow(id) {
        var _a, _b, _c;
        try {
            if (this.node.client.options.fetchType === 'SCRAPE') {
                const tracks = await getTracks(`https://open.spotify.com/show/${id}`);
                const metaData = await getData(`https://open.spotify.com/show/${id}`);
                const unresolvedShowEpisodes = (_a = tracks.map((track) => track && this.buildUnresolved(track))) !== null && _a !== void 0 ? _a : [];
                return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? (await Promise.all(unresolvedShowEpisodes.map((x) => x.resolve()))).filter(Boolean) : unresolvedShowEpisodes, metaData.name);
            }
            if (!this.token)
                throw new Error('No Spotify access token.');
            const response = await (0, undici_1.fetch)(`${this.node.client.baseURL}/shows/${id}?market=US`, { headers: { Authorization: this.token } });
            const spotifyShow = response.json();
            await this.getShowEpisodes(spotifyShow);
            const unresolvedShowEpisodes = spotifyShow.episodes.items.map((x) => this.buildUnresolved(x));
            return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? (await Promise.all(unresolvedShowEpisodes.map((x) => x.resolve()))).filter(Boolean) : unresolvedShowEpisodes, spotifyShow.name);
        }
        catch (e) {
            return this.buildResponse(e.status === 404 ? "NO_MATCHES" : "LOAD_FAILED", [], undefined, (_c = (_b = e.body) === null || _b === void 0 ? void 0 : _b.error.message) !== null && _c !== void 0 ? _c : e.message);
        }
    }
    async getShowEpisodes(spotifyShow) {
        let nextPage = spotifyShow.episodes.next;
        let pageLoaded = 1;
        while (nextPage && (this.playlistLimit === 0 ? true : pageLoaded < this.playlistLimit)) {
            const response = await (0, undici_1.fetch)(nextPage, { headers: { Authorization: this.token } });
            const spotifyEpisodePage = await response.json();
            spotifyShow.episodes.items.push(...spotifyEpisodePage.items);
            nextPage = spotifyEpisodePage.next;
            pageLoaded++;
        }
    }
    async getPlaylistTracks(spotifyPlaylist) {
        let nextPage = spotifyPlaylist.tracks.next;
        let pageLoaded = 1;
        while (nextPage && (this.playlistLimit === 0 ? true : pageLoaded < this.playlistLimit)) {
            const response = await (0, undici_1.fetch)(nextPage, { headers: { Authorization: this.token } });
            const spotifyPlaylistPage = await response.json();
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
                    uri: unresolvedTrack.info.uri,
                    authorURI: unresolvedTrack.info.authorURI,
                    authorHyperLink: unresolvedTrack.info.authorHyperLink
                });
            }
            this.cache.set(unresolvedTrack.info.identifier, Object.freeze(lavaTrack));
        }
        return Util_1.default.structuredClone(lavaTrack);
    }
    async retrieveTrack(unresolvedTrack) {
        const params = new URLSearchParams({ identifier: `ytsearch:${unresolvedTrack.info.author} - ${unresolvedTrack.info.title} ${this.node.client.options.audioResults ? 'Audio' : ''}` });
        const request = await (0, undici_1.fetch)(`http${this.node.secure ? 's' : ''}://${this.node.url}/loadtracks?${params.toString()}`, { headers: { Authorization: this.node.auth } });
        const response = await request.json();
        return await response.tracks[0];
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
    buildResponse(loadType, tracks = [], playlistName, exceptionMsg) {
        return Object.assign({
            loadType,
            tracks,
            playlistInfo: playlistName ? { name: playlistName } : {}
        }, exceptionMsg ? { exception: { message: exceptionMsg, severity: 'COMMON' } } : {});
    }
}
exports.default = Resolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RydWN0dXJlcy9SZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHVEQUF1RDtBQUN2RCxpQ0FBaUM7QUFDakMsd0VBQXNDO0FBQ3RDLG1DQUE4QjtBQUM5QixNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUEsMEJBQU8sRUFBQyxjQUFLLENBQUMsQ0FBQztBQUc5QyxtREFBMkI7QUFFM0IsTUFBcUIsUUFBUTtJQUd6QixZQUEwQixJQUFVO1FBQVYsU0FBSSxHQUFKLElBQUksQ0FBTTtRQUY3QixVQUFLLEdBQUcsSUFBSSxHQUFHLEVBQWlCLENBQUM7SUFFQSxDQUFDO0lBRXpDLElBQVcsS0FBSztRQUNaLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBTSxDQUFDO0lBQ25DLENBQUM7SUFFRCxJQUFXLGFBQWE7UUFDcEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYyxDQUFDO0lBQ25ELENBQUM7SUFFRCxJQUFXLFdBQVc7UUFDbEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBWSxDQUFDO0lBQ2pELENBQUM7SUFFTyxPQUFPLENBQUMsR0FBUTtRQUNwQixJQUFJLENBQUMsR0FBRywwSUFBMEksQ0FBQztRQUNuSixJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQUUsT0FBTyxtQ0FBbUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFBO0lBQ2pGLENBQUM7SUFFTSxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQVU7O1FBQzVCLElBQUk7WUFDQSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEtBQUssUUFB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