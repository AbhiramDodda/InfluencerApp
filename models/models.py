from db.db import db
from sqlalchemy import *

class User(db.Model):
    __tablename__ = "users"
    email = db.Column(db.String, primary_key = True)
    password = db.Column(db.String, nullable = False)
    role_id = db.Column(db.String, db.ForeignKey("roles.role_id"), nullable = False)
    active = db.Column(db.Integer, nullable = False)

class Roles(db.Model):
    __tablename__ = "roles"
    role_id = db.Column(db.String, primary_key = True)
    role_name = db.Column(db.String, nullable = False)

class Campaigns(db.Model):
    __tablename__ = "campaigns"
    id = db.Column(db.String, primary_key = True)
    name = db.Column(db.String,  nullable = False)
    description = db.Column(db.String, nullable = False)
    visibility = db.Column(db.String, nullable = False)
    budget = db.Column(db.Numeric, nullable = False)
    start_date = db.Column(db.String, nullable = False)
    end_date = db.Column(db.String, nullable = False)
    expired = db.Column(db.String, nullable = False)
    photo_path = db.Column(db.String, default = 'D:\\Web\\MAD2\\InfluencerApp\\static\\uploads\\event_image.png')
    search = db.Column(db.String,nullable = False)
    sponsor_id = db.Column(db.String,  nullable = False)
    flagged = db.Column(db.Integer, default = 0)

class AdRequests(db.Model):
    __tablename__ = "add_requests"
    id = db.Column(db.String, primary_key = True)
    campaign_id = db.Column(db.String, db.ForeignKey("campaigns.id"), nullable = False)   
    sponsor_id = db.Column(db.String, db.ForeignKey("users.email"), nullable = False) 
    influencer_id = db.Column(db.String, db.ForeignKey("users.email"), nullable = False)
    budget = db.Column(db.Float, nullable = False)
    status = db.Column(db.String, nullable = False)
    description = db.Column(db.String, nullable = False)
    campaign_name = db.Column(db.String, nullable = False)
    start_date = db.Column(db.String, nullable = False)
    end_date = db.Column(db.String, nullable = False)
    expired = db.Column(db.String, nullable = False)
    by = db.Column(db.String, nullable = False)

class Influencer(db.Model):
    __tablename__ = "influencers"
    email = db.Column(db.String, primary_key = True)
    name = db.Column(db.String, nullable = False)
    insta_link = db.Column(db.String, nullable = False)
    linkdin_link = db.Column(db.String, nullable = False)
    other_link = db.Column(db.String, nullable = False)
    followers_count = db.Column(db.Integer, nullable = False)
    photo_path = db.Column(db.Integer, default = 'D:\\Web\\MAD2\\InfluencerApp\\static\\uploads\\person_avatar.webp')

class Sponsor(db.Model):
    __tablename__ = 'sponsors'
    email = db.Column(db.String, primary_key = True)
    name = db.Column(db.String, nullable = False)
    category = db.Column(db.String, nullable = False)