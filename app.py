from build import app, api, token_required
from flask import render_template, redirect, url_for, request, make_response
from flask_restful import Api
from api.api import LoginValidation, SignupValidation, CampaignCRUD, AdminApproval, InfluencerCRUD, CampaignFlagAPI, ProfileAPI, RequestsAPI, SponsorCRUD, StatsAPI
import jwt
from build import celery
from celery.schedules import crontab
import yagmail
from db.db import db
from models.models import AdRequests, Campaigns
from datetime import datetime
from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask_caching import Cache

secret_key = 'Secret_Key9@+'

cache = Cache()
cache.init_app(app)

@app.route('/logout')
def logout():
    resp = make_response(redirect("/"))
    resp.set_cookie('auth_token', '', expires = 0)
    return resp

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/admin')
@token_required
def admin():
    token = request.cookies.get('auth_token')
    if token:
        try:
            token = jwt.decode(token, secret_key, algorithms=['HS256'])
            if token['role'] != 'admin':
                return redirect(url_for(index))
            return render_template('admin.html')
        except:
            return redirect(url_for('index'))
    else:
        return redirect(url_for('index'))

@app.route("/dashboard")
@token_required
def dashboard():
    token = request.cookies.get('auth_token')
    if token:
        try:
            token = jwt.decode(token, secret_key, algorithms=['HS256'])
            if token['role'] == 'sponsor':
                return redirect(url_for('sponsor'))
            elif token['role'] == 'admin':
                return redirect(url_for('admin'))
            else:
                return redirect(url_for('influencer'))
        except:
            return redirect(url_for('index'))
    else:
        return redirect(url_for('index'))

@app.route('/sponsor')
@token_required
def sponsor():
    token = request.cookies.get('auth_token')
    if token:
        try:
            token = jwt.decode(token, secret_key, algorithms=['HS256'])
            if token['role'] != 'sponsor':
                return redirect(url_for('index'))
            return render_template('sponsor.html')
        except:
            return redirect(url_for('index'))
    else:
        return redirect(url_for('index'))

@app.route('/influencer')
@token_required
def influencer():
    token = request.cookies.get('auth_token')
    if token:
        try:
            token = jwt.decode(token, secret_key, algorithms=['HS256'])
            if token['role'] != 'influencer':
                return redirect(url_for(index))
            return render_template('influencer.html')
        except:
            return redirect(url_for('index'))
    else:
        return redirect(url_for('index'))


################################################## CELERY ##################################################

celery.conf.beat_schedule = {
    'send-daily-reminders': {
        'task': 'app.send_daily_reminders',
        'schedule': crontab(hour=17, minute=37), 
    },
}

'''celery.conf.beat_schedule = {
    'send-monthly-report': {
        'task': 'generate_monthly_report',
        'schedule': crontab(day_of_month=1, hour=0, minute=0),
    },
}'''

@celery.task
def send_daily_reminders():
    now = datetime.now()

    # Format the date as YYYY-MM-DD
    today = now.strftime('%Y-%m-%d')
    records = db.session.query(Campaigns).filter(Campaigns.end_date == today).all()
    
    for record in records:
        record.expired = 'yes'
    db.session.commit()

    pending_requests = []
    ref = db.session.query(AdRequests).filter(AdRequests.status == 'neutral').all()
    for i in ref:
        if i.by == "sponsor":
            pending_requests.append(i.influencer_id)
        else:
            pending_requests.append(i.sponsor_id)
    
    dic = {}
    for i in pending_requests:
        if i not in dic:
            dic[i] = 0
        dic[i] += 1
    for i in dic:
        send_mail(i)

def send_mail(mail):
    msg = MIMEMultipart()
    msg['Subject'] = 'Reminder'
    msg['From'] = "abhiramdodda@gmail.com"
    msg['To']= mail

    server = SMTP('smtp.gmail.com',587)
    server.starttls()
    message = "you have pending requests"
    msg.attach(MIMEText(message,'html'))
    server.login("","")
    server.send_message(msg)
    server.quit()



# API routes
api.add_resource(LoginValidation, '/login_validate') # POST
api.add_resource(SignupValidation, '/signup_validate') # GET, POST
api.add_resource(AdminApproval, '/admin-approval') # GET, POST, DELETE
api.add_resource(CampaignCRUD, '/campaign') 
api.add_resource(InfluencerCRUD, '/influencer-data')
api.add_resource(CampaignFlagAPI, '/campaign-flag') # POST
api.add_resource(ProfileAPI, '/profile') # GET
api.add_resource(RequestsAPI, '/requests') # GET, POST, PUT
api.add_resource(SponsorCRUD, '/sponsor-data')
api.add_resource(StatsAPI, '/stats') # POST


if __name__ == '__main__':
    app.run(debug = False)