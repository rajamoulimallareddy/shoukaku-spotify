"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { 'default': mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
const Resolver_1 = __importDefault(require('./Resolver'));
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
    async load(url) {
        var _a;
        const [, type, id] = (_a = this.client.spotifyPattern.exec(url)) !== null && _a !== void 0 ? _a : [];
        return this.methods[type](id);
    }
}
exports.default = Node;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJ1Y3R1cmVzL05vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQSwwREFBa0M7QUFFbEMsTUFBcUIsSUFBSTtJQWlCckIsWUFBMEIsTUFBcUIsRUFBRSxPQUFvQjtRQUEzQyxXQUFNLEdBQU4sTUFBTSxDQUFlO1FBaEJ4QyxhQUFRLEdBQUcsSUFBSSxrQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBT3BCLFlBQU8sR0FBRztZQUN2QixLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDakQsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ3ZELEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUNqRCxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDbkQsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ3JELElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztTQUNsRCxDQUFDO1FBR0UsTUFBTSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRTtZQUMxQixFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFO1lBQzdDLEdBQUcsRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFFO1lBQzNCLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFO1lBQzdCLE1BQU0sRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFO1NBQ3BDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7O09BR0c7SUFDSSxJQUFJLENBQUMsR0FBVzs7UUFDbkIsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxTQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsbUNBQUksRUFBRSxDQUFDO1FBQ2hFLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUE2QixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDM0QsQ0FBQztDQUNKO0FBbENELHVCQWtDQyJ9