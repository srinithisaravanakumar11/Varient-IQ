# External annotation sources

Downloaded 2026-10-09. Raw files are gitignored; `src/prepare_annotations.py` reduces them to `prepared/`.

| File | Source | Version | Licence | Used for |
|---|---|---|---|---|
| `AlphaMissense_hg38.tsv.gz` | https://storage.googleapis.com/dm_alphamissense/AlphaMissense_hg38.tsv.gz (Google DeepMind, Cheng et al. 2023, Science) | hg38 release | CC BY-NC-SA 4.0 (non-commercial) | `am_pathogenicity` for missense SNVs. `am_class` is NOT used (cut-offs calibrated on ClinVar). |
| `gnomad.v4.1.constraint_metrics.tsv` | https://storage.googleapis.com/gcp-public-data--gnomad/release/4.1/constraint/gnomad.v4.1.constraint_metrics.tsv (gnomAD) | v4.1 | gnomAD terms of use (open) | Gene-level `loeuf` (lof.oe_ci.upper), `lof_pli`, `mis_z`, `mis_oe` on canonical transcripts. |
