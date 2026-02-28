/* ================================================
   CIRCLEJERK.EDIT — Shared JS Utilities
   ================================================ */

let CJ_DATA = null;

async function loadData() {
  if (CJ_DATA) return CJ_DATA;
  try {
    const res = await fetch('data/data.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    CJ_DATA = await res.json();
  } catch (e) {
    console.error('Failed to load data.json:', e);
    document.body.innerHTML = `<div style="padding:40px;font-family:sans-serif;text-align:center;">
      <h2>Could not load data</h2>
      <p style="color:#666;margin-top:8px">Error: ${e.message}</p>
      <p style="color:#666;margin-top:4px">Make sure you're running this through a server (e.g. Live Server), not opening the file directly.</p>
    </div>`;
    throw e;
  }
  return CJ_DATA;
}

function getCharacter(id) {
  return CJ_DATA.characters.find(c => c.id === id);
}

function avatarHTML(char, size = 'md') {
  return `<div class="cj-avatar cj-avatar-${size}" style="background:${char.avatarColor}">${char.avatar}</div>`;
}

function relativeDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day ago';
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return `${Math.floor(diff / 30)}mo ago`;
}

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
  return n.toString();
}

function renderPost(post) {
  const author = getCharacter(post.author);
  if (!author) return '';

  const isArticle = post.type === 'article';
  const bodyContent = isArticle
    ? `<p class="cj-post-body" style="font-size:13px;color:#666;padding:4px 16px 8px;font-style:italic;">${author.name} published an article</p>
       <div class="cj-article-card" onclick="location.href='article.html?id=${post.id}'">
         <div class="cj-article-thumb">📝</div>
         <div class="cj-article-info">
           <div class="cj-article-headline">${post.headline}</div>
           <div class="cj-article-excerpt">${post.excerpt}</div>
         </div>
       </div>`
    : `<div class="cj-post-body truncated" id="body-${post.id}">${escapeHtml(post.text)}</div>
       ${post.text.length > 280 ? `<button class="cj-post-see-more" onclick="expandPost('${post.id}')">...see more</button>` : ''}`;

  const commentsHTML = post.comments && post.comments.length > 0
    ? `<div class="cj-comments">
        ${post.comments.map(c => {
          const commenter = getCharacter(c.author);
          if (!commenter) return '';
          return `<div class="cj-comment">
            ${avatarHTML(commenter, 'sm')}
            <div class="cj-comment-bubble">
              <div class="cj-comment-author"><a href="profile.html?id=${commenter.id}">${commenter.name}</a></div>
              <div class="cj-comment-text">${escapeHtml(c.text)}</div>
            </div>
          </div>`;
        }).join('')}
      </div>` : '';

  return `
    <div class="cj-card cj-post cj-gap">
      <div class="cj-post-header">
        <a href="profile.html?id=${author.id}">${avatarHTML(author, 'md')}</a>
        <div class="cj-post-author-info">
          <div class="cj-post-author-name"><a href="profile.html?id=${author.id}">${author.name}</a></div>
          <div class="cj-post-author-title">${author.title}</div>
          <div class="cj-post-meta">${relativeDate(post.date)} • 🌐</div>
        </div>
      </div>
      ${bodyContent}
      <div class="cj-post-reactions">
        <span class="cj-reaction-emojis">👍❤️😂</span>&nbsp;${formatNumber(post.likes)}
        ${post.comments ? `<span style="margin-left:auto">${post.comments.length} comment${post.comments.length !== 1 ? 's' : ''}</span>` : ''}
      </div>
      <div class="cj-post-actions">
        <button class="cj-action-btn"><span class="cj-action-icon">👍</span><span>Like</span></button>
        <button class="cj-action-btn"><span class="cj-action-icon">💬</span><span>Comment</span></button>
        <button class="cj-action-btn"><span class="cj-action-icon">🔁</span><span>Repost</span></button>
        <button class="cj-action-btn"><span class="cj-action-icon">📤</span><span>Send</span></button>
      </div>
      ${commentsHTML}
    </div>`;
}

