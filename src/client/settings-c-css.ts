/** Locked settings C chrome, scoped under [data-providers-section]. */
export const settingsCCss = `
[data-providers-section]{--c-ink:var(--dsw-alias-label-primary);--c-muted:var(--dsw-alias-label-secondary);--c-faint:var(--dsw-alias-label-tertiary);--c-line:var(--dsw-alias-border-l2);--c-bg:var(--dsw-alias-bg-layer-1);--c-subtle:var(--dsw-alias-bg-module-platform);--c-hover:color-mix(in srgb,var(--dsw-alias-label-primary) 6%,var(--dsw-alias-bg-layer-1));display:flex;flex-direction:column;width:100%;min-width:0;color:var(--c-ink);font-size:13px;line-height:1.5}
[data-providers-section] button{font:inherit;color:inherit;cursor:pointer;border:0;background:none}
[data-providers-section] .c-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:34px;border:1px solid var(--c-line);border-radius:9px;padding:6px 12px;background:var(--c-bg);white-space:nowrap;font-size:12px;font-weight:500}
[data-providers-section] .c-btn:hover{background:var(--c-hover);border-color:var(--c-faint)}
[data-providers-section] .c-btn.quiet{background:transparent;border-color:transparent}
[data-providers-section] .c-btn.quiet:hover{background:var(--c-hover)}
[data-providers-section] .c-sort{min-width:128px}
[data-providers-section] .c-ico{width:14px;height:14px;flex:none}
[data-providers-section] .c-page-title{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin:3px 0 24px}
[data-providers-section] .c-page-title h2{margin:0;font-size:20px;line-height:28px;font-weight:600;letter-spacing:-.5px}
[data-providers-section] .c-page-title p{margin:5px 0 0;color:var(--c-muted);font-size:12px}
[data-providers-section] .c-note{padding:14px 16px;background:var(--c-subtle);border:1px solid var(--c-line);border-radius:11px;margin-bottom:19px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
[data-providers-section] .c-number{font-size:27px;line-height:1;font-weight:550;font-variant-numeric:tabular-nums;letter-spacing:-1px}
[data-providers-section] .c-copy{flex:1;min-width:140px}
[data-providers-section] .c-copy strong{display:block;font-size:13px}
[data-providers-section] .c-copy p{margin:3px 0 0;font-size:11px;color:var(--c-muted)}
[data-providers-section] .c-switch{display:flex;align-items:center;gap:8px;min-height:44px;flex:none;font-size:11px;white-space:nowrap;cursor:pointer}
[data-providers-section] .c-switch input[role=switch]{appearance:none;-webkit-appearance:none;position:relative;width:32px;height:18px;min-height:18px;padding:2px;border:0;border-radius:20px;background:var(--c-faint);cursor:inherit}
[data-providers-section] .c-switch input::before{content:"";display:block;width:14px;height:14px;background:var(--c-bg);border-radius:50%;transition:transform .15s}
[data-providers-section] .c-switch input:checked{background:var(--c-ink)}
[data-providers-section] .c-switch input:checked::before{transform:translateX(14px)}
[data-providers-section] .c-filters{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:13px}
[data-providers-section] .c-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
[data-providers-section] .c-zone{font-size:11px;color:var(--c-faint)}
[data-providers-section] .c-ledger{display:flex;flex-direction:column}
[data-providers-section] .c-labels,[data-providers-section] .c-row-grid{display:grid;--quota-column:minmax(170px,calc((100% - 90px)/2.05));grid-template-columns:minmax(140px,1fr) var(--quota-column) 72px;gap:20px;align-items:center}
[data-providers-section] .c-labels{padding:0 12px 10px;font-size:10px;color:var(--c-faint);border-bottom:1px solid var(--c-line)}
[data-providers-section] .c-row-grid{position:relative;padding:19px 12px;border-bottom:1px solid var(--c-line);min-height:96px;box-sizing:border-box}
[data-providers-section] .c-probe{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);pointer-events:none}
[data-providers-section] .c-row-grid:last-child{border-bottom:0}
[data-providers-section][data-sorting] .c-labels,[data-providers-section][data-sorting] .c-row-grid{grid-template-columns:minmax(0,1fr) var(--quota-column)}
[data-providers-section][data-sorting] .c-labels>span:last-child,[data-providers-section][data-sorting] [data-action=open-provider]{display:none}
[data-providers-section] .c-identity{display:flex;align-items:center;gap:10px;min-width:0}
[data-providers-section] .c-brand{width:26px;height:28px;display:grid;place-items:center;flex:none}
[data-providers-section] .c-name{font-size:13px;font-weight:600;overflow-wrap:anywhere;line-height:20px}
[data-providers-section] .c-name-line{display:flex;align-items:center;flex-wrap:wrap;gap:7px}
[data-providers-section] .c-sub{margin-top:4px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;color:var(--c-faint);font-size:11px}
[data-providers-section] .c-dot{display:inline-block;width:6px;height:6px;flex:none;border-radius:50%;background:var(--c-faint)}
[data-providers-section] .c-dot.good{background:#3b7759}
[data-providers-section] .c-missing{display:flex;flex-direction:column;gap:4px;color:var(--c-faint);font-size:12px;min-height:48px;justify-content:center}
[data-providers-section] .c-crumb{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--c-faint);margin-bottom:21px}
[data-providers-section] .c-crumb button{font-size:11px;color:var(--c-muted);padding:0;display:flex;align-items:center;gap:5px}
[data-providers-section] .c-full{max-width:650px;margin:0 auto}
[data-providers-section] .c-detail-title{padding:0 0 16px;border-bottom:1px solid var(--c-line);margin-bottom:16px}
[data-providers-section] .c-detail-title .c-name{font-size:18px}
[data-providers-section] .c-quota-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:13px}
[data-providers-section] .c-quota-head h3{margin:0;font-size:13px;font-weight:650}
[data-providers-section] .c-quota-list{display:grid;gap:17px}
[data-providers-section] .c-quota-meta{margin-top:12px;display:flex;gap:8px;align-items:center;justify-content:space-between;color:var(--c-faint);font-size:10px;flex-wrap:wrap}
[data-providers-section] .c-empty{color:var(--c-faint);font-size:13px}
[data-providers-section] .c-full [data-provider-card-header]{display:none!important}
[data-providers-section] .c-full [data-provider-body],[data-providers-section] .c-full [data-provider-body][hidden]{display:flex!important;border-top:0;padding-top:8px}
[data-providers-section] .c-plugin [data-provider-quota],[data-providers-section] .c-plugin [data-provider-quota-mini],[data-providers-section] .c-plugin [data-provider-quota-missing]{display:none!important}
[data-providers-section] .c-plugin *:has(> [data-provider-quota]),[data-providers-section] .c-plugin *:has(> [data-provider-quota-mini]){display:none!important}
[data-providers-section] .c-plugin section[aria-label*=usage i],[data-providers-section] .c-plugin section[aria-label*=Usage],[data-providers-section] .c-plugin section[aria-label*=用量]{display:none!important}
[data-providers-section] .c-account{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border:1px solid var(--c-line);border-radius:12px;background:var(--c-subtle);margin:8px 0 18px}
[data-providers-section] .c-account-head{margin:18px 0 10px;font-size:13px;font-weight:650}
[data-providers-section] .c-plugin section[aria-label*=model i] button,[data-providers-section] .c-plugin section[aria-label*=模型] button{min-width:96px}
[data-providers-section] .sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}
@media (max-width:560px){
 [data-providers-section] .c-labels,[data-providers-section] .c-row-grid{grid-template-columns:minmax(0,1fr);gap:10px}
 [data-providers-section] .c-labels{display:none}
 [data-providers-section] .c-row-grid{min-height:0;padding:14px 4px}
}
`
