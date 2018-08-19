import pymongo as mongo
import models
from models import new_session, serialize
import json

s = new_session()
print([i.__dict__ for i in s.query(models.Inspection, models.Restaurant, models.ViolationCode, \
    models.Borough).join(models.ViolationCode). \
    join(models.Restaurant).join(models.Borough).limit(10).all()])
s.close()
