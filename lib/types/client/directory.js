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
     */
    register(declaration) {
        this.entries.set(declaration.key, {
            role: declaration.role ?? 'llm',
            header: declaration.header ?? 'legacy',
            ...(declaration.usage === undefined ? {} : { usage: declaration.usage }),
        });
        this.notify();
        return () => {
            if (!this.entries.delete(declaration.key))
                return;
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