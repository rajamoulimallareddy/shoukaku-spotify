"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = __importDefault(require("./structures/Node"));
const Util_1 = __importDefault(require("./Util"));
const petitio_1 = __importDefault(require("petitio"));
const Constants_1 = require("./Constants");
class SpotifyClient {
    constructor(options, nodesOpt) {
        /** The {@link Node}s are stored here */
        this.nodes = new Map();
        Object.defineProperty(this, 'baseURL', {
            enumerable: true,
            value: 'https://api.spotify.com/v1'
        });
        Object.defineProperty(this, 'spotifyPattern', {
            value: /^(?:https:\/\/open\.spotify\.com\/(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track|artist|episode|show)(?:[/:])([A-Za-z0-9]+).*$/
        });
        Object.defineProperty(this, 'token', {
            configurable: true,
            value: null
        });
        this.options = Object.freeze(Util_1.default.mergeDefault(Constants_1.DefaultClientOptions, options));
        for (const nodeOpt of nodesOpt)
            this.addNode(nodeOpt);
    }
    addNode(options) {
        this.nodes.set(options.name, new Node_1.default(this, Util_1.default.mergeDefault(Constants_1.DefaultNodeOptions, options)));
    }
    removeNode(id) {
        if (!this.nodes.size)
            throw new Error('No nodes available, please add a node first...');
        if (!id)
            throw new Error('Provide a valid node identifier to delete it');
        return this.nodes.delete(id);
    }
    /**
     * @param {string} [id] The node id, if not specified it will return a random node.
     */
    getNode(id) {
        if (!this.nodes.size)
            throw new Error('No nodes available, please add a node first...');
        if (!id)
            return [...this.nodes.values()].sort(() => 0.5 - Math.random())[0];
        return this.nodes.get(id);
    }
    /** Determine the URL is a valid Spotify URL or not */
    isValidURL(url) {
        return this.spotifyPattern.test(url);
    }
    /** A method to retrieve the Spotify API token. (this method only needs to be invoked once after the {@link SpotifyClient} instantiated) */
    async requestToken() {
        if (this.nextRequest)
            return;
        try {
            const request = await (0, petitio_1.default)('https://accounts.spotify.com/api/token', 'POST')
                .header({
                Authorization: `Basic ${Buffer.from(this.options.clientId + ":" + this.options.clientSecret).toString("base64")}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }).body('grant_type=client_credentials').send();
            if (request.statusCode === 400)
                return Promise.reject(new Error('Invalid Spotify Client'));
            const { access_token, token_type, expires_in } = request.json();
            Object.defineProperty(this, 'token', {
                value: `${token_type} ${access_token}`
            });
            Object.defineProperty(this, 'nextRequest', {
                configurable: true,
                value: setTimeout(() => {
                    delete this.nextRequest;
                    void this.requestToken();
                }, expires_in * 1000)
            });
        }
        catch (e) {
            if (e.statusCode === 400) {
                return Promise.reject(new Error('Invalid Spotify client.'));
            }
            await this.requestToken();
        }
    }
}
exports.default = SpotifyClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjMi9DbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSw2REFBcUM7QUFDckMsa0RBQTBCO0FBQzFCLHNEQUE4QjtBQUM5QiwyQ0FBdUU7QUFFdkUsTUFBcUIsYUFBYTtJQWU5QixZQUFtQixPQUFzQixFQUFFLFFBQXVCO1FBWmxFLHdDQUF3QztRQUNqQyxVQUFLLEdBQUcsSUFBSSxHQUFHLEVBQWdCLENBQUM7UUFZbkMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQ25DLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLEtBQUssRUFBRSw0QkFBNEI7U0FDdEMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDMUMsS0FBSyxFQUFFLDBJQUEwSTtTQUNwSixDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUU7WUFDakMsWUFBWSxFQUFFLElBQUk7WUFDbEIsS0FBSyxFQUFFLElBQUk7U0FDZCxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBSSxDQUFDLFlBQVksQ0FBQyxnQ0FBb0IsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQy9FLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUTtZQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVNLE9BQU8sQ0FBQyxPQUFvQjtRQUMvQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksY0FBSSxDQUFDLElBQUksRUFBRSxjQUFJLENBQUMsWUFBWSxDQUFDLDhCQUFrQixFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lB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