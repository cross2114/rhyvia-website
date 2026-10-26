import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch, MagicMock
from datetime import date, timedelta

spec = importlib.util.spec_from_file_location('booking', Path(__file__).resolve().parents[1]/'server/booking.py')
booking = importlib.util.module_from_spec(spec)
spec.loader.exec_module(booking)

class BookingTests(unittest.TestCase):
    def setUp(self):
        self.data = dict(name='测试顾客', email='customer@example.com', date=str(date.today()+timedelta(days=3)), location='Hong Kong', chair='SOFA', notes='Please contact me by email.')

    def test_valid_request(self):
        self.assertEqual(booking.validate(self.data)['chair'], 'SOFA')

    def test_invalid_fields(self):
        for field,value in [('email','a@b.com\r\nBcc: victim@example.com'),('name','a\nb'),('chair','UNKNOWN'),('date','2000-01-01'),('notes','x'*1001),('location','')]:
            with self.subTest(field=field), self.assertRaises(ValueError):
                booking.validate({**self.data,field:value})

    def test_missing_config_does_not_succeed(self):
        with patch.dict(booking.os.environ,{},clear=True), self.assertRaises(RuntimeError):
            booking.deliver(self.data)

    def test_fixed_recipient_and_reply_to(self):
        with patch.dict(booking.os.environ,{'SMTP_HOST':'smtp.example.com','SMTP_USER':'sender@example.com','SMTP_PASSWORD':'test-only'}), patch.object(booking.smtplib,'SMTP_SSL') as smtp:
            client=smtp.return_value.__enter__.return_value
            client.send_message.return_value={}
            booking.deliver({**self.data,'to':'attacker@example.com'})
            msg=client.send_message.call_args.args[0]
            self.assertEqual(str(msg['To']),'13392884743@163.com')
            self.assertEqual(str(msg['Reply-To']),'customer@example.com')
            self.assertEqual(str(msg['From']),'sender@example.com')
            self.assertIn('律动沙发', msg.get_content())
            self.assertIsInstance(smtp.call_args.kwargs['context'], booking.ssl.SSLContext)

    def test_refused_recipient_fails(self):
        with patch.dict(booking.os.environ,{'SMTP_HOST':'smtp.example.com','SMTP_USER':'sender@example.com','SMTP_PASSWORD':'test-only'}), patch.object(booking.smtplib,'SMTP_SSL') as smtp:
            smtp.return_value.__enter__.return_value.send_message.return_value={'recipient':(550,b'refused')}
            with self.assertRaises(RuntimeError): booking.deliver(self.data)

    def test_rate_limit_and_expiry(self):
        booking.attempts.clear()
        with patch.object(booking.time,'monotonic',return_value=1000):
            self.assertTrue(all(booking.allowed('test') for _ in range(5)))
            self.assertFalse(booking.allowed('test'))
        with patch.object(booking.time,'monotonic',return_value=1601):
            self.assertTrue(booking.allowed('test'))

if __name__=='__main__': unittest.main()
