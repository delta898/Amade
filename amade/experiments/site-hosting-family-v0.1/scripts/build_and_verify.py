#!/usr/bin/env python3
"""Materialize two family Sites and build each template A→B→A."""
from pathlib import Path
import hashlib, os, shutil, subprocess, sys
ROOT=Path(__file__).resolve().parents[1]
REPO_ROOT=ROOT.parents[2]
OUT=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path('/private/tmp/amade-site-hosting-v01-proof')
if OUT.exists(): raise SystemExit(f'Refusing to overwrite existing path: {OUT}')
OUT.mkdir(parents=True)
FAMILIES={'personal-homepage':['personal-post-list','personal-card-grid'],'company-homepage':['company-service-cards','company-service-list']}
def hashes(folder):
 return {str(p.relative_to(folder)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(folder.rglob('*')) if p.is_file()}
for family,(a,b) in FAMILIES.items():
 site=OUT/'sites'/family;site.mkdir(parents=True);data=site/'site-data';shutil.copytree(REPO_ROOT/'amade'/'families'/family/'data',data);before=hashes(data)
 for tid in (a,b,a):
  target=site/'template'/'astro'
  if target.exists():shutil.rmtree(target)
  target.parent.mkdir(parents=True,exist_ok=True);shutil.copytree(REPO_ROOT/'amade'/'templates'/tid/'astro',target)
  assert 'families/' not in (target/'src/content.config.ts').read_text(),f'{tid}: tied to Amade source tree'
  subprocess.run(['npm','ci','--offline','--ignore-scripts','--no-audit','--no-fund'],cwd=target,check=True,stdout=subprocess.DEVNULL)
  subprocess.run(['npm','run','build'],cwd=target,check=True,env={**os.environ,'BLOGGENIUS_SITE_URL':'https://example.test/'})
  saved=OUT/'builds'/tid
  if saved.exists():shutil.rmtree(saved)
  shutil.copytree(target/'dist',saved)
 after=hashes(data);assert before==after,f'{family}: site-data changed during template conversion'
 print(f'PASS {family} A→B→A: {len(before)} durable data/media files unchanged')
subprocess.run([sys.executable,str(ROOT/'scripts/verify_builds.py'),str(OUT)],check=True)
print(f'Proof output: {OUT}')
