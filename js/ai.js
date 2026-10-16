"use strict";

const AI_PROVIDER_OPTIONS = { tooken: 'AI service' };
const AI_MODEL_OPTIONS = {
  'deepseek-v4.1-flash': 'DeepSeek V4.1 Flash',
  'deepseek-v4-flash': 'DeepSeek V4 Pro',
  'glm-5.3-flash': 'GLM 5.3 Flash',
  'gpt-6-luna': 'GPT-6 Luna',
  'gpt-6-astra': 'GPT-6 Astra'
};
const AI_MODEL_DESCRIPTIONS = {
  'deepseek-v4.1-flash': 'Быстрая и экономичная модель для повседневных генераций.',
  'deepseek-v4-flash': 'Сбалансированная модель для детальных и разнообразных ответов.',
  'glm-5.3-flash': 'Более выразительная модель для сложных и творческих генераций.',
  'gpt-6-luna': 'Модель для подробных и творческих AI-генераций.',
  'gpt-6-astra': 'Модель для сложных задач и развернутых AI-ответов.'
};
const AI_MODEL_COSTS = {
  'deepseek-v4.1-flash': '0.25x',
  'deepseek-v4-flash': '0.3x',
  'glm-5.3-flash': '0.35x',
  'gpt-6-luna': '0.5x',
  'gpt-6-astra': '1.8x'
};
const AI_THEME_OPTIONS = {
  real_world: 'Реальный мир',
  fantasy: 'Фэнтези',
  sci_fi: 'Научная фантастика',
  post_apocalyptic: 'Постапокалипсис'
};
const AI_THEME_DESCRIPTIONS = {
  real_world: 'Современная повседневность, узнаваемые места и реальные жизненные задачи.',
  fantasy: 'Фэнтезийные образы и приключенческий тон; цели и результаты остаются выполнимыми в реальной жизни.',
  sci_fi: 'Футуристические технологии и космический антураж без фантастических изменений реальных целей.',
  post_apocalyptic: 'Атмосфера выживания и восстановления мира; задания остаются безопасными и реалистичными.'
};
const AI_THEME_INSTRUCTIONS = {
  real_world: 'Используй современный, нейтральный и узнаваемый мир. Описывай обычные места и предметы без жанровой стилизации. Все задания, действия и результаты должны быть конкретными и выполнимыми в реальной жизни.',
  fantasy: 'Используй фэнтезийные образы, приключенческий язык и атмосферу сказочного мира в названиях и описаниях. Не представляй магию, монстров или сверхъестественные события как реальные действия: задания и результаты должны оставаться безопасными и выполнимыми в реальной жизни.',
  sci_fi: 'Используй футуристические технологии, космические мотивы и научно-фантастический язык в названиях и описаниях. Не приписывай реальным заданиям фантастические возможности: действия и результаты должны быть правдоподобны и выполнимы в реальной жизни.',
  post_apocalyptic: 'Используй атмосферу постапокалиптического выживания, восстановления и дефицита ресурсов в образах и описаниях. Не предлагай опасное поведение, добычу ресурсов в рискованных местах или насилие: реальные задания должны быть безопасными и выполнимыми.'
};
const DEFAULT_AI_PROVIDER = 'tooken';
const DEFAULT_AI_MODEL = 'deepseek-v4-flash';
const DEFAULT_AI_THEME = 'real_world';

function getAIProvider(){
  const selected = state?.settings?.aiProvider;
  return AI_PROVIDER_OPTIONS[selected] ? selected : DEFAULT_AI_PROVIDER;
}

function getAIModel(){
  const selected = state?.settings?.aiModel;
  return Object.prototype.hasOwnProperty.call(AI_MODEL_OPTIONS, selected) ? selected : DEFAULT_AI_MODEL;
}

function getAIModelLabel(model = getAIModel()){
  return Object.prototype.hasOwnProperty.call(AI_MODEL_OPTIONS, model) ? AI_MODEL_OPTIONS[model] : model;
}

function getAITheme(){
  const selected = state?.settings?.aiTheme;
  return Object.prototype.hasOwnProperty.call(AI_THEME_OPTIONS, selected) ? selected : DEFAULT_AI_THEME;
}

function getAIThemeInstruction(){
  return AI_THEME_INSTRUCTIONS[getAITheme()];
}

function setAIProvider(provider){
  if (provider !== 'tooken') return false;
  const result = typeof SettingsCore !== 'undefined' ? SettingsCore.setAIProvider(provider) : {ok:false};
  if (!result.ok) return false;
  if (typeof persist === 'function') persist();
  updateAIStatus();
  return true;
}

function setAIModel(model){
  if (!Object.prototype.hasOwnProperty.call(AI_MODEL_OPTIONS, model)) return false;
  const result = typeof SettingsCore !== 'undefined' ? SettingsCore.setAIModel(model, getAIProvider()) : {ok:false};
  if (!result.ok) return false;
  if (typeof persist === 'function') persist();
  updateAIStatus();
  return true;
}

const PROXY_URL = 'https://comfortable-flounder-3259.kreditor14.deno.net';

