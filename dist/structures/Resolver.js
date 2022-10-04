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
            const spotifyTrack = await (0, petitio_1.default)(`${this.node.client.baseURL}/tracks/${id}`).header('Authorization', this.token).json();
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
            const spotifyPlaylist = await (0, petitio_1.default)(`${this.node.client.baseURL}/playlists/${id}`).header('Authorization', this.token).json();
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
            const spotifyAlbum = await (0, petitio_1.default)(`${this.node.client.baseURL}/albums/${id}`, 'GET').header('Authorization', this.token).json();
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
            if (!this.token)
                throw new Error('No Spotify access token.');
            const metaData = await (0, petitio_1.default)(`${this.node.client.baseURL}/artists/${id}`).header('Authorization', this.token).json();
            const spotifyArtis = await (0, petitio_1.default)(`${this.node.client.baseURL}/artists/${id}/top-tracks`).query('country', 'US').header('Authorization', this.token).json();
            const unresolvedArtistTracks = (_b = spotifyArtis.tracks.map(track => track && this.buildUnresolved(track))) !== null && _b !== void 0 ? _b : [];
            return this.buildResponse('PLAYLIST_LOADED', this.autoResolve ? (await Promise.all(unresolvedArtistTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedArtistTracks, metaData.name);
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
            const metaData = await (0, petitio_1.default)(`${this.node.client.baseURL}/episodes/${id}`, 'GET').query('market', 'US').header('Authorization', this.token).json();
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
            const spotifyShow = await (0, petitio_1.default)(`${this.node.client.baseURL}/shows/${id}`).query('market', 'US').header('Authorization', this.token).json();
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
    buildResponse(loadType, tracks = [], playlistName, exceptionMsg) {
        return Object.assign({
            loadType,
            tracks,
            playlistInfo: playlistName ? { name: playlistName } : {}
        }, exceptionMsg ? { exception: { message: exceptionMsg, severity: 'COMMON' } } : {});
    }
}
exports.default = Resolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RydWN0dXJlcy9SZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHVEQUF1RDtBQUN2RCxzREFBOEI7QUFDOUIsd0VBQXNDO0FBQ3RDLG1DQUE4QjtBQUM5QixNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUEsMEJBQU8sRUFBQyxjQUFLLENBQUMsQ0FBQztBQUc5QyxtREFBMkI7QUFFM0IsTUFBcUIsUUFBUTtJQUd6QixZQUEwQixJQUFVO1FBQVYsU0FBSSxHQUFKLElBQUksQ0FBTTtRQUY3QixVQUFLLEdBQUcsSUFBSSxHQUFHLEVBQWlCLENBQUM7SUFFQSxDQUFDO0lBRXpDLElBQVcsS0FBSztRQUNaLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBTSxDQUFDO0lBQ25DLENBQUM7SUFFRCxJQUFXLGFBQWE7UUFDcEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYyxDQUFDO0lBQ25ELENBQUM7SUFFRCxJQUFXLFdBQVc7UUFDbEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBWSxDQUFDO0lBQ2pELENBQUM7SUFFTyxPQUFPLENBQUMsR0FBUTtRQUNwQixJQUFJLENBQUMsR0FBRywwSUFBMEksQ0FBQztRQUNuSixJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQUUsT0FBTyxtQ0FBbUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFBO0lBQ2pGLENBQUM7SUFFTSxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQVU7O1FBQzVCLElBQUk7WUFDQSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEtBQUssUUFB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