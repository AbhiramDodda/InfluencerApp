from flask_restful import Resource
from flask import request
from helpers.helpers import validate_user, generate_token, check_user, new_user, new_campaign, accept_approval_request, reject_approval_request, delete_campaign, edit_campaign, get_active_campaigns
from helpers.helpers import get_influencers, get_approval_requests, get_sponsor_campaigns, get_all_campaigns, get_influencer, get_sponsor, get_public_campaigns, get_sponsor, get_influencer
from helpers.helpers import new_sponsor, new_influencer, flag_campaign, new_ad_request, get_requests, edit_request, delete_influencer, delete_sponsor, delete_request, get_sponsors, edit_influencer_profile, delete_request
import jwt

secret_key = 'Secret_Key9@+'

class LoginValidation(Resource):
    def get(self):
        pass
    def put(self):
        pass
    def post(self):
        data = request.get_json()
        response_obj = {}
        validity = validate_user(data['email'], data['password'])
        if validity == 'approval#':
            response_obj = {'approval': False}, 200
        elif validity:
            token = generate_token(data['email'])
            response_obj = {'approval': True, 'valid_login': True, 'auth_token': token}, 200
        else:
            response_obj = {'valid_login': False}, 200
        return response_obj
    def delete(self):
        pass

class SignupValidation(Resource):
    def get(self):
        if check_user(request.headers['email']):
            print("'user exists")
            return {'user_exists': True}, 200
        return {'user_exists': False}, 200
    def post(self):
        data = request.get_json()
        if check_user(data['email']):
            return {'valid_signup': False}, 200
        else:
            if new_user(data['email'], data['password'], data['role']):
                token = generate_token(data['email'])
                if data['role'] == "SPONSOR":
                    new_sponsor(data)
                    return {'valid_signup': True, 'auth_token': token, 'unknown_error': False, 'approval': 0}, 200
                elif data['role'] == 'INFLUENCER':
                    try:
                        followers = int(data['followers'])
                    except:
                        return {'valid_signup': False}, 200
                    new_influencer(data)
                    return {'valid_signup': True, 'auth_token': token, 'unknown_error': False, 'approval': 1}, 200
            else:
                return {'valid_signup': True, 'unknown_error': True}, 200
    def put(self):
        pass
    def delete(self):
        pass

class AdminApproval(Resource):
    def get(self):
        data = get_approval_requests()
        if len(data) == 0:
            return {'data': []}, 200
        return {'data': data}, 200
    def post(self):
        data = request.get_json()
        if accept_approval_request(data['email']):
            data = get_approval_requests()
            return {'data': data}, 200
        return {'success': False}, 200
    def delete(self):
        data = request.get_json()
        if reject_approval_request(data['email']):
            data = get_approval_requests()
            return {'data': data}, 200
        return {'success': False}, 200

class CampaignCRUD(Resource):
    def get(self):
        token = jwt.decode(request.cookies.get('auth_token'), secret_key, algorithms=['HS256'])
        data = []
        if token['role'] == 'sponsor':
            data = get_sponsor_campaigns(token['email'])
        elif token['role'] == 'influencer':
            data = get_public_campaigns()
            #print(data)
        else:
            data = get_all_campaigns()
        #print(data)
        return {'data': data}, 200
    def post(self):
        data = request.get_json()
        token = jwt.decode(request.cookies.get('auth_token'), secret_key, algorithms=['HS256'])
        if new_campaign(data, jwt.decode(request.cookies.get('auth_token'), secret_key, algorithms=['HS256'])['email']):
            data = get_sponsor_campaigns(token['email'])
            return {'data': data}, 200
        return {'valid': False}, 200
    def put(self):
        data = request.get_json()
        edit_campaign(data)
        token = jwt.decode(request.cookies.get('auth_token'), secret_key, algorithms=['HS256'])
        data = get_sponsor_campaigns(token['email'])
        return {'data': data}, 200
    def delete(self):
        data = request.get_json()
        if delete_campaign(data):
            token = jwt.decode(request.cookies.get('auth_token'), secret_key, algorithms=['HS256'])
            data = []
            if token['role'] == 'sponsor':
                data = get_sponsor_campaigns(token['email'])
            elif token['role'] == 'influencer':
                data = get_public_campaigns()
            else:
                data = get_all_campaigns()
           
            return {'data': data}, 200
        return {'valid': False}, 200

class InfluencerCRUD(Resource):
    def get(self):
        data = get_influencers()
        if len(data) == 0:
            return {'data': []}, 200
        return {'data': data}, 200
    def post(self):
        pass
    def put(self):
        data = request.get_json()
        edit_influencer_profile(data['influencer'])
        return {'success': True}, 200
    def delete(self):
        data = request.get_json()
        delete_influencer(data['id'])
        return {'data': get_influencers()}, 200

class SponsorCRUD(Resource):
    def get(self):
        data = get_sponsors()
        if len(data) == 0:
            return {'data': []}, 200
        return {'data': data}, 200
    def post(self):
        pass
    def put(self):
        pass
    def delete(self):
        data = request.get_json()
        delete_sponsor(data['id'])
        return {'data': get_sponsors()}, 200

class CampaignFlagAPI(Resource):
    def post(self):
        param = request.get_json()
        flag_campaign(param.get('id'))
        data = get_all_campaigns()
        return {'data': data}, 200

class ProfileAPI(Resource):
    def get(self):
        token = jwt.decode(request.cookies.get('auth_token'), secret_key, algorithms=['HS256'])
        role = token['role'] 
        if role == 'sponsor':
            return {'data': get_sponsor(token['email'])}, 200
        elif role == 'influencer':
            return {'data': get_influencer(token['email'])}, 200 
    def post(self):
        pass
    def put(self):
        pass
    def delete(self):
        pass

class RequestsAPI(Resource):
    def post(self):
        token = jwt.decode(request.cookies.get('auth_token'), secret_key, algorithms=['HS256'])
        role = token['role'] 
        email = token['email']
        data = request.get_json()
        print(data)
        if new_ad_request(data, role, email):
            data = get_requests(email, role)
            new_requests = [i for i in data if (i['status'] == 'neutral' and i['by'] != role)]
            active_campaigns = [i for i in data if i['status'] == 'accept']
            sent_requests = [i for i in data if i['by'] == role]
            return {'active': active_campaigns, 'new': new_requests, 'sent': sent_requests}, 200
        return {'success': False}, 200
    def get(self):
        token = jwt.decode(request.cookies.get('auth_token'), secret_key, algorithms=['HS256'])
        role = token['role'] 
        email = token['email']
        data = get_requests(email, role)

        new_requests = [i for i in data if (i['status'] == 'neutral' and i['by'] != role)]
        sent_requests = [i for i in data if (i['status'] == 'neutral' and i['by'] == role)]
        active_campaigns = [i for i in data if i['status'] == 'accept']

        return {'active': active_campaigns, 'new': new_requests, 'sent': sent_requests}, 200
    def put(self):
        #print("reached put")
        data = request.get_json()
        token = jwt.decode(request.cookies.get('auth_token'), secret_key, algorithms=['HS256'])
        role = token['role'] 
        email = token['email']
        #print(data)
        if edit_request(data['id'], data['status']):
            data = get_requests(email, role)
            new_requests = [i for i in data if (i['status'] == 'neutral' and i['by'] != role)]
            active_campaigns = [i for i in data if i['status'] == 'accept']
            sent_requests = [i for i in data if i['by'] == role]
            return {'active': active_campaigns, 'new': new_requests, 'sent': sent_requests}, 200
        return {'active': [], 'new': [], 'sent': []}
    def delete(self):
        data = request.get_json()
        if delete_request(data['id']):
            token = jwt.decode(request.cookies.get('auth_token'), secret_key, algorithms=['HS256'])
            role = token['role'] 
            email = token['email']
            data = get_requests(email, role)

            new_requests = [i for i in data if (i['status'] == 'neutral' and i['by'] != role)]
            sent_requests = [i for i in data if (i['status'] == 'neutral' and i['by'] == role)]
            active_campaigns = [i for i in data if i['status'] == 'accept']
            print(new_requests)
            print(sent_requests)
            print(active_campaigns)
            return {'active': active_campaigns, 'new': new_requests, 'sent': sent_requests}, 200
        return {'active': [], 'new': [], 'sent': []}


class StatsAPI(Resource):
    def post(self):
        data = request.get_json()
        if data['required'] == "bar-chart":
            sponsors = get_sponsors()
            influencers = get_influencers()
            return {'data': {
            "labels": ["Sponsors", "Influencers"],
            "values": [len(sponsors), len(influencers)]
            }}, 200
        else:
            campaigns = get_all_campaigns()
            active_campaigns = get_active_campaigns()
            return {'data': {
            "labels": ["Campaigns", "Active-Campaigns"],
            "values": [len(campaigns), len(active_campaigns)]
            }}, 200