from db.db import db
from models.models import User, Roles, Campaigns, AdRequests, Influencer, Sponsor
import hashlib
import jwt
import datetime
import random

secret_key = 'Secret_Key9@+'

# SHA256
def encrypt(password):
    ''' SHA256 '''
    hash_pass = hashlib.sha256()
    hash_pass.update(password.encode("utf-8"))
    return str(hash_pass.digest())


# Checking functions
def validate_user(email, password):
    ''' User validation '''
    user = db.session.query(User).filter(User.email == email).first()
    print(user)
    print(user.active)
    if not user:
        return None
    if user.active == 0:
        return 'approval#'
    if user.password == encrypt(password):
        return user.role_id
    return None

def check_user(email):
    ''' Checking for user existance '''
    user = db.session.query(User).filter(User.email == email).first()
    if user:
        return True
    return False

# Generation helpers
def generate_token(email):
    ''' Token Generation '''
    user = db.session.query(User).filter(User.email == email).first()
    role = db.session.query(Roles).filter(Roles.role_id == user.role_id).first()
    payload = {
        'email': email,
        'role': role.role_name,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes = 60),
    }
    token = jwt.encode(payload, secret_key, algorithm = 'HS256')
    return token

def generate_id(name):
    ref = random.randint(int(1e7), int(1e8) - 1)
    return name[0] + str(ref) + name[-1]


# Create helpers
def new_user(email, password, role):
    ''' User registration '''
    try:
        active = 1
        if role == "SPONSOR":
            active = 0
        new_user = User(email = email, password = encrypt(password), role_id = role, active = active)
        db.session.add(new_user)
        db.session.commit()
    except:
        return False
    else:
        return True
    
def new_campaign(data, email):
    try:
        campaign = Campaigns(id = generate_id(data['campaign_name']), name = data['campaign_name'], description = data['campaign_description'], visibility = data['campaign_visibility'], budget = data['campaign_budget'], photo_path = 'D:\\Web\\MAD2\\InfluencerApp\\static\\uploads\\event_image.png', start_date = data['start_date'], end_date = data['end_date'], expired = 'no', sponsor_id = email, flagged = 0)
        db.session.add(campaign)
        db.session.commit()
    except:
        return False
    return True

def new_sponsor(data):
    try:
        sponsor = Sponsor(email = data['email'], name = data['name'], category = data['category'])
        db.session.add(sponsor)
        db.session.commit()
    except:
        return False
    return True

def new_influencer(data):
    influencer = Influencer(email = data['email'], name = data['name'], followers_count = int(data['followers']), insta_link = data['insta_link'], linkdin_link = data['linkdin_link'], other_link = data['other_link'])
    db.session.add(influencer)
    db.session.commit()

def new_ad_request(data, curr_user_role, curr_user_id):
    id = generate_id('request')
    campaign = db.session.query(Campaigns).filter(Campaigns.id == data['campaign_id']).first()
    ad_request = None
    
    if curr_user_role == 'sponsor':
        temp = db.session.query(AdRequests).filter(AdRequests.influencer_id == data['influencer_id'], AdRequests.campaign_id == data['campaign_id']).first()
        if temp != None:
            return True
        ad_request = AdRequests(id = id, sponsor_id = curr_user_id, influencer_id = data['influencer_id'], status = 'neutral', description = campaign.description, campaign_name = campaign.name, start_date = campaign.start_date, end_date = campaign.end_date,budget = campaign.budget, expired = 'no', by = 'sponsor', campaign_id = campaign.id)
    
    elif curr_user_role == 'influencer':
        temp = db.session.query(AdRequests).filter(AdRequests.influencer_id == curr_user_id, AdRequests.campaign_id == data['campaign_id']).first()
        print(temp)
        amt = campaign.budget
        if 'bargain_amt' in data and data['bargain_amt']:
            try:
                amt = int(data['bargain_amt'])
            except:
                return True
        if temp != None:
            return True
        ad_request = AdRequests(id = id, sponsor_id = campaign.sponsor_id, influencer_id = curr_user_id, status = 'neutral', description = campaign.description, campaign_name = campaign.name, start_date = campaign.start_date, end_date = campaign.end_date,expired = 'no', budget = amt, by = 'influencer', campaign_id = campaign.id)
    
    db.session.add(ad_request)
    db.session.commit()
    return True

