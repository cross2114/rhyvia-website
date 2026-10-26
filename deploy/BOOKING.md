# Booking email deployment

Recipient is fixed in `server/booking.py`: `13392884743@163.com`. Customer email is Reply-To, never the SMTP sender. The website calls the same-origin `/api/booking` endpoint. GitHub Pages cannot run this service; on Pages the form reports unavailable rather than pretending to send.

1. Deploy the static `dist/` website on the Alibaba server and enable domain HTTPS.
2. Copy `server/booking.py` to `/opt/rhyvia-booking/booking.py`, owned by root and readable by the service. Python 3 uses only its standard library.
3. Create `/etc/rhyvia-booking.env` from `booking.env.example`, owned by root with mode 600. The mailbox owner supplies the SMTP authorization code directly on the server. Do not use the account login password. Do not commit or upload this filled file.
4. Install `rhyvia-booking.service` in `/etc/systemd/system/`; run `systemctl daemon-reload` and `systemctl enable --now rhyvia-booking`.
5. Add the example Nginx location inside the existing HTTPS server block. Validate with `nginx -t` before reload. Do not expose port 8765 publicly. The proxy must overwrite X-Real-IP. If SELinux blocks the Nginx upstream, configure the needed proxy permission; do not disable SELinux.
6. Submit an explicitly labelled test booking from the production domain. Confirm the inbox receives it, reply targets the entered customer email, failure does not report success, and TLS renewal is configured.

No customer submissions are stored by this service. The in-memory rate limiter permits five attempts per IP per ten minutes. SMTP acceptance is necessary for success, but inbox delivery must be verified separately. If the network response is lost after SMTP acceptance, delivery may have occurred; no automatic retries are made.

If a different sender is selected, replace SMTP_HOST/PORT/USER/PASSWORD using that provider's SSL SMTP settings; recipient remains fixed.
