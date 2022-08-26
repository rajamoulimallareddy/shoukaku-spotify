import { ClientOptions, NodeOptions } from './typings';

export const DefaultClientOptions: ClientOptions = {
    clientID: '',
    clientSecret: '',
    playlistLoadLimit: 2,
    audioOnlyResults: false,
    useSpotifyMetadata: false,
    autoResolve: false,
    fetchStrategy: 'API' 
};

export const DefaultNodeOptions: NodeOptions = {
    name: '',
    url: '',
    auth: '',
    secure: false
};
