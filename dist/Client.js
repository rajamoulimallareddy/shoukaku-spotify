"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { 'default': mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
const Node_1 = __importDefault(require('./structures/Node'));
const Util_1 = __importDefault(require('./Util'));
const petitio_1 = __importDefault(require('petitio'));
const Constants_1 = require('./Constants');
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
            const request = await petitio_1.default('https://accounts.spotify.com/api/token', 'POST')
                .header({
                    Authorization: `Basic ${Buffer.from(this.options.clientID + ':' + this.options.clientSecret).toString('base64')}`,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLDZEQUFxQztBQUNyQyxrREFBMEI7QUFDMUIsc0RBQThCO0FBQzlCLDJDQUF1RTtBQUV2RSxNQUFxQixhQUFhO0lBYzlCLFlBQW1CLE9BQXNCLEVBQUUsUUFBdUI7UUFYbEUsd0NBQXdDO1FBQ2pDLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBZ0IsQ0FBQztRQVduQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDbkMsVUFBVSxFQUFFLElBQUk7WUFDaEIsS0FBSyxFQUFFLDRCQUE0QjtTQUN0QyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUMxQyxLQUFLLEVBQUUsMElBQTBJO1NBQ3BKLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtZQUNqQyxZQUFZLEVBQUUsSUFBSTtZQUNsQixLQUFLLEVBQUUsSUFBSTtTQUNkLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFJLENBQUMsWUFBWSxDQUFDLGdDQUFvQixFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDL0UsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRO1lBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRU0sT0FBTyxDQUFDLE9BQW9CO1FBQy9CLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxjQUFJLENBQUMsSUFBSSxFQUFFLGNBQUksQ0FBQyxZQUFZLENBQUMsOEJBQWtCLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFF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