const REALISM_RULE = `ВАЖНО про баланс: никогда не используй огромные числа вида +100500. Любой игровой эффект предмета — это либо +1..+5 к конкретной характеристике/навыку, либо 1-15% к какому-то бытовому параметру (сон, концентрация, иммунитет и т.п.). Формулируй эффект метафорично, но правдоподобно для реальной вещи.`;
const NO_THINKING_RULE = `КРИТИЧНО: не показывай свои рассуждения, thinking process, план, анализ. Не пиши "Here's a thinking process", "Let me analyze", "1. Analyze" и т.п. Сразу выдавай ТОЛЬКО финальный JSON-объект, ничего до и после.`;
const AI_WORLD_RULE = `Ты работаешь внутри The Creed of Life — RPG-системы реальной жизни. Реальные бытовые задачи, привычки, обучение, работа и крупные жизненные цели превращаются в игровой контент. Следуй выбранной пользователем атмосфере, не меняя реальные задачи и физические результаты.`;
const AI_DESIGN_RULE = `Главный принцип: AI — дизайнер контента, а не игровой движок. Придумывай смысл, название, атмосферу, описание и логические связи. Не создавай новые навыки, слоты, редкости, состояния или другие игровые сущности вне разрешённых списков.`;
const AI_REALISM_RULE = `Не используй магию, сверхъестественные способности или физически невозможные действия как реальные результаты. RPG-стилистика допустима в названиях и образах, но результат должен быть применим к реальной жизни.`;
const AI_EFFECT_RULE = `Эффекты предметов должны быть короткими и реалистичными. Если эффект влияет на игровой показатель, ОБЯЗАТЕЛЬНО возвращай структурированный объект modifiers: для SPECIAL используй specialFlat, для навыков — skillFlat. Значение только +1..+5. Текст effect должен точно описывать тот же модификатор, например "+2 к 🧠 Интеллект" + {"specialFlat":{"🧠 Интеллект":2}} или "+3 к 🧘 Концентрация" + {"skillFlat":{"🧘 Концентрация":3}}. Не используй modifiers для XP героя, монет или Мощи. Бытовые эффекты 1-15% без игрового модификатора допустимы только если они действительно описывают реальный бытовой параметр.`;

function normalizeAIEffectModifiers(raw, effectText=''){
    const out = {specialFlat:{}, skillFlat:{}};
    const validSpecial = new Set(Object.keys(SPECIAL_SKILL_LINKS || {}));
    const validSkills = new Set(SKILL_NAMES || []);
    const read = (source, target, valid) => {
        if (!source || typeof source !== 'object') return;
        Object.entries(source).forEach(([key, value]) => {
            const n = Math.max(1, Math.min(5, Math.round(Number(value))));
            if (valid.has(key) && Number.isFinite(n)) target[key] = n;
        });
    };
    read(raw?.specialFlat, out.specialFlat, validSpecial);
    read(raw?.skillFlat, out.skillFlat, validSkills);
    // Обратная совместимость: если AI всё же вернул только строку "+N к ...",
    // пытаемся восстановить структурированный модификатор по точному имени.
    if (!Object.keys(out.specialFlat).length && !Object.keys(out.skillFlat).length && effectText){
        const nMatch = String(effectText).match(/\+(\d+)/);
        const n = nMatch ? Math.max(1, Math.min(5, Number(nMatch[1]))) : 0;
        if (n) {
            for (const key of validSpecial) if (String(effectText).includes(key)) { out.specialFlat[key] = n; break; }
            if (!Object.keys(out.specialFlat).length) for (const key of validSkills) if (String(effectText).includes(key)) { out.skillFlat[key] = n; break; }
        }
    }
    return (Object.keys(out.specialFlat).length || Object.keys(out.skillFlat).length) ? out : null;
}

const AI_NO_NOTE_RULE = `Поле quote/«Примечание» больше не используется. Не создавай его. Атмосферные фразы, назначение и художественные детали помещай в desc.`;

const JSON_ONLY_RULE = `ОБЯЗАТЕЛЬНО: ответ должен содержать ТОЛЬКО один валидный JSON-объект.
Не используй Markdown, тройные обратные кавычки, пояснения, вступительный текст, заключительный текст, списки или рассуждения вне JSON.
Не обрамляй JSON в \`\`\`json или другие блоки.
Все строковые значения внутри JSON должны быть корректно экранированы.
Если ты не можешь выполнить задачу, всё равно верни валидный JSON требуемой структуры.`;
let aiThinkingIntervalId = null;
let aiThinkingStartTime = null;
let aiCancelRequested = false;
let aiActiveController = null;
let aiRequestInFlight = false;

function usingProxy(){ return !!(PROXY_URL && PROXY_URL.trim()); }

function isAIProxyConfigured(){ return usingProxy(); }

async function checkAIAvailability() {
  aiAvailable = isAIProxyConfigured();
  updateAIStatus();
  return aiAvailable;
}

function updateAIStatus() {
  const el = document.getElementById('aiStatus');
  const settingsEl = document.getElementById('aiStatusSettings');
  const hasKey = typeof state !== 'undefined' && !!(state?.settings?.aiOwnKey || '').trim();

  let label;
  if (!usingProxy()) {
    label = '🤖 AI: прокси не настроен';
  } else if (!hasKey) {
    label = '🤖 AI: добавьте личный API-ключ в настройках';
  } else {
    label = `🤖 AI: личный ключ · ${getAIModelLabel()}`;
  }

  if (el) { el.textContent = label; el.className = 'ai-status ' + (aiAvailable && hasKey ? 'online' : 'offline'); }
  if (settingsEl) settingsEl.textContent = label;

  const billingInfoEl = document.getElementById('aiBillingInfo');
  if (billingInfoEl) {
    billingInfoEl.textContent = hasKey
      ? 'AI-запросы будут оплачиваться по тарифу вашего API-ключа.'
      : 'Для AI нужен личный API-ключ. Добавьте его ниже.';
  }
}

