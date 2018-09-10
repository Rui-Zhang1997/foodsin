import csv, sys
import pymongo
import hashlib
from pymongo import MongoClient

with open(sys.argv[1]) as f:
    data = list(csv.reader(f, delimiter=','))
columns, data = data[0], data[1:]
replace = {'boro': 'borough'}
columns = [replace[c] if c in replace else c.lower().replace(' ', '_') for c in columns]
data = [{k: v.lower() for k,v in zip(columns, r)} for r in data]

restaurant_columns = [('camis', '_id'), 'zipcode', 'street', 'phone', 'cuisine_description', 'building', 'dba', 'geohash']
inspection_columns = [c for c in columns if c not in restaurant_columns] + ['camis']
print(restaurant_columns, inspection_columns)
print(data[0])
inspections, restaurants = zip(*[({(k[1] if isinstance(k, tuple) else k): r[k[0] if isinstance(k,tuple) else k] for k,r in zip(inspection_columns, r)}, \
    {(k[1] if isinstance(k, tuple) else k): r[k[0] if isinstance(k,tuple) else k] for k,r in zip(restaurant_columns, r)}) for r in data])
sys.exit(0)
def generate_id(d):
    m = hashlib.md5()
    m.update(d['camis'].encode('utf-8'))
    m.update(d['zipcode'].encode('utf-8'))
    m.update(d['inspection_date'].encode('utf-8'))
    m.update(d['violation_code'].encode('utf-8'))
    m.update(d['violation_description'].encode('utf-8'))
    m.update(d['score'].encode('utf-8'))
    return m.hexdigest()

for d in inspections:
    d['_id'] = generate_id(d)

print(data[:10])
client = MongoClient()
client = MongoClient('localhost', 27107)

db = client.inspections

insp_coll = db['inspections']
rest_coll = db['restaurants']
restaurant_indexes = ['dba', 'borough', 'zipcode', 'street', 'geohash']
for idx in restaurant_indexes:
    rest_coll.create_index(idx)

inspection_indexes = ['camis', 'score', 'grade', 'inspection_type', 'inspection_date', 'violation_code', 'cuisine_description']
for idx in inspection_indexes:
    insp_coll.create_index(idx)


