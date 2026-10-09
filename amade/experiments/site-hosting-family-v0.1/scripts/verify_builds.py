#!/usr/bin/env python3
"""Verify built artifacts copied to <proof-root>/builds by build_and_verify.py."""
from html.parser import HTMLParser
from pathlib import Path
import sys, json
ROOT=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parents[1]
SOURCE=Path(sys.argv[2]).resolve() if len(sys.argv)>2 else Path(__file__).resolve().parents[4]
def read_manifest(reference, area):
 ref=Path(reference)
 expected_prefix='amade/families' if area=='families' else 'amade/templates'
 assert not ref.is_absolute() and '..' not in ref.parts and str(ref).startswith(expected_prefix + '/'), f'unsafe {area} manifest reference: {reference}'
 path=(SOURCE/ref).resolve()
 assert SOURCE.resolve() in path.parents and path.is_file(), f'missing or escaped manifest reference: {reference}'
 expected='family.json' if area=='families' else 'template.json'
 assert path.name==expected, f'unexpected manifest type at reference: {reference}'
 return json.loads(path.read_text())
CASES={'personal-post-list':('personal-homepage','work/field-notes','민서의 기록','필드 노트','첫 기록','이야기'),'personal-card-grid':('personal-homepage','work/field-notes','민서의 기록','필드 노트','첫 기록','이야기'),'company-service-cards':('company-homepage','services/research','다음연구소','사용자와 맥락을 이해하는 리서치','좋은 경험은 작은 질문에서 시작됩니다','소식'),'company-service-list':('company-homepage','services/research','다음연구소','사용자와 맥락을 이해하는 리서치','좋은 경험은 작은 질문에서 시작됩니다','소식'),'company-atelier':('company-homepage','services/research','다음연구소','사용자와 맥락을 이해하는 리서치','좋은 경험은 작은 질문에서 시작됩니다','소식')}
catalog=json.loads((SOURCE/'amade/catalog/index.json').read_text())
assert catalog.get('spec_version')=='0.1.0' and catalog.get('status')=='experimental', 'catalog version/status missing'
listed_templates=set();listed_families=set()
for family_ref in catalog.get('families',[]):
 family_id=family_ref['family_id'];assert family_id not in listed_families, f'duplicate family in catalog: {family_id}';listed_families.add(family_id)
 family_manifest=read_manifest(family_ref['manifest'],'families')
 assert family_manifest['family_id']==family_id, f'family manifest ID mismatch: {family_id}'
 for template_ref in family_ref.get('templates',[]):
  template_id=template_ref['template_id'];assert template_id not in listed_templates, f'duplicate template in catalog: {template_id}';listed_templates.add(template_id)
  template_manifest=read_manifest(template_ref['manifest'],'templates')
  assert template_manifest['template_id']==template_id and template_manifest['family_id']==family_id, f'template/family reference mismatch: {template_id}'
  required=('name','description','author','version','license','categories','tags','preview','status')
  assert all(template_manifest.get(key) for key in required), f'{template_id}: required metadata missing'
  assert template_manifest['status'] in {'active','deprecated','withdrawn'}, f'{template_id}: invalid lifecycle status'
  assert isinstance(template_manifest['categories'],list) and all(isinstance(x,str) and x.strip() for x in template_manifest['categories']), f'{template_id}: invalid categories'
  assert isinstance(template_manifest['tags'],list) and all(isinstance(x,str) and x.strip() for x in template_manifest['tags']), f'{template_id}: invalid tags'
  template_dir=Path(template_ref['manifest']).parent
  for key in ('preview','screenshots'):
   refs=[template_manifest[key]] if key=='preview' else template_manifest.get(key,[])
   assert isinstance(refs,list), f'{template_id}: {key} must be a path list'
   for asset in refs:
    rel=Path(asset);resolved=(SOURCE/template_dir/rel).resolve()
    assert not rel.is_absolute() and SOURCE.resolve() in resolved.parents and resolved.is_file(), f'{template_id}: missing or escaped {key} asset: {asset}'
  for key in ('homepage','support'):
   if key in template_manifest: assert isinstance(template_manifest[key],str) and template_manifest[key].startswith(('https://','mailto:')), f'{template_id}: invalid {key} URL'
assert listed_families=={p.parent.name for p in (SOURCE/'amade/families').glob('*/family.json')}, 'catalog family index is incomplete'
assert listed_templates=={p.parent.name for p in (SOURCE/'amade/templates').glob('*/template.json')}, 'catalog template index is incomplete'
print(f'PASS catalog: {len(listed_families)} families and {len(listed_templates)} linked templates')
class Markup(HTMLParser):
 def __init__(self): super().__init__(); self.images=[]; self.links=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='img' and a.get('src'): self.images.append(a['src'])
  if tag=='a' and a.get('href'): self.links.append(a['href'])