async function queryAI(prompt, systemPrompt = '', options = {}) {
  const settings = (typeof state !== 'undefined' && state?.settings) ? state.settings : {};
  const ownKey = (settings.aiOwnKey || '').trim();
  if (!ownKey) throw new Error('Для AI нужен личный API-ключ. Добавьте его в настройках AI.');
  if (!usingProxy()) throw new Error('AI-прокси не настроен.');
  if (aiRequestInFlight) {
    throw new Error('AI уже обрабатывает другой запрос. Дождись его завершения.');
  }

  const maxTokens = Math.max(500, Math.min(2500, Number(options.maxTokens) || 2000));
  const temperature = Number.isFinite(Number(options.temperature)) ? Number(options.temperature) : 0.8;
  const topP = Number.isFinite(Number(options.topP)) ? Number(options.topP) : 0.9;
  const model = Object.prototype.hasOwnProperty.call(AI_MODEL_OPTIONS, options.model) ? options.model : getAIModel();

  const effectiveSystemPrompt = [JSON_ONLY_RULE, NO_THINKING_RULE, getAIThemeInstruction(), systemPrompt]
    .filter(Boolean)
    .join('\n\n');
  const messages = [
    { role: 'system', content: effectiveSystemPrompt },
    { role: 'user', content: prompt }
  ];

  const headers = {
    'Content-Type': 'application/json',
    'X-Client-Version': '3.7.5'
  };

  const body = {
    provider: 'tooken',
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
    top_p: topP
  };
  body.userApiKey = ownKey;

  aiRequestInFlight = true;
  try {
    if (aiCancelRequested) throw cancelledError();

    const controller = new AbortController();
    aiActiveController = controller;
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout
    let response;
    try {
      response = await fetch(PROXY_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });
    } catch (networkErr) {
      if (aiCancelRequested) throw cancelledError();
      throw new Error('Не удалось связаться с AI-прокси. Запрос не повторялся, чтобы не расходовать лимит.');
    } finally {
      clearTimeout(timeoutId);
      aiActiveController = null;
    }

    if (aiCancelRequested) throw cancelledError();

    if (response.status === 429) {
      let quotaError = {};
      try { quotaError = await response.json(); } catch {}
      const err = new Error(quotaError.error || 'Провайдер временно ограничил запросы. Попробуй позже.');
      err.code = quotaError.code || 'RATE_LIMIT';
      throw err;
    }

    if (!response.ok) {
      let detail = response.statusText;
      try {
        const errBody = await response.json();
        detail = errBody.error?.message || errBody.error || errBody.message || detail;
      } catch {}
      if (response.status === 401) {
        throw new Error('Невалидный API-ключ. Проверь ключ в настройках.');
      }
      throw new Error(`Ошибка AI (${response.status}): ${detail}. Запрос не повторялся.`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    let parsed;
    try {
      parsed = parseAIJson(text);
    } catch (parseErr) {
      throw new Error(`${parseErr.message} Запрос не повторялся, чтобы не расходовать лимит.`);
    }
    return parsed;
  } finally {
    aiRequestInFlight = false;
    aiActiveController = null;
  }
}

function cancelledError(){
const err = new Error('Генерация отменена.');
err.cancelled = true;
return err;
}

function parseAIJson(text){
  if (window.DEBUG_AI) console.log('[AI raw]', text);
  
    // Отрезаем явный "thinking", если он отделён маркерами
    let cleaned = text
      .replace(/<\/?think>/gi, '')
      .replace(/```(?:json)?\s*([\s\S]*?)```/gi, (m, p1) => '\n' + p1 + '\n');
  
    // Собираем ВСЕ сбалансированные JSON-фрагменты и пробуем с конца —
    // reasoning-модели пишут рассуждения первыми, JSON последним.
    const candidates = [];
    const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) candidates.push(fenced[1].trim());
  
    let idx = 0;
    while (idx < cleaned.length){
      const start = cleaned.indexOf('{', idx);
      if (start === -1) break;
      const extracted = extractBalancedJson(cleaned.slice(start));
      if (extracted){
        candidates.push(extracted);
        idx = start + extracted.length;
      } else {
        idx = start + 1;
      }
    }
    candidates.push(cleaned.trim());
  
    // Пробуем с КОНЦА (там настоящий ответ), потом остальные
    const ordered = candidates.slice().reverse();
    for (const candidate of ordered){
      const parsed = tryParseJsonLenient(candidate);
      if (parsed !== undefined && typeof parsed === 'object') return parsed;
    }
    throw new Error('AI не вернул валидный JSON — модель ушла в рассуждения или обрезала ответ. Попробуй ещё раз или смени модель.');
  }

function extractBalancedJson(text){
const closerFor = { '{': '}', '[': ']' };
for (let i = 0; i < text.length; i++){
const opener = text[i];
if (opener !== '{' && opener !== '[') continue;
const closer = closerFor[opener];
let depth = 0;
let inString = false;
let escape = false;
for (let j = i; j < text.length; j++){
const c = text[j];
if (inString){
if (escape) { escape = false; }
else if (c === '\\') { escape = true; }
else if (c === '"') { inString = false; }
continue;
}
if (c === '"') { inString = true; continue; }
if (c === opener) depth++;
else if (c === closer) {
depth--;
if (depth === 0) return text.slice(i, j + 1);
}
}
break; // первая открывающая скобка не закрылась корректно — дальше не ищем от неё
}
return null;
}

function tryParseJsonLenient(str){
if (!str) return undefined;
try { return JSON.parse(str); } catch {}
const cleaned = str
.replace(/[\u201C\u201D]/g, '"')
.replace(/[\u2018\u2019]/g, "'")
.replace(/,\s*([}\]])/g, '$1');
try { return JSON.parse(cleaned); } catch {}
return undefined;
}

