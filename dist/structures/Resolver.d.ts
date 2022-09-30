import { Track, LavalinkTrackResponse } from '../typings';
import Node from './Node';
export default class Resolver {
    node: Node;
    client: import("..").SpotifyClient;
    cache: Map<string, Track>;
    constructor(node: Node);
    get token(): string;
    get playlistLimit(): number;
    get autoResolve(): boolean;
    getTrack(id: string): Promise<LavalinkTrackResponse | any>;
    getPlaylist(id: string): Promise<LavalinkTrackResponse | any>;
    getAlbum(id: string): Promise<LavalinkTrackResponse | any>;
    getArtist(id: string): Promise<LavalinkTrackResponse | any>;
    getEpisode(id: string): Promise<LavalinkTrackResponse | any>;
    getShow(id: string): Promise<LavalinkTrackResponse | any>;
    private getShowEpisodes;
    private getPlaylistTracks;
    private resolve;
    private retrieveTrack;
    private buildUnresolved;
    private buildResponse;
}
