# 🔒 راه‌اندازی SSL روی سرور (Nginx بیرونی)

این فایل راهنما توضیح می‌دهد چگونه Nginx بیرونی را روی سرور نصب و SSL را فعال کنید تا پروژه Docker شما (Frontend + Backend) با HTTPS اجرا شود.

---

## 1️⃣ نصب Nginx روی سرور
ابتدا روی سرور اصلی (نه داخل Docker) دستور زیر را اجرا کنید:

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```
پورت بخش فرانت اند docker-compose.yml را برای اجرا با ssl روی 8080:80 تغییر دهید و سپس build بگیرید.

## 2️⃣ ویرایش کانفیگ Nginx

وارد پوشه Get_ssl شوید.

فایل nginx-setting-internal را کپی کنید و نام آن را مثلاً attendance بگذارید:

```bash
cp nginx-setting-internal attendance
```
فایل را باز کنید و ویرایش کنید
دامنه خود را در  جای your-domain.com جایگزین کنید.

```bash
nano attendance
```
با دستور زیر فایل را انتقال دهید به مسیر زیر
```bash
sudo mv attendance /etc/nginx/sites-available/
```
  
## 3️⃣ فعال‌سازی کانفیگ Nginx

```bash
sudo ln -s /etc/nginx/sites-available/attendance /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 4️⃣ فعال‌سازی SSL با Certbot

```bash
sudo certbot --nginx -d your-domain.com
```

پس از اجرای این دستور، Certbot به طور خودکار گواهی SSL را دریافت و Nginx را به‌روزرسانی می‌کند.


## 5️⃣ نتیجه

تمام درخواست‌های HTTP به HTTPS هدایت می‌شوند.

مسیر /api/ به بک‌اند (Gunicorn داخل Docker) فوروارد می‌شود.

مسیر / به فرانت‌اند (Nginx داخل Docker) فوروارد می‌شود.
