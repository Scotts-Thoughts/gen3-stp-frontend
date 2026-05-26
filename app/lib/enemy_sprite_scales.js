/**
 * Enemy Sprite Scales
 *
 * Per-species scale + position factor applied to enemy team sprites in the overlay.
 * Auto-written from the in-app resize tool (Ctrl+Click an enemy sprite to enter
 * resize mode, drag the corner handle / use arrow keys / press F1 to flip,
 * press Enter to save).
 *
 * Key: Pokemon species name (e.g. "Lillipup")
 * Value: { scale, xOffset, yOffset, flipped } (scale=1, offsets=0 by default)
 */

const ENEMY_SPRITE_SCALES = {};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ENEMY_SPRITE_SCALES;
}