function renderSidebarProfile() {
  // Renders a generic "you" sidebar — placeholder for logged-in feel
  return `
    <div class="cj-card cj-sidebar-profile">
      <div class="cj-sidebar-profile-banner"></div>
      <div class="cj-sidebar-profile-body">
        <div class="cj-sidebar-avatar-wrap">
          <div class="cj-avatar cj-avatar-lg" style="background:#0a66c2">CJ</div>
        </div>
        <div class="cj-sidebar-profile-name">Welcome to Circlejerk</div>
        <div class="cj-sidebar-profile-title">Your self-congratulatory professional community</div>
        <hr class="cj-sidebar-divider">
        <div class="cj-sidebar-stat">
          <span class="cj-sidebar-stat-label">Profile views</span>
          <span class="cj-sidebar-stat-value">—</span>
        </div>
        <div class="cj-sidebar-stat">
          <span class="cj-sidebar-stat-label">Post impressions</span>
          <span class="cj-sidebar-stat-value">—</span>
        </div>
        <div class="cj-sidebar-premium">
          <a href="#">Try Circlejerk Premium Free</a><br>
          <span>Be seen by important people who matter.</span>
        </div>
      </div>
    </div>`;
}

function renderPYMK(exclude = null) {
  const chars = CJ_DATA.characters.filter(c => c.id !== exclude).slice(0, 4);
  const items = chars.map(c => `
    <div class="cj-pymk-item">
      <a href="profile.html?id=${c.id}">${avatarHTML(c, 'md')}</a>
      <div class="cj-pymk-info">
        <div class="cj-pymk-name"><a href="profile.html?id=${c.id}">${c.name}</a></div>
        <div class="cj-pymk-title">${c.title}</div>
      </div>
      <button class="cj-connect-btn">+ Follow</button>
    </div>`).join('');

  return `
    <div class="cj-card">
      <div class="cj-card-title">People you may know</div>
      ${items}
      <a href="profiles.html" class="cj-card-title-link">View all profiles →</a>
    </div>`;
}

function renderNavLinks(activePage) {
  const pages = [
    { href: 'feed.html', icon: '🏠', label: 'Home' },
    { href: 'profiles.html', icon: '👥', label: 'Network' },
    { href: 'jobs.html', icon: '💼', label: 'Jobs' },
    { href: 'articles.html', icon: '📝', label: 'Articles' },
  ];

  return pages.map(p => `
    <li>
      <a href="${p.href}" class="${activePage === p.href ? 'active' : ''}">
        <span class="nav-icon">${p.icon}</span>
        <span class="nav-label">${p.label}</span>
      </a>
    </li>`).join('');
}

function renderNav(activePage) {
  return `
    <nav class="cj-nav">
      <div class="cj-nav-inner">
        <a href="index.html" class="cj-logo">
          <div class="cj-logo-mark">
            <div class="cj-logo-icon"></div>
          </div>
          <span class="cj-logo-text">circlejerk</span>
        </a>
        <div class="cj-search">
          <span class="cj-search-icon">🔍</span>
          <input type="text" placeholder="Search">
        </div>
        <ul class="cj-nav-links">
          ${renderNavLinks(activePage)}
          <li><a href="#" class="cj-nav-cta">Sign in</a></li>
        </ul>
      </div>
    </nav>`;
}

function renderFooter() {
  return `
    <footer class="cj-footer">
      <div class="cj-footer-inner">
        <span>circlejerk &copy; 2025 &mdash; circlejerkedit.com</span>
        <ul class="cj-footer-links">
          <li><a href="#">About</a></li>
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Terms</a></li>
          <li><a href="#">Jobs Board</a></li>
          <li><a href="#">Advertising</a></li>
        </ul>
      </div>
    </footer>`;
}

function expandPost(id) {
  const body = document.getElementById(`body-${id}`);
  if (body) {
    body.classList.remove('truncated');
    body.nextElementSibling.style.display = 'none';
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}
