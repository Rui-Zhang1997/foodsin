from models import Restaurant, new_session
import geohash as geo
import requests as req
import json, yaml
import re

with open('config.yaml') as f:
    api_keys = yaml.load(f)['keys']

s = new_session()
print(len(s.query(Restaurant).all()))

restaurants = {(r[0], r[3]): (r[1], r[2]) for r in s.query(Restaurant.__table__.c.id, \
    Restaurant.__table__.c.street, Restaurant.__table__.c.zipcode, \
    Restaurant.__table__.c.dba).all()}

print("Rendering geohash for %s restaurants" % len(restaurants))

GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json"

addr_ll = {}
restaurant_id_names = {}
restaurant_geolocations = {}
for dba, addr in restaurants.items():
    restaurant_id_names[dba[0]] = dba[1]
    key = '%s,%s' % addr
    if key not in addr_ll:
        print("GETTING", key)
        r = req.get(GEOCODING_URL, params={'address': key, 'key': api_keys['google']}).json()
        addr_ll[key] = r['results'][0]['geometry']['location']
    restaurant_geolocations[dba[0]] = (addr_ll[key]['lat'], addr_ll[key]['lng'])

with open('geolocations.json', 'w') as f:
    json.data(addr_ll, f)

PLACES_URL = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?"
fields = {'fields': 'name,formatted_address,geometry', 'inputtype': 'textquery', 'key': api_keys['google']}
for r_id, name in restaurant_id_names.items():
    radius = 100
    print("Getting %s @ %s" % (name, radius))
    while True:
        params = {**fields, **{'input': re.sub('\W+', '', name), 'locationbias': 'circle:%s@%s,%s' % (radius, restaurant_geolocations[r_id][0], restaurant_geolocations[r_id][1])}}
        r = req.get(PLACES_URL, params=params).json()
        if len(r['candidates']) == 0:
            radius *= 1.25
            continue
        restaurant_geolocations[r_id] = r['candidates'][0]['geometry']['location']
        break

s = new_session()
for r_id, latlng in restaurant_geolocations.items():
    s.query(Restaurant).filter_by(id=r_id).update({'geohash': geo.encode(latlng['lat'], latlng['lng'])})
s.commit()
print("Completed")
