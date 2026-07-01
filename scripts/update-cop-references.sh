#!/usr/bin/env bash
# scripts/update-cop-references.sh
# Fetches Red Hat CoP automation good practices AsciiDoc sections
# and distributes them to plugin references/ directories.

set -euo pipefail

REPO="redhat-cop/automation-good-practices"
REF="main"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --ref) REF="$2"; shift 2 ;;
    *) echo "Usage: $0 [--ref <tag-or-sha>]" >&2; exit 1 ;;
  esac
done

BASE_URL="https://raw.githubusercontent.com/${REPO}/${REF}"

SECTIONS=(
  structures roles collections playbooks inventories plugins coding_style
  aap_configuration cicd_and_promotion git_workflow naming_conventions
  security testing
)

# Where this script lives — resolve to repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Section-to-plugin mapping
declare -A SECTION_MAP=(
  [structures]="ansible-good-practices,ansible-zen"
  [roles]="ansible-good-practices,ansible-scaffold-role,ansible-scaffold-collection"
  [collections]="ansible-good-practices,ansible-scaffold-collection"
  [playbooks]="ansible-good-practices"
  [inventories]="ansible-good-practices"
  [plugins]="ansible-good-practices"
  [coding_style]="ansible-good-practices,ansible-scaffold-role,ansible-scaffold-collection,ansible-scaffold-ee"
  [aap_configuration]="ansible-good-practices"
  [cicd_and_promotion]="ansible-good-practices,ansible-scaffold-collection"
  [git_workflow]="ansible-good-practices"
  [naming_conventions]="ansible-good-practices,ansible-scaffold-role,ansible-scaffold-collection"
  [security]="ansible-good-practices,ansible-scaffold-role"
  [testing]="ansible-good-practices,ansible-scaffold-role,ansible-scaffold-collection"
)

echo "Fetching CoP references from ${REPO}@${REF}..."

TMPDIR=$(mktemp -d)
trap 'rm -rf "${TMPDIR}"' EXIT

FAILED=0
for section in "${SECTIONS[@]}"; do
  url="${BASE_URL}/${section}/README.adoc"
  dest="${TMPDIR}/${section}.adoc"
  echo "  Fetching ${section}/README.adoc..."
  if ! curl -fsSL -o "${dest}" "${url}"; then
    echo "  ERROR: Failed to fetch ${url}" >&2
    FAILED=1
    continue
  fi
done

if [[ ${FAILED} -eq 1 ]]; then
  echo "ERROR: Some sections failed to fetch. Aborting." >&2
  exit 1
fi

# Distribute to plugins
for section in "${SECTIONS[@]}"; do
  src="${TMPDIR}/${section}.adoc"
  IFS=',' read -ra targets <<< "${SECTION_MAP[${section}]}"
  for plugin in "${targets[@]}"; do
    plugin_refs="${REPO_ROOT}/${plugin}/references"
    mkdir -p "${plugin_refs}"
    cp "${src}" "${plugin_refs}/${section}.adoc"
    echo "  -> ${plugin}/references/${section}.adoc"
  done
done

echo "Done. All references updated from ${REPO}@${REF}."
