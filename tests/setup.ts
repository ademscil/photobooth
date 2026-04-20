import '@testing-library/jest-dom'

// Suppress jsdom "Not implemented" warnings for HTMLMediaElement methods
// that are not available in the test environment.
window.HTMLMediaElement.prototype.play = () => Promise.resolve()
window.HTMLMediaElement.prototype.pause = () => undefined
window.HTMLMediaElement.prototype.load = () => undefined
