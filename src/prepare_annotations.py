"""Reduce the raw external annotation downloads to the ClinVar variants/genes we use.

Inputs (downloaded by hand into data/annotations/, gitignored; see SOURCES.md):
  AlphaMissense_hg38.tsv.gz              missense SNV pathogenicity scores
  gnomad.v4.1.constraint_metrics.tsv     gene-level constraint

Outputs (data/annotations/prepared/):
  variant_alphamissense.tsv.gz   chrom,pos,ref,alt,am_pathogenicity   (variant-keyed; read by join_annotations.py)
  gene_constraint.tsv            GeneSymbol,loeuf,lof_pli,mis_z,mis_oe (gene-keyed; read by annotation_features.py)

Only the numeric score is kept. AlphaMissense's `am_class` column is dropped
because its cut-offs were calibrated against ClinVar labels. Nothing here is
simulated; variants without a score stay absent and become NaN downstream.
Usage: python src/prepare_annotations.py
"""
import pandas as pd

from paths import ML_DATASET, ROOT

RAW = ROOT / "data" / "annotations"
OUT = RAW / "prepared"
AM_FILE = RAW / "AlphaMissense_hg38.tsv.gz"
GNOMAD_FILE = RAW / "gnomad.v4.1.constraint_metrics.tsv"


def _chrom(s):
    return s.astype(str).str.replace("chr", "", case=False).str.upper().replace({"M": "MT"})


def prepare_alphamissense():
    clin = pd.read_csv(ML_DATASET, usecols=["Chromosome", "PositionVCF", "ReferenceAlleleVCF", "AlternateAlleleVCF"])
    clin = clin[(clin["ReferenceAlleleVCF"].str.len() == 1) & (clin["AlternateAlleleVCF"].str.len() == 1)]
    keys = set(_chrom(clin["Chromosome"]) + ":" + clin["PositionVCF"].astype(str) + ":"
               + clin["ReferenceAlleleVCF"].str.upper() + ":" + clin["AlternateAlleleVCF"].str.upper())
    print(f"ClinVar SNV keys: {len(keys):,}")
    kept, total = [], 0
    for chunk in pd.read_csv(AM_FILE, sep="\t", comment="#", chunksize=2_000_000,
                             names=["CHROM", "POS", "REF", "ALT", "genome", "uniprot_id", "transcript_id",
                                    "protein_variant", "am_pathogenicity", "am_class"],
                             usecols=["CHROM", "POS", "REF", "ALT", "am_pathogenicity"]):
        total += len(chunk)
        k = _chrom(chunk["CHROM"]) + ":" + chunk["POS"].astype(str) + ":" + chunk["REF"] + ":" + chunk["ALT"]
        kept.append(chunk[k.isin(keys)])
        print(f"  scanned {total:,} AlphaMissense rows", end="\r")
    am = pd.concat(kept)
    # A variant can appear once per transcript; average the transcript scores.
    am = (am.groupby(["CHROM", "POS", "REF", "ALT"], as_index=False)["am_pathogenicity"].mean()
          .rename(columns={"CHROM": "chrom", "POS": "pos", "REF": "ref", "ALT": "alt"}))
    am["chrom"] = _chrom(am["chrom"])
    am.to_csv(OUT / "variant_alphamissense.tsv.gz", sep="\t", index=False)
    print(f"\nAlphaMissense: {len(am):,} ClinVar SNVs scored of {len(keys):,} ({len(am) / len(keys):.1%})")


def prepare_gene_constraint():
    g = pd.read_csv(GNOMAD_FILE, sep="\t", na_values=["NA"])
    g = g[g["canonical"].astype(str).str.lower() == "true"]
    g = g.rename(columns={"gene": "GeneSymbol", "lof.oe_ci.upper": "loeuf", "lof.pLI": "lof_pli",
                          "mis.z_score": "mis_z", "mis.oe": "mis_oe"})
    g = g[["GeneSymbol", "loeuf", "lof_pli", "mis_z", "mis_oe"]].drop_duplicates("GeneSymbol")
    g.to_csv(OUT / "gene_constraint.tsv", sep="\t", index=False)
    print(f"gnomAD constraint: {len(g):,} genes")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    if GNOMAD_FILE.exists():
        prepare_gene_constraint()
    else:
        print(f"skipping gene constraint: {GNOMAD_FILE.name} not found")
    if AM_FILE.exists():
        prepare_alphamissense()
    else:
        print(f"skipping AlphaMissense: {AM_FILE.name} not found")
