/* AnumBrix community comments — Supabase Auth + comments table. */
(function () {
    "use strict";

    const client = window.anumBrixSupabase;
    if (!client) return;

    const MAX_COMMENT_LENGTH = 2000;

    function esc(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatDate(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        return date.toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short"
        });
    }

    function getInitials(email) {
        const text = String(email || "User").trim();
        return esc(text.slice(0, 1).toUpperCase());
    }

    function getCurrentAnimeKey() {
        const params = new URLSearchParams(window.location.search);
        const mal = params.get("mal");
        const id = params.get("id");
        if (mal) return `mal:${Number(mal)}`;
        if (id) return String(id);
        return "";
    }

    function getTitle() {
        const h1 = document.querySelector(".anime h1");
        return h1 ? h1.textContent.trim() : "this anime";
    }

    function ensureContainer() {
        let el = document.getElementById("anumbrixComments");
        if (!el) {
            el = document.createElement("section");
            el.id = "anumbrixComments";
            el.className = "ab-comments-section";
            const main = document.querySelector("main.container") || document.querySelector("main");
            if (main) main.appendChild(el);
        }
        return el;
    }

    function showMessage(el, message, type) {
        if (!el) return;
        el.textContent = message || "";
        el.className = `ab-comments-message${type ? ` ${type}` : ""}`;
    }

    async function loadComments(animeId, listEl, countEl) {
        const { data, error } = await client
            .from("comments")
            .select("id, created_at, updated_at, user_id, content")
            .eq("anime_id", animeId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("AnumBrix comments load error:", error);
            listEl.innerHTML = `<div class="ab-comments-empty">Could not load comments right now.</div>`;
            return;
        }

        const comments = data || [];
        countEl.textContent = `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`;

        if (!comments.length) {
            listEl.innerHTML = `<div class="ab-comments-empty">No comments yet. Be the first to share your thoughts!</div>`;
            return;
        }

        const sessionResult = await client.auth.getSession();
        const currentUserId = sessionResult.data.session?.user?.id || null;

        listEl.innerHTML = comments.map(comment => {
            const own = currentUserId && comment.user_id === currentUserId;
            const edited = comment.updated_at && comment.updated_at !== comment.created_at;
            return `
                <article class="ab-comment" data-comment-id="${esc(comment.id)}">
                    <div class="ab-comment-avatar">${getInitials(currentUserId && own ? sessionResult.data.session.user.email : "User")}</div>
                    <div class="ab-comment-body">
                        <div class="ab-comment-topline">
                            <span class="ab-comment-author">${own ? "You" : "Anime fan"}</span>
                            <time datetime="${esc(comment.created_at)}">${esc(formatDate(comment.created_at))}${edited ? " · edited" : ""}</time>
                        </div>
                        <p class="ab-comment-text">${esc(comment.content)}</p>
                        ${own ? `
                            <div class="ab-comment-actions">
                                <button type="button" class="ab-comment-action" data-edit-comment="${esc(comment.id)}">Edit</button>
                                <button type="button" class="ab-comment-action danger" data-delete-comment="${esc(comment.id)}">Delete</button>
                            </div>
                        ` : ""}
                    </div>
                </article>
            `;
        }).join("");
    }

    function authPanelHtml(session) {
        if (session) {
            const email = esc(session.user.email || "Logged-in user");
            return `
                <div class="ab-auth-status">
                    <div>
                        <span class="ab-auth-dot"></span>
                        Signed in as <strong>${email}</strong>
                    </div>
                    <button type="button" id="abSignOut" class="ab-secondary-btn">Sign out</button>
                </div>
                <form id="abCommentForm" class="ab-comment-form">
                    <label for="abCommentInput">Write a comment</label>
                    <textarea id="abCommentInput" maxlength="${MAX_COMMENT_LENGTH}" rows="4" placeholder="What do you think about this anime?"></textarea>
                    <div class="ab-form-bottom">
                        <span id="abCommentCount">0/${MAX_COMMENT_LENGTH}</span>
                        <button type="submit" class="ab-primary-btn">Post comment</button>
                    </div>
                    <div id="abCommentFormMessage" class="ab-comments-message" role="status"></div>
                </form>
            `;
        }

        return `
            <div class="ab-auth-box">
                <h3>Join the AnumBrix community</h3>
                <p>Sign in or create a free account to post, edit, and delete your own comments.</p>
                <div class="ab-auth-grid">
                    <form id="abLoginForm" class="ab-auth-form">
                        <h4>Sign in</h4>
                        <input id="abLoginEmail" type="email" autocomplete="email" placeholder="Email" required>
                        <input id="abLoginPassword" type="password" autocomplete="current-password" placeholder="Password" required minlength="6">
                        <button type="submit" class="ab-primary-btn">Sign in</button>
                    </form>
                    <form id="abSignupForm" class="ab-auth-form">
                        <h4>Create account</h4>
                        <input id="abSignupEmail" type="email" autocomplete="email" placeholder="Email" required>
                        <input id="abSignupPassword" type="password" autocomplete="new-password" placeholder="Password (6+ characters)" required minlength="6">
                        <button type="submit" class="ab-secondary-btn">Create account</button>
                    </form>
                </div>
                <div id="abAuthMessage" class="ab-comments-message" role="status"></div>
            </div>
        `;
    }

    async function render(animeId) {
        if (!animeId) return;

        const section = ensureContainer();
        section.innerHTML = `
            <div class="ab-comments-heading">
                <div>
                    <span class="ab-comments-kicker">COMMUNITY</span>
                    <h2>💬 Comments</h2>
                    <p>Share your thoughts about <strong>${esc(getTitle())}</strong>.</p>
                </div>
                <span id="abCommentsCount" class="ab-comments-count">Loading…</span>
            </div>
            <div id="abAuthPanel"></div>
            <div id="abCommentsList" class="ab-comments-list"><div class="ab-comments-empty">Loading comments…</div></div>
        `;

        const authPanel = document.getElementById("abAuthPanel");
        const listEl = document.getElementById("abCommentsList");
        const countEl = document.getElementById("abCommentsCount");

        async function refresh() {
            const result = await client.auth.getSession();
            authPanel.innerHTML = authPanelHtml(result.data.session);
            bindAuthControls();
            await loadComments(animeId, listEl, countEl);
        }

        function bindAuthControls() {
            const signOut = document.getElementById("abSignOut");
            if (signOut) {
                signOut.addEventListener("click", async () => {
                    signOut.disabled = true;
                    const { error } = await client.auth.signOut();
                    if (error) console.error(error);
                    await refresh();
                });
            }

            const commentForm = document.getElementById("abCommentForm");
            const input = document.getElementById("abCommentInput");
            const charCount = document.getElementById("abCommentCount");
            if (input && charCount) {
                const updateCount = () => { charCount.textContent = `${input.value.length}/${MAX_COMMENT_LENGTH}`; };
                input.addEventListener("input", updateCount);
                updateCount();
            }

            if (commentForm) {
                commentForm.addEventListener("submit", async event => {
                    event.preventDefault();
                    const messageEl = document.getElementById("abCommentFormMessage");
                    const button = commentForm.querySelector("button[type=submit]");
                    const content = input.value.trim();
                    if (!content) {
                        showMessage(messageEl, "Please write a comment first.", "error");
                        return;
                    }
                    if (content.length > MAX_COMMENT_LENGTH) {
                        showMessage(messageEl, "Your comment is too long.", "error");
                        return;
                    }

                    const session = (await client.auth.getSession()).data.session;
                    if (!session) {
                        showMessage(messageEl, "Please sign in again before posting.", "error");
                        return;
                    }

                    button.disabled = true;
                    showMessage(messageEl, "Posting…");
                    const { error } = await client.from("comments").insert({
                        anime_id: animeId,
                        user_id: session.user.id,
                        content
                    });

                    if (error) {
                        console.error("AnumBrix comment insert error:", error);
                        showMessage(messageEl, error.message || "Could not post the comment.", "error");
                        button.disabled = false;
                        return;
                    }

                    input.value = "";
                    showMessage(messageEl, "Comment posted!", "success");
                    button.disabled = false;
                    await loadComments(animeId, listEl, countEl);
                });
            }

            const loginForm = document.getElementById("abLoginForm");
            if (loginForm) {
                loginForm.addEventListener("submit", async event => {
                    event.preventDefault();
                    const messageEl = document.getElementById("abAuthMessage");
                    const button = loginForm.querySelector("button[type=submit]");
                    button.disabled = true;
                    showMessage(messageEl, "Signing in…");
                    const { error } = await client.auth.signInWithPassword({
                        email: document.getElementById("abLoginEmail").value.trim(),
                        password: document.getElementById("abLoginPassword").value
                    });
                    if (error) {
                        showMessage(messageEl, error.message || "Could not sign in.", "error");
                        button.disabled = false;
                        return;
                    }
                    await refresh();
                });
            }

            const signupForm = document.getElementById("abSignupForm");
            if (signupForm) {
                signupForm.addEventListener("submit", async event => {
                    event.preventDefault();
                    const messageEl = document.getElementById("abAuthMessage");
                    const button = signupForm.querySelector("button[type=submit]");
                    button.disabled = true;
                    showMessage(messageEl, "Creating your account…");
                    const { data, error } = await client.auth.signUp({
                        email: document.getElementById("abSignupEmail").value.trim(),
                        password: document.getElementById("abSignupPassword").value
                    });
                    if (error) {
                        showMessage(messageEl, error.message || "Could not create the account.", "error");
                        button.disabled = false;
                        return;
                    }
                    if (data.session) {
                        await refresh();
                    } else {
                        showMessage(messageEl, "Account created. Check your email to confirm your address, then sign in.", "success");
                        button.disabled = false;
                    }
                });
            }
        }

        listEl.addEventListener("click", async event => {
            const editButton = event.target.closest("[data-edit-comment]");
            const deleteButton = event.target.closest("[data-delete-comment]");

            if (deleteButton) {
                const id = deleteButton.dataset.deleteComment;
                if (!confirm("Delete this comment?")) return;
                deleteButton.disabled = true;
                const { error } = await client.from("comments").delete().eq("id", id);
                if (error) {
                    console.error("AnumBrix comment delete error:", error);
                    alert(error.message || "Could not delete the comment.");
                    deleteButton.disabled = false;
                    return;
                }
                await loadComments(animeId, listEl, countEl);
                return;
            }

            const cancelButton = event.target.closest("[data-cancel-edit]");
            if (cancelButton) {
                await loadComments(animeId, listEl, countEl);
                return;
            }

            if (editButton) {
                const article = editButton.closest(".ab-comment");
                const text = article?.querySelector(".ab-comment-text");
                const current = text ? text.textContent : "";
                if (!text) return;

                const editor = document.createElement("textarea");
                editor.className = "ab-comment-edit-input";
                editor.maxLength = MAX_COMMENT_LENGTH;
                editor.value = current;
                text.replaceWith(editor);
                editor.focus();

                editButton.textContent = "Save";
                editButton.dataset.saveComment = editButton.dataset.editComment;
                delete editButton.dataset.editComment;
                editButton.nextElementSibling.textContent = "Cancel";
                editButton.nextElementSibling.dataset.cancelEdit = "true";
                editButton.nextElementSibling.removeAttribute("data-delete-comment");
                return;
            }

            const saveButton = event.target.closest("[data-save-comment]");
            if (saveButton) {
                const article = saveButton.closest(".ab-comment");
                const editor = article?.querySelector(".ab-comment-edit-input");
                const value = editor?.value.trim() || "";
                if (!value) {
                    alert("Comment cannot be empty.");
                    return;
                }
                saveButton.disabled = true;
                const { error } = await client.from("comments")
                    .update({ content: value, updated_at: new Date().toISOString() })
                    .eq("id", saveButton.dataset.saveComment);
                if (error) {
                    console.error("AnumBrix comment update error:", error);
                    alert(error.message || "Could not update the comment.");
                    saveButton.disabled = false;
                    return;
                }
                await loadComments(animeId, listEl, countEl);
            }
        });

        await refresh();
    }

    window.renderAnumBrixComments = render;
})();