for tid,(family,item_route,site_name,item_title,post_title,nav_label) in CASES.items():
 dist=ROOT/'builds'/tid; html_files=list(dist.rglob('*.html')); assert html_files, f'{tid}: build output is missing'
 html='\n'.join(f.read_text(errors='ignore') for f in html_files)
 assert site_name in html and item_title in html and post_title in html, f'{tid}: expected public data missing'
 assert '로컬 전용 기록' not in html, f'{tid}: publication=none entry leaked'
 if tid=='company-atelier': assert 'proof' not in html.casefold() and 'fixture' not in html.casefold(), 'company-atelier: placeholder content leaked into public pages'
 assert (dist/'blog/private-note/index.html').is_file(), f'{tid}: private detail route missing'
 assert '비공개 기록' in (dist/'blog/private-note/index.html').read_text(errors='ignore'), f'{tid}: private detail content missing'
 assert '비공개 기록' not in (dist/'blog/index.html').read_text(errors='ignore'), f'{tid}: private post leaked into public listing'
 assert (dist/'about/team/index.html').is_file(), f'{tid}: multi-level internal page route missing'
 if tid=='company-atelier':
  about_html=(dist/'about/team/index.html').read_text(errors='ignore')
  assert '← 홈으로' not in about_html and '사람을 이해하는 데서' in about_html and 'How we work' in about_html, 'company-atelier: designed company introduction missing'
 assert (dist/item_route/'index.html').is_file(), f'{tid}: family item route missing'
 assert (dist/'blog/first-steps/index.html').is_file(), f'{tid}: public post detail missing'
 detail_html=(dist/'blog/first-steps/index.html').read_text(errors='ignore')
 listing_html=(dist/'blog/index.html').read_text(errors='ignore')
 if tid=='company-atelier': assert 'journal-feature-art' in listing_html, f'{tid}: designed feature artwork missing from blog list'
 else: assert 'post-thumbnail' in listing_html and '<img' in listing_html, f'{tid}: representative image thumbnail missing from blog list'
 assert 'cover_alt' not in listing_html, f'{tid}: cover metadata leaked into visible listing text'
 if tid!='company-atelier':
  asset_name='field-notes.' if family=='company-homepage' else 'proof.'
  assert f'/_astro/{asset_name}' in listing_html, f'{tid}: optimized representative thumbnail asset missing from blog list'
 assert f'<title>{post_title} |' in detail_html and f'<h1>{post_title}</h1>' in detail_html, f'{tid}: path/content title fallback missing'
 assert '<meta property="og:image" content="https://example.test/' in detail_html, f'{tid}: absolute representative image metadata missing'
 expected_alt='관찰 노트와 아이디어를 정리한 그래픽' if family=='company-homepage' else '증명 이미지'
 assert f'<meta property="og:image:alt" content="{expected_alt}"' in detail_html, f'{tid}: representative image alt metadata missing'
 expected_author='다음연구소' if family=='company-homepage' else '민서'
 assert 'name="author"' in detail_html and expected_author in detail_html, f'{tid}: optional author metadata missing'
 assert 'address' not in detail_html and '서울특별시 종로구' not in detail_html, f'{tid}: unknown metadata was unexpectedly rendered'
 assert not (dist/'blog/local-only/index.html').exists(), f'{tid}: frontmatter-free post did not default to publication none'
 page=Markup(); page.feed((dist/'index.html').read_text(errors='ignore'))
 assert '/about/team/' in page.links and '/blog/first-steps/' in page.links, f'{tid}: navigation/post links missing'
 assert nav_label in (dist/'index.html').read_text(errors='ignore') and '/blog/' in page.links, f'{tid}: site-data navigation missing'
 site=json.loads((SOURCE/'amade/families'/family/'data/site.json').read_text())
 for menu in site['navigation']: assert menu['label'] in (dist/'index.html').read_text(errors='ignore') and menu['path'] in page.links, f"{tid}: menu item lost: {menu['id']}"
 assert f'/{item_route}/' in page.links, f'{tid}: family item link missing'
 assert '/logo.svg' in page.images and (dist/'logo.svg').is_file(), f'{tid}: logo missing'
 manifest=json.loads((SOURCE/'amade/templates'/tid/'template.json').read_text())
 assert manifest['family_id']==family and manifest.get('categories') and isinstance(manifest.get('tags'),list), f'{tid}: discovery metadata missing'
 detail=Markup(); detail.feed((dist/'blog/first-steps/index.html').read_text(errors='ignore'))
 assert detail.images, f'{tid}: Markdown image missing'
 for image in detail.images: assert (dist/image.lstrip('/')).is_file(), f'{tid}: built image absent: {image}'
 print(f'PASS {tid}: profile, full navigation, pages, public/unlisted/local-only publication states, family routes, author/cover metadata, thumbnails, logo, Markdown image')
