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
            playlistInfo: { name: playlistName }
        }, exceptionMsg ? { exception: { message: exceptionMsg, severity: 'COMMON' } } : {});
    }
}
exports.default = Resolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMyL3N0cnVjdHVyZXMvUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSx1REFBdUQ7QUFDdkQsc0RBQThCO0FBQzlCLHdFQUFzQztBQUN0QyxtQ0FBOEI7QUFDOUIsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFBLDBCQUFPLEVBQUMsY0FBSyxDQUFDLENBQUM7QUFHOUMsbURBQTJCO0FBRTNCLE1BQXFCLFFBQVE7SUFHekIsWUFBMEIsSUFBVTtRQUFWLFNBQUksR0FBSixJQUFJLENBQU07UUFGN0IsVUFBSyxHQUFHLElBQUksR0FBRyxFQUFpQixDQUFDO0lBRUEsQ0FBQztJQUV6QyxJQUFXLEtBQUs7UUFDWixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQU0sQ0FBQztJQUNuQyxDQUFDO0lBRUQsSUFBVyxhQUFhO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWMsQ0FBQztJQUNuRCxDQUFDO0lBRUQsSUFBVyxXQUFXO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVksQ0FBQztJQUNqRCxDQUFDO0lBRU8sT0FBTyxDQUFDLEdBQVE7UUFDcEIsSUFBSSxDQUFDLEdBQUcsMElBQTBJLENBQUM7UUFDbkosSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUFFLE9BQU8sbUNBQW1DLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtJQUNqRixDQUFDO0lBRU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFVO1FBQzVCLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsS0FBSyxRQUFRLEVBQUU7WUFD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