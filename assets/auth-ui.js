/* AnumBrix account button + Supabase authentication modal. */
(function () {
  "use strict";

  function boot() {
    const client = window.anumBrixSupabase;
    if (!client) return;

    const headerRight = document.querySelector(".header-right");
    if (!headerRight || document.getElementById("abAccountBtn")) return;

    const accountBtn = document.createElement("button");
    accountBtn.id = "abAccountBtn";
    accountBtn.className = "ab-account-btn";
    accountBtn.type = "button";
    accountBtn.setAttribute("aria-label", "Login or register");
    accountBtn.setAttribute("title", "Login / Register");
    accountBtn.innerHTML = `
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <circle cx="12" cy="11" r="5.2" fill="currentColor" opacity=".98"/>
        <path d="M3.9 23.2c0-4.05 3.55-6.7 8.1-6.7s8.1 2.65 8.1 6.7c0 .75-.6 1.35-1.35 1.35H5.25c-.75 0-1.35-.6-1.35-1.35Z" fill="currentColor" opacity=".98"/>
        <rect x="16.3" y="15.3" width="12.3" height="9.6" rx="2.2" fill="#24102f" stroke="currentColor" stroke-width="1.55"/>
        <path d="m17.7 17.3 4.75 3.65 4.75-3.65" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="ab-account-status-dot" aria-hidden="true"></span>`;
    headerRight.appendChild(accountBtn);

    const style = document.createElement("style");
    style.textContent = `
      .ab-account-btn{position:relative;flex:0 0 auto;width:45px;height:45px;border:1px solid rgba(188,86,255,.38);border-radius:14px;background:linear-gradient(135deg,rgba(91,18,137,.72),rgba(29,8,52,.92));color:#f2dfff;display:grid;place-items:center;cursor:pointer;box-shadow:0 0 18px rgba(147,48,255,.18);transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease}
      .ab-account-btn:hover{transform:translateY(-2px);border-color:#c16cff;box-shadow:0 0 26px rgba(150,40,255,.35)}
      .ab-account-btn:active{transform:scale(.96)}
      .ab-account-btn svg{width:25px;height:25px;fill:currentColor;filter:drop-shadow(0 0 7px rgba(218,142,255,.45))}
      .ab-account-status-dot{position:absolute;right:5px;top:5px;width:7px;height:7px;border-radius:50%;background:#8e7b9c;box-shadow:0 0 0 2px rgba(20,7,34,.9)}
      .ab-account-btn.ab-signed-in .ab-account-status-dot{background:#55e89b;box-shadow:0 0 9px rgba(85,232,155,.85),0 0 0 2px rgba(20,7,34,.9)}
      .ab-auth-modal{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(5,1,10,.76);backdrop-filter:blur(9px)}
      .ab-auth-modal.open{display:flex}
      .ab-auth-card{position:relative;width:min(440px,calc(100vw - 30px));max-height:calc(100vh - 40px);overflow:auto;border:1px solid rgba(193,108,255,.3);border-radius:24px;background:linear-gradient(155deg,#170b25 0%,#0d0615 72%);box-shadow:0 25px 90px rgba(0,0,0,.65),0 0 45px rgba(139,44,255,.2);padding:25px}
      .ab-auth-close{position:absolute;right:14px;top:14px;width:36px;height:36px;border:1px solid rgba(255,255,255,.1);border-radius:11px;background:rgba(255,255,255,.05);color:#d8c8df;font-size:22px;cursor:pointer}
      .ab-auth-close:hover{background:rgba(255,255,255,.1);color:white}
      .ab-auth-brand{display:flex;align-items:center;gap:12px;margin-bottom:7px}
      .ab-auth-logo{width:42px;height:42px;border-radius:12px;object-fit:contain;background:#12061c;box-shadow:0 0 22px rgba(162,55,255,.35)}
      .ab-auth-card h2{margin:0;color:#fff;font-size:24px}
      .ab-auth-card .ab-auth-subtitle{margin:0 0 20px;color:#aa98b7;font-size:13px;line-height:1.55}
      .ab-auth-tabs{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:16px;padding:4px;border-radius:13px;background:rgba(255,255,255,.045)}
      .ab-auth-tab{border:0;border-radius:10px;background:transparent;color:#9f8ba9;padding:10px;font-weight:700;cursor:pointer}
      .ab-auth-tab.active{background:linear-gradient(135deg,#8e20ec,#b13cff);color:white;box-shadow:0 6px 20px rgba(145,33,239,.25)}
      .ab-auth-form{display:grid;gap:10px}
      .ab-auth-form label{color:#cfc0d5;font-size:12px;font-weight:700}
      .ab-auth-form input{width:100%;box-sizing:border-box;height:46px;border:1px solid rgba(195,118,255,.2);border-radius:12px;background:#0b0610;color:#fff;padding:0 13px;outline:none}
      .ab-auth-form input:focus{border-color:#b65aff;box-shadow:0 0 0 3px rgba(168,69,255,.1)}
      .ab-auth-submit{height:46px;border:0;border-radius:12px;background:linear-gradient(135deg,#8c1ee8,#b43eff);color:#fff;font-weight:800;cursor:pointer;box-shadow:0 9px 25px rgba(142,32,236,.25)}
      .ab-auth-submit:disabled{opacity:.6;cursor:wait}
      .ab-auth-message{min-height:20px;margin-top:12px;color:#aa98b7;font-size:13px;line-height:1.45}
      .ab-auth-message.error{color:#ff8eaa}.ab-auth-message.success{color:#69e6a5}
      .ab-auth-account{display:grid;gap:14px}
      .ab-auth-account-email{padding:13px;border:1px solid rgba(195,118,255,.17);border-radius:13px;background:rgba(255,255,255,.035);color:#ddd0e3;font-size:13px;word-break:break-word}
      .ab-auth-signout{height:44px;border:1px solid rgba(255,120,160,.28);border-radius:12px;background:rgba(255,70,120,.06);color:#ffb2c6;font-weight:700;cursor:pointer}
      .ab-auth-note{margin-top:14px;color:#7f7087;font-size:11px;line-height:1.5}
      @media(max-width:560px){.ab-account-btn{width:43px;height:43px;border-radius:12px}.ab-auth-modal{padding:12px}.ab-auth-card{padding:21px;border-radius:20px}}
    `;
    document.head.appendChild(style);

    const modal = document.createElement("div");
    modal.className = "ab-auth-modal";
    modal.id = "abAuthModal";
    modal.innerHTML = `
      <div class="ab-auth-card" role="dialog" aria-modal="true" aria-labelledby="abAuthTitle">
        <button type="button" class="ab-auth-close" id="abAuthClose" aria-label="Close">×</button>
        <div id="abAuthContent"></div>
      </div>`;
    document.body.appendChild(modal);

    const content = document.getElementById("abAuthContent");

    function message(text, type) {
      const el = document.getElementById("abAuthMessage");
      if (!el) return;
      el.textContent = text || "";
      el.className = `ab-auth-message${type ? ` ${type}` : ""}`;
    }

    function signedInHtml(session) {
      const email = String(session?.user?.email || "Logged-in user").replace(/[<>&\"']/g, "");
      return `
        <div class="ab-auth-brand"><img class="ab-auth-logo" src="assets/anumbrix-logo.png" alt=""><div><h2 id="abAuthTitle">Your account</h2></div></div>
        <p class="ab-auth-subtitle">You are signed in to AnumBrix.</p>
        <div class="ab-auth-account">
          <div class="ab-auth-account-email">${email}</div>
          <button type="button" id="abAuthSignOut" class="ab-auth-signout">Sign out</button>
        </div>
        <div id="abAuthMessage" class="ab-auth-message"></div>
      `;
    }

    function formsHtml(mode) {
      const login = mode === "login";
      return `
        <div class="ab-auth-brand"><img class="ab-auth-logo" src="assets/anumbrix-logo.png" alt=""><h2 id="abAuthTitle">${login ? "Welcome back" : "Join AnumBrix"}</h2></div>
        <p class="ab-auth-subtitle">${login ? "Sign in to your AnumBrix account to join the community." : "Create a free account to comment and manage your own comments."}</p>
        <div class="ab-auth-tabs"><button type="button" class="ab-auth-tab ${login ? "active" : ""}" data-auth-mode="login">Login</button><button type="button" class="ab-auth-tab ${!login ? "active" : ""}" data-auth-mode="register">Register</button></div>
        <form id="abAccountForm" class="ab-auth-form">
          <label for="abAccountEmail">Email</label>
          <input id="abAccountEmail" type="email" autocomplete="email" placeholder="you@example.com" required>
          <label for="abAccountPassword">Password</label>
          <input id="abAccountPassword" type="password" autocomplete="${login ? "current-password" : "new-password"}" placeholder="${login ? "Your password" : "At least 6 characters"}" minlength="6" required>
          <button class="ab-auth-submit" type="submit">${login ? "Login" : "Create account"}</button>
        </form>
        <div id="abAuthMessage" class="ab-auth-message"></div>
        <div class="ab-auth-note">Your password is handled by Supabase Authentication. Never share your password with anyone.</div>
      `;
    }

    let mode = "login";

    async function renderAccount() {
      const { data } = await client.auth.getSession();
      if (data.session) content.innerHTML = signedInHtml(data.session);
      else content.innerHTML = formsHtml(mode);
      bindContent();
      accountBtn.classList.toggle("ab-signed-in", !!data.session);
    }

    function bindContent() {
      content.querySelectorAll("[data-auth-mode]").forEach(tab => {
        tab.addEventListener("click", () => { mode = tab.dataset.authMode; renderAccount(); });
      });

      const form = document.getElementById("abAccountForm");
      if (form) form.addEventListener("submit", async e => {
        e.preventDefault();
        const button = form.querySelector("button[type=submit]");
        const email = document.getElementById("abAccountEmail").value.trim();
        const password = document.getElementById("abAccountPassword").value;
        button.disabled = true;
        message(mode === "login" ? "Signing in…" : "Creating account…");
        try {
          if (mode === "login") {
            const { error } = await client.auth.signInWithPassword({ email, password });
            if (error) throw error;
            message("Signed in successfully.", "success");
            window.dispatchEvent(new CustomEvent("anumbrix-auth-changed"));
            setTimeout(closeModal, 350);
          } else {
            const { data, error } = await client.auth.signUp({ email, password });
            if (error) throw error;
            if (data.session) {
              message("Account created and signed in.", "success");
              window.dispatchEvent(new CustomEvent("anumbrix-auth-changed"));
              setTimeout(closeModal, 350);
            } else {
              message("Account created. Check your email to confirm your account, then log in.", "success");
            }
          }
        } catch (err) {
          message(err?.message || "Authentication failed. Please try again.", "error");
        } finally { button.disabled = false; }
      });

      const signOut = document.getElementById("abAuthSignOut");
      if (signOut) signOut.addEventListener("click", async () => {
        signOut.disabled = true;
        const { error } = await client.auth.signOut();
        if (error) message(error.message || "Could not sign out.", "error");
        else { window.dispatchEvent(new CustomEvent("anumbrix-auth-changed")); renderAccount(); }
      });
    }

    function openModal() { modal.classList.add("open"); document.body.style.overflow = "hidden"; renderAccount(); }
    function closeModal() { modal.classList.remove("open"); document.body.style.overflow = ""; }

    accountBtn.addEventListener("click", openModal);
    document.getElementById("abAuthClose").addEventListener("click", closeModal);
    modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("open")) closeModal(); });

    client.auth.onAuthStateChange(() => {
      client.auth.getSession().then(({ data }) => accountBtn.classList.toggle("ab-signed-in", !!data.session));
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
