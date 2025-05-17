import asyncio
from flask import Flask, render_template, jsonify
from flask_sqlalchemy import SQLAlchemy
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime

from proxy_scraper import scrape_and_validate
from models import db, Proxy


def create_app():
    app = Flask(__name__, static_folder='static', template_folder='templates')
    app.config.from_object('config.Config')
    db.init_app(app)

    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/api/proxies')
    def get_proxies():
        proxies = Proxy.query.filter_by(validated_ok=True).all()
        return jsonify([
            {
                'ip': p.ip,
                'port': p.port,
                'type': p.type,
                'https': p.https,
                'region': p.region or ''
            } for p in proxies
        ])

    return app


def update_proxies():
    print(f"[{datetime.now()}] 开始更新代理")
    app = create_app()
    with app.app_context():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        valid_proxies = loop.run_until_complete(scrape_and_validate())

        existing = {f"{p.ip}:{p.port}": p for p in Proxy.query.all()}
        valid_keys = set()

        for p in valid_proxies:
            key = f"{p['ip']}:{p['port']}"
            valid_keys.add(key)
            if key in existing:
                db_p = existing[key]
                db_p.type = p.get('type')
                db_p.https = p.get('https')
                db_p.region = p.get('region')
                db_p.last_checked = datetime.now()
                db_p.validated_ok = True
            else:
                new_p = Proxy(
                    ip=p['ip'],
                    port=p['port'],
                    type=p.get('type'),
                    https=p.get('https'),
                    region=p.get('region'),
                    last_checked=datetime.now(),
                    validated_ok=True
                )
                db.session.add(new_p)

        # 删除无效代理
        for key, db_p in existing.items():
            if key not in valid_keys:
                db.session.delete(db_p)

        db.session.commit()
    print(f"[{datetime.now()}] 代理更新完成，共{len(valid_proxies)}个有效代理")


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
        update_proxies()  # 启动时先更新一次
        scheduler = BackgroundScheduler()
        scheduler.add_job(func=update_proxies, trigger='interval', minutes=5)
        scheduler.start()
    app.run(host='0.0.0.0', port=5000, debug=True) 