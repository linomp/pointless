#!/bin/sh
# Puts the deployable site together: raw site at /, Astro build (astro/dist) at /v2.
# Used by .github/workflows/pages.yml; run locally to preview both: ./assemble.sh _site && busybox httpd -f -p 8000 -h _site
set -e
out=${1:-_site}
rm -rf "$out"
mkdir -p "$out"
cp -r index.html code.html music.html gallery.html contact.html css media CNAME "$out"/
cp -r astro/dist "$out"/v2
