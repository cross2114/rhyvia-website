"""Loopback-only booking mail service; front with Nginx HTTPS."""
import json
import os
import re
import smtplib
import ssl
import threading
import time
from collections import defaultdict, deque
from datetime import date
from email.message import EmailMessage
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

RECIPIENT = '13392884743@163.com'
PRODUCTS = {'': '未决定 / Not sure yet', 'ONE': 'RHYVIA ONE', 'TWO': 'RHYVIA TWO', 'THREE': 'RHYVIA THREE', 'BED': '律动床 / Rhythm bed', 'SOFA': '律动沙发 / Rhythmic sofa'}
LIMITS = {'name': 100, 'email': 254, 'date': 10, 'location': 200, 'chair': 10, 'notes': 1000}
lock = threading.Lock()
attempts = defaultdict(deque)

def validate(data):
    if not isinstance(data, dict):
        raise ValueError('Invalid request')
    clean = {}
    for field, limit in LIMITS.items():
        value = data.get(field, '')
        if not isinstance(value, str) or len(value) > limit or '\x00' in value:
            raise ValueError('Invalid field')
        clean[field] = value.strip()
    if not all(clean[k] for k in ('name', 'email', 'date', 'location')):
        raise ValueError('Required field')
    if not re.fullmatch(r'[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+', clean['email']):
        raise ValueError('Invalid email')
    if any(c in clean['name'] for c in '\r\n'):
        raise ValueError('Invalid name')
    if date.fromisoformat(clean['date']) < date.today():
        raise ValueError('Date is in the past')
    if clean['chair'] not in PRODUCTS:
        raise ValueError('Invalid product')
    return clean

def deliver(data):
    host, user, password = (os.environ.get(k, '') for k in ('SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD'))
    if not all((host, user, password)):
        raise RuntimeError('Mail is not configured')
    msg = EmailMessage()
    msg['Subject'] = 'RHYVIA 新预约 / New experience request'
    msg['From'] = user
    msg['To'] = RECIPIENT
    msg['Reply-To'] = data['email']
    msg.set_content('\n'.join([
        'RHYVIA 网站预约 / Website experience request',
        '称呼 / Name: ' + data['name'], '联系邮箱 / Email: ' + data['email'],
        '产品 / Product: ' + PRODUCTS[data['chair']], '偏好日期 / Date: ' + data['date'],
        '偏好地点 / Location: ' + data['location'], '备注 / Notes: ' + (data['notes'] or '—'),
        '', '此邮件为顾客预约意向，具体时间与地点需团队确认。',
        'This is a request, not a confirmed booking. Reply directly to contact the customer.'
    ]))
    with smtplib.SMTP_SSL(host, int(os.environ.get('SMTP_PORT', '465')), timeout=20, context=ssl.create_default_context()) as smtp:
        smtp.login(user, password)
        if smtp.send_message(msg):
            raise RuntimeError('Recipient refused')

def allowed(ip):
    now = time.monotonic()
    with lock:
        for key in list(attempts):
            while attempts[key] and attempts[key][0] < now - 600:
                attempts[key].popleft()
            if not attempts[key]:
                del attempts[key]
        queue = attempts[ip]
        if len(queue) >= 5:
            return False
        queue.append(now)
        return True

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass  # Never log customer details or credentials.

    def respond(self, code, payload):
        body = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != '/api/booking':
            return self.respond(404, {'ok': False})
        origins = os.environ.get('BOOKING_ORIGINS', 'https://rhyviawellness.com,https://www.rhyviawellness.com').split(',')
        if self.headers.get('Origin') not in origins:
            return self.respond(403, {'ok': False})
        if self.headers.get_content_type() != 'application/json':
            return self.respond(415, {'ok': False})
        try:
            size = int(self.headers.get('Content-Length', '0'))
            if not 0 < size <= 16384:
                return self.respond(413, {'ok': False})
            self.connection.settimeout(10)
            data = json.loads(self.rfile.read(size))
            clean = validate(data)
        except (ValueError, OSError):
            return self.respond(400, {'ok': False})
        # Nginx must overwrite X-Real-IP; this service listens on loopback only.
        if not allowed(self.headers.get('X-Real-IP', self.client_address[0])):
            return self.respond(429, {'ok': False})
        try:
            deliver(clean)
        except (OSError, smtplib.SMTPException, RuntimeError, ValueError):
            return self.respond(503, {'ok': False})
        self.respond(200, {'ok': True})

if __name__ == '__main__':
    ThreadingHTTPServer(('127.0.0.1', 8765), Handler).serve_forever()
