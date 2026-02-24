const AUTH_URL = "https://functions.poehali.dev/5d3caa49-5d31-4eb5-8bf5-ab798d7d30e2";
const INV_URL = "https://functions.poehali.dev/99f934d7-938f-4137-8d71-ba06811bfcad";

function getToken() {
  return localStorage.getItem("token") || "";
}

async function req(url: string, path: string, method = "GET", body?: object) {
  const res = await fetch(url + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Token": getToken(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    if (typeof data === "string") return JSON.parse(data);
    return data;
  } catch {
    return { error: text };
  }
}

export const api = {
  register: (email: string, password: string, full_name: string, phone: string) =>
    req(AUTH_URL, "/register", "POST", { email, password, full_name, phone }),
  login: (email: string, password: string) =>
    req(AUTH_URL, "/login", "POST", { email, password }),
  logout: () => req(AUTH_URL, "/logout", "POST"),
  me: () => req(AUTH_URL, "/me", "GET"),

  investments: () => req(INV_URL, "/list", "GET"),
  createInvestment: (data: object) => req(INV_URL, "/create", "POST", data),
  deposit: (amount: number) => req(INV_URL, "/deposit", "POST", { amount }),
  withdraw: (amount: number, details: string) => req(INV_URL, "/withdraw", "POST", { amount, details }),
  transactions: () => req(INV_URL, "/transactions", "GET"),
};
