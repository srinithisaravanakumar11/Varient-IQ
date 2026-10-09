"""Attach REAL external annotations (prepared by prepare_annotations.py) to the
engineered ClinVar frame. Values are looked up, never generated; variants or
genes with no match stay NaN and get a median fill (fitted on train only) plus
an explicit "has_*" indicator so the model can tell "missing" from "typical".

Neither source is label-derived: AlphaMissense is trained without human clinical
labels, and gnomAD constraint comes from population variation. See
data/annotations/SOURCES.md for versions and licences.
"""
import pandas as pd

from paths import ROOT

PREP = ROOT / "data" / "annotations" / "prepared"
AM_COLS = ["am_pathogenicity", "has_am"]
GENE_COLS = ["loeuf", "lof_pli", "mis_z", "mis_oe"]


def _chrom(s):
    return s.astype(str).str.replace("chr", "", case=False).str.upper().replace({"M": "MT"})


def add_alphamissense(df):
    f = PREP / "variant_alphamissense.tsv.gz"
    if not f.exists():
        raise SystemExit(f"{f} missing - run src/prepare_annotations.py")
    a = pd.read_csv(f, sep="\t")
    a["variant_key"] = _chrom(a["chrom"]) + ":" + a["pos"].astype(str) + ":" + a["ref"] + ":" + a["alt"]
    df = df.merge(a[["variant_key", "am_pathogenicity"]], on="variant_key", how="left")
    df["has_am"] = df["am_pathogenicity"].notna().astype(int)
    return df


def add_gene_constraint(df):
    f = PREP / "gene_constraint.tsv"
    if not f.exists():
        raise SystemExit(f"{f} missing - run src/prepare_annotations.py")
    g = pd.read_csv(f, sep="\t")
    return df.merge(g, on="GeneSymbol", how="left")


def add_annotations(df, alphamissense=True, gene_constraint=True):
    """Return (df, extra_numeric_columns)."""
    cols = []
    if alphamissense:
        df = add_alphamissense(df)
        cols += AM_COLS
    if gene_constraint:
        df = add_gene_constraint(df)
        cols += GENE_COLS
    return df, cols
