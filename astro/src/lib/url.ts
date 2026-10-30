// Internal link that respects the base path ('/v2' until switchover): url('music.html') -> '/v2/music.html'
export const url = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