function normalizeAIQuestSkills(rawSkills){
    const valid = new Set(Array.isArray(SKILL_NAMES) ? SKILL_NAMES : []);
    const selected = Array.isArray(rawSkills)
        ? rawSkills.filter(s => valid.has(s))
        : [];
    return [...new Set(selected)].slice(0, 3);
}

function questRewardRarity(){
    return typeof rollConsumableRarity === 'function' ? rollConsumableRarity() : 'common';
}

function normalizeAIQuestRewardItem(raw, type){
    if (!raw || typeof raw !== 'object' || !String(raw.name || '').trim()) return null;
    const item = {
        name: String(raw.name).trim().slice(0, 80),
        type,
        desc: String(raw.desc || '').trim().slice(0, 500),
        effect: String(raw.effect || '').trim().slice(0, 120),
        modifiers: normalizeAIEffectModifiers(raw.modifiers, String(raw.effect || '').trim()),
        source: 'ai'
    };

    if (type === 'material') {
        item.rarity = 'common';
        item.effect = '';
        item.modifiers = null;
        item.durationMinutes = null;
        item.slot = null;
        if (looksLikeFinishedProduct(item.name)) {
            item.name = '🧱 Универсальная заготовка';
            item.desc = 'Базовый материальный ресурс для бытового крафта.';
        }
        return item;
    }

    item.rarity = questRewardRarity();

    if (type === 'consumable') {
        item.durationMinutes = normalizeConsumableDuration(raw.durationMinutes, 30);
        item.slot = null;
        if (!item.effect) item.effect = '+2 к полезному показателю на время';
        return item;
    }

    const validSlots = new Set(SLOT_ORDER || []);
    item.slot = validSlots.has(raw.slot) ? raw.slot : (SLOT_ORDER?.[Math.floor(Math.random() * SLOT_ORDER.length)] || 'Аксессуар');
    item.condition = 'good';
    item.itemLevel = Math.max(1, Number(state.character?.level) || 1);
    return item;
}

async function generateQuestWithAI(theme) {
    const systemPrompt = `${NO_THINKING_RULE}
${AI_WORLD_RULE}
${AI_DESIGN_RULE}
${AI_REALISM_RULE}
${AI_EFFECT_RULE}
${AI_NO_NOTE_RULE}

Ты — генератор содержательных квестов для реальных бытовых задач.
Навыки разрешено выбирать ТОЛЬКО из списка: ${SKILL_NAMES.join(', ')}.
ПРАВИЛА:
- Название короткое, выразительное, с эмодзи; не просто название бытового действия.
- desc: 2-3 предложения; конкретно объясни задачу и ожидаемый результат.
- skills: 1-3 действительно используемых навыка.
- Не генерируй difficulty, minutes, XP героя, монеты, rarity, condition, itemLevel, power, ID или коэффициенты — это рассчитывает игра.
- items — только кандидаты наград и только если они логично связаны с квестом.
- material = сырьё/ресурс, а не готовый товар.
- consumable = одноразовый реалистичный расходник с временным эффектом 15-1440 минут.
- equipment = экипируемый предмет со слотом из списка; не указывай его rarity, condition, itemLevel или power.
JSON:
{"title":"название с эмодзи","desc":"описание","skills":["точное название навыка"],"items":[{"type":"material","name":"сырьё","desc":"описание"},{"type":"consumable","name":"расходник","desc":"описание","effect":"+2 к 🧘 Концентрация","modifiers":{"skillFlat":{"🧘 Концентрация":2}},"durationMinutes":30},{"type":"equipment","name":"снаряжение","desc":"описание","effect":"+1 к 🎲 Удача","modifiers":{"specialFlat":{"🎲 Удача":1}},"slot":"Аксессуар"}]}
Верни только один JSON-объект.`;
    const prompt = `Создай один квест на тему: "${theme || 'случайное приключение'}". Сделай его выполнимым в реальной жизни и логично связанным с выбранными навыками и кандидатами наград.`;
    const result = await queryAI(prompt, systemPrompt);
    const skills = normalizeAIQuestSkills(result?.skills);
    return { title: typeof result?.title === 'string' && result.title.trim() ? result.title.trim() : '📜 Новый квест', desc: typeof result?.desc === 'string' && result.desc.trim() ? result.desc.trim() : 'Выполни задачу последовательно и доведи её до результата.', difficulty: 'normal', minutes: 30, skills, items: Array.isArray(result?.items) ? result.items : [] };
}

function normalizeGeneratedBossPhases(phases, bossType, fallbackPhases) {
    const fallback = fallbackPhases.map(p => ({ ...p }));
    if (!Array.isArray(phases) || !phases.length) return fallback;
    if (bossType === 'financial') {
        const fixedPcts = [20, 30, 50];
        return fixedPcts.map((pct, i) => {
            const src = phases[i] || fallback[i];
            return {
                ...src,
                name: typeof src.name === 'string' && src.name.trim() ? src.name.trim() : fallback[i].name,
                pct,
                rewardXP: Math.max(0, Number(src.rewardXP) || fallback[i].rewardXP),
                skill: SKILL_NAMES.includes(src.skill) ? src.skill : fallback[i].skill,
                skillXP: Math.max(0, Number(src.skillXP) || fallback[i].skillXP)
            };
        });
    }
    const usable = phases.slice(0, 4).filter(p => p && typeof p === 'object');
    if (usable.length < 2) return fallback;
    const weights = usable.map(p => {
        const n = Number(p.pct);
        return Number.isFinite(n) && n > 0 ? n : 1;
    });
    const total = weights.reduce((a,b) => a+b, 0);
    const rounded = weights.map((w, i) => i === weights.length - 1
        ? 100 - weights.slice(0,-1).reduce((a,x) => a + Math.round(x / total * 100), 0)
        : Math.round(w / total * 100));
    return usable.map((src, i) => {
        const fb = fallback[Math.min(i, fallback.length - 1)];
        return {
            ...src,
            name: typeof src.name === 'string' && src.name.trim() ? src.name.trim() : `Фаза ${i + 1}`,
            pct: rounded[i],
            rewardXP: Math.max(0, Number(src.rewardXP) || fb.rewardXP),
            skill: SKILL_NAMES.includes(src.skill) ? src.skill : fb.skill,
            skillXP: Math.max(0, Number(src.skillXP) || fb.skillXP)
        };
    });
}

async function generateBossWithAI(theme, bossType, targetHint, unitHint) {
const skillList = SKILL_NAMES.join(', ');
let systemPrompt, prompt;
if (bossType === 'other') {
systemPrompt = `${NO_THINKING_RULE}\n${AI_WORLD_RULE}\n${AI_DESIGN_RULE}\n${AI_REALISM_RULE}\nТы — генератор крупных жизненных боссов, не связанных с деньгами. Единица прогресса должна быть реально измеримой. 2-4 фазы, pct суммарно 100. Если target/unit заданы игроком — не изменяй их. Каждая фаза получает только rewardXP и skillXP одного существующего навыка. Монеты и Мощь не создавай. Навыки: ${skillList}.\nJSON: {"name":"имя с эмодзи","goal":"цель","unit":"часы","target":120,"phases":[{"name":"Фаза I","pct":30,"rewardXP":80,"skill":"🎯 Концентрация","skillXP":40},{"name":"Фаза II","pct":30,"rewardXP":150,"skill":"🎯 Концентрация","skillXP":70},{"name":"Фаза III","pct":40,"rewardXP":250,"skill":"🎯 Концентрация","skillXP":100}]}\nВерни только JSON.`;
prompt = `Создай босса на тему: "${theme || 'крупная жизненная цель'}".` + (targetHint ? ` Целевая величина: ${targetHint}${unitHint ? ' ' + unitHint : ''}. Используй как есть.` : ' Сам выбери разумную измеримую цель.');
} else {
systemPrompt = `${NO_THINKING_RULE}\n${AI_WORLD_RULE}\n${AI_DESIGN_RULE}\n${AI_REALISM_RULE}\nТы — генератор финансовых боссов. Всегда ровно 3 фазы: 20%, 30%, 50% — эти доли фиксированы. Каждая фаза получает только rewardXP и skillXP одного существующего навыка. Монеты и Мощь не выдаются. Навыки: ${skillList}. target игрока не изменять; unit всегда ₽.\nJSON: {"name":"имя с эмодзи","goal":"цель","target":100000,"phases":[{"name":"Фаза I","rewardXP":80,"skill":"💰 Финансы","skillXP":40},{"name":"Фаза II","rewardXP":150,"skill":"💰 Финансы","skillXP":70},{"name":"Фаза III","rewardXP":280,"skill":"💰 Финансы","skillXP":120}]}\nВерни только JSON.`;
prompt = `Создай финансового босса на тему: "${theme || 'крупная денежная цель'}".` + (targetHint ? ` Целевая сумма: ${targetHint} ₽. Используй её как есть.` : ' Если сумма не задана, выбери цель от 50000 до 500000 ₽.');
}
return await queryAI(prompt, systemPrompt);
}

async function generateBossVictoryRewardWithAI(boss) {
const level = Math.max(1, Number(state.character?.level) || 1);
const systemPrompt = `${NO_THINKING_RULE}\n${AI_WORLD_RULE}\n${AI_DESIGN_RULE}\n${AI_REALISM_RULE}\n${AI_EFFECT_RULE}\n${AI_NO_NOTE_RULE}\nТы — генератор награды за победу над боссом. Создай один тематический экипируемый предмет и персональное достижение. Слоты: ${SLOT_ORDER.join(', ')}. Редкости: common, uncommon, rare, epic, legendary, unique, mythical. Состояния: broken, damaged, worn, good, reliable, excellent, perfect. itemLevel ОБЯЗАТЕЛЬНО ${level}. Не указывай power. bonusCoins умеренный. quote запрещён.\nJSON: {"item":{"name":"название с эмодзи","type":"equipment","rarity":"epic","slot":"Аксессуар","condition":"good","itemLevel":${level},"desc":"описание и атмосфера","effect":"+2 к 🧠 Интеллект","modifiers":{"specialFlat":{"🧠 Интеллект":2}}},"achievement":{"icon":"🏆","title":"название","desc":"одно предложение"},"bonusCoins":100}\nВерни только JSON.`;
const result = await queryAI(`Игрок победил босса "${boss.name}" с целью "${boss.goal}". Создай награду, связанную именно с этой победой.`, systemPrompt);
if (result?.item) { delete result.item.quote; result.item.modifiers = normalizeAIEffectModifiers(result.item.modifiers, result.item.effect); }
return result;
}

async function generateShopItemWithAI(theme) {
const systemPrompt = `${NO_THINKING_RULE}\n${AI_WORLD_RULE}\n${AI_DESIGN_RULE}\n${AI_REALISM_RULE}\n${AI_EFFECT_RULE}\n${AI_NO_NOTE_RULE}\nТы — генератор товаров магазина TCoL. Создавай обычный доступный бытовой расходник: еду, напиток, средство ухода, канцелярскую мелочь или полезный набор. Не создавай оружие, магию или экипировку. effect обязателен, durationMinutes 15-1440. rarity: common/uncommon/rare/epic/legendary/unique/mythical. price 10-150. quote запрещён.\nJSON: {"name":"название с эмодзи","price":25,"rarity":"common","effect":"+2 к 🧘 Концентрация","modifiers":{"skillFlat":{"🧘 Концентрация":2}},"durationMinutes":30,"desc":"описание, назначение и атмосфера"}\nВерни только JSON.`;
const result = await queryAI(`Придумай один товар для магазина на тему: "${theme || 'что-нибудь полезное на каждый день'}".`, systemPrompt);
if (result && typeof result === 'object') { delete result.quote; result.modifiers = normalizeAIEffectModifiers(result.modifiers, result.effect); }
return result;
}

function normalizeCraftRecipes(recipes, materials) {
    if (!Array.isArray(recipes) || !Array.isArray(materials)) return [];
    const owned = new Map(materials.map(m => [String(m.name || '').trim(), Math.max(0, Number(m.qty) || 1)]));
    const validSlots = new Set(SLOT_ORDER);
    const validTypes = new Set(['equipment', 'consumable']);
    const validRarities = new Set(RARITY_ORDER);
    const equipmentCategoryToSlot = {
        'Шлем':'Голова','Головной убор':'Голова','Броня':'Тело','Доспех':'Тело',
        'Плащ':'Верхняя одежда','Перчатки':'Перчатки','Поножи':'Ноги',
        'Сапоги':'Ступни','Обувь':'Обувь','Рюкзак':'Рюкзак',
        'Кольцо':'Пальцы','Амулет':'Шея','Талисман':'Шея',
        'Наруч':'Запястье (левое)','Браслет':'Запястье (левое)','Гаджет':'Гаджет'
    };
    const equipmentTypes = new Set(Object.keys(equipmentCategoryToSlot));
    const consumableTypes = new Set([
        'Еда','Напиток','Эликсир','Зелье','Настой','Свиток',
        'Талисман','Боевая смесь','Ремкомплект','Средство ухода','Набор'
    ]);
    const rarityCapByUnits = units => units >= 8 ? 'epic' : units >= 6 ? 'rare' : units >= 4 ? 'uncommon' : 'common';
    const rarityRank = r => Math.max(0, RARITY_ORDER.indexOf(r));
    const capRank = r => Math.max(0, RARITY_ORDER.indexOf(r));
    const result = [];

    for (const raw of recipes.slice(0, 3)) {
        if (!raw || typeof raw !== 'object' || typeof raw.name !== 'string') continue;
        if (!Array.isArray(raw.materials)) continue;

        const used = new Map();
        for (const entry of raw.materials) {
            const name = typeof entry === 'string' ? entry.trim() : String(entry?.name || '').trim();
            const qty = typeof entry === 'string' ? 1 : Math.floor(Number(entry?.qty));
            if (!name || !owned.has(name) || !Number.isFinite(qty) || qty < 1 || qty > 5) continue;
            if (!used.has(name)) used.set(name, Math.min(qty, Math.floor(owned.get(name))));
        }

        if (used.size < 2) continue;
        const materialList = [...used.entries()].map(([name, qty]) => ({ name, qty }));
        const totalUnits = materialList.reduce((sum, m) => sum + m.qty, 0);
        if (totalUnits < 2 || totalUnits > 10) continue;

        const type = validTypes.has(raw.type) ? raw.type : 'equipment';
        const rarity = validRarities.has(raw.rarity) ? raw.rarity : 'common';
        const cap = rarityCapByUnits(totalUnits);
        const finalRarity = rarityRank(rarity) <= capRank(cap) ? rarity : cap;
        const effect = typeof raw.effect === 'string' ? raw.effect.trim().slice(0, 120) : '';
        const safeEffect = /(?:^|\s)\+?[1-5](?:\s|$)|(?:^|\s)1[0-5]%(?:\s|$)/.test(effect) ? effect : '';
        const modifiers = normalizeAIEffectModifiers(raw.modifiers, effect);
        const desc = typeof raw.desc === 'string' ? raw.desc.trim().slice(0, 500) : '';

        if (!safeEffect) continue;

        if (type === 'consumable') {
            const category = consumableTypes.has(raw.category) ? raw.category : 'Эликсир';
            const duration = Math.max(15, Math.min(1440, Math.floor(Number(raw.durationMinutes) || 30)));
            result.push({
                name: raw.name.trim().slice(0, 80),
                type,
                category,
                materials: materialList,
                rarity: finalRarity,
                effect: safeEffect,
                modifiers,
                desc,
                slot: null,
                power: 0,
                durationMinutes: duration,
                secondaryEffect: typeof raw.secondaryEffect === 'string' ? raw.secondaryEffect.trim().slice(0, 120) : '',
                secondaryDurationMinutes: raw.secondaryDurationMinutes ? Math.max(15, Math.min(1440, Math.floor(Number(raw.secondaryDurationMinutes) || 15))) : 0
            });
        } else {
            const category = equipmentTypes.has(raw.category) ? raw.category : (validSlots.has(raw.slot) ? raw.slot : 'Шлем');
            const mappedSlot = equipmentCategoryToSlot[category];
            const slot = validSlots.has(mappedSlot) ? mappedSlot : (validSlots.has(raw.slot) ? raw.slot : 'Голова');
            result.push({
                name: raw.name.trim().slice(0, 80),
                type,
                category,
                materials: materialList,
                rarity: finalRarity,
                effect: safeEffect,
                modifiers,
                desc,
                slot,
                itemLevel: Math.max(1, Math.floor(Number(raw.itemLevel) || Number(state.character?.level) || 1)),
                condition: EQUIPMENT_CONDITION_ALIASES[raw.condition] || raw.condition || 'good'
            });
        }
    }
    return result;
}

async function generateCraftRecipesWithAI(materials) {
const systemPrompt = `${NO_THINKING_RULE}\n${AI_WORLD_RULE}\n${AI_DESIGN_RULE}\n${AI_REALISM_RULE}\n${AI_EFFECT_RULE}\n${AI_NO_NOTE_RULE}\nТы — генератор рецептов крафта The Creed of Life. РОВНО ОДИН рецепт. Используй ТОЛЬКО материалы из списка игрока и сохраняй их точные названия. 2-3 разных материала, qty 1-5 каждого, суммарно 2-10. Не используй бренды. Не зацикливайся на контейнерах, держателях, органайзерах и чехлах. Результат должен быть физически связан с материалами. type только equipment или consumable. Не возвращай power. quote запрещён. Для equipment: category ТОЛЬКО из: Шлем, Головной убор, Броня, Доспех, Плащ, Перчатки, Поножи, Сапоги, Обувь, Рюкзак, Кольцо, Амулет, Талисман, Наруч, Браслет, Гаджет. slot должен соответствовать category: Шлем/Головной убор→Голова; Броня/Доспех→Тело; Плащ→Верхняя одежда; Перчатки→Перчатки; Поножи→Ноги; Сапоги→Ступни; Обувь→Обувь; Рюкзак→Рюкзак; Кольцо→Пальцы; Амулет/Талисман→Шея; Наруч/Браслет→Запястье (левое); Гаджет→Гаджет. condition только broken/damaged/worn/good/reliable/excellent/perfect, itemLevel ${Number(state.character?.level) || 1}. Для consumable: category ТОЛЬКО из: Еда, Напиток, Эликсир, Зелье, Настой, Свиток, Талисман, Боевая смесь, Ремкомплект, Средство ухода, Набор; durationMinutes 15-1440.\nJSON-массив: [{"name":"название с эмодзи","type":"equipment","category":"Перчатки","materials":[{"name":"точный материал 1","qty":2},{"name":"точный материал 2","qty":1}],"slot":"Перчатки","rarity":"common","itemLevel":${Number(state.character?.level) || 1},"condition":"good","effect":"+1 к 🛠️ Ручной труд","modifiers":{"skillFlat":{"🛠️ Ручной труд":1}},"desc":"подробное описание предмета и назначения"}]\nВерни только JSON-массив.`;
const materialsDesc = materials.map(m => `${m.name} (доступно ×${Math.max(0, Number(m.qty) || 1)})`).join(', ');
const prompt = `Материалы игрока: ${materialsDesc}. Создай ОДИН рецепт, выбрав equipment или consumable. Рецепт должен иметь очевидную причинно-следственную связь между материалами и результатом.`;
const result = await queryAI(prompt, systemPrompt);
const normalized = normalizeCraftRecipes(Array.isArray(result) ? result : (result.recipes || [result]), materials);
if (Array.isArray(normalized)) normalized.forEach(r => { if (r?.type === 'equipment') r.itemLevel = Number(state.character?.level) || 1; if (r) delete r.quote; });
return normalized[0] || null;
}

const QUEST_MATERIAL_PRODUCT_WORDS = [
    'телефон','смартфон','планшет','ноутбук','компьютер','монитор','клавиатур','мышь','наушник','гарнитур',
    'часы','смарт-часы','кружк','термокружк','бутылк','рюкзак','сумк','перчатк','куртк','футболк','обув',
    'кроссовк','ремень','браслет','очки','органайзер','контейнер','держатель','чехол','инструмент','отвёртк',
    'отвертк','молоток','плоскогуб','фонарик','мультитул','велосипед','самокат','зарядник','адаптер','колонк'
];

function looksLikeFinishedProduct(name){
    const s = String(name || '').toLowerCase();
    return QUEST_MATERIAL_PRODUCT_WORDS.some(word => s.includes(word));
}

function normalizeAIQuestMaterial(item){
    if (!item || item.type !== 'material' || !item.name) return null;
    const material = {...item};
    material.type = 'material';
    material.rarity = 'common';
    material.effect = '';
    material.durationMinutes = null;
    material.slot = null;
    if (looksLikeFinishedProduct(material.name)) {
        material.name = '🧱 Универсальная заготовка';
        material.desc = 'Базовый материальный ресурс для бытового крафта.';
        delete material.quote;
    }
    return material;
}

function rollAIQuestRewardItems(items){
    const candidates = Array.isArray(items) ? items.filter(it => it && it.name) : [];
    const byType = type => candidates.find(it => it.type === type);

    // Материал — гарантированная награда. Для всех типов используем единую
    // нормализацию, чтобы modifiers/rarity/slot/duration не зависели от того,
    // какая версия обработчика была вызвана.
    const material = normalizeAIQuestRewardItem(byType('material'), 'material') || {
        name: '🧱 Универсальная заготовка',
        type: 'material',
        rarity: 'common',
        desc: 'Базовый материальный ресурс для бытового крафта.',
        effect: '',
        modifiers: null,
        durationMinutes: null,
        slot: null,
        source: 'ai'
    };
    const consumable = normalizeAIQuestRewardItem(byType('consumable'), 'consumable');
    const equipment = normalizeAIQuestRewardItem(byType('equipment'), 'equipment');

    const result = [material];
    // Расходник — 80%.
    if (consumable && Math.random() < 0.80) result.push(consumable);
    // Снаряжение — 40%.
    if (equipment && Math.random() < 0.40) result.push(equipment);
    return result;
}

