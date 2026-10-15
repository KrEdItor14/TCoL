# Implementation Plan: Цветные селекторы перечислений

## Overview

Добавить modal-режим в существующий `EnumPicker`, подключить его к редкости, состоянию и сложности, сохранив chip-режим для слотов и типа квеста. Затем синхронизировать `www/` и Android public assets через `npm run prepare:web`.

## Architecture Decisions

- `EnumPicker` поддерживает два режима: `chip` по умолчанию и `modal` по конфигурации.
- Варианты получают семантический `tone`, который превращается в CSS-класс цветного контура.
- Hidden input, его ID и bubbling `change` остаются контрактом форм.
- Генерируемые копии обновляются только `npm run prepare:web`.

## Completed Tasks

1. Modal-режим и тесты поведения.
2. Конфигурация редкости, состояния и сложности, цветные контуры, регрессия chip-кнопок.
3. Синхронизация `www/` и Android public assets.

## Verification

- `node tests/enum-picker.test.js` — pass.
- `node tests/settings-ui.test.js` — pass.
- `node tests/html-structure.test.js` — pass.
- `node tests/capacitor-bridge.test.js` — pass.
- `node tests/mobile-ux.test.js` — pass.
- `node tests/offline-readiness.test.js` — pass.
- Browser verification completed at desktop and 320 px.
- `npm run prepare:web` completed; selected source and generated files match by SHA-256.

## Known Unrelated Test Blockers

`npm run test:all` is blocked by existing test-environment/repository issues: `SLOT_MAP_OLD_TO_NEW is not defined` in the storage test and an AI quota test mismatch involving `PROXY_SECRET`. The working AI runtime was not changed by this feature.
