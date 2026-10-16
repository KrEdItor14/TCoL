# Spec: Слот «Лицо» и безопасная AI-генерация

## Objective

Сделать слот `Лицо` полноценным exclusive-слотом для AI-генерации снаряжения. Когда пользователь выбирает `Лицо`, AI может создать только физически релевантный предмет для лица: очки, солнцезащитные очки, маску, визор, балаклаву или защитный щиток.

Prompt-наставление дополняется программной защитой: если ответ AI не соответствует allowlist по имени или описанию, приложение выполняет ровно одну повторную генерацию с явным требованием исправить тип предмета. Если второй ответ также нерелевантен, генерация отклоняется с понятной ошибкой и не заполняет форму неподходящим предметом.

Одновременно исправить AI-генерацию рецептов крафта: категория `Плащ` и связанные prompt instructions используют канонический слот `Верхняя одежда`, а не устаревший `Тело верхняя`.

## Tech Stack

- Vanilla JavaScript.
- Ручная AI-экипировка: `js/equipment.js` (`generateEquipmentWithAI`).
- AI-копка крафта и её output normalization: `js/ai.js` (`generateCraftRecipesWithAI`, `normalizeCraftRecipes`).
- Слоты и алиасы: `data/constants.js`.
- Генерируемый runtime: `js/runtime.js`, создаётся `build-runtime.bat`.
- Distribution-копии: `www/` и `android/app/src/main/assets/public/`, создаются `npm run prepare:web`.
- Тесты: Node.js `assert` и `vm` в новом focused test для AI equipment, плюс существующие AI и slot-contract проверки.

## Commands

```powershell
# Проверить strict face-item validation и craft category normalization.
node tests/ai-equipment-slots.test.js

# Проверить AI networking and parsing regression.
node tests/ai-flow.test.js

# Проверить slot contract.
node tests/equipment-slot-contract.test.js

# Пересобрать runtime из source-модулей.
cmd /c "echo.|build-runtime.bat"

# Синхронизировать web- и Android-копии.
npm run prepare:web

# Запустить полный набор проверок.
npm run test:all
```

## Project Structure

```text
data/constants.js              → Канонические slot names и legacy aliases
js/equipment.js                → Prompt, response normalization и face-retry для AI-экипировки
js/ai.js                       → AI-копка рецептов, category-to-slot mapping и prompt contract
js/runtime.js                  → Генерируемый bundle, не редактируется вручную
tests/ai-equipment-slots.test.js → Focused behavior tests для slot-aware AI output
tests/ai-flow.test.js          → Регрессия transport/parsing flow
tests/equipment-slot-contract.test.js → Канонический набор exclusive-слотов
www/                           → Генерируемая web-копия
android/app/src/main/assets/public/ → Генерируемая Capacitor-копия
```

## Code Style

AI output валидируется в owning-модуле до передачи его в UI. Валидация использует нормализованный lower-case текст `name` и `desc`, не полагается только на prompt и не добавляет отдельную зависимость.

```js
const FACE_ITEM_TERMS = ['очки', 'маск', 'визор', 'балаклав', 'щиток'];

function isFaceItem(item) {
  const text = `${item?.name || ''} ${item?.desc || ''}`.toLowerCase();
  return FACE_ITEM_TERMS.some(term => text.includes(term));
}
```

- Allowlist применяется только при `slotHint === 'Лицо'`; другие слоты сохраняют текущее поведение.
- При нерелевантном первом ответе выполняется максимум один повторный вызов `queryAI` с тем же slotHint и явной коррекцией.
- Результат всегда принудительно получает выбранный `slotHint`, но это не заменяет semantic validation для `Лицо`.
- Если обе попытки нерелевантны, функция выбрасывает понятную ошибку. UI использует существующий `toastAIError` и не изменяет форму.
- Craft category mapping и prompt используют `Плащ → Верхняя одежда` в единственном каноническом виде. `Тело верхняя` не остаётся в AI prompt, mapping или normalized recipe output.
- `js/runtime.js`, `www/` и Android public assets редактируются только генераторами.

## Testing Strategy

Создать focused Node/`vm` test с замещённым `queryAI`:

1. **Face prompt:** для `slotHint: 'Лицо'` system prompt включает явный allowlist и exclusions для headwear.
2. **Relevant first result:** ответ с `Очки`, `Маска`, `Визор`, `Балаклава` или `щиток` проходит с одним AI вызовом и `slot: 'Лицо'`.
3. **Retry:** нерелевантный первый результат, например `Шлем`, отклоняется, выполняется ровно второй AI вызов, а релевантный второй результат принимается.
4. **Reject after retry:** два нерелевантных результата приводят к rejection, форма не получает предмет.
5. **Slot authority:** даже если релевантный AI response возвращает иной slot, accepted face result имеет `slot: 'Лицо'`.
6. **Non-face regression:** генерация для другого slotHint не выполняет face validation и не делает повторный запрос.
7. **Craft normalization:** `normalizeCraftRecipes()` принимает category `Плащ` и выдаёт `slot: 'Верхняя одежда'`; generated craft prompt не содержит `Тело верхняя` и содержит `Плащ→Верхняя одежда`.

Запустить focused test, `node tests/ai-flow.test.js`, `node tests/equipment-slot-contract.test.js`, затем `npm run test:all` после пересборки bundle и sync distribution-копий.

## Boundaries

- **Always:** ограничивать `Лицо` allowlist и программной проверкой; делать не более одной retry; не заполнять форму нерелевантным результатом; принудительно сохранять выбранный slot; нормализовать craft `Плащ` к `Верхняя одежда`; добавлять behavior-тесты; собирать derived-файлы генераторами.
- **Ask first:** менять AI provider/model, лимиты генерации или quota; расширять allowlist новыми типами; менять crafting materials, rarity limits, effects или data schema; добавлять dependencies, менять CI или Capacitor config.
- **Never:** принимать шлемы, шапки, капюшоны или наушники для `Лицо`; выполнять бесконечные или больше одной retry; вручную редактировать generated artifacts; менять семантику других слотов или перезаписывать несвязанные пользовательские изменения.

## Success Criteria

1. При выборе `Лицо` AI возвращает только предметы, соответствующие allowlist: очки, солнцезащитные очки, маски, визоры, балаклавы или защитные щитки.
2. Нерелевантный первый AI result вызывает ровно одну retry; после второго нерелевантного результата генерация корректно отклоняется и форма не меняется.
3. Принятый face-item всегда имеет `slot: 'Лицо'`, даже если AI вернул другой slot.
4. AI-генерация для других слотов не получает retry и сохраняет действующее поведение.
5. AI-копка рецептов использует `Плащ → Верхняя одежда` и никогда не генерирует/нормализует `Тело верхняя`.
6. Focused AI-slot тесты, AI flow, slot contract и `npm run test:all` проходят; runtime, web и Android copies синхронизированы штатной сборкой.

## Open Questions

Нет.
