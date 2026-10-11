# THE CREED OF LIFE — Единая дорожная карта

**Актуальная версия документа:** 08.10.2026  
**Текущая кодовая база:** v3.8.x (Settings UI + AI AI service-only + theme/quest patches)  
**Текущая цель:** Публикация на RuStore  
**Статус:** Stage 1–3 ✅ · **Stage 3.5 (Release Candidate)** ← сейчас · Stage 4 (RuStore) после RC

> Этот документ заменяет все предыдущие roadmap.  
> Источник правды — только этот файл.

---

## 0. Текущее реальное состояние (08.10.2026)

### Уже сделано

- Модульная архитектура (`*-core.js`) + Core purity
- Storage Layer 2.0 (Web + IndexedDB + Capacitor Preferences), envelope v2
- Capacitor 8 Android-обёртка, 87 density assets, device PASS (Honor + Redmi Note 9)
- Звук, анимации, Local Notifications, CRT/themes, terminal boot
- AI: ?????? ? ???????????? ??????????? ???????, ??????????? ???? ????? Deno proxy
- Settings UI (v3.8.1) + последующие AI/theme/quest патчи до ~v3.8.7

### Главный блокер прямо сейчас

Текущий артефакт — **debug-контур**:
- только `app-debug.apk`
- `versionCode 1` / `versionName "1.0"` (расходится с 3.8.x в коде)
- нет release signing / keystore

Пока нет **подписанного release-кандидата**, идти в Privacy Policy и карточку RuStore рано — сначала должен существовать стабильный RC-билд, который ставится и работает как «почти магазинный».

**Оценка готовности к RuStore: ~25–30%.**  
**Цель Stage 3.5:** довести техническую готовность релизного билда до ~60–70%, после чего открывать Stage 4.

---

## Главный принцип (обновлено)

```text
Стабильное ядро + надёжные сохранения     ✅
        ↓
Локальный offline APK (личный)            ✅ Stage 2
        ↓
Полировка UX                              ✅ Stage 3
        ↓
Release Candidate (подписанный билд)      ← МЫ ЗДЕСЬ (Stage 3.5)
        ↓
Публикация на RuStore                     Stage 4
        ↓
(позже) Безопасный AI / Cloud / аккаунты
```

---

## Этап 1. Стабилизация ядра и Storage — ✅ ЗАКРЫТ (v3.5.0 → v3.5.1)

- [x] Core / UI separation + core purity
- [x] Storage Layer 2.0 + envelope v2 + tests

---

## Этап 2. Первая настоящая Android-сборка — ✅ ЗАКРЫТ (v3.6.0 → v3.6.5)

**Устройства: Honor + Redmi Note 9 (04.10.2026) — все критерии PASS**

- [x] Capacitor: Preferences, Back, lifecycle save, safe areas, splash, status bar
- [x] Mobile UX: touch targets, keyboard, bottom nav, portrait guard
- [x] Device checklist: install/profile, kill→progress, export/import, offline

---

## Этап 3. Полировка — ✅ ЗАКРЫТ (v3.6.6 → v3.8.x)

- [x] Звук (Web Audio SFX, gain, toggle)
- [x] Анимации + reduced-motion
- [x] Local Notifications (рейд) + POST_NOTIFICATIONS
- [x] CRT / light-dark-space themes + item FX
- [x] Terminal boot + logo/icon resources
- [x] Settings UI (Общие + AI)
- [x] AI AI service-only + proxy key flow
- [ ] Мелкий UX-полиш — post-release / по необходимости

---

## Этап 3.5. Release Candidate — ТЕКУЩАЯ ЦЕЛЬ

**Цель:** получить подписанный release-билд, который ведёт себя как кандидат в магазин, без юридической и стор-обвязки.  
**Критерий закрытия:** на 1–2 устройствах проходит тот же smoke, что Stage 2.3, но уже на **release** APK/AAB; версии согласованы; ключ подписи зафиксирован.

### 3.5.1. Версии

- [ ] Единая версия приложения (предложение: `3.9.0` или `4.0.0-rc.1` — выбрать одну схему и не менять)
  - `APP_VERSION` в `js/runtime.js` / бандле
  - `<title>` и любые UI-строки с версией
  - `package.json` → `"version"`
  - Android `versionName` = той же строке
  - Android `versionCode` ≥ 10 (целое, только растёт; для RC можно 10, для первого store — 11+)
- [ ] Зафиксировать в README / changelog: «RC build = versionCode X / versionName Y»

### 3.5.2. Подпись и release-сборка

- [ ] Создать release keystore (вне репозитория, бэкап ключа отдельно)
- [ ] Прописать `signingConfigs.release` в `android/app/build.gradle`
- [ ] `buildTypes.release`: `debuggable false`, при желании `minifyEnabled` / shrink
- [ ] Собрать:
  - `assembleRelease` → APK
  - и/или `bundleRelease` → AAB (предпочтительнее для стора позже)
