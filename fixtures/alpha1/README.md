# Alpha.1 fixture provenance

These 82 archives are the exact offline-install closure for this package's DSH peers and their published package dependencies. `PROVENANCE.json` records one exact `package@version` node for each archive and every locked `parentKey` to `childKey` dependency edge, including available optional peers. Conflicting ranges retain both `negotiator@0.6.4` and `negotiator@1.0.0`.

DSH packages and vendored Cordis packages are recorded from the clean official checkout at `dsh-v0.1.2-alpha.1` and revision `cd5ef8148158c3a752a658978873241fdf8e2bbc`. Registry packages retain their archive digest. The archives are test-only inputs and are not included in the plugin tarball.

## Regenerate

1. Obtain the clean checkout of https://github.com/deepseek-ai/deepseek-harness.git at the recorded tag and verify its revision.
2. Install and build that checkout with its pinned package manager and official scripts without changing manifests or adding source declarations.
3. Pack each DSH package in the recorded closure and obtain the exact registry archives at the recorded versions.
4. Recompute each node's byte size, SHA-256, and integrity, then regenerate the locked edges from the archive manifests.
5. Run `node scripts/check-pack.mjs`.

The workspace-level alpha.1 overrides are intentionally unshipped; they make local development reproducible without changing the published package manifest.
