from models import Restaurant, new_session
import geohash
import requests as req
import json, yaml
import asyncio
import re

with open('config.yaml') as f:
    config = yaml.load(f)
api_keys = config['keys']

s = new_session()
print(len(s.query(Restaurant).all()))

restaurants = {(r[0], r[3]): (r[1], r[2]) for r in s.query(Restaurant.__table__.c.id, \
    Restaurant.__table__.c.street, Restaurant.__table__.c.zipcode, \
    Restaurant.__table__.c.dba).filter(Restaurant.geohash==None).filter(Restaurant.borough==4).all()}

GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json"

def get_found_geolocations():
    try:
        with open(config['files']['geolocation']) as f:
            geometrics = json.load(f)
        return geometrics
    except json.decoder.JSONDecodeError:
        return []

found_addrs = [addr['key'] for addr in get_found_geolocations()]
addrs = list(set([dba for e, dba in restaurants.items() if ('%s+%s' % dba) not in found_addrs ]))

async def get_all_lls():
    loop = asyncio.get_event_loop()
    print("Getting futures...")
    futures = [loop.run_in_executor(None, req.get, GEOCODING_URL, \
        {'address': '%s+%s' % addr, 'key': api_keys['google']}) for addr in addrs]
    print("Blocking...")
    responses = [await future for future in futures]
    get_data = lambda key, r: {'key': key, 'location': r.json()['results'][0]}
    valid_stmts = []
    for addr, r in zip(addrs, responses):
        try:
            key = '%s+%s' % addr
            valid_stmts.append(get_data(key, r))
        except:
            continue
    return valid_stmts

def log_geolocations():
    loop = asyncio.get_event_loop()
    locations = get_found_geolocations()
    with open("geolocations.json", 'w') as f:
        json.dump(locations + loop.run_until_complete(get_all_lls()), f)

def load_geohashes(geos):
    for geo in geos:
        street, zipcode = geo['key'].split('+')
        location = geo['location']['geometry']['location']
        s.query(Restaurant).filter(Restaurant.street==street and Restaurant.zipcode==zipcode). \
            update({'geohash': geohash.encode(location['lat'], location['lng'])})
    s.commit()

load_geohashes(get_found_geolocations())

print(get_found_geolocations())
