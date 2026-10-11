"use strict";

const PROFILE_SPECIAL_ORDER = [
    { letter: "S", key: "💪 Сила" },
    { letter: "P", key: "👁️ Восприятие" },
    { letter: "E", key: "🛡️ Выносливость" },
    { letter: "C", key: "🗣️ Харизма" },
    { letter: "I", key: "🧠 Интеллект" },
    { letter: "A", key: "⚡ Ловкость" },
    { letter: "L", key: "🎲 Удача" },
];

function getProfileEquipmentItems(){
    const result = [];
    Object.entries(state.equipment || {}).forEach(([slot, item]) => {
        if (item) result.push({ slot, item });
    });
    Object.entries(state.accessories || {}).forEach(([slot, items]) => {
        (Array.isArray(items) ? items : []).forEach((item, index) => {
            if (item) result.push({ slot, item, index });
        });
    });
    return result;
}

function getProfileInventoryCount(){
    return (state.inventory || []).reduce((sum, item) => sum + (Number(item.qty) || 1), 0);
}


function renderProfileBuffs(){
    const el = document.getElementById('profileActiveBuffs');
    if (!el) return;
    const effects = typeof getActiveEffects === 'function' ? getActiveEffects() : [];
    if (!effects.length) {
        el.innerHTML = '<div class="profile-effects-empty">Сейчас нет действующих эффектов.</div>';
        return;
    }
    const now = Date.now();
    const permanent = effects.filter(e => e.durationType === 'permanent').length;
    const timed = effects.length - permanent;
    const negative = effects.filter(e => e.type === 'negative').length;
    el.innerHTML = `
        <div class="profile-effects-summary">
            <span><b>${effects.length}</b> эффектов</span>
            <span><b>${timed}</b> временных</span>
            <span><b>${permanent}</b> постоянных</span>
            ${negative ? `<span class="negative"><b>${negative}</b> негативных</span>` : ''}
        </div>
        <div class="profile-effects-list">
            ${effects.map(e => {
                const pending = Number(e.startsAt) > now;
                const remaining = pending ? Number(e.startsAt) - now : (e.durationType === 'permanent' ? null : Number(e.expiresAt) - now);
                const negativeClass = e.type === 'negative' ? ' negative' : '';
                const source = typeof getActiveEffectSourceLabel === 'function' ? getActiveEffectSourceLabel(e) : 'Источник';
                const duration = e.durationType === 'permanent'
                    ? '♾️ Постоянный эффект'
                    : (pending ? `⏳ Активация через ${formatBuffDuration(remaining)}` : `⏱ Осталось ${formatBuffDuration(remaining)}`);
                return `
                    <div class="profile-effect-row${negativeClass}">
                        <div class="profile-effect-icon">${escapeHtml(e.icon || '✨')}</div>
                        <div class="profile-effect-content">
                            <div class="profile-effect-top">
                                <b>${escapeHtml(e.name || 'Активный эффект')}</b>
                                <span class="profile-effect-source">${escapeHtml(source)}</span>
                            </div>
                            <div class="profile-effect-value">${escapeHtml(e.effect || 'Эффект не указан')}</div>
                            <div class="profile-effect-meta">${escapeHtml(duration)}${e.stack > 1 ? ` · ×${e.stack}` : ''}</div>
                        </div>
                    </div>`;
            }).join('')}
        </div>`;
}

function renderProfileAdditional(){
    const statsEl = document.getElementById('profileProgressStats');
    const achievementsEl = document.getElementById('profileAchievementsList');
    if (!statsEl && !achievementsEl) return;

    const questStats = state.quests?.stats || { completed: 0, failed: 0, aborted: 0 };
    const completed = Number(questStats.completed) || 0;
    const failed = Number(questStats.failed) || 0;
    const aborted = Number(questStats.aborted) || 0;
    const resolved = completed + failed + aborted;
    const completionRate = resolved ? Math.round(completed / resolved * 100) : 0;
    const totalSkillXP = Object.values(state.skills || {}).reduce((sum, xp) => sum + (Number(xp) || 0), 0);
    const totalSkillLevels = Object.values(state.skills || {}).reduce((sum, xp) => sum + getSkillLevel(Number(xp) || 0), 0);
    const achievements = Array.isArray(state.achievements) ? state.achievements : [];
    const unlockedAchievements = achievements.filter(a => a.unlocked).length;
    const perks = Array.isArray(state.perksUnlocked) ? state.perksUnlocked.length : 0;
    const totalActivitySeconds = Number(state.totalActivitySeconds) || 0;

    if (statsEl) {
        statsEl.innerHTML = `
            <div class="profile-progress-stat"><b>${fmt(completed)}</b><span>Квестов завершено</span></div>
            <div class="profile-progress-stat"><b>${fmt(completionRate)}%</b><span>Процент завершения</span></div>
            <div class="profile-progress-stat"><b>${fmt(totalSkillXP)}</b><span>XP навыков</span></div>
            <div class="profile-progress-stat"><b>${fmt(totalSkillLevels)}</b><span>Сумма уровней навыков</span></div>
            <div class="profile-progress-stat"><b>${fmt(unlockedAchievements)}/${fmt(achievements.length)}</b><span>Достижений открыто</span></div>
            <div class="profile-progress-stat"><b>${fmt(perks)}</b><span>Перков разблокировано</span></div>
            <div class="profile-progress-stat"><b>${formatActivityDuration(totalActivitySeconds)}</b><span>Время активности</span></div>
        `;
    }

    if (achievementsEl) {
        achievementsEl.innerHTML = achievements.length ? achievements.map(a => `
            <div class="profile-achievement-item ${a.unlocked ? '' : 'locked'}">
                <span class="profile-achievement-icon">${escapeHtml(a.icon || '🏆')}</span>
                <div class="profile-achievement-main">
                    <b>${escapeHtml(a.title || 'Без названия')}${a.rank ? ` · Ранг ${escapeHtml(ACHIEVEMENT_RANKS[Math.max(0, Number(a.rank) - 1)] || '—')}` : ''}</b>
                    <span>${escapeHtml(a.desc || (a.unlocked ? 'Достижение разблокировано.' : 'Условие ещё не выполнено.'))}</span>
                </div>
                <strong>${a.rank >= 10 ? 'X' : (a.rank ? '✓' : '🔒')}</strong>
            </div>
        `).join('') : `<div class="empty">Достижений пока нет.</div>`;
    }
}

function animatePowerValue(el, targetValue){
    if (!el) return;
    const target = Number(targetValue) || 0;
    const previous = el.dataset.powerValue === undefined ? null : Number(el.dataset.powerValue);

    if (previous === null || !Number.isFinite(previous) || previous === target) {
        el.textContent = fmt(target);
        el.dataset.powerValue = String(target);
        return;
    }

    if (el._powerAnimationFrame) cancelAnimationFrame(el._powerAnimationFrame);
    if (el._powerAnimationTimer) clearTimeout(el._powerAnimationTimer);

    const delta = target - previous;
    const directionClass = delta > 0 ? 'power-increase' : 'power-decrease';
    el.classList.remove('power-increase', 'power-decrease');
    void el.offsetWidth;
    el.classList.add(directionClass);

    const startTime = performance.now();
    const duration = 1040;
    const easeOut = t => 1 - Math.pow(1 - t, 3);

    const step = now => {
        const progress = Math.min(1, (now - startTime) / duration);
        const value = Math.round(previous + (target - previous) * easeOut(progress));
        el.textContent = fmt(value);
        if (progress < 1) {
            el._powerAnimationFrame = requestAnimationFrame(step);
        } else {
            el.dataset.powerValue = String(target);
            el._powerAnimationFrame = null;
            el._powerAnimationTimer = setTimeout(() => {
                el.classList.remove('power-increase', 'power-decrease');
            }, 440);
        }
    };

    el._powerAnimationFrame = requestAnimationFrame(step);
}

function getProfilePowerBreakdown(){
    const level = Number(state.character?.level) || 0;
    const levelPower = level * POWER_CHARACTER_LEVEL;
    const specialSum = PROFILE_SPECIAL_ORDER.reduce((sum, entry) => sum + (typeof getEffectiveSpecialValue === 'function' ? getEffectiveSpecialValue(entry.key) : (Number(state.special?.[entry.key]) || 0)), 0);
    const specialPower = specialSum * POWER_SPECIAL_PER_POINT;
    const skillLevelSum = Object.keys(state.skills || {}).reduce((sum, skillName) => sum + (typeof getEffectiveSkillLevel === 'function' ? getEffectiveSkillLevel(skillName) : getSkillLevel(Number(state.skills?.[skillName]) || 0)), 0);
    const skillPower = skillLevelSum * POWER_SKILL_PER_LEVEL;
    const equipmentPower = getProfileEquipmentItems().reduce((sum, { item }) => sum + getEquipmentPower(item), 0);
    return { specialPower, skillPower, equipmentPower, levelPower, total: specialPower + skillPower + equipmentPower + levelPower };
}

function getProfilePower(){
    return getProfilePowerBreakdown().total;
}

function renderProfilePowerBreakdown(){
    const el = document.getElementById('profilePowerBreakdown');
    if (!el) return;
    const b = getProfilePowerBreakdown();
    el.innerHTML = `
        <div class="profile-power-breakdown-row"><span>SPECIAL</span><b>+${fmt(b.specialPower)}</b></div>
        <div class="profile-power-breakdown-row"><span>НАВЫКИ</span><b>+${fmt(b.skillPower)}</b></div>
        <div class="profile-power-breakdown-row"><span>ПРЕДМЕТЫ</span><b>+${fmt(b.equipmentPower)}</b></div>
        <div class="profile-power-breakdown-row"><span>УРОВЕНЬ</span><b>+${fmt(b.levelPower)}</b></div>
        <div class="profile-power-breakdown-total"><span>ИТОГО</span><b>${fmt(b.total)}</b></div>
    `;
}


function renderProfile(){
    const nameEl = document.getElementById('profileName');
    const levelEl = document.getElementById('profileLevelLabel');
    const xpTextEl = document.getElementById('profileXPText');
    const xpBarEl = document.getElementById('profileXPBar');
    const powerEl = document.getElementById('profilePower');
    const specialEl = document.getElementById('profileSpecialList');
    const skillsEl = document.getElementById('profileSkillsList');
    const perksEl = document.getElementById('profilePerksList');
    const equipmentEl = document.getElementById('profileEquipmentList');
    const equipmentCountEl = document.getElementById('profileEquipmentCount');
    const inventoryEl = document.getElementById('profileInventorySummary');

    if (!nameEl && !specialEl && !skillsEl) return;

    const level = Number(state.character?.level) || 0;
    const xp = Number(state.character?.heroXP) || 0;
    const threshold = levelThreshold(level);
    const xpPct = threshold > 0 ? Math.min(100, (xp / threshold) * 100) : 0;

    if (nameEl) nameEl.textContent = state.character?.name || 'Без имени';
    if (levelEl) levelEl.textContent = `· УРОВЕНЬ ${level}`;
    if (xpTextEl) xpTextEl.textContent = `${fmt(xp)}/${fmt(threshold)}`;
    if (xpBarEl) xpBarEl.style.width = xpPct + '%';
    if (powerEl) animatePowerValue(powerEl, getProfilePower());
    renderProfilePowerBreakdown();

    if (specialEl) {
        specialEl.innerHTML = PROFILE_SPECIAL_ORDER.map(({letter, key}) => `
            <div class="profile-special-cell">
                <span class="profile-special-letter">${letter}</span>
                <b>${typeof getEffectiveSpecialValue === 'function' ? getEffectiveSpecialValue(key) : (Number(state.special?.[key]) || 0)}</b>
            </div>
        `).join('');
    }

    if (skillsEl) {
        const skills = Object.entries(state.skills || {});
        skillsEl.innerHTML = skills.length ? skills.map(([name, xpValue]) => {
            const skillXP = Number(xpValue) || 0;
            const skillLevel = typeof getEffectiveSkillLevel === 'function' ? getEffectiveSkillLevel(name) : getSkillLevel(skillXP);
            const parts = String(name).trim().split(/\s+/);
            const emoji = parts.shift() || '•';
            const skillName = parts.join(' ') || name;
            return `
                <div class="profile-skill-cell">
                    <span class="profile-skill-icon">${escapeHtml(emoji)}</span>
                    <span class="profile-skill-name">${escapeHtml(skillName)}</span>
                    <b class="profile-skill-level">${skillLevel}</b>
                </div>
            `;
        }).join('') : `<div class="empty">Навыков пока нет.</div>`;
    }

    if (perksEl) {
        const perks = state.perksUnlocked || [];
        perksEl.innerHTML = perks.length ? perks.map(perk => {
            const name = typeof perk === 'string' ? perk : perk.name;
            const effects = typeof perk === 'string' ? [] : (perk.effects || []);
            return `
                <div class="profile-perk-item">
                    <div class="profile-perk-name">🔓 ${escapeHtml(name || 'Без названия')}</div>
                    ${effects.map(effect => `<div class="sub">✨ ${escapeHtml(effect)}</div>`).join('')}
                </div>
            `;
        }).join('') : `<div class="empty">Пока нет разблокированных перков.</div>`;
    }

    const equipped = getProfileEquipmentItems();
    if (equipmentCountEl) equipmentCountEl.textContent = `${equipped.length} предметов экипировано`;
    if (equipmentEl) {
        equipmentEl.innerHTML = equipped.length ? equipped.map(({slot, item}) => `
            <div class="profile-equipment-item">
                <span class="profile-equipment-icon">${SLOT_ICON[slot] || '•'}</span>
                <div>
                    <b>${escapeHtml(item.name || 'Без названия')}</b>
                    <div class="sub">${escapeHtml(slot)}</div>
                </div>
                ${item.rarity ? `<span class="rarity ${item.rarity}">${escapeHtml(RARITY_LABEL[item.rarity] || item.rarity)}</span>` : ''}
            </div>
        `).join('') : `<div class="empty">Экипировка отсутствует.</div>`;
    }

    if (inventoryEl) {
        const total = getProfileInventoryCount();
        const stacks = (state.inventory || []).length;
        const materials = (state.inventory || []).filter(i => i.type === 'material').reduce((s, i) => s + (Number(i.qty) || 1), 0);
        const consumables = (state.inventory || []).filter(i => i.type === 'consumable').reduce((s, i) => s + (Number(i.qty) || 1), 0);
        const equipment = (state.inventory || []).filter(i => i.type === 'equipment').reduce((s, i) => s + (Number(i.qty) || 1), 0);
        inventoryEl.innerHTML = `
            <div class="profile-inventory-stat"><b>${fmt(total)}</b><span>Всего предметов</span></div>
            <div class="profile-inventory-stat"><b>${fmt(equipment)}</b><span>Снаряжение</span></div>
            <div class="profile-inventory-stat"><b>${fmt(consumables)}</b><span>Расходники</span></div>
            <div class="profile-inventory-stat"><b>${fmt(materials)}</b><span>Материалы</span></div>
        `;
    }
    renderProfileBuffs();
    renderProfileAdditional();
}