#### Edit Helpers ####
def edit_influencer_profile(influencer):
    print(influencer)
    db.session.query(Influencer).filter(Influencer.email == influencer['email']).update({'name': influencer['name'], 'insta_link': influencer['insta_link'], 'linkdin_link': influencer['linkdin_link'], 'other_link': influencer['other_link'], 'followers_count': int(influencer['followers_count'])})
    db.session.commit()

def edit_campaign(data):
    db.session.query(Campaigns).filter(Campaigns.id == data['id']).update({'name': data['campaign_name'], 'description': data['campaign_description'], 'budget': int(data['campaign_budget']), 'start_date': data['start_date'], 'end_date': data['end_date'], 'visibility': data['campaign_visibility']})
    db.session.commit()

def edit_request(id, status):
    #print(id)
    request = db.session.query(AdRequests).filter(AdRequests.id == id).first()
    if not request:
        return False
    db.session.query(AdRequests).filter(AdRequests.id == id).update({'status': status})
    db.session.commit()
    return True

def accept_approval_request(email):
    ''' Call is from AdiminApproval API POST :: Admin approves registration request of Sponsor '''
    try:
        db.session.query(User).filter(User.email == email).update({'active': 1})
        db.session.commit()
    except:
        return False
    return True

def flag_campaign(campaign_id):
    try:
        db.session.query(Campaigns).filter(Campaigns.id == campaign_id).update({'flagged': 1})
        db.session.commit()
    except:
        return False
    return True

#### Read Healpers ####
def get_active_campaigns():
    data = db.session.query(AdRequests).filter(AdRequests.status == "accept").all()
    return data

def get_approval_requests():
    data = []
    requests = db.session.query(User).filter(User.active == 0).all()
    for request in requests:
        data.append([request.email, request.active])
    return data

def get_all_campaigns():
    data = []
    campaigns = db.session.query(Campaigns).all()
    for campaign in campaigns:
        data.append({
            "id": campaign.id,
            "name": campaign.name,
            "description": campaign.description,
            "visibility": campaign.visibility,
            "budget": float(campaign.budget),
            "start_date": campaign.start_date,
            "end_date": campaign.end_date,
            "sponsor_id": campaign.sponsor_id,
            "flagged": campaign.flagged
        })
        #data.append([campaign.id, campaign.name, campaign.description, campaign.visibility, float(campaign.budget), campaign.start_date, campaign.end_date, campaign.photo_path, campaign.sponsor_id, campaign.flagged])
    return data

def get_public_campaigns():
    data = []
    campaigns = db.session.query(Campaigns).filter(Campaigns.visibility == "PUBLIC" and Campaigns.expired == 'no').all()
    #print(campaigns)
    for campaign in campaigns:
        data.append({
            "id": campaign.id,
            "name": campaign.name,
            "description": campaign.description,
            "visibility": campaign.visibility,
            "budget": float(campaign.budget),
            "start_date": campaign.start_date,
            "end_date": campaign.end_date,
            "sponsor_id": campaign.sponsor_id,
            "flagged": campaign.flagged
        })
        #data.append([campaign.id, campaign.name, campaign.description, campaign.visibility, float(campaign.budget), campaign.start_date, campaign.end_date, campaign.photo_path, campaign.sponsor_id])
    return data

def get_sponsor_campaigns(sponsor_id):
    data = []
    sponsor_campaigns = db.session.query(Campaigns).filter(Campaigns.sponsor_id == sponsor_id).all()
    for campaign in sponsor_campaigns:
        data.append({
            "id": campaign.id,
            "name": campaign.name,
            "description": campaign.description,
            "visibility": campaign.visibility,
            "budget": float(campaign.budget),
            "start_date": campaign.start_date,
            "end_date": campaign.end_date,
            "sponsor_id": campaign.sponsor_id,
            "expired": campaign.expired,
            "flagged": campaign.flagged
        })
        #data.append([campaign.id, campaign.name, campaign.description, campaign.visibility, float(campaign.budget), campaign.start_date, campaign.end_date, campaign.photo_path, campaign.sponsor_id])
    return data

def get_campaign(campaign_id):
    return db.session.query(Campaigns).filter(Campaigns.id == campaign_id).first()

def get_requests(id, user_role):
    requests = []
    if user_role == 'sponsor':
        requests = db.session.query(AdRequests).filter(AdRequests.sponsor_id == id and AdRequests.expired == 'no').all()
    elif user_role == 'influencer':
        requests = db.session.query(AdRequests).filter(AdRequests.influencer_id == id and AdRequests.expired == 'no').all()
    data = []
    for i in requests:
        data.append({
            'id': i.id,
            'sponsor_id': i.sponsor_id,
            'influencer_id': i.influencer_id,
            'budget': i.budget,
            'description': i.description,
            'campaign_name': i.campaign_name,
            'start_date': i.start_date,
            'end_date': i.end_date,
            'expired': i.expired,
            'status': i.status,
            'by': i.by
        })
    return data

def get_influencer(email):
    influencer = db.session.query(Influencer).filter(Influencer.email == email).first()
    data = {
        'email': influencer.email,
        'name': influencer.name,
        'insta_link': influencer.insta_link,
        'linkdin_link': influencer.linkdin_link,
        'followers_count': influencer.followers_count,
        'other_link': influencer.other_link,
        'photo_path': influencer.photo_path
    }
    return data

def get_sponsor(email):
    sponsor = db.session.query(Sponsor).filter(Sponsor.email == email).first()
    data = {
        'email': sponsor.email,
        'name': sponsor.name,
        'category': sponsor.category
    }
    return data

def get_sponsors():
    sponsors = db.session.query(Sponsor).all()
    data = []
    for sponsor in sponsors:
        data.append({
            'email': sponsor.email,
            'name': sponsor.name,
            'category': sponsor.category
        })
    return data

def get_influencers():
    data = []
    influencers = db.session.query(Influencer).all()
    for influencer in influencers:
        data.append({
            'email': influencer.email,
            'name': influencer.name,
            'insta_link': influencer.insta_link,
            'linkdin_link': influencer.linkdin_link,
            'other_link': influencer.other_link,
            'follwers': influencer.followers_count,
            'photo_path': influencer.photo_path
        })
        #data.append([influencer.email, influencer.name, influencer.insta_link, influencer.linkdin_link, influencer.other_link, influencer.followers_count, influencer.photo_path])
    return data
    

#### Delete Helpers ####
def delete_user():
    pass

def delete_campaign(campaign):
    try:
        #print(campaign)
        db.session.query(AdRequests).filter(AdRequests.campaign_id == campaign['id']).delete()
        db.session.commit()
        db.session.query(Campaigns).filter(Campaigns.id == campaign['id']).delete()
        db.session.commit()
    except:
        #print('oh hell')
        return False
    return True

def delete_request(id):
    db.session.query(AdRequests).filter(AdRequests.id == id).delete()
    db.session.commit()

def delete_influencer(id):
    db.session.query(AdRequests).filter(AdRequests.influencer_id == id).delete()
    db.session.commit()

    db.session.query(Influencer).filter(Influencer.email == id).delete()
    db.session.commit()

    db.session.query(User).filter(User.email == id).delete()
    db.session.commit()

def delete_sponsor(id):
    db.session.query(AdRequests).filter(AdRequests.sponsor_id == id).delete()
    db.session.commit()

    db.session.query(Campaigns).filter(Campaigns.sponsor_id == id).delete()
    db.session.commit()

    db.session.query(Sponsor).filter(Sponsor.email == id).delete()
    db.session.commit()

    db.session.query(User).filter(User.email == id).delete()
    db.session.commit()

def reject_approval_request(email):
    ''' Call is from AdiminApproval API DELETE :: Admin approves registration request of Sponsor '''
    try:
        db.session.query(User).filter(User.email == email).delete()
        db.session.commit()
    except:
        return False
    return True