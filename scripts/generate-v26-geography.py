"""Tag preview dots by country boundaries, never by nearest centroid.

Uses public-domain Natural Earth geometry. Run from the repository root.
Earlier preview datasets remain untouched. Tiny countries get a label-point dot.
"""
import json
import math
import re
from pathlib import Path
from urllib.request import urlopen

ROOT = Path('src/views/home-preview/mock')
SOURCE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/'


def load_source(resolution):
    with urlopen(SOURCE + f'ne_{resolution}_admin_0_countries.geojson', timeout=90) as response:
        return json.load(response)['features']


def in_ring(x, y, ring):
    inside = False
    for (ax, ay), (bx, by) in zip(ring, ring[1:] + ring[:1]):
        if (ay > y) != (by > y) and x < (bx - ax) * (y - ay) / (by - ay) + ax:
            inside = not inside
    return inside


def in_polygon(x, y, polygon):
    return in_ring(x, y, polygon[0]) and not any(in_ring(x, y, hole) for hole in polygon[1:])


def project(lon, lat):
    # Equal Earth projection fitted to the existing world-map-global SVG paths.
    lam, phi = math.radians(lon), math.radians(lat)
    theta = math.asin(math.sqrt(3) / 2 * math.sin(phi))
    t2, t6 = theta**2, theta**6
    x = 2 * math.sqrt(3) * lam * math.cos(theta) / (3 * (1.340264 - 3 * .081106 * t2 + t6 * (7 * .000893 + 9 * .003796 * t2)))
    y = theta * (1.340264 - .081106 * t2 + t6 * (.000893 + .003796 * t2))
    return [round(500 + 188.25597 * x, 1), round(261.22524 - 188.25597 * y, 1)]


def generate():
    world = json.loads((ROOT / 'world-map-global.json').read_text())
    globe = json.loads((ROOT / 'globe-dots.json').read_text())
    features = load_source('110m')
    features += [f for f in load_source('10m') if f['properties']['ADMIN'] == 'Maldives']
    aliases = {
        'United States of America': 'United States',
        'Ivory Coast': 'Ivory Coast',
        'eSwatini': 'Eswatini',
        "Côte d'Ivoire": 'Ivory Coast',
        'Dominican Rep.': 'Dominican Republic',
        'Solomon Is.': 'Solomon Islands',
        'Central African Rep.': 'Central African Republic',
    }
    def name(value):
        return aliases.get(value, value)

    geographic = []
    labels = {}
    for f in features:
        props, geom = f['properties'], f['geometry']
        country = name(props['NAME_EN'])
        polygons = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
        geographic.append((country, polygons))
        labels[country] = [props['LABEL_X'], props['LABEL_Y']]

    map_polygons = []
    for c in world['countries']:
        rings = [[list(map(float, xy)) for xy in re.findall(r'(-?[\d.]+),(-?[\d.]+)', part)] for part in c['d'].split('M') if part]
        map_polygons.append((name(c['name']), rings))

    map_dots = []
    for x, y, _ in world['dots']:
        country = next((n for n, rings in map_polygons if sum(in_ring(x, y, ring) for ring in rings) % 2), '')
        map_dots.append([x, y, country])
    globe_dots = []
    for lon, lat, _ in globe['pts']:
        country = next((n for n, polygons in geographic if any(in_polygon(lon, lat, poly) for poly in polygons)), '')
        globe_dots.append([lon, lat, country])

    # Every explicitly listed country is represented, including small islands.
    text = (ROOT / 'v26-countries.ts').read_text()
    groups = text.split('custodial: [', 1)[1].split('} as const', 1)[0]
    eligible = re.findall(r"'([^']+)'", groups)
    for country in eligible:
        lon, lat = labels[country]
        if not any(p[2] == country for p in map_dots):
            map_dots.append([*project(lon, lat), country])
        if not any(p[2] == country for p in globe_dots):
            globe_dots.append([round(lon, 3), round(lat, 3), country])
    output = {'mapDots': map_dots, 'globeDots': globe_dots}
    (ROOT / 'v26-geography.json').write_text(json.dumps(output, separators=(',', ':')) + '\n')
    print(f'Generated country-tagged geometry: {len(map_dots)} map dots, {len(globe_dots)} globe dots; {len(set(eligible))} eligible countries represented.')


if __name__ == '__main__':
    generate()
