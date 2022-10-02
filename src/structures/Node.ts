import SpotifyClient from '../Client';
import { LavalinkTrackResponse, NodeOptions } from '../typings';
import Resolver from './Resolver';
import petitio from 'petitio';
export default class Node {
    public resolver = new Resolver(this);

    public name!: string;
    public url!: string;
    public auth!: string;
    public secure!: boolean;

    private readonly methods = {
        album: this.resolver.getAlbum.bind(this.resolver),
        playlist: this.resolver.getPlaylist.bind(this.resolver),
        track: this.resolver.getTrack.bind(this.resolver),
        artist: this.resolver.getArtist.bind(this.resolver),
        episode: this.resolver.getEpisode.bind(this.resolver),
        show: this.resolver.getShow.bind(this.resolver)
    };

    public constructor(public client: SpotifyClient, options: NodeOptions) {
        Object.defineProperties(this, {
            id: { value: options.name, enumerable: true },
            url: { value: options.url },
            auth: { value: options.auth },
            secure: { value: options.secure }
        });
    }

    /**
     * A method for loading Spotify URLs
     * @returns Lavalink-like /loadtracks response
     */
    public async load(url: string, limit: number = 1): Promise<LavalinkTrackResponse | null> {
        if (!this.client.spotifyPattern.exec(url)) url = await this.keyword_search(url, limit).then((req: any) => req?.tracks?.items[0]?.external_urls.spotify);
        const [, type, id] = this.client.spotifyPattern.exec(url) ?? [];
        return this.methods[type as keyof Node['methods']](id);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
    public async keyword_search(keyword: string, limit: number = 1): Promise<any> {
        const result = await petitio('https://api.spotify.com/v1' + `/search?q=${keyword}&type=track&limit=${limit}`, 'GET')
            .header({
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                Authorization: `${this.client.token}`
            }).json();
        return result;
    }
}
