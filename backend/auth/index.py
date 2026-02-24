"""Авторизация: регистрация, вход, выход, профиль"""
import json
import os
import hashlib
import secrets
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(pwd: str) -> str:
    return hashlib.sha256(pwd.encode()).hexdigest()


def get_user_by_token(conn, token: str):
    cur = conn.cursor()
    cur.execute(
        "SELECT u.id, u.email, u.full_name, u.phone, u.balance, u.is_admin "
        "FROM sessions s JOIN users u ON u.id = s.user_id "
        "WHERE s.token = %s AND s.expires_at > NOW()",
        (token,),
    )
    row = cur.fetchone()
    if not row:
        return None
    return {"id": row[0], "email": row[1], "full_name": row[2], "phone": row[3], "balance": float(row[4]), "is_admin": row[5]}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    path = event.get("path", "/")
    method = event.get("httpMethod", "GET")
    body = json.loads(event.get("body") or "{}")
    token = event.get("headers", {}).get("X-Auth-Token", "")

    conn = get_conn()

    # POST /register
    if method == "POST" and path.endswith("/register"):
        email = body.get("email", "").strip().lower()
        password = body.get("password", "")
        full_name = body.get("full_name", "").strip()
        phone = body.get("phone", "").strip()
        if not email or not password:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Email и пароль обязательны"})}
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return {"statusCode": 409, "headers": CORS, "body": json.dumps({"error": "Email уже зарегистрирован"})}
        cur.execute(
            "INSERT INTO users (email, password_hash, full_name, phone) VALUES (%s, %s, %s, %s) RETURNING id",
            (email, hash_password(password), full_name, phone),
        )
        user_id = cur.fetchone()[0]
        new_token = secrets.token_hex(32)
        cur.execute("INSERT INTO sessions (user_id, token) VALUES (%s, %s)", (user_id, new_token))
        conn.commit()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"token": new_token, "user": {"id": user_id, "email": email, "full_name": full_name, "is_admin": False, "balance": 0}})}

    # POST /login
    if method == "POST" and path.endswith("/login"):
        email = body.get("email", "").strip().lower()
        password = body.get("password", "")
        cur = conn.cursor()
        cur.execute("SELECT id, email, full_name, phone, balance, is_admin FROM users WHERE email = %s AND password_hash = %s", (email, hash_password(password)))
        row = cur.fetchone()
        if not row:
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Неверный email или пароль"})}
        new_token = secrets.token_hex(32)
        cur.execute("INSERT INTO sessions (user_id, token) VALUES (%s, %s)", (row[0], new_token))
        conn.commit()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"token": new_token, "user": {"id": row[0], "email": row[1], "full_name": row[2], "phone": row[3], "balance": float(row[4]), "is_admin": row[5]}})}

    # POST /logout
    if method == "POST" and path.endswith("/logout"):
        if token:
            cur = conn.cursor()
            cur.execute("UPDATE sessions SET expires_at = NOW() WHERE token = %s", (token,))
            conn.commit()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    # GET /me
    if method == "GET" and path.endswith("/me"):
        user = get_user_by_token(conn, token)
        if not user:
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"user": user})}

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}