- [ ] Убедиться, что артефакт подписан именно release-ключом (не debug)

### 3.5.3. Гигиена кода под RC

- [ ] Убрать/скрыть dev-only UI и явные debug-логи в прод-пути
- [ ] Проверить, что старые упоминания OpenRouter / provod не торчат в UI и не ломают AI service-only flow
- [ ] `allowBackup` / FileProvider — осознанное решение (оставить или ужесточить)
- [ ] Размер APK/AAB разумный (без лишних `.gradle`/build-кэшей в поставке)

### 3.5.4. Device smoke на release (обязательно)

Повторить критерии Stage 2.3 **на release-сборке**:

| Критерий | Устройство 1 | Устройство 2 |
|----------|--------------|--------------|
| Установка + создание профиля | [ ] | [ ] |
| Kill process → прогресс на месте | [ ] | [ ] |
| Экспорт → reinstall → импорт | [ ] | [ ] |
| Offline: квесты, save; AI offline-сообщение | [ ] | [ ] |
| Уведомление конца рейда (если включено) | [ ] | [ ] |
| Звук / тема / настройки сохраняются | [ ] | [ ] |

- [ ] Нет краша на холодном старте и после kill
- [ ] Нет «debug» в подписи / about (если где-то отображается)

### 3.5.5. Артефакты Stage 3.5

- [ ] `TCoL_vX.Y.Z_RC.apk` (и при необходимости `.aab`) — чистый release
- [ ] Краткая заметка: versionCode, versionName, дата, на каких устройствах прогнан smoke
- [ ] Keystore **не** класть в zip/репозиторий

**После закрытия 3.5** можно параллельно готовить Privacy Policy и скриншоты, не блокируя друг друга.

---

## Этап 4. Публикация на RuStore — после RC

**Цель:** первый публичный релиз в каталоге RuStore.  
**Входное условие:** Stage 3.5 закрыт (есть подписанный RC и device smoke).

### 4.1. Юридическое и данные

- [ ] Privacy Policy на **русском** (публичный URL)
  - локальные данные / сейвы
  - AI (промпты, пользовательский ключ)
  - уведомления, бэкапы
  - контакты
- [ ] Ссылка в карточке RuStore + желательно в приложении (Настройки / О приложении)
- [ ] При необходимости — короткое пользовательское соглашение
- [ ] Декларация разрешений в консоли (INTERNET, POST_NOTIFICATIONS, SCHEDULE_EXACT_ALARM, VIBRATE)

### 4.2. Стор-материалы

- [ ] Иконка 512×512
- [ ] 4–8 скриншотов 9:16
- [ ] Название, краткое и полное описание на русском
- [ ] Возрастная маркировка, категория
- [ ] Контакты поддержки

### 4.3. Upload и модерация

- [ ] Package name `com.kreditor.thecreedoflife` зафиксирован
- [ ] Upload подписанного release (тот же ключ, что в 3.5) + privacy URL + метаданные
- [ ] Пройти модерацию, исправить замечания
- [ ] После публикации: hotfix-план (versionCode++)

---

## Этап 5. После публикации (бэклог)

- AI-gateway / abuse-защита
- Cloud-сейвы / аккаунты
- UX по отзывам
- Другие сторы (тот же package + тот же signing key)
- Аналитика / краш-репорты без лишнего ПДн

---

## Быстрый чеклист

| Пункт                            | Сейчас     | Нужно для 3.5 | Нужно для RuStore |
|----------------------------------|------------|---------------|-------------------|
| Release APK/AAB + подпись        | ❌ debug   | **Обязательно** | Обязательно     |
| versionCode / versionName        | ❌ 1 / 1.0 | **Обязательно** | Обязательно     |
| Device smoke на release          | ❌         | **Обязательно** | Желательно      |
| Privacy Policy (RU, URL)         | ❌         | —             | Обязательно     |
| Скриншоты + описание + иконка    | ❌         | —             | Обязательно     |
| Package name / targetSdk         | ✅         | Ок            | Ок              |

**Правило:** не начинать upload в RuStore, пока Stage 3.5 не закрыт.

---

## История решений

- 03–04.10.2026 — Stage 2 закрыт на устройствах; Stage 3 — полировка.
- 07–08.10.2026 — AI AI service-only, Settings UI, серия v3.8.x.
- 08.10.2026 — цель = RuStore; Stage 4 описан целиком.
- **08.10.2026 — введён промежуточный Stage 3.5 (Release Candidate): сначала подписанный RC + device smoke, затем юридическое и карточка.**
