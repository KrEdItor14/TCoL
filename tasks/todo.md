# Tasks: Слот «Лицо» и безопасная AI-генерация

## Task 1: Зафиксировать strict AI slot behavior тестами

**Description:** Создать focused VM-тест с контролируемым `queryAI`, который задаёт contract для face allowlist, одной retry, отказа после двух нерелевантных результатов, slot authority и craft `Плащ` mapping.

**Acceptance criteria:**
- [x] Тест падает до реализации при face result `Шлем` или другой нерелевантной вещи.
- [x] Тест проверяет один вызов для валидного face-item, два вызова для retry и rejection после двух невалидных результатов.
- [x] Тест фиксирует `slot: 'Лицо'` у принятого face result и отсутствие retry для другого slot.
- [x] Тест фиксирует `Плащ → Верхняя одежда` в craft normalizer и prompt, без `Тело верхняя`.

**Verification:**
- [x] Tests fail first: `node tests/ai-equipment-slots.test.js`

**Dependencies:** None

**Files likely touched:**
- `tests/ai-equipment-slots.test.js`

**Estimated scope:** Medium, 1 file

## Task 2: Ограничить AI-экипировку для «Лицо»

**Description:** Добавить allowlist и одну корректирующую retry в `generateEquipmentWithAI()`. Только accepted result может попасть в форму, с гарантированным `slot: 'Лицо'`.

**Acceptance criteria:**
- [x] `Лицо` принимает только очки, солнцезащитные очки, маски, визоры, балаклавы и защитные щитки.
- [x] Первый нерелевантный result запускает ровно одну retry, второй приводит к понятному rejection.
- [x] Другие slot hints не проходят face validation и не получают retry.

**Verification:**
- [x] Tests pass: `node tests/ai-equipment-slots.test.js`
- [x] Tests pass: `node tests/ai-flow.test.js`

**Dependencies:** Task 1

**Files likely touched:**
- `js/equipment.js`
- `tests/ai-equipment-slots.test.js`

**Estimated scope:** Small, 2 files

## Task 3: Канонизировать AI-копку плащей

**Description:** Обновить craft category-to-slot mapping и prompt, чтобы `Плащ` всегда создавался в `Верхняя одежда` и AI больше не видел устаревшее название.

**Acceptance criteria:**
- [x] `normalizeCraftRecipes()` normalizes category `Плащ` to `slot: 'Верхняя одежда'`.
- [x] Craft system prompt содержит `Плащ→Верхняя одежда` и не содержит `Тело верхняя`.
- [x] Остальные craft category mappings не меняются.

**Verification:**
- [x] Tests pass: `node tests/ai-equipment-slots.test.js`
- [x] Tests pass: `node tests/equipment-slot-contract.test.js`

**Dependencies:** Task 1

**Files likely touched:**
- `js/ai.js`
- `tests/ai-equipment-slots.test.js`

**Estimated scope:** Small, 2 files

## Checkpoint: AI slot safety

- [x] Face allowlist, retry, rejection, forced slot и non-face regression проходят.
- [x] Craft mapping and prompt используют только `Верхняя одежда`.
- [x] AI transport и existing slot contract остаются зелёными.

## Task 4: Пересобрать distribution и выполнить регрессии

**Description:** Сгенерировать runtime и Capacitor-копии из source-модулей после focused-проверок, затем выполнить полный test suite.

**Acceptance criteria:**
- [x] `js/runtime.js` пересобран через `build-runtime.bat` и содержит face policy и canonical craft mapping.
- [x] `www/` и Android public assets обновлены через `npm run prepare:web`.
- [x] Полный набор регрессий проходит.

**Verification:**
- [x] Build succeeds: `cmd /c "echo.|build-runtime.bat"`
- [x] Build succeeds: `npm run prepare:web`
- [x] Tests pass: `npm run test:all`

**Dependencies:** Tasks 2-3 and AI-slot-safety checkpoint

**Files likely touched:**
- `js/runtime.js`
- `www/`
- `android/app/src/main/assets/public/`

**Estimated scope:** Medium, generated files

## Checkpoint: Complete

- [x] Все success criteria из `SPEC-face-slot-ai.md` выполнены.
- [x] Generated-файлы созданы штатными командами, не вручную.
- [x] Эта работа не добавила несвязанных изменений; исходные незакоммиченные правки пользователя сохранены.
