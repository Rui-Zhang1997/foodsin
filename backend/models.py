from sqlalchemy import Column, Integer, String, DateTime, Boolean, SmallInteger, Float, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.schema import ForeignKey, Index

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import yaml

with open('config.yaml') as f:
    config = yaml.load(f)

dbconf = config['db']
engine = create_engine('mysql+pymysql://%s:%s@localhost:3306/health?charset=utf8mb4' % (dbconf['username'], dbconf['password']))
Session = sessionmaker(bind=engine)
Base = declarative_base()

class Serializer:
    def serialize(self):
        return {k: v for k, v in self.__dict__.items() if k in self.__table__.columns}

class Borough(Base, Serializer):
    __tablename__ = 'borough'
    id = Column(Integer, primary_key=True)
    borough = Column(String(length=32), unique=True)


class ViolationCode(Base, Serializer):
    __tablename__ = 'violation_code'
    id = Column(Integer, primary_key=True)
    code = Column(String(length=8), unique=True)


class Restaurant(Base, Serializer):
    __tablename__ = 'restaurant'
    id = Column(Integer, primary_key=True)
    camis = Column(String(length=16), unique=True)
    dba = Column(String(length=512))
    street = Column(String(length=512))
    phone = Column(String(length=16))
    cuisine_description = Column(String(length=128))
    borough = Column(Integer, ForeignKey('borough.id'))
    building = Column(String(length=16))
    zipcode = Column(String(length=8))
    geohash = Column(String(length=32))
    borough_rel = relationship('Borough')

restaurant_cuisine_idx = Index('restaurant_cuisine_idx', Restaurant.__table__.c.cuisine_description)
restaurant_borough_idx = Index('restaurant_borough_idx', Restaurant.__table__.c.borough)
restaurant_zipcode_idx = Index('restaurant_zipcode_idx', Restaurant.__table__.c.zipcode)
restaurant_geohash_idx = Index('restaurant_geohash_idx', Restaurant.__table__.c.geohash)

class Inspection(Base, Serializer):
    __tablename__ = 'inspection'
    id = Column(Integer, primary_key=True)
    restaurant = Column(Integer, ForeignKey('restaurant.id'))
    record_date = Column(DateTime)
    violation_code = Column(Integer, ForeignKey('violation_code.id'))
    violation_description = Column(Text)
    score = Column(Integer)
    grade = Column(String(length=16))
    inspection_date = Column(DateTime)
    inspection_type = Column(String(length=128))
    critical_flag = Column(String(length=16))
    restaurant_rel = relationship('Restaurant')
    violation_code_rel = relationship('ViolationCode')

inspection_code_index = Index('inspection_code_idx', Inspection.__table__.c.violation_code)
inspection_grade_index = Index('inspection_grade_idx', Inspection.__table__.c.grade)
inspection_score_index = Index('inspection_score_idx', Inspection.__table__.c.score)
inspection_restaurant_index = Index('inspection_restaruant_idx', Inspection.__table__.c.restaurant)
inspection_date_idx = Index('inspection_date_idx', Inspection.__table__.c.inspection_date)
inspection_flag_idx = Index('inspection_flag_idx', Inspection.__table__.c.critical_flag)
inspection_type_idx = Index('inspection_type_idx', Inspection.__table__.c.inspection_type)

class Tables:
    inspection = Inspection.__table__
    restaurant = Restaurant.__table__
    violation_code = ViolationCode.__table__
    borough = Borough.__table__

class Collection:
    def __init__(self, model, pkfn):
        self.model = model
        self.pkfn = pkfn
        self.inserted = {}
    
    def insert(self, obj):
        if self.pkfn(obj) not in self.inserted:
            self.inserted[self.pkfn(obj)] = obj

    def get(self, key):
        return self.inserted[key]
    
    def getall(self):
        return [self.inserted[k] for k in self.inserted]
            

Base.metadata.create_all(engine)

def new_session():
    return Session()

def serialize(obj_list):
    return [obj.serialize() for obj in obj_list]
