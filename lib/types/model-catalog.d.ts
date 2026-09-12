/**
 * Stable built ESM re-export for the shared model catalog editor and picker.
 * Provider plugins acquire these from dsh-llm-providers-ui/model-catalog, never from source.
 * @module dsh-llm-providers-ui/model-catalog
 */
export { ModelCatalogCapabilities, ModelCatalogDetails, ModelCatalogRow, ModelCatalogRowGrid, catalogStyles, inputStyle, rowInputStyle, selectStyle, fieldStyle, labelStyle, } from './client/model-catalog-ui.js';
export { applyCatalogPatch, ModelCatalogEditor } from './client/ModelCatalogEditor.js';
export type { CatalogPatch, ModelCatalogDraft, ModelCatalogFields, ModelCatalogLabels } from './client/ModelCatalogEditor.js';
export { ModelPickerDialog } from './client/ModelPickerDialog.js';
export type { ModelPickerCandidate, ModelPickerLabels, ModelPickerSection } from './client/ModelPickerDialog.js';
//# sourceMappingURL=model-catalog.d.ts.map