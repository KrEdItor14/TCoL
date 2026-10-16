# Implementation Plan: Слот «Лицо» и безопасная AI-генерация

## Overview

Усилить AI-генерацию снаряжения для exclusive-слота `Лицо`: prompt определяет релевантные виды предметов, а код проверяет semantic relevance результата. Нерелевантный первый ответ получает одну корректирующую retry, второй отклоняется. Одновременно убрать устаревшее `Плащ → Тело верхняя` из AI-крафта в пользу `Плащ → Верхняя одежда`.

## Architecture Decisions

- **Prompt плюс enforcement.** Prompt направляет модель, а локальный allowlist защищает UI от неверного JSON-ответа.
- **Одна retry.** Она даёт модели возможность исправиться, но ограничивает quota, задержку и риск зацикливания.
- **Валидация в `js/equipment.js`.** Генератор экипировки владеет slotHint и ответом AI, поэтому policy не протекает в UI или общий AI transport.
- **Validation только для `Лицо`.** Остальные slots не получают дополнительную фильтрацию или retry.
- **Craft mapping как canonical source.** `normalizeCraftRecipes()` и craft prompt синхронно заменяют `Тело верхняя` на `Верхняя одежда` для `Плащ`.
- **Проверять поведение через fake `queryAI`.** Focused VM test контролирует ответы, число вызовов и generated prompts без сети.

## Dependency Graph

```text
Face allowlist policy + canonical craft category mapping
                         │
                         ▼
AI equipment response validation and one-retry flow
                         │
                         ├───────────────► Face AI behavior tests
                         │
                         └───────────────► Craft normalization/prompt tests
                                                  │
                                                  ▼
Runtime rebuild → web/Android distribution sync → full regression suite
```

## Task List

Задачи ведутся в `tasks/todo.md`.

### Phase 1: Behavior proof

- [x] Task 1: Добавить failing tests для strict face validation, retry и craft mapping.
- [x] Task 2: Реализовать face allowlist и ограниченную retry в AI equipment generator.
- [x] Task 3: Перевести craft AI mapping и prompt `Плащ` на `Верхняя одежда`.

### Checkpoint: AI slot safety

- [x] Face results проходят allowlist или правильно отклоняются после второй попытки.
- [x] Остальные slot hints не меняют текущий flow.
- [x] Craft recipes и prompt не содержат `Тело верхняя`.

### Phase 2: Distribution verification

- [x] Task 4: Пересобрать runtime и distribution-копии, выполнить полный набор регрессий.

### Checkpoint: Complete

- [x] Все criteria из `SPEC-face-slot-ai.md` выполнены.
- [x] Generated-файлы созданы штатными командами.
- [x] Исходные незакоммиченные правки пользователя сохранены; этот модуль не добавил несвязанных изменений.

## Implementation Order

1. **Task 1:** Сначала тесты фиксируют policy и точное число AI calls.
2. **Task 2:** Минимально внедрить strict face validation и single retry, чтобы все face tests стали зелёными.
3. **Task 3:** Внести независимое craft mapping/prompt исправление и доказать его тестом.
4. **Checkpoint:** Прогнать focused AI-slot, AI-flow и slot-contract tests.
5. **Task 4:** Последней пересобрать runtime и distribution copies, затем выполнить полный suite.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Нерелевантный предмет всё же попадёт в форму | High | Проверять returned name и desc локальным allowlist до обновления UI. |
| Retry расходует quota бесконечно | High | Лимит в одну повторную попытку, проверяется точным числом `queryAI` вызовов. |
| Валидный face-item с другим slot попадёт не туда | High | Принудительно назначать accepted result `slotHint: 'Лицо'`. |
| Валидация меняет другие slots | Medium | Отдельный non-face regression test подтверждает один AI call без face policy. |
| Craft prompt и normalizer расходятся | High | Один test проверяет category mapping и содержание prompt. |
| Generated bundle остаётся устаревшим | Medium | `build-runtime.bat` перед `npm run prepare:web`, затем test source/bundle contract. |
| Незакоммиченные правки пользователя затёрты | High | Точечные edits, no reset/checkout, итоговый diff review. |

## Parallelization

Task 2 и Task 3 касаются разных owning-модулей, но оба зависят от общего focused test contract и должны быть последовательны в этой сессии. Task 4 зависит от обоих.

## Open Questions

Нет.
