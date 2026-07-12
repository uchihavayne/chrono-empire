import { useEffect, useRef, useState } from 'react';
import { ACHIEVEMENTS, DAILY_REWARDS } from '../game/data';
import { formatNumber } from '../game/format';
import { LANG_NAMES } from '../i18n';
import { useGame, useT } from '../hooks';
import { ConfirmModal } from './Modals';
import { PRODUCTS, shopVisible } from '../services/iap';
import { purchase as iapPurchase, restore as iapRestore } from '../services/iap';
import type { LbEntry } from '../services/leaderboard';

function achText(t: ReturnType<typeof useT>, a: (typeof ACHIEVEMENTS)[number], notation: 'suffix' | 'scientific') {
  switch (a.kind) {
    case 'own': return t('ach_own', { n: a.n, name: t(`gen_${a.target}`) });
    case 'earn': return t('ach_earn', { v: formatNumber(a.n, notation) });
    case 'rebirth': return t('ach_rebirth', { n: a.n });
    case 'ads': return t('ach_ads', { n: a.n });
    case 'anomaly': return t('ach_anomaly', { n: a.n });
    case 'managers': return t('ach_managers');
    case 'era': return t('ach_era', { n: a.n });
  }
}

export function MoreTab({ onToast }: { onToast: (msg: string) => void }) {
  const engine = useGame();
  const t = useT();
  const s = engine.state;
  const [resetting, setResetting] = useState(false);
  const importRef = useRef<HTMLTextAreaElement>(null);
  const [showImport, setShowImport] = useState(false);
  const [showAch, setShowAch] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [restoreCode, setRestoreCode] = useState('');
  const [showRestore, setShowRestore] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);
  const [lb, setLb] = useState<LbEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [playerName, setPlayerName] = useState(s.playerName);

  const loadLb = async () => {
    setLbLoading(true);
    setLb(await engine.fetchLeaderboard(20));
    setLbLoading(false);
  };
  useEffect(() => { void loadLb(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  const submitScore = async () => {
    await engine.submitLeaderboard(playerName);
    await loadLb();
    onToast(t('lb_submitted'));
  };

  const backup = async () => {
    setCloudBusy(true);
    const r = await engine.cloudBackup();
    setCloudBusy(false);
    onToast(r.ok ? t('cloud_ok') : t('cloud_fail'));
  };
  const restore = async () => {
    setCloudBusy(true);
    const r = await engine.cloudRestore(restoreCode);
    setCloudBusy(false);
    if (r.ok) { onToast(t('cloud_restored')); setShowRestore(false); }
    else onToast(r.error === 'empty' ? t('cloud_empty') : t('cloud_fail'));
  };
  const buy = async (id: string) => {
    setBuying(id);
    const r = await iapPurchase(id);
    if (r.ok) { engine.applyPurchase(id); onToast('✓'); }
    setBuying(null);
  };
  const restorePurchases = async () => {
    const ents = await iapRestore();
    engine.applyRestore(ents);
    onToast(t('shop_restored'));
  };

  const claim = () => {
    const r = engine.claimDaily();
    if (r) {
      onToast(r.type === 'cash' ? `+${formatNumber(r.value, s.notation)} 💰` : `+${r.value} 💎`);
    }
  };

  const dayIdx = s.dailyStreak % DAILY_REWARDS.length;

  return (
    <div>
      {/* daily reward */}
      <div className="section-title">🎁 {t('daily_title')}</div>
      <div className="daily-grid">
        {DAILY_REWARDS.map((d, i) => (
          <div key={i} className={`daily-cell${i < dayIdx ? ' past' : i === dayIdx ? ' today' : ''}`}>
            <span className="d-emoji">{d.type === 'cash' ? '💰' : '💎'}</span>
            {t('daily_day', { n: i + 1 })}
          </div>
        ))}
      </div>
      <button className="action-btn" style={{ width: '100%', padding: 12 }} disabled={!s.dailyClaimable} onClick={claim}>
        {s.dailyClaimable ? t('claim') : t('daily_done')}
      </button>

      {/* achievements (collapsed by default to keep this tab tidy) */}
      <button className="collapse-head" onClick={() => setShowAch((v) => !v)}>
        <span>🏆 {t('ach_title')}</span>
        <span className="collapse-sub">{s.achievements.length}/{ACHIEVEMENTS.length} {showAch ? '▲' : '▼'}</span>
      </button>
      {showAch && (
        <>
          <p className="hint">{t('ach_bonus', { a: s.achievements.length, b: ACHIEVEMENTS.length })}</p>
          <div className="ach-grid">
            {ACHIEVEMENTS.map((a) => {
              const done = s.achievements.includes(a.id);
              return (
                <div key={a.id} className={`ach-card${done ? ' unlocked' : ''}`}>
                  <span className="a-emoji">{done ? '🏆' : '🔒'}</span>
                  <div>{achText(t, a, s.notation)}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* stats (collapsed) */}
      <button className="collapse-head" onClick={() => setShowStats((v) => !v)}>
        <span>📊 {t('stats_title')}</span>
        <span className="collapse-sub">{showStats ? '▲' : '▼'}</span>
      </button>
      {showStats && (
        <>
          <div className="stat-row"><span>{t('stat_lifetime')}</span><span>{formatNumber(s.lifetimeCash, s.notation)}</span></div>
          <div className="stat-row"><span>{t('stat_run')}</span><span>{formatNumber(s.runCash, s.notation)}</span></div>
          <div className="stat-row"><span>{t('time_travels', { n: '' }).replace(':', '').trim()}</span><span>{s.rebirths}</span></div>
          <div className="stat-row"><span>{t('stat_crystals_total')}</span><span>{formatNumber(s.totalCrystalsEarned, s.notation)}</span></div>
          <div className="stat-row"><span>{t('stat_ads')}</span><span>{s.adsWatched}</span></div>
          <div className="stat-row"><span>{t('stat_anomalies')}</span><span>{s.anomaliesCaught}</span></div>
        </>
      )}

      {/* leaderboard */}
      <div className="section-title">🏅 {t('lb_title')}</div>
      <p className="hint">{t('lb_hint', { v: formatNumber(engine.leaderboardScore(), s.notation) })}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="text-input"
          style={{ flex: 1 }}
          value={playerName}
          maxLength={16}
          placeholder={t('lb_name_ph')}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <button className="action-btn" style={{ padding: '0 16px' }} disabled={!playerName.trim()} onClick={submitScore}>
          {t('lb_submit')}
        </button>
      </div>
      <div className="lb-list">
        {lbLoading && lb.length === 0 ? (
          <div className="lb-row"><span className="lb-rank">…</span></div>
        ) : (
          lb.map((e, i) => (
            <div key={i} className={`lb-row${e.me ? ' me' : ''}`}>
              <span className="lb-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
              <span className="lb-name">{e.name}</span>
              <span className="lb-score">{formatNumber(e.score, s.notation)}</span>
            </div>
          ))
        )}
      </div>

      {/* shop (IAP) — hidden on a native build until real IAP is configured */}
      {shopVisible() && <>
      <div className="section-title">🛒 {t('shop_title')}</div>
      <p className="hint">{t('shop_hint')}</p>
      {PRODUCTS.map((p) => {
        const owned = p.kind === 'noncon' && s.iapOwned.includes(p.id);
        return (
          <div key={p.id} className="row-card" style={{ marginTop: 6 }}>
            <div className="icon-tile">{p.icon}</div>
            <div className="info"><div className="title">{t(`iap_${p.id}_t`)}</div></div>
            <button
              className="action-btn"
              disabled={owned || buying === p.id}
              onClick={() => buy(p.id)}
            >
              {owned ? t('shop_owned') : t('shop_buy')}
            </button>
          </div>
        );
      })}
      <button className="action-btn purple" style={{ width: '100%', padding: 10, marginTop: 8 }} onClick={restorePurchases}>
        {t('shop_restore')}
      </button>
      </>}

      {/* cloud backup */}
      <div className="section-title">☁️ {t('cloud_title')}</div>
      <p className="hint">{t('cloud_hint')}</p>
      <div
        className="stat-row"
        style={{ cursor: 'pointer' }}
        onClick={async () => { try { await navigator.clipboard.writeText(s.cloudCode); onToast(t('copied')); } catch { /* */ } }}
      >
        <span>{t('cloud_code')}</span>
        <span style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.5px' }}>{s.cloudCode} 📋</span>
      </div>
      <p className="hint" style={{ marginTop: 2 }}>
        {s.cloudSyncedAt ? t('cloud_synced', { t: new Date(s.cloudSyncedAt).toLocaleString() }) : t('cloud_never')}
      </p>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button className="action-btn" style={{ flex: 1, padding: 11 }} disabled={cloudBusy} onClick={backup}>
          {t('cloud_backup_btn')}
        </button>
        <button className="action-btn purple" style={{ flex: 1, padding: 11 }} onClick={() => setShowRestore(!showRestore)}>
          {t('cloud_restore_btn')}
        </button>
      </div>
      {showRestore && (
        <div style={{ marginTop: 8 }}>
          <p className="hint">{t('cloud_restore_hint')}</p>
          <input
            className="text-input"
            style={{ width: '100%' }}
            value={restoreCode}
            onChange={(e) => setRestoreCode(e.target.value)}
            placeholder="CE-XXXX-XXXX-XXXX"
          />
          <button
            className="action-btn"
            style={{ width: '100%', padding: 11, marginTop: 6 }}
            disabled={cloudBusy || !restoreCode.trim()}
            onClick={restore}
          >
            {t('confirm')}
          </button>
        </div>
      )}

      {/* settings */}
      <div className="section-title">⚙️ {t('settings_title')}</div>
      <p className="hint">{t('language')}</p>
      <select value={s.lang} onChange={(e) => engine.setLang(e.target.value)}>
        {Object.entries(LANG_NAMES).map(([code, name]) => (
          <option key={code} value={code}>{name}</option>
        ))}
      </select>
      <p className="hint">{t('notation')}</p>
      <select value={s.notation} onChange={(e) => engine.setNotation(e.target.value as 'suffix' | 'scientific')}>
        <option value="suffix">{t('notation_suffix')}</option>
        <option value="scientific">{t('notation_sci')}</option>
      </select>
      <div className="row-card" style={{ marginTop: 4 }}>
        <div className="icon-tile">🎵</div>
        <div className="info">
          <div className="title">{t('music')}</div>
          <input
            className="vol-slider" type="range" min={0} max={100} step={1}
            value={Math.round((s.musicVol ?? 1) * 100)}
            disabled={!s.musicOn}
            onChange={(e) => engine.setMusicVol(Number(e.target.value) / 100)}
            aria-label={t('music')}
          />
        </div>
        <button className={`action-btn${s.musicOn ? '' : ' purple'}`} onClick={() => engine.setMusic(!s.musicOn)}>
          {s.musicOn ? t('on') : t('off')}
        </button>
      </div>
      <div className="row-card" style={{ marginTop: 6 }}>
        <div className="icon-tile">🔔</div>
        <div className="info">
          <div className="title">{t('sfx')}</div>
          <input
            className="vol-slider" type="range" min={0} max={100} step={1}
            value={Math.round((s.sfxVol ?? 1) * 100)}
            disabled={!s.sfxOn}
            onChange={(e) => engine.setSfxVol(Number(e.target.value) / 100)}
            aria-label={t('sfx')}
          />
        </div>
        <button className={`action-btn${s.sfxOn ? '' : ' purple'}`} onClick={() => engine.setSfx(!s.sfxOn)}>
          {s.sfxOn ? t('on') : t('off')}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button
          className="action-btn purple"
          style={{ flex: 1, padding: 11 }}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(engine.exportSave());
              onToast(t('copied'));
            } catch { /* clipboard unavailable */ }
          }}
        >
          {t('export_save')}
        </button>
        <button className="action-btn purple" style={{ flex: 1, padding: 11 }} onClick={() => setShowImport(!showImport)}>
          {t('import_save')}
        </button>
      </div>
      {showImport && (
        <div style={{ marginTop: 8 }}>
          <textarea ref={importRef} className="text-input" rows={3} />
          <button
            className="action-btn"
            style={{ width: '100%', padding: 11 }}
            onClick={() => {
              const ok = engine.importSave(importRef.current?.value ?? '');
              onToast(ok ? '✓' : t('import_bad'));
              if (ok) setShowImport(false);
            }}
          >
            {t('confirm')}
          </button>
        </div>
      )}

      <button
        className="action-btn"
        style={{ width: '100%', padding: 11, marginTop: 14, background: 'var(--red)', color: 'white' }}
        onClick={() => setResetting(true)}
      >
        {t('reset')}
      </button>

      <div style={{ height: 20 }} />

      {resetting && (
        <ConfirmModal
          icon="⚠️"
          title={t('reset')}
          text={t('reset_confirm')}
          danger
          onConfirm={() => { engine.hardReset(); setResetting(false); }}
          onCancel={() => setResetting(false)}
        />
      )}
    </div>
  );
}
