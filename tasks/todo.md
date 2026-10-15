# Tasks: Цветные селекторы перечислений

## Task 1: Add modal EnumPicker behavior

**Description:** Extend `EnumPicker` with a `modal` variant that renders a trigger and opens an accessible selection modal, while leaving the existing chip variant as its default behavior.

**Acceptance criteria:**
- [x] A modal trigger displays the current option icon and label.
- [x] The modal includes a title, close button, overlay dismissal, focus on open, and `aria-pressed` on every option.
- [x] Choosing an option updates the original hidden input, sends one bubbling `change` event, updates the trigger, and closes the modal.

**Verification:**
- [x] Tests pass: `node tests/enum-picker.test.js`
- [ ] Manual check: open, choose, close, and overlay-dismiss a modal selector with keyboard and touch.

**Dependencies:** None

**Files likely touched:**
- `js/enum-picker.js`
- `tests/enum-picker.test.js`

**Estimated scope:** Small, 2 files

## Task 2: Configure coloured modal fields without changing chips

**Description:** Configure equipment rarity and condition, quest difficulty, and shop rarity to use the new modal variant; attach semantic colour identifiers and CSS outlines. Preserve slot and quest-type chips, including the existing green active fill.

**Acceptance criteria:**
- [ ] All four required fields use the modal variant, with exact icons, labels, and required outline colours.
- [ ] Option text remains in the interface foreground colour.
- [ ] Equipment slots and quest type remain chip pickers, and their active buttons remain green-filled.

**Verification:**
- [ ] Tests pass: `node tests/enum-picker.test.js && node tests/settings-ui.test.js`
- [ ] Manual check: inspect all three forms at 320 px and desktop widths; select every value class at least once.

**Dependencies:** Task 1

**Files likely touched:**
- `js/init-pickers.js`
- `css/components.css`
- `css/mobile.css` (only if a responsive correction is necessary)

**Estimated scope:** Small, 2-3 files

## Checkpoint: Interactive selector

- [ ] `node tests/enum-picker.test.js && node tests/settings-ui.test.js` passes.
- [ ] Keyboard focus, close button, overlay dismissal, touch selection, and 320 px layout are verified manually.
- [ ] Existing chip selectors still have a green-filled active state.

## Task 3: Verify full application and sync generated bundles

**Description:** Run the complete test suite, regenerate the Capacitor web copies from sources, and confirm the generated selectors match the checked source.

**Acceptance criteria:**
- [ ] The full regression suite completes successfully.
- [ ] `www/` and `android/app/src/main/assets/public/` are regenerated only by `npm run prepare:web`.
- [ ] The final diff has no unrelated edits introduced by this work.

**Verification:**
- [ ] Tests pass: `npm run test:all`
- [ ] Build/sync succeeds: `npm run prepare:web`
- [ ] Manual check: generated `www/js/enum-picker.js`, `www/js/init-pickers.js`, and `www/css/components.css` match source behavior.

**Dependencies:** Task 2 and interactive-selector checkpoint

**Files likely touched:**
- `www/index.html`
- `www/css/components.css`
- `www/css/mobile.css` (if source changed)
- `www/js/enum-picker.js`
- `www/js/init-pickers.js`
- `android/app/src/main/assets/public/` generated mirrors

**Estimated scope:** Medium, generated copies

## Checkpoint: Complete

- [ ] All success criteria in `SPEC-enum-picker.md` are met.
- [ ] `npm run test:all` and `npm run prepare:web` pass.
- [ ] Generated assets were not edited manually.
- [ ] Review confirms only intended files changed.
