/** Open registration service for Provider card roles and quota readers. */
/** Lets client plugins publish their Provider card role and optional quota reader. */
export class ProviderDirectory {
    entries = new Map();
    listeners = new Set();
    /**
     * Publish a Provider declaration.
     * @param declaration - Card key, role, and optional quota reader.
     * @returns A disposer that removes the declaration.
     */
    register(declaration) {
        this.entries.set(declaration.key, {
            role: declaration.role ?? 'llm',
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
    notify() {
        for (const listener of this.listeners)
            listener();
    }
}
//# sourceMappingURL=directory.js.map