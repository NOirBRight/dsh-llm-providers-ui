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
[data-providers-section] .c-full{display:flex;flex-direction:column;width:100%;min-width:0;max-width:650px;margin:0 auto;padding-bottom:12px;box-sizing:border-box}
[data-providers-section] .c-full *{min-width:0;box-sizing:border-box}
[data-providers-section] .c-plugin,[data-providers-section] .c-plugin [data-provider-slot],[data-providers-section] .c-plugin [data-provider-card],[data-providers-section] .c-plugin [data-provider-body]{display:contents!important}
[data-providers-section] .c-plugin [data-provider-body]>p{margin:0 0 16px;color:var(--c-muted);font-size:12px}
[data-providers-section] .c-detail-title{padding:0 0 16px;border-bottom:1px solid var(--c-line);margin-bottom:16px}
[data-providers-section] .c-detail-title .c-name{font-size:18px}
[data-providers-section] .c-quota-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:13px}
[data-providers-section] .c-quota-head h3{margin:0;font-size:13px;font-weight:650}
[data-providers-section] .c-quota-list{display:grid;gap:17px}
[data-providers-section] .c-quota-meta{margin-top:12px;display:flex;gap:8px;align-items:center;justify-content:space-between;color:var(--c-faint);font-size:10px;flex-wrap:wrap}
[data-providers-section] .c-empty{color:var(--c-faint);font-size:13px}
[data-providers-section] .c-full [data-provider-card-header]{display:none!important}
[data-providers-section] .c-full [data-provider-body],[data-providers-section] .c-full [data-provider-body][hidden]{display:contents!important}
[data-providers-section] .c-full [data-provider-card]{display:contents!important}
[data-providers-section] .c-plugin [data-provider-quota],[data-providers-section] .c-plugin [data-provider-quota-mini],[data-providers-section] .c-plugin [data-provider-quota-missing]{display:none!important}
[data-providers-section] .c-plugin *:has(> [data-provider-quota]),[data-providers-section] .c-plugin *:has(> [data-provider-quota-mini]){display:none!important}
[data-providers-section] .c-plugin section[aria-label*=usage i],[data-providers-section] .c-plugin section[aria-label*=Usage],[data-providers-section] .c-plugin section[aria-label*=用量]{display:none!important}
[data-providers-section] .c-account{display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:space-between!important;text-align:left!important;gap:12px;padding:12px 14px!important;border:1px solid var(--c-line);border-radius:12px;background:var(--c-subtle);margin:0 0 22px;min-height:0}
[data-providers-section] .c-account-head{margin:22px 0 10px;font-size:13px;font-weight:650}
[data-providers-section] .c-account-copy{display:block!important;flex:1 1 auto;min-width:0;text-align:left!important}
[data-providers-section] .c-account-name{display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:6px;font-size:13px;font-weight:600;text-align:left!important}
[data-providers-section] .c-account-meta{margin-top:3px;font-size:11px;color:var(--c-faint);text-align:left!important}
[data-providers-section] .c-account button{flex:none;min-height:34px}
[data-providers-section] .c-full details.c-advanced{border:1px solid var(--c-line);border-radius:12px;margin:6px 0 0;background:transparent}
[data-providers-section] .c-full details.c-advanced>summary{display:flex;align-items:center;gap:8px;padding:12px 14px;min-height:44px;list-style:none;cursor:pointer;font-size:13px;font-weight:650}
[data-providers-section] .c-full details.c-advanced>summary::-webkit-details-marker{display:none}
[data-providers-section] .c-full details.c-advanced>summary .c-ico{flex:none;transition:transform .15s}
[data-providers-section] .c-full details.c-advanced[open]>summary .c-ico{transform:rotate(90deg)}
[data-providers-section] .c-full details.c-advanced>summary .c-advanced-note{margin-left:auto;font-size:11px;font-weight:400;color:var(--c-faint)}
[data-providers-section] .c-full details.c-advanced>section{padding:0 14px 16px}
[data-providers-section] .c-full details.c-advanced>section>section{padding:0}
[data-providers-section] .c-models-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px 12px;flex-wrap:wrap!important;margin:0 0 10px}
[data-providers-section] [data-provider-models]{margin-top:22px}
[data-providers-section] .c-models-title{display:flex;align-items:baseline;gap:7px;min-width:0}
[data-providers-section] .c-models-title h3{margin:0;font-size:13px;font-weight:650}
[data-providers-section] .c-models-title .c-count{font-size:11px;color:var(--c-faint)}
[data-providers-section] .c-models-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
[data-providers-section] .c-models-actions .c-btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:6px!important;min-height:34px;padding:6px 10px!important;font-size:12px;line-height:1;white-space:nowrap}
[data-providers-section] .c-models-actions .c-btn .c-ico{display:block;flex:none;width:14px;height:14px}
[data-providers-section] .c-models-actions .c-btn.quiet{border-color:transparent!important;background:transparent!important}
[data-providers-section] .c-models-actions .c-btn.quiet:hover{background:var(--c-hover)!important}
[data-providers-section] .c-models-actions .c-btn[disabled]{opacity:.5;cursor:default}
[data-providers-section] .c-models-hint{margin:0 0 12px;font-size:11px;color:var(--c-faint)}
[data-providers-section] .c-plugin .c-sort{min-width:96px}
[data-providers-section] .c-full [data-sortable-move]{display:none!important}
[data-providers-section] .c-full [data-sortable-row]:has([data-sortable-handle]:not([hidden])){grid-template-columns:32px minmax(0,1fr)!important;align-items:center}
[data-providers-section] .c-full [data-sortable-row]:has([data-sortable-handle]:not([hidden])) [data-sortable-handle]{width:32px!important;min-width:32px!important;min-height:32px;align-self:center}
[data-providers-section] .c-full [data-provider-model]{grid-template-columns:minmax(0,1.15fr) minmax(0,1fr) 32px 32px!important;align-items:center!important;column-gap:8px;row-gap:4px;padding:10px 8px!important}
[data-providers-section] .c-full [data-provider-model]>.c-field-label{grid-row:1;font-size:11px;color:var(--c-muted);line-height:1.2;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
[data-providers-section] .c-full [data-provider-model]>.c-field-label:nth-of-type(1){grid-column:1}
[data-providers-section] .c-full [data-provider-model]>.c-field-label:nth-of-type(2){grid-column:2}
[data-providers-section] .c-full [data-provider-model]>input:nth-of-type(1){grid-column:1;grid-row:2}
[data-providers-section] .c-full [data-provider-model]>input:nth-of-type(2){grid-column:2;grid-row:2}
[data-providers-section] .c-full [data-provider-model]>button{grid-row:2;align-self:center;justify-self:center;width:32px;height:32px;min-height:32px}
[data-providers-section] .c-full [data-provider-model]>button[aria-expanded]{grid-column:3}
[data-providers-section] .c-full [data-provider-model]>button:not([aria-expanded]){grid-column:4}
[data-providers-section] .c-full [data-sortable-row]:has([data-sortable-handle]:not([hidden])) [data-provider-model]{grid-template-columns:minmax(0,1.15fr) minmax(0,1fr) 32px!important}
[data-providers-section] .c-full [data-sortable-row]:has([data-sortable-handle]:not([hidden])) [data-provider-model]>button[aria-expanded]{display:none!important}
[data-providers-section] .c-full [data-sortable-row]:has([data-sortable-handle]:not([hidden])) [data-provider-model]>button:not([aria-expanded]){grid-column:3}
[data-providers-section] .c-full [data-sortable-row]:has([data-sortable-handle]:not([hidden])) [data-provider-model] input{pointer-events:none;background:var(--c-subtle);color:var(--c-muted);border-color:var(--c-line)}
[data-providers-section] .c-notice{margin:0;color:var(--c-muted);font-size:12px;line-height:1.5}
[data-providers-section] .c-account-actions{display:flex;align-items:center;gap:8px;flex:none}
[data-providers-section] .c-account-body{margin-top:10px}
[data-providers-section] .c-advanced-body{padding:0 14px 16px}
[data-providers-section] .c-advanced>summary .c-ico{flex:none}
[data-providers-section] .c-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:14px;border-top:1px solid var(--c-line);color:var(--c-faint);font-size:11px}
[data-providers-section] .c-draft{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 0 20px}
[data-providers-section] .sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}
@media (max-width:560px){
 [data-providers-section] .c-labels,[data-providers-section] .c-row-grid{grid-template-columns:minmax(0,1fr);gap:10px}
 [data-providers-section] .c-labels{display:none}
 [data-providers-section] .c-row-grid{min-height:0;padding:14px 4px}
}
@media (max-width:760px){
 /* The scroll pane keeps 24px of right padding while the dialog header keeps 14px,
    so the column sat 10px left of the header controls. Stretch it back in line. */
 [data-providers-section]{width:calc(100% + 10px);margin-right:-10px}
 [data-providers-section] .c-full{max-width:none;margin:0}
 [data-providers-section] .c-account{flex-wrap:wrap;gap:10px}
 [data-providers-section] .c-quota-meta{flex-direction:column;align-items:flex-start;gap:4px}
 [data-providers-section] .c-models-head{gap:8px!important;flex-wrap:nowrap!important}
 [data-providers-section] .c-models-title{width:auto!important;flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 [data-providers-section] .c-models-actions{flex:0 0 auto;flex-wrap:nowrap!important}
 [data-providers-section] .c-filters .c-btn{min-height:28px!important;padding:4px 11px!important;font-size:12px;line-height:1.2}
 [data-providers-section] .c-full [data-provider-model]{grid-template-columns:minmax(0,1fr) minmax(0,1fr) 32px!important;column-gap:6px}
 [data-providers-section] .c-full [data-provider-model]>button[aria-expanded]{grid-column:3;grid-row:1}
 [data-providers-section] .c-full [data-provider-model]>button:not([aria-expanded]){grid-column:3;grid-row:2}
}
@media (max-width:520px){
 [data-providers-section] .c-full [data-provider-model]{grid-template-columns:minmax(0,1fr) 32px!important;row-gap:4px}
 [data-providers-section] .c-full [data-provider-model]>.c-field-label:nth-of-type(1){grid-column:1;grid-row:1}
 [data-providers-section] .c-full [data-provider-model]>input:nth-of-type(1){grid-column:1;grid-row:2}
 [data-providers-section] .c-full [data-provider-model]>.c-field-label:nth-of-type(2){grid-column:1;grid-row:3}
 [data-providers-section] .c-full [data-provider-model]>input:nth-of-type(2){grid-column:1;grid-row:4}
 [data-providers-section] .c-full [data-provider-model]>button{grid-row:1/span 4;grid-column:2}
 [data-providers-section] .c-account{flex-direction:column!important;align-items:flex-start!important}
 [data-providers-section] .c-plugin .c-sort{min-width:0!important}
 [data-providers-section] .c-models-actions .c-btn{padding:5px 7px!important;font-size:11px;min-height:30px}
 [data-providers-section] .c-models-title h3{font-size:13px}
 [data-providers-section] .c-models-title .c-count{font-size:11px}
 [data-providers-section] .c-filters .c-btn{min-height:26px!important;padding:3px 10px!important;font-size:11px}
 [data-providers-section] .c-detail-title .c-name{font-size:16px}
 [data-providers-section] .c-quota-head h3{font-size:12px}
}
/* Reserve the scrollbar gutter inside the providers dialog so content never
   shifts sideways when the detail grows past the viewport. */

`
