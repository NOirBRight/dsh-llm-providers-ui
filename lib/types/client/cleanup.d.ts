type Disposer = () => void;
/**
 * Dispose resources in reverse registration order while attempting every disposer.
 * Nested AggregateErrors are flattened into one ordered error list.
 * @param disposers - Disposers in registration order; missing entries are skipped.
 * @param message - Message used when more than one cleanup error remains.
 */
export declare function disposeReverse(disposers: readonly (Disposer | undefined)[], message: string): void;
/**
 * Roll back resources after setup while keeping the setup error first.
 * @param setupError - Original setup failure to preserve as the first error.
 * @param disposers - Disposers in registration order for the partial setup.
 * @param message - Message for the setup-and-cleanup AggregateError.
 */
export declare function disposeAfterSetup(setupError: unknown, disposers: readonly (Disposer | undefined)[], message: string): never;
export {};
//# sourceMappingURL=cleanup.d.ts.map