/** Open registration service for Provider card roles and quota readers. */
/** Lets client plugins publish their Provider card role and optional quota reader. */
export class ProviderDirectory {
    entries = new Map();
    listeners = new Set();
    invalidationListeners = new Set();
    /**
    * Publish a Provider declaration.
    * @param declaration - Card key, role, and optional quota reader.
    * @returns A disposer that removes the declaration.
     * @throws {Error} When the card key, catalog route, or native binding descriptor conflicts with an active registration.
     */
    register(declaration) {
        if (this.entries.has(declaration.key))
            throw new Error('Provider key is already registered: ' + declaration.key);
        if (declaration.catalogId === '')
            throw new Error('Provider catalogId must not be empty');
        if (declaration.binding !== undefined && (declaration.binding.channel === '' || declaration.binding.endpoint === '')) {
            throw new Error('Provider binding channel and endpoint must not be empty');
        }
        if (declaration.catalogId !== undefined) {
            for (const [key, entry] of this.entries) {
                if (key !== declaration.key && entry.catalogId === declaration.catalogId) {
                    throw new Error('Provider catalogId is already registered: ' + declaration.catalogId);
                }
            }
        }
        const entry = {
            ...(declaration.name === undefined ? {} : { name: declaration.name }),
            role: declaration.role ?? 'llm',
            header: declaration.header ?? 'legacy',
            detail: declaration.detail ?? 'legacy',
            ...(declaration.usage === undefined ? {} : { usage: declaration.usage }),
            ...(declaration.account === undefined ? {} : { account: declaration.account }),
            ...(declaration.catalogId === undefined ? {} : { catalogId: declaration.catalogId }),
            ...(declaration.binding === undefined ? {} : { binding: { channel: declaration.binding.channel, endpoint: declaration.binding.endpoint } }),
            ...(declaration.modelCount === undefined ? {} : { modelCount: declaration.modelCount }),
        };
        this.entries.set(declaration.key, entry);
        this.notify();
        return () => {
            if (this.entries.get(declaration.key) !== entry)
                return;
            this.entries.delete(declaration.key);
            this.notify();
        };
    }
    /**
     * Read a Provider role, defaulting undeclared cards to LLM.
     * @param key - Provider card key.
     * @returns The published role or LLM for an undeclared card.
     */
    roleOf(key) {
        return this.entries.get(key)?.role ?? 'llm';
    }
    /**
     * Read who renders a Provider header, defaulting undeclared cards to legacy.
     * The shell renders its fallback badge only for legacy cards.
     * @param key - Provider card key.
     * @returns shared for migrated cards, legacy otherwise.
     */
    headerOf(key) {
        return this.entries.get(key)?.header ?? 'legacy';
    }
    /**
     * Read the optional quota reader for a Provider card.
     * @param key - Provider card key.
     * @returns The published reader, if any.
     */
    reader(key) {
        return this.entries.get(key)?.usage;
    }
    /**
     * Read who renders the expanded detail.
     * @param key - Provider card key.
     * @returns shared for migrated cards, legacy otherwise.
     */
    detailOf(key) {
        return this.entries.get(key)?.detail ?? 'legacy';
    }
    /** Display name for the overview and detail title. */
    nameOf(key) {
        return this.entries.get(key)?.name;
    }
    /** Active model count, or undefined when the plugin does not report one. */
    modelCountOf(key) {
        return this.entries.get(key)?.modelCount?.();
    }
    /**
     * Tell listeners a provider's reported state changed (auth, models, label).
     * @param key - provider card key whose metadata changed.
     */
    update(key) {
        if (!this.entries.has(key))
            return;
        this.notify();
    }
    /** Overview connection only. Never returns an email. */
    accountOf(key) {
        return this.entries.get(key)?.account?.();
    }
    /** Live catalog-group-id → card-key map for picker/settings sort. */
    catalogRoutes() {
        const routes = {};
        for (const [key, entry] of this.entries) {
            if (entry.catalogId !== undefined)
                routes[entry.catalogId] = key;
        }
        return routes;
    }
    /**
     * Native-agent binding descriptors. Derived from Agent entries that published both `catalogId` and `binding`.
     * @returns One descriptor per registered native agent; empty when none are declared.
     */
    nativeBindings() {
        const bindings = [];
        for (const entry of this.entries.values()) {
            if (entry.role !== 'agent' || entry.catalogId === undefined || entry.binding === undefined)
                continue;
            bindings.push({ provider: entry.catalogId, channel: entry.binding.channel, endpoint: entry.binding.endpoint });
        }
        return bindings;
    }
    /**
     * Subscribe to changes in registered Providers.
     * @param listener - Called after a declaration is added or removed.
     * @returns A disposer that stops notifications.
     */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    }
    /**
     * Signal that cached quota for a key is no longer valid. Providers call
     * this immediately after sign-out or account switch; the shell purges the
     * sidebar cache and refetches, so the previous account's quota never lingers
     * as a stale tile. Transient read errors still show stale data by design.
     * @param key - Provider card key whose quota cache must drop.
     */
    invalidateUsage(key) {
        for (const listener of this.invalidationListeners)
            listener(key);
    }
    /**
     * Subscribe to quota-invalidation signals.
     * @param listener - Called with the key whose cache must drop.
     * @returns A disposer that stops notifications.
     */
    onInvalidateUsage(listener) {
        this.invalidationListeners.add(listener);
        return () => { this.invalidationListeners.delete(listener); };
    }
    notify() {
        for (const listener of this.listeners)
            listener();
    }
}
//# sourceMappingURL=directory.js.map