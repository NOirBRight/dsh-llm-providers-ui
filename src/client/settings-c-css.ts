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

[data-providers-section] .c-account{display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:space-between!important;text-align:left!important;gap:12px;padding:12px 14px!important;border:1px solid var(--c-line);border-radius:10px;background:var(--c-subtle);margin:0 0 22px;min-height:0}
[data-providers-section] .c-account-head{margin:22px 0 10px;font-size:13px;font-weight:650}
[data-providers-section] .c-account-copy{display:block!important;flex:1 1 auto;min-width:0;text-align:left!important}
[data-providers-section] .c-account-name{display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:6px;font-size:13px;font-weight:600;text-align:left!important}
[data-providers-section] .c-account-meta{margin-top:3px;font-size:11px;color:var(--c-faint);text-align:left!important}
[data-providers-section] .c-account button{flex:none;min-height:34px}
[data-providers-section] .c-full details.c-advanced{border-top:1px solid var(--c-line);padding-top:17px;margin:16px 0 0;background:transparent}
[data-providers-section] .c-full details.c-advanced>summary{display:flex;align-items:center;gap:8px;padding:0;min-height:20px;list-style:none;cursor:pointer;font-size:13px;font-weight:550}
[data-providers-section] .c-full details.c-advanced>summary::-webkit-details-marker{display:none}
[data-providers-section] .c-full details.c-advanced>summary .c-ico{flex:none;width:13px;height:13px;transition:transform .15s}
[data-providers-section] .c-full details.c-advanced[open]>summary .c-ico{transform:rotate(90deg)}
[data-providers-section] .c-full details.c-advanced>summary .c-advanced-note{margin-left:auto;font-size:11px;font-weight:400;color:var(--c-faint)}
[data-providers-section] .c-full details.c-advanced>section{padding:0}
[data-providers-section] .c-full details.c-advanced>section>section{padding:0}
[data-providers-section] .c-models-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px 12px;flex-wrap:nowrap!important;margin:0 0 10px}
[data-providers-section] .c-models-title{display:flex;align-items:baseline;gap:7px;min-width:0}
[data-providers-section] .c-models-title h3{margin:0;font-size:13px;font-weight:650}
[data-providers-section] .c-models-title .c-count{font-size:11px;color:var(--c-faint)}
[data-providers-section] .c-models-list>*+*{margin-top:16px}
[data-providers-section] .c-model-card{border:1px solid var(--c-line);border-radius:10px;background:var(--c-bg);padding:12px}
[data-providers-section] .c-model-top{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) 32px 32px;gap:10px;align-items:end}
[data-providers-section] .c-field{display:flex;flex-direction:column;gap:4px;min-width:0}
[data-providers-section] .c-field-label{font-size:11px;line-height:1.4;color:var(--c-muted)}
[data-providers-section] .c-input{width:100%;min-width:0;min-height:34px;border:1px solid var(--c-line);border-radius:7px;padding:7px 9px;font:inherit;font-size:12px;color:var(--c-ink);background:var(--c-bg)}
[data-providers-section] .c-icon-only{width:32px;min-width:32px;height:34px;padding:0!important;justify-content:center}
[data-providers-section] .c-icon-only[aria-expanded=true] .c-ico{transform:rotate(90deg)}
[data-providers-section] .c-input[readonly]{background:var(--c-subtle);color:var(--c-muted)}
[data-providers-section] .c-icon-label{gap:6px}
[data-providers-section] .c-icon-label .c-ico{flex:none;width:14px;height:14px}
[data-providers-section] .c-add-model{align-self:flex-start}
[data-providers-section] .c-model-extra{margin-top:10px;padding-top:10px;border-top:1px solid var(--c-line)}
/* Provider fields keep fixed slots so the window field and the capability checks
   never move when an optional field such as the reasoning effort is absent. */
[data-providers-section] .c-extra-grid{display:grid;grid-template-columns:minmax(0,200px) max-content minmax(0,200px);justify-content:start;gap:10px 14px;align-items:end}
[data-providers-section] .c-extra-grid>*{min-width:0}
[data-providers-section] .c-extra-grid>.c-field{max-width:220px}
[data-providers-section] .c-extra-checks{display:flex;align-items:center;gap:16px;flex-wrap:nowrap;min-height:34px;align-self:end}
[data-providers-section] .c-extra-checks label{display:inline-flex;align-items:center;gap:7px;min-height:34px;font-size:12px}
[data-providers-section] .c-extra-checks input[type=checkbox]{accent-color:var(--c-ink);width:15px;height:15px;min-height:0;padding:0;margin:0;flex:none}
[data-providers-section] .c-models-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
[data-providers-section] .c-models-actions .c-btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:6px!important;min-height:34px;padding:6px 10px!important;font-size:12px;line-height:1;white-space:nowrap}
[data-providers-section] .c-models-actions .c-btn.quiet{min-width:96px}
[data-providers-section] .c-models-actions .c-btn .c-ico{display:block;flex:none;width:14px;height:14px}
[data-providers-section] .c-models-actions .c-btn.quiet{border-color:transparent!important;background:transparent!important}
[data-providers-section] .c-models-actions .c-btn.quiet:hover{background:var(--c-hover)!important}
[data-providers-section] .c-models-actions .c-btn[disabled]{opacity:.5;cursor:default}
[data-providers-section] .c-models-hint{margin:0 0 12px;font-size:11px;color:var(--c-faint)}
[data-providers-section] .c-plugin .c-sort{min-width:96px}
[data-providers-section] .c-full [data-sortable-move]{display:none!important}
[data-providers-section] .c-full [data-sortable-row]:has([data-sortable-handle]:not([hidden])){grid-template-columns:32px minmax(0,1fr)!important;align-items:center}
[data-providers-section] .c-full [data-sortable-row]:has([data-sortable-handle]:not([hidden])) [data-sortable-handle]{width:32px!important;min-width:32px!important;min-height:32px;align-self:center}
[data-providers-section] .c-notice{margin:0;color:var(--c-muted);font-size:12px;line-height:1.5}
[data-providers-section] .c-account-actions{display:flex;align-items:center;gap:8px;flex:none}
[data-providers-section] .c-account-body{margin-top:10px}
[data-providers-section] .c-advanced-content{display:flex;flex-direction:column;gap:16px;margin-top:18px;padding:0 1px}
[data-providers-section] .c-control{display:flex;flex-direction:column;gap:4px}
[data-providers-section] .c-checkbox-field{display:flex;align-items:flex-start;gap:7px;font-size:12px;font-weight:500;min-height:0}
[data-providers-section] .c-checkbox-field input[type=checkbox]{accent-color:var(--c-ink);width:15px;height:15px;min-height:0;padding:0;margin:3px 0 0;flex:none}
[data-providers-section] .c-field-hint{margin:0;padding-left:22px;font-size:11px;color:var(--c-faint);line-height:1.65}
[data-providers-section] .c-advanced>summary .c-ico{flex:none;transition:transform .15s ease}
[data-providers-section] .c-advanced[open]>summary .c-ico{transform:rotate(90deg)}
[data-providers-section] .c-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:14px;border-top:1px solid var(--c-line);color:var(--c-faint);font-size:11px}
[data-providers-section] .c-draft{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:16px;padding:10px 14px;border-top:1px solid var(--c-line);background:var(--c-subtle);font-size:12px}
[data-providers-section] .c-draft-actions{display:flex;align-items:center;gap:7px;margin-left:auto}
[data-providers-section] .sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}
@media (max-width:560px){
 [data-providers-section] .c-note{display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px 10px;align-items:start;padding:12px 14px}
 [data-providers-section] .c-note .c-copy{min-width:0}
 [data-providers-section] .c-note .c-switch{grid-column:1 / -1;justify-content:space-between;width:100%;min-height:36px;margin-top:2px;padding-top:8px;border-top:1px solid var(--c-line)}
 [data-providers-section] .c-labels,[data-providers-section] .c-row-grid{grid-template-columns:minmax(0,1fr);gap:10px}
 [data-providers-section] .c-labels{display:none}
 [data-providers-section] .c-row-grid{min-height:0;padding:14px 4px}
}
@media (max-width:760px){
 /* The scroll pane keeps 24px of right padding while the dialog header keeps 14px,
    so the column sat 10px left of the header controls. Stretch it back in line.
    ponytail: this +10px assumes an overlay scrollbar (mobile/WebView). With a classic
    scrollbar the pane is inset by its width; move the scrollbar onto the dialog if
    that ever needs to be exact on desktop too. */
 [data-providers-section]{width:calc(100% + 10px);margin-right:-10px}
 [data-providers-section] .c-full{max-width:none;margin:0}
 [data-providers-section] .c-account{flex-wrap:wrap;gap:10px}
 [data-providers-section] .c-quota-meta{flex-direction:column;align-items:flex-start;gap:4px}
 [data-providers-section] .c-models-head{gap:8px!important;flex-wrap:nowrap!important}
 [data-providers-section] .c-models-title{width:auto!important;flex:1 1 auto;min-width:6ch;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 [data-providers-section] .c-models-actions{margin-left:auto}
 [data-providers-section] .c-models-actions{flex:0 0 auto;flex-wrap:nowrap!important}
 [data-providers-section] .c-filters .c-btn{min-height:28px!important;padding:4px 11px!important;font-size:12px;line-height:1.2}
}
/* Narrow phones: keep the heading and all three actions on one row by tightening
   the toolbar rather than wrapping it (the prototype keeps one row). */
@media (max-width:520px){
 [data-providers-section] .c-extra-grid{grid-auto-flow:row;grid-template-columns:minmax(0,1fr)}
 [data-providers-section] .c-extra-grid>*{max-width:none}
 [data-providers-section] .c-account{flex-direction:column!important;align-items:flex-start!important}
 [data-providers-section] .c-plugin .c-sort{min-width:0!important}
 [data-providers-section] .c-models-actions .c-btn,
 [data-providers-section] .c-models-actions .c-btn.quiet{padding:4px 8px!important;font-size:11px!important;line-height:1;min-height:30px!important;gap:5px!important}
 [data-providers-section] .c-models-actions .c-btn .c-ico,
 [data-providers-section] .c-models-actions .c-btn.quiet .c-ico{width:13px!important;height:13px!important;flex:none}
 [data-providers-section] .c-models-actions{gap:4px}
 [data-providers-section] .c-models-title h3{font-size:13px}
 [data-providers-section] .c-models-title .c-count{font-size:11px}
 [data-providers-section] .c-filters{flex-wrap:nowrap!important;gap:8px}
 [data-providers-section] .c-filters .c-row{display:flex;gap:6px;flex:none}
 [data-providers-section] .c-filters .c-zone{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right}
 [data-providers-section] .c-filters .c-btn{height:26px!important;min-height:26px!important;max-height:26px!important;padding:0 10px!important;font-size:11px;line-height:1;display:inline-flex!important;align-items:center;justify-content:center;flex:none}
 [data-providers-section] .c-detail-title .c-name{font-size:16px}
 [data-providers-section] .c-quota-head h3{font-size:12px}
}
@media (max-width:430px){
 [data-providers-section] .c-models-head{gap:4px!important}
 [data-providers-section] .c-models-title{min-width:0!important;flex:1 1 auto}
 [data-providers-section] .c-models-actions{gap:3px!important}
 [data-providers-section] .c-models-actions .c-btn,
 [data-providers-section] .c-models-actions .c-btn.quiet{padding:3px 6px!important;gap:4px!important;min-width:0!important}
 [data-providers-section] .c-models-actions .c-btn .c-ico,
 [data-providers-section] .c-models-actions .c-btn.quiet .c-ico{width:12px!important;height:12px!important}
}
/* Reserve the scrollbar gutter inside the providers dialog so content never
   shifts sideways when the detail grows past the viewport. */

`
