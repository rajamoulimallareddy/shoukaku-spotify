"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Resolver_1 = __importDefault(require("./Resolver"));
const petitio_1 = __importDefault(require("petitio"));
class Node {
    constructor(client, options) {
        this.client = client;
        this.resolver = new Resolver_1.default(this);
        this.methods = {
            album: this.resolver.getAlbum.bind(this.resolver),
            playlist: this.resolver.getPlaylist.bind(this.resolver),
            track: this.resolver.getTrack.bind(this.resolver),
            artist: this.resolver.getArtist.bind(this.resolver),
            episode: this.resolver.getEpisode.bind(this.resolver),
            show: this.resolver.getShow.bind(this.resolver)
        };
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
    async load(url, limit = 1) {
        var _a;
        if (!this.client.spotifyPattern.exec(url))
            url = await this.keyword_search(url, limit).then((req) => { var _a, _b; return (_b = (_a = req === null || req === void 0 ? void 0 : req.tracks) === null || _a === void 0 ? void 0 : _a.items[0]) === null || _b === void 0 ? void 0 : _b.external_urls.spotify; });
        const [, type, id] = (_a = this.client.spotifyPattern.exec(url)) !== null && _a !== void 0 ? _a : [];
        return this.methods[type](id);
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
    async keyword_search(keyword, limit = 1) {
        const result = await (0, petitio_1.default)('https://api.spotify.com/v1' + `/search?q=${keyword}&type=track&limit=${limit}`, 'GET')
            .header({
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            Authorization: `${this.client.token}`
        }).json();
        return result;
    }
}
exports.default = Node;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYzIvc3RydWN0dXJlcy9Ob2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUEsMERBQWtDO0FBQ2xDLHNEQUE4QjtBQUM5QixNQUFxQixJQUFJO0lBaUJyQixZQUEwQixNQUFxQixFQUFFLE9BQW9CO1FBQTNDLFdBQU0sR0FBTixNQUFNLENBQWU7UUFoQnhDLGFBQVEsR0FBRyxJQUFJLGtCQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFPcEIsWUFBTyxHQUFHO1lBQ3ZCLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUNqRCxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDdkQsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ2pELE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUNuRCxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDckQsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1NBQ2xELENBQUM7UUFHRSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFO1lBQzFCLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUU7WUFDN0MsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUU7WUFDM0IsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDN0IsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUU7U0FDcEMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7T0FHRztJQUNJLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBVyxFQUFFLFFBQWdCLENBQUM7O1FBQzVDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQUUsR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBUSxFQUFFLEVBQUUsZUFBQyxPQUFBLE1BQUEsTUFBQSxHQUFHLGFBQUgsR0FBRyx1QkFBSCxHQUFHLENBQUUsTUFBTSwwQ0FBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLDBDQUFFLGFBQWEsQ0FBQyxPQUFPLENBQUEsRUFBQSxDQUFDLENBQUM7UUFDeEosTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLE1BQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQ0FBSSxFQUFFLENBQUM7UUFDaEUsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQTZCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQsK0hBQStIO0lBQ3hILEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBZSxFQUFFLFFBQWdCLENBQUM7UUFDMUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLGlCQUFPLEVBQUMsNEJBQTRCLEdBQUcsYUFBYSxPQUFPLHFCQUFxQixLQUFLLEVBQUUsRUFBRSxLQUFLLENBQUM7YUFDL0csTUFBTSxDQUFDO1lBQ0osNEVBQTRFO1lBQzVFLGFBQWEsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFO1NBQ3hDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNkLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7Q0FDSjtBQTdDRCx1QkE2Q0MifQ==