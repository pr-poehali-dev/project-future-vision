"""Инвестиции: создание, список, пополнение баланса, вывод средств"""
import json
import os
import psycopg2
from datetime import datetime, timedelta

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_user_by_token(conn, token: str):
    cur = conn.cursor()
    cur.execute(
        "SELECT u.id, u.email, u.full_name, u.balance, u.is_admin "
        "FROM sessions s JOIN users u ON u.id = s.user_id "
        "WHERE s.token = %s AND s.expires_at > NOW()",
        (token,),
    )
    row = cur.fetchone()
    if not row:
        return None
    return {"id": row[0], "email": row[1], "full_name": row[2], "balance": float(row[3]), "is_admin": row[4]}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    path = event.get("path", "/")
    method = event.get("httpMethod", "GET")
    body = json.loads(event.get("body") or "{}")
    token = event.get("headers", {}).get("X-Auth-Token", "")

    conn = get_conn()
    user = get_user_by_token(conn, token)
    if not user:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

    cur = conn.cursor()

    # GET /list — список инвестиций пользователя
    if method == "GET" and path.endswith("/list"):
        cur.execute(
            "SELECT id, tariff_name, amount, min_daily, max_daily, bonus_percent, period_days, started_at, ends_at, status, accrued "
            "FROM investments WHERE user_id = %s ORDER BY started_at DESC",
            (user["id"],),
        )
        rows = cur.fetchall()
        investments = []
        for r in rows:
            investments.append({
                "id": r[0], "tariff_name": r[1], "amount": float(r[2]),
                "min_daily": float(r[3]), "max_daily": float(r[4]), "bonus_percent": float(r[5]),
                "period_days": r[6], "started_at": r[7].isoformat() if r[7] else None,
                "ends_at": r[8].isoformat() if r[8] else None,
                "status": r[9], "accrued": float(r[10])
            })
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"investments": investments, "balance": user["balance"]})}

    # POST /create — создать инвестицию
    if method == "POST" and path.endswith("/create"):
        tariff_name = body.get("tariff_name")
        amount = float(body.get("amount", 0))
        min_daily = float(body.get("min_daily", 0))
        max_daily = float(body.get("max_daily", 0))
        bonus_percent = float(body.get("bonus_percent", 0))
        period_days = int(body.get("period_days", 14))

        if amount <= 0:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Некорректная сумма"})}
        if user["balance"] < amount:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Недостаточно средств на балансе"})}

        ends_at = datetime.now() + timedelta(days=period_days)
        cur.execute(
            "INSERT INTO investments (user_id, tariff_name, amount, min_daily, max_daily, bonus_percent, period_days, ends_at) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (user["id"], tariff_name, amount, min_daily, max_daily, bonus_percent, period_days, ends_at),
        )
        inv_id = cur.fetchone()[0]
        cur.execute("UPDATE users SET balance = balance - %s WHERE id = %s", (amount, user["id"]))
        cur.execute(
            "INSERT INTO transactions (user_id, type, amount, status, comment) VALUES (%s, %s, %s, %s, %s)",
            (user["id"], "invest", amount, "completed", f"Инвестиция #{inv_id}: {tariff_name} на {period_days} дней"),
        )
        conn.commit()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "investment_id": inv_id})}

    # POST /deposit — пополнение баланса (заявка)
    if method == "POST" and path.endswith("/deposit"):
        amount = float(body.get("amount", 0))
        if amount <= 0:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Некорректная сумма"})}
        cur.execute(
            "INSERT INTO transactions (user_id, type, amount, status, comment) VALUES (%s, %s, %s, %s, %s)",
            (user["id"], "deposit", amount, "pending", "Заявка на пополнение"),
        )
        conn.commit()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "message": "Заявка на пополнение принята. Ожидайте подтверждения."})}

    # POST /withdraw — заявка на вывод
    if method == "POST" and path.endswith("/withdraw"):
        amount = float(body.get("amount", 0))
        details = body.get("details", "")
        if amount <= 0:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Некорректная сумма"})}
        if user["balance"] < amount:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Недостаточно средств"})}
        cur.execute(
            "INSERT INTO transactions (user_id, type, amount, status, comment) VALUES (%s, %s, %s, %s, %s)",
            (user["id"], "withdraw", amount, "pending", f"Вывод на: {details}"),
        )
        conn.commit()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "message": "Заявка на вывод принята. Средства будут отправлены после завершения инвестиционного периода."})}

    # GET /transactions — история операций
    if method == "GET" and path.endswith("/transactions"):
        cur.execute(
            "SELECT id, type, amount, status, comment, created_at FROM transactions WHERE user_id = %s ORDER BY created_at DESC LIMIT 50",
            (user["id"],),
        )
        rows = cur.fetchall()
        txs = [{"id": r[0], "type": r[1], "amount": float(r[2]), "status": r[3], "comment": r[4], "created_at": r[5].isoformat()} for r in rows]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"transactions": txs})}

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}
