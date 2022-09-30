import { ClientOptions, NodeOptions } from './typings';

export const DefaultClientOptions: ClientOptions = {
    clientId: '',
    clientSecret: '',
    playlistLimit: 2,
    audioResults: false,
    spotifyMetadata: false,
    autoResolve: false,
    fetchType: 'API'
};

export const DefaultNodeOptions: NodeOptions = {
    name: '',
    url: '',
    auth: '',
    secure: false
};
