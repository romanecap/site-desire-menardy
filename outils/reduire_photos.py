"""Réduit les photos envoyées depuis l'interface d'édition (lancé par GitHub à chaque publication).
- Redimensionne les photos trop grandes (plus de 1600 px de côté) et les recompresse.
- Convertit les photos iPhone (.heic), que les navigateurs n'affichent pas, en .jpg
  et met à jour les fichiers du dossier content.
Les photos déjà légères ne sont pas touchées."""
import json, os, sys
from PIL import Image, ImageOps
try:
    import pillow_heif; pillow_heif.register_heif_opener()
except ImportError:
    pillow_heif = None

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOSSIER = os.path.join(RACINE, 'images')
COTE_MAX, POIDS_MAX = 1600, 450 * 1024
renommees, reduites = {}, []

for nom in sorted(os.listdir(DOSSIER)):
    chemin = os.path.join(DOSSIER, nom)
    base, ext = os.path.splitext(nom); ext = ext.lower()
    if ext not in ('.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'):
        continue
    if ext in ('.heic', '.heif') and not pillow_heif:
        print('Impossible de lire', nom, '(pillow-heif manquant)'); continue
    if ext not in ('.heic', '.heif') and os.path.getsize(chemin) <= POIDS_MAX:
        continue
    im = ImageOps.exif_transpose(Image.open(chemin))      # remet les photos de téléphone dans le bon sens
    im.thumbnail((COTE_MAX, COTE_MAX))
    if ext in ('.heic', '.heif'):
        nouveau = base + '.jpg'
        im.convert('RGB').save(os.path.join(DOSSIER, nouveau), quality=82, optimize=True, progressive=True)
        os.remove(chemin); renommees['images/' + nom] = 'images/' + nouveau
    elif ext == '.png' and im.mode in ('RGBA', 'LA', 'P'):
        im.save(chemin, optimize=True)
    elif ext == '.webp':
        im.save(chemin, 'WEBP', quality=82)
    else:
        im.convert('RGB').save(chemin, quality=82, optimize=True, progressive=True)
    reduites.append(nom)

# Mettre à jour les noms des photos converties dans le contenu
if renommees:
    for f in os.listdir(os.path.join(RACINE, 'content')):
        p = os.path.join(RACINE, 'content', f); t = open(p, encoding='utf-8').read(); t2 = t
        for a, b in renommees.items():
            t2 = t2.replace(a, b).replace('/' + a, '/' + b)
        if t2 != t: open(p, 'w', encoding='utf-8').write(t2)

print(f'{len(reduites)} photo(s) réduite(s), {len(renommees)} convertie(s) en .jpg')
