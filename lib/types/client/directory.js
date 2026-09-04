/** Open port: LLM and native-agent plugins declare role and quota readers here. */
/** Client service named providerDirectory. */
export class ProviderDirectory {
    items = new Map();
    listeners = new Set();
    register(declaration) {
        this.items.set(declaration.key, {
            role: declaration.role ?? 'llm',
            ...(declaration.usage === undefined ? {} : { usage: declaration.usage }),
        });
        this.emit();
        return () => {
            this.items.delete(declaration.key);
            this.emit();
        };
    }
    roleOf(key) {
        return this.items.get(key)?.role ?? 'llm';
    }
    reader(key) {
        return this.items.get(key)?.usage;
    }
    hasReader(key) {
        return this.items.get(key)?.usage !== undefined;
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    }
    emit() {
        for (const listener of this.listeners)
            listener();
    }
}
//# sourceMappingURL=directory.js.map