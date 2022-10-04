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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLDZEQUFxQztBQUNyQyxrREFBMEI7QUFDMUIsc0RBQThCO0FBQzlCLDJDQUF1RTtBQUV2RSxNQUFxQixhQUFhO0lBZTlCLFlBQW1CLE9BQXNCLEVBQUUsUUFBdUI7UUFabEUsd0NBQXdDO1FBQ2pDLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBZ0IsQ0FBQztRQVluQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDbkMsVUFBVSxFQUFFLElBQUk7WUFDaEIsS0FBSyxFQUFFLDRCQUE0QjtTQUN0QyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUMxQyxLQUFLLEVBQUUsMElBQTBJO1NBQ3BKLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtZQUNqQyxZQUFZLEVBQUUsSUFBSTtZQUNsQixLQUFLLEVBQUUsSUFBSTtTQUNkLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFJLENBQUMsWUFBWSxDQUFDLGdDQUFvQixFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDL0UsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRO1lBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRU0sT0FBTyxDQUFDLE9BQW9CO1FBQy9CLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxjQUFJLENBQUMsSUFBSSxFQUFFLGNBQUksQ0FBQyxZQUFZLENBQUMsOEJBQWtCLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFF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