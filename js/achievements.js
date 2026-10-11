"use strict";

function handleAchievementChanges(changed){
    if (!Array.isArray(changed) || !changed.length) return;
    changed.forEach(({def, rank, oldRank}) => {
        const rankText = ACHIEVEMENT_RANKS[rank - 1];
        const previousRankText = oldRank > 0 ? ACHIEVEMENT_RANKS[oldRank - 1] : null;
        logEvent('achievement', def.icon, `Получено достижение: «${def.title}» ранг — ${rankText}`);
        if (typeof queueAchievementUnlock === 'function') {
            const currentValue = achievementValue(def.id);
            const nextThreshold = rank < def.thresholds.length ? def.thresholds[rank] : null;
            queueAchievementUnlock({
                icon: def.icon,
                title: def.title,
                desc: def.desc,
                rank: rankText,
                previousRank: previousRankText,
                currentValue,
                currentValueText: formatAchievementValue(currentValue, def),
                unit: def.unit,
                nextThreshold,
                nextThresholdText: nextThreshold !== null ? formatAchievementValue(nextThreshold, def) : null,
                isMaxRank: rank >= 10
            });
        } else if (typeof toast === 'function') {
            toast(`🏆 Получено достижение: «${def.title}» ранг — ${rankText}`);
        }
    });
}

function syncAchievements({silent=false} = {}){
    const changed = AchievementCore.sync();
    if (!silent && changed.length) {
        handleAchievementChanges(changed);
        if (typeof persist === 'function') persist();
    }
    return changed;
}



function renderAchievements(){
    const list = document.getElementById("achList");
    if (!list) return;
    syncAchievements({silent:true});
    list.innerHTML = "";
    ACHIEVEMENT_DEFINITIONS.forEach(def => {
        const a = state.achievements.find(x => x.id === def.id) || {rank:0};
        const rank = Number(a.rank) || 0;
        const value = achievementValue(def.id);
        const next = rank < 10 ? def.thresholds[rank] : null;
        const current = rank > 0 ? def.thresholds[rank - 1] : 0;
        const progress = next === null ? 100 : Math.min(100, Math.max(0, ((value - current) / Math.max(1, next - current)) * 100));
        const rankText = rank > 0 ? ACHIEVEMENT_RANKS[rank - 1] : '—';
        const status = rank >= 10 ? 'X · МАКСИМАЛЬНЫЙ РАНГ' : rank > 0 ? `Ранг ${rankText} · следующий ${ACHIEVEMENT_RANKS[rank]}` : `До ранга I: ${formatAchievementValue(Math.max(0, def.thresholds[0] - value), def)} ${def.unit}`;
        const targetText = rank >= 10 ? `${formatAchievementValue(def.thresholds[9], def)} ${def.unit}` : `${formatAchievementValue(value, def)} / ${formatAchievementValue(next, def)} ${def.unit}`;
        const div = document.createElement("div");
        div.className = "ach achievement-tier";
        div.innerHTML = `<div class="icon">${escapeHtml(def.icon)}</div><div class="achievement-main"><div class="achievement-title"><b>${escapeHtml(def.title)}</b><span class="achievement-rank">${escapeHtml(rankText)}</span></div><p>${escapeHtml(def.desc)}</p><div class="achievement-progress-text"><span>${escapeHtml(targetText)}</span><span>${escapeHtml(status)}</span></div><div class="bar"><span style="width:${progress}%"></span></div></div>`;
        list.appendChild(div);
    });

    const bossAchievements = state.achievements.filter(a => String(a?.id || '').startsWith('boss:'));
    if (bossAchievements.length) {
        const heading = document.createElement('div');
        heading.className = 'achievement-category';
        heading.innerHTML = '<h3>👹 Достижения за боссов</h3>';
        list.appendChild(heading);
    }
    bossAchievements.forEach(a => {
        const div = document.createElement('div');
        div.className = 'ach achievement-tier';
        div.innerHTML = `<div class="icon">${escapeHtml(a.icon || '🏆')}</div><div class="achievement-main"><div class="achievement-title"><b>${escapeHtml(a.title || 'Достижение босса')}</b><span class="achievement-rank">🏆</span></div><p>${escapeHtml(a.desc || 'Персональное достижение за победу над боссом.')}</p><div class="achievement-progress-text"><span>Получено</span><span>Победа над боссом</span></div></div>`;
        list.appendChild(div);
    });
}