function wireAI() {
const aiQuestBtn = document.getElementById('aiGenerateQuest');
const aiBossBtn = document.getElementById('aiGenerateBoss');
if (aiQuestBtn) {
aiQuestBtn.addEventListener('click', async () => {
if (!aiAvailable) {
toast('🤖 AI недоступен. Проверьте интернет-соединение.');
return;
}
const theme = (document.getElementById('aiQuestTheme')?.value || '').trim();
try {
const questData = await withAIThinking('🤖 Генерирую квест...', () => generateQuestWithAI(theme || 'случайное приключение'));
      pendingQuestGeneratedByAI = true;
const titleEl = document.getElementById('qNewTitle');
const descEl = document.getElementById('qNewDesc');
const diffEl = document.getElementById('qNewDifficulty');
const minEl = document.getElementById('qNewMinutes');
if (!questData || !questData.title || !questData.desc) {
    console.error('AI вернул неожиданную структуру:', questData);
    throw new Error('AI вернул ответ без полей title/desc. Попробуй ещё раз.');
  }
  if (titleEl) titleEl.value = questData.title;
  if (descEl) descEl.value = questData.desc;
  if (diffEl) diffEl.value = questData.difficulty || 'normal';
  if (minEl) minEl.value = questData.minutes || 30;
if (questData.skills && Array.isArray(questData.skills)) {
document.querySelectorAll('#qNewSkillsPick input[type=checkbox]').forEach(cb => {
cb.checked = questData.skills.includes(cb.value);
cb.closest(".skill-pick-label").classList.toggle("picked", cb.checked);
});
}
pendingQuestItems = rollAIQuestRewardItems(questData.items);
updatePreview();
toast(pendingQuestItems.length ? `✅ Квест сгенерирован, награда: ${pendingQuestItems.map(i=>i.name).join(', ')}` : '✅ Квест сгенерирован AI!');
} catch(error) {
toastAIError(error);
}
});
}
if (aiBossBtn) {
aiBossBtn.addEventListener('click', async () => {
if (!aiAvailable) {
toast('🤖 AI недоступен. Проверьте интернет-соединение.');
return;
}
const theme = (document.getElementById('aiBossTheme')?.value || '').trim();
const typeEl = document.getElementById('bossNewType');
const targetEl0 = document.getElementById('bossNewTarget');
const unitEl0 = document.getElementById('bossNewUnit');
const bossType = typeEl ? typeEl.value : 'financial';
const targetHint = targetEl0 && Number(targetEl0.value) > 0 ? Number(targetEl0.value) : null;
const unitHint = unitEl0 && unitEl0.value.trim() ? unitEl0.value.trim() : null;
try {
const bossData = await withAIThinking('🤖 Генерирую босса...', () => generateBossWithAI(theme || (bossType === 'other' ? 'крупная жизненная цель' : 'крупная денежная цель'), bossType, targetHint, unitHint));
const nameEl = document.getElementById('bossNewName');
const goalEl = document.getElementById('bossNewGoal');
const targetEl = document.getElementById('bossNewTarget');
const unitEl = document.getElementById('bossNewUnit');
const finalTarget = targetHint || bossData.target || 100000;
const finalUnit = bossType === 'financial' ? '₽' : (unitHint || bossData.unit || 'ед.');
if (nameEl) nameEl.value = bossData.name || '🎯 Крупная цель';
if (goalEl) goalEl.value = bossData.goal || 'Довести проект до конца';
if (targetEl) targetEl.value = finalTarget;
if (unitEl) unitEl.value = finalUnit;
const defaultPhases = bossType === 'financial'
? [
{name: "Фаза I", pct: 20, rewardXP: 80, skill: "💰 Финансы", skillXP: 40},
{name: "Фаза II", pct: 30, rewardXP: 150, skill: "💰 Финансы", skillXP: 70},
{name: "Фаза III", pct: 50, rewardXP: 280, skill: "💰 Финансы", skillXP: 120},
]
: [
{name: "Фаза I", pct: 34, rewardXP: 80, skill: "🎯 Концентрация", skillXP: 40},
{name: "Фаза II", pct: 33, rewardXP: 150, skill: "📋 Менеджмент", skillXP: 70},
{name: "Фаза III", pct: 33, rewardXP: 280, skill: "⚖️ Ответственность", skillXP: 120},
];
// Для финансового типа доли фиксированы (20/30/50) вне зависимости от того,
// что вернул AI — это правило игры, а не предложение AI.
const phasesSource = normalizeGeneratedBossPhases(bossData.phases, bossType, defaultPhases);
const boss = {
id: "boss_" + Date.now(),
name: bossData.name || '🎯 Крупная цель',
goal: bossData.goal || 'Довести проект до конца',
target: finalTarget,
bossType,
unit: finalUnit,
createdAt: Date.now(),
victoryRewarded: false,
phases: phasesSource.map(p => ({
name: p.name || `Фаза ${p.pct || 30}%`,
target: Math.round(finalTarget * (p.pct || 30) / 100),
progress: 0,
defeated: false,
// Награда — только XP персонажа и XP одного навыка, монет нет
reward: { heroXP: p.rewardXP || 100, skills: p.skill ? { [p.skill]: p.skillXP || 30 } : {} },
applied: false
}))
};
if (typeof BossCore === 'undefined' || !BossCore.create(boss)) throw new Error('Не удалось создать босса');
if (nameEl) nameEl.value = "";
if (goalEl) goalEl.value = "";
if (targetEl) targetEl.value = "";
if (unitEl) unitEl.value = "";
persist(); renderAll();
toast(`✅ Босс "${boss.name}" создан AI!`);
} catch(error) {
toastAIError(error);
}
});
}
}
