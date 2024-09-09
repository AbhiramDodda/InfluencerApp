from celery import Celery
from app import celery
from db.db import db
from models.models import AdRequests, Campaigns
import yagmail
import datetime

@celery.task
def update_attribute_if_ended():
    today = datetime.utcnow().date().strftime('%Y-%m-%d')
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
    yag = yagmail.SMTP('22f2000660@ds.study.iitm.ac.in', '6cfwv7au')
    yag.send(
        to=mail,
        subject='Reminder',
        contents='You have pending ad requests.'
    )
