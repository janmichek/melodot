/**
 * @typedef {Object} ShazamTrackMetadata
 * @property {string} [text]
 * @property {string} [title]
 */

/**
 * @typedef {Object} ShazamTrackSection
 * @property {ShazamTrackMetadata[]} [metadata]
 * @property {string} [type]
 */

/**
 * @typedef {Object} ShazamTrackImages
 * @property {string} [coverart]
 * @property {string} [background]
 */

/**
 * @typedef {Object} ShazamHubAction
 * @property {string} type
 * @property {string} [uri]
 * @property {string} [name]
 */

/**
 * @typedef {Object} ShazamHub
 * @property {ShazamHubAction[]} [actions]
 * @property {string} [type]
 */

/**
 * @typedef {Object} ShazamTrack
 * @property {string} [title]
 * @property {string} [subtitle]
 * @property {ShazamTrackSection[]} [sections]
 * @property {ShazamTrackImages} [images]
 * @property {ShazamHub} [hub]
 * @property {string} [key]
 */

/**
 * @typedef {Object} ShazamResponse
 * @property {ShazamTrack} [track]
 * @property {Object} [matches]
 */

export {};
