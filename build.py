from flask import Flask, jsonify, request
from flask_restful import Api
import os
from db.db import db
from functools import wraps
import jwt
from celery import Celery

secret_key = 'Secret_Key9@+'
base_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(base_dir, 'db', 'influencerappdb.sqlite3')
print(db_path)

def build_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = f'sqlite:///{db_path}'
    app.config.update(
        CELERY_BROKER_URL='redis://localhost:6379/0',
        result_backend='redis://localhost:6379/0'
    )
    api = Api(app)
    app.app_context().push()
    app.secret_key = os.urandom(36)
    db.init_app(app)
    celery = Celery(app, broker = app.config["CELERY_BROKER_URL"], backend = app.config['result_backend'])
    celery.conf.update(app.config)
    app.config["CACHE_TYPE"]="RedisCache"
    app.config["CACHE_REDIS_URL"] = "redis://localhost:6379/2"
    app.config["CACHE_DEFAULT_TIMEOUT"] = 1000

    return app, api, celery

app, api, celery = build_app()

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('auth_token')
        if not token:
            return jsonify({'message': 'Token missing'})
        try:
            data = jwt.decode(token, secret_key, algorithms = ['HS256'])
        except:
            return jsonify({'message':'Invalid'}), 403
        return f(*args, **kwargs)
    return decorated