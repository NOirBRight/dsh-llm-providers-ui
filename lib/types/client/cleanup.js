function flattenCleanupError(error, output) {
    if (error instanceof AggregateError && error.errors.length > 0) {
        for (const nested of error.errors)
            flattenCleanupError(nested, output);
        return;
    }
    output.push(error);
}
function collectCleanupFailures(disposers) {
    const failures = [];
    for (let index = disposers.length - 1; index >= 0; index -= 1) {
        const disposer = disposers[index];
        if (disposer === undefined)
            continue;
        try {
            disposer();
        }
        catch (error) {
            flattenCleanupError(error, failures);
        }
    }
    return failures;
}
function throwCleanupFailures(failures, message) {
    if (failures.length === 0)
        return;
    if (failures.length === 1)
        throw failures[0];
    throw new AggregateError(failures, message);
}
/**
 * Dispose resources in reverse registration order while attempting every disposer.
 * Nested AggregateErrors are flattened into one ordered error list.
 * @param disposers - Disposers in registration order; missing entries are skipped.
 * @param message - Message used when more than one cleanup error remains.
 */
export function disposeReverse(disposers, message) {
    throwCleanupFailures(collectCleanupFailures(disposers), message);
}
/**
 * Roll back resources after setup while keeping the setup error first.
 * @param setupError - Original setup failure to preserve as the first error.
 * @param disposers - Disposers in registration order for the partial setup.
 * @param message - Message for the setup-and-cleanup AggregateError.
 */
export function disposeAfterSetup(setupError, disposers, message) {
    const failures = collectCleanupFailures(disposers);
    if (failures.length === 0)
        throw setupError;
    throw new AggregateError([setupError, ...failures], message);
}
//# sourceMappingURL=cleanup.js.map