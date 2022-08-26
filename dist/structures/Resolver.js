"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { 'default': mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
const petitio_1 = __importDefault(require('petitio'));
const spotify_url_info_1 = require('spotify-url-info');
const Util_1 = __importDefault(require('../Util'));
class Resolver {
    constructor(node) {
        this.node = node;
        this.client = this.node.client;
        this.cache = new Map();
    }
    get token() {
        return this.client.token;
    }
    get playlistLoadLimit() {
        return this.client.options.playlistLoadLimit;
    }
    get autoResolve() {
        return this.client.options.autoResolve;
    }
    async getTrack(id) {
        if (this.client.options.fetchStrategy === 'SCRAPE') {
            const tracks = await spotify_url_info_1.getTracks(`https://open.spotify.com/track/${id}`);
            const unresolvedTracks = this.buildUnresolved(tracks[0]);
            return this.buildResponse('TRACK', this.autoResolve ? [await unresolvedTracks.resolve()] : [unresolvedTracks]);
        }
        if (!this.token)
            throw new Error('No Spotify access token.');
        const spotifyTrack = await petitio_1.default(`${this.client.baseURL}/tracks/${id}`).header('Authorization', this.token).json();
        const unresolvedTrack = this.buildUnresolved(spotifyTrack);
        return this.buildResponse('TRACK', this.autoResolve ? [await unresolvedTrack.resolve()] : [unresolvedTrack]);
    }
    async getPlaylist(id) {
        if (this.client.options.fetchStrategy === 'SCRAPE') {
            const tracks = await spotify_url_info_1.getTracks(`https://open.spotify.com/playlist/${id}`);
            const metaData = await spotify_url_info_1.getData(`https://open.spotify.com/playlist/${id}`);
            let unresolvedPlaylistTracks;
            // @ts-expect-error no typings
            if (typeof tracks[0].track === 'object') {
                // @ts-expect-error no typings
                unresolvedPlaylistTracks = tracks.filter(x => x.track).map(track => this.buildUnresolved(track.track));
            }
            else {
                // @ts-expect-error no typings
                unresolvedPlaylistTracks = tracks.filter(x => x.track).map(track => this.buildUnresolved(track));
            }
            return this.buildResponse('PLAYLIST', this.autoResolve ? (await Promise.all(unresolvedPlaylistTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedPlaylistTracks, metaData.name);
        }
        if (!this.token)
            throw new Error('No Spotify access token.');
        const spotifyPlaylist = await petitio_1.default(`${this.client.baseURL}/playlists/${id}`).header('Authorization', this.token).json();
        await this.getPlaylistTracks(spotifyPlaylist);
        const unresolvedPlaylistTracks = spotifyPlaylist.tracks.items.filter((x) => x.track !== null).map((x) => this.buildUnresolved(x.track));
        return this.buildResponse('PLAYLIST', this.autoResolve ? (await Promise.all(unresolvedPlaylistTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedPlaylistTracks, spotifyPlaylist.name);
    }
    async getAlbum(id) {
        var _a, _b;
        if (this.client.options.fetchStrategy === 'SCRAPE') {
            const tracks = await spotify_url_info_1.getTracks(`https://open.spotify.com/album/${id}`);
            const metaData = await spotify_url_info_1.getData(`https://open.spotify.com/album/${id}`);
            const unresolvedAlbumTracks = (_a = tracks.map(track => track && this.buildUnresolved(track))) !== null && _a !== void 0 ? _a : [];
            return this.buildResponse('PLAYLIST', this.autoResolve ? (await Promise.all(unresolvedAlbumTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedAlbumTracks, metaData.name);
        }
        if (!this.token)
            throw new Error('No Spotify access token.');
        const spotifyAlbum = await petitio_1.default(`${this.client.baseURL}/albums/${id}`, 'GET').header('Authorization', this.token).json();
        const unresolvedAlbumTracks = (_b = spotifyAlbum === null || spotifyAlbum === void 0 ? void 0 : spotifyAlbum.tracks.items.map((track) => this.buildUnresolved(track))) !== null && _b !== void 0 ? _b : [];
        return this.buildResponse('PLAYLIST', this.autoResolve ? (await Promise.all(unresolvedAlbumTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedAlbumTracks, spotifyAlbum.name);
    }
    async getArtist(id) {
        var _a, _b;
        if (this.client.options.fetchStrategy === 'SCRAPE') {
            const tracks = await spotify_url_info_1.getTracks(`https://open.spotify.com/artist/${id}`);
            const metaData = await spotify_url_info_1.getData(`https://open.spotify.com/artist/${id}`);
            const unresolvedArtistTracks = (_a = tracks.map(track => track && this.buildUnresolved(track))) !== null && _a !== void 0 ? _a : [];
            return this.buildResponse('PLAYLIST', this.autoResolve ? (await Promise.all(unresolvedArtistTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedArtistTracks, metaData.name);
        }
        if (!this.token)
            throw new Error('No Spotify access token.');
        const metaData = await petitio_1.default(`${this.client.baseURL}/artists/${id}`).header('Authorization', this.token).json();
        const spotifyArtis = await petitio_1.default(`${this.client.baseURL}/artists/${id}/top-tracks`).query('country', 'US').header('Authorization', this.token).json();
        const unresolvedArtistTracks = (_b = spotifyArtis.tracks.map(track => track && this.buildUnresolved(track))) !== null && _b !== void 0 ? _b : [];
        return this.buildResponse('PLAYLIST', this.autoResolve ? (await Promise.all(unresolvedArtistTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedArtistTracks, metaData.name);
    }
    async getEpisode(id) {
        var _a;
        if (this.client.options.fetchStrategy === 'SCRAPE') {
            const tracks = await spotify_url_info_1.getTracks(`https://open.spotify.com/episode/${id}`);
            const metaData = await spotify_url_info_1.getData(`https://open.spotify.com/episode/${id}`);
            const unresolvedEpisodeTracks = (_a = tracks.map(track => track && this.buildUnresolved(track))) !== null && _a !== void 0 ? _a : [];
            return this.buildResponse('PLAYLIST', this.autoResolve ? (await Promise.all(unresolvedEpisodeTracks.map((x) => x.resolve()))).filter(Boolean) : unresolvedEpisodeTracks, metaData.name);
        }
        if (!this.token)
            throw new Error('No Spotify access token.');
        const metaData = await petitio_1.default(`${this.client.baseURL}/episodes/${id}`, 'GET').query('market', 'US').header('Authorization', this.token).json();
        return this.getShow(metaData.show.id);
    }
    async getShow(id) {
        var _a;
        if (this.client.options.fetchStrategy === 'SCRAPE') {
            const tracks = await spotify_url_info_1.getTracks(`https://open.spotify.com/show/${id}`);
            const metaData = await spotify_url_info_1.getData(`https://open.spotify.com/show/${id}`);
            const unresolvedShowEpisodes = (_a = tracks.map(track => track && this.buildUnresolved(track))) !== null && _a !== void 0 ? _a : [];
            return this.buildResponse('PLAYLIST', this.autoResolve ? (await Promise.all(unresolvedShowEpisodes.map((x) => x.resolve()))).filter(Boolean) : unresolvedShowEpisodes, metaData.name);
        }
        if (!this.token)
            throw new Error('No Spotify access token.');
        const spotifyShow = await petitio_1.default(`${this.client.baseURL}/shows/${id}`).query('market', 'US').header('Authorization', this.token).json();
        await this.getShowEpisodes(spotifyShow);
        const unresolvedShowEpisodes = spotifyShow.episodes.items.map((x) => this.buildUnresolved(x));
        return this.buildResponse('PLAYLIST', this.autoResolve ? (await Promise.all(unresolvedShowEpisodes.map((x) => x.resolve()))).filter(Boolean) : unresolvedShowEpisodes, spotifyShow.name);
    }
    async getShowEpisodes(spotifyShow) {
        let nextPage = spotifyShow.episodes.next;
        let pageLoaded = 1;
        while (nextPage && (this.playlistLoadLimit === 0 ? true : pageLoaded < this.playlistLoadLimit)) {
            const spotifyEpisodePage = await petitio_1.default(nextPage).header('Authorization', this.token).json();
            spotifyShow.episodes.items.push(...spotifyEpisodePage.items);
            nextPage = spotifyEpisodePage.next;
            pageLoaded++;
        }
    }
    async getPlaylistTracks(spotifyPlaylist) {
        let nextPage = spotifyPlaylist.tracks.next;
        let pageLoaded = 1;
        while (nextPage && (this.playlistLoadLimit === 0 ? true : pageLoaded < this.playlistLoadLimit)) {
            const spotifyPlaylistPage = await petitio_1.default(nextPage).header('Authorization', this.token).json();
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
            if (this.client.options.useSpotifyMetadata) {
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
        const params = new URLSearchParams({ identifier: `ytsearch:${unresolvedTrack.info.author} - ${unresolvedTrack.info.title} ${this.client.options.audioOnlyResults ? 'Audio' : ''}` });
        const response = await petitio_1.default(`http${this.node.secure ? 's' : ''}://${this.node.url}/loadtracks?${params.toString()}`).header('Authorization', this.node.auth).json();
        return response.tracks[0];
    }
    buildUnresolved(spotifyTrack) {
        const _this = this; // eslint-disable-line
        return {
            info: {
                identifier: spotifyTrack.id,
                title: spotifyTrack.name,
                author: spotifyTrack.artists ? spotifyTrack.artists.map((x) => x.name).join(' ') : undefined !== null && undefined !== void 0 ? undefined : '',
                uri: spotifyTrack.external_urls.spotify,
                length: spotifyTrack.duration_ms
            },
            resolve() {
                return _this.resolve(this);
            }
        };
    }

    keywordSearch(keyword) {
        return this.makeRequest(`/search?q=${keyword}&type=track&limit=1`)
            .then((res) => {
                const output_result = res.tracks.items[0].external_urls.spotify;
                return output_result;
            })
    }

    makeRequest(url) {
        return petitio_1.default(this.client.baseURL + url, 'GET').header({ Authorization: `Bearer ${this.token}` })
            .json()
            .then((req) => {
                return req;
            });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RydWN0dXJlcy9SZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNEQUE4QjtBQUM5Qix1REFBOEQ7QUFFOUQsbURBQTJCO0FBRzNCLE1BQXFCLFFBQVE7SUFJekIsWUFBMEIsSUFBVTtRQUFWLFNBQUksR0FBSixJQUFJLENBQU07UUFIN0IsV0FBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQzFCLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBeUIsQ0FBQztJQUVSLENBQUM7SUFFekMsSUFBVyxLQUFLO1FBQ1osT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQU0sQ0FBQztJQUM5QixDQUFDO0lBRUQsSUFBVyxpQkFBaUI7UUFDeEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBa0IsQ0FBQztJQUNsRCxDQUFDO0lBRUQsSUFBVyxXQUFXO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBWSxDQUFDO0lBQzVDLENBQUM7SUFFTSxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQVU7UUFDNUIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEtBQUssUUFBUSxFQUFFO1lBQ2hELE1BQU0sTUFBTSxHQUFHLE1BQU0sNEJBQVMsQ0FBQyxrQ0FBa0MsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN2RSxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBRSxDQUFDLE1BQU0sZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1NBQ3ZJO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQzdELE1BQU0sWUFBWSxHQUFpQixNQUFNLGlCQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25JLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBc0IsQ0FBQyxDQUFDO1FBQ3JFLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUUsQ0FBQyxNQUFNLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO0lBQ3RJLENBQUM7SUFFTSxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQVU7UUFDL0IsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEtBQUssUUFBUSxFQUFFO1lBQ2hELE1BQU0sTUFBTSxHQUFHLE1BQU0sNEJBQVMsQ0FBQyxxQ0FBcUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMxRSxNQUFNLFFBQVEsR0FBRyxNQUFNLDBCQUFPLENBQUMscUNBQXFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDMUUsSUFBSSx3QkFBd0IsQ0FBQztZQUM3Qiw4QkFBOEI7WUFDOUIsSUFBSSxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUFFO2dCQUNyQyw4QkFBOEI7Z0JBQzlCLHdCQUF3QixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUMxRztpQkFBTTtnQkFDSCw4QkFBOEI7Z0JBQzlCLHdCQUF3QixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQ3BHO1lBQ0QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBRSxDQUFDLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFxQixDQUFDLENBQUMsQ0FBQyx3QkFBd0IsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbE47UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUs7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDN0QsTUFBTSxlQUFlLEdBQW9CLE1BQU0saUJBQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxjQUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDNUksTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDOUMsTUFBTSx3QkFBd0IsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxLQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ2xKLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUUsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBcUIsQ0FBQyxDQUFDLENBQUMsd0JBQXdCLEVBQUUsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9OLENBQUM7SUFFTSxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQVU7O1FBQzVCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxLQUFLLFFBQVEsRUFBRTtZQUNoRCxNQUFNLE1BQU0sR0FBRyxNQUFNLDRCQUFTLENBQUMsa0NBQWtDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDdkUsTUFBTSxRQUFRLEdBQUcsTUFBTSwwQkFBTyxDQUFDLGtDQUFrQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0scUJBQXFCLFNBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLG1DQUFJLEVBQUUsQ0FBQztZQUM5RixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFFLENBQUMsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQXFCLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM1TTtRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUM3RCxNQUFNLFlBQVksR0FBaUIsTUFBTSxpQkFBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLFdBQVcsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDMUksTUFBTSxxQkFBcUIsU0FBRyxZQUFZLGFBQVosWUFBWSx1QkFBWixZQUFZLENBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBZSxDQUFDLG9DQUFLLEVBQUUsQ0FBQztRQUNySCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFFLENBQUMsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQXFCLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixFQUFFLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqTixDQUFDO0lBRU0sS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFVOztRQUM3QixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsS0FBSyxRQUFRLEVBQUU7WUFDaEQsTUFBTSxNQUFNLEdBQUcsTUFBTSw0QkFBUyxDQUFDLG1DQUFtQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sUUFBUSxHQUFHLE1BQU0sMEJBQU8sQ0FBQyxtQ0FBbUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN4RSxNQUFNLHNCQUFzQixTQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxtQ0FBSSxFQUFFLENBQUM7WUFDL0YsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBRSxDQUFDLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFxQixDQUFDLENBQUMsQ0FBQyxzQkFBc0IsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDOU07UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUs7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDN0QsTUFBTSxRQUFRLEdBQUcsTUFBTSxpQkFBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNsSCxNQUFNLFlBQVksR0FBa0IsTUFBTSxpQkFBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLFlBQVksRUFBRSxhQUFhLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3ZLLE1BQU0sc0JBQXNCLFNBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFlLENBQUMsQ0FBQyxtQ0FBSSxFQUFFLENBQUM7UUFDdEgsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBRSxDQUFDLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFxQixDQUFDLENBQUMsQ0FBQyxzQkFBc0IsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFL00sQ0FBQztJQUVNLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBVTs7UUFDOUIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEtBQUssUUFBUSxFQUFFO1lBQ2hELE1BQU0sTUFBTSxHQUFHLE1BQU0sNEJBQVMsQ0FBQyxvQ0FBb0MsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6RSxNQUFNLFFBQVEsR0FBRyxNQUFNLDBCQUFPLENBQUMsb0NBQW9DLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekUsTUFBTSx1QkFBdUIsU0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsbUNBQUksRUFBRSxDQUFDO1lBQ2hHLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUUsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBcUIsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2hOO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQzdELE1BQU0sUUFBUSxHQUFtQixNQUFNLGlCQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sYUFBYSxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2hLLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQVU7O1FBQzNCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxLQUFLLFFBQVEsRUFBRTtZQUNoRCxNQUFNLE1BQU0sR0FBRyxNQUFNLDRCQUFTLENBQUMsaUNBQWlDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDdEUsTUFBTSxRQUFRLEdBQUcsTUFBTSwwQkFBTyxDQUFDLGlDQUFpQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3RFLE1BQU0sc0JBQXNCLFNBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLG1DQUFJLEVBQUUsQ0FBQztZQUMvRixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFFLENBQUMsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQXFCLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM5TTtRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUM3RCxNQUFNLFdBQVcsR0FBZ0IsTUFBTSxpQkFBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3RKLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN4QyxNQUFNLHNCQUFzQixHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3JHLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUUsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBcUIsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xOLENBQUM7SUFFTyxLQUFLLENBQUMsZUFBZSxDQUFDLFdBQXdCO1FBQ2xELElBQUksUUFBUSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ3pDLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNuQixPQUFPLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1lBQzVGLE1BQU0sa0JBQWtCLEdBQTRCLE1BQU0saUJBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUV2SCxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3RCxRQUFRLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDO1lBQ25DLFVBQVUsRUFBRSxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUVPLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxlQUFnQztRQUM1RCxJQUFJLFFBQVEsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUMzQyxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDbkIsT0FBTyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRTtZQUM1RixNQUFNLG1CQUFtQixHQUE4QixNQUFNLGlCQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFMUgsZUFBZSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEUsUUFBUSxHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQztZQUNwQyxVQUFVLEVBQUUsQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFTyxLQUFLLENBQUMsT0FBTyxDQUFDLGVBQWdDO1FBQ2xELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDL0QsSUFBSSxNQUFNO1lBQUUsT0FBTyxjQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWhELE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM1RCxJQUFJLFNBQVMsRUFBRTtZQUNYLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUU7Z0JBQ3hDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRTtvQkFDMUIsS0FBSyxFQUFFLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSztvQkFDakMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTTtvQkFDbkMsR0FBRyxFQUFFLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRztpQkFDaEMsQ0FBQyxDQUFDO2FBQ047WUFDRCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7U0FDN0U7UUFDRCxPQUFPLGNBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVPLEtBQUssQ0FBQyxhQUFhLENBQUMsZUFBZ0M7UUFDeEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFlLENBQUMsRUFBRSxVQUFVLEVBQUUsWUFBWSxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sTUFBTSxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDckwsTUFBTSxRQUFRLEdBQXlDLE1BQU0saUJBQU8sQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsZUFBZSxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM3TSxPQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVPLGVBQWUsQ0FBQyxZQUFvQjtRQUN4QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxzQkFBc0I7UUFDMUMsT0FBTztZQUNILElBQUksRUFBRTtnQkFDRixVQUFVLEVBQUUsWUFBWSxDQUFDLEVBQUU7Z0JBQzNCLEtBQUssRUFBRSxZQUFZLENBQUMsSUFBSTtnQkFDeEIsTUFBTSxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLGFBQVQsU0FBUyxjQUFULFNBQVMsR0FBSSxFQUFFO2dCQUNsRyxHQUFHLEVBQUUsWUFBWSxDQUFDLGFBQWEsQ0FBQyxPQUFPO2dCQUN2QyxNQUFNLEVBQUUsWUFBWSxDQUFDLFdBQVc7YUFDbkM7WUFDRCxPQUFPO2dCQUNILE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQixDQUFDO1NBQ0osQ0FBQztJQUNOLENBQUM7SUFFTyxhQUFhLENBQUMsSUFBbUMsRUFBRSxTQUFpRCxFQUFFLEVBQUUsWUFBcUIsRUFBRSxZQUFxQjtRQUN4SixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQ2hCO1lBQ0ksSUFBSTtZQUNKLE1BQU07WUFDTixZQUFZO1NBQ2YsRUFDRCxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUNuRixDQUFDO0lBQ04sQ0FBQztDQUNKO0FBcExELDJCQW9MQyJ9