// Internal link that respects the base path: url('music.html') -> '/music.html'
export const url = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
