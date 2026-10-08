document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.querySelectorAll(".nav__link");
  const toTop = document.getElementById("toTop");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------
     スムーススクロール
     --------------------------- */
  const scrollToTarget = (target) => {
    const headerHeight = header.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({
      top: target.id === "hero" ? 0 : top,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      const target = id.length > 1 ? document.querySelector(id) : null;
      if (!target) return;

      e.preventDefault();
      closeNav();
      scrollToTarget(target);
      history.pushState(null, "", id);
    });
  });

  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  /* ---------------------------
     モバイルナビゲーション
     --------------------------- */
  function openNav() {
    nav.classList.add("is-open");
    navToggle.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "メニューを閉じる");
    document.body.classList.add("is-locked");
  }

  function closeNav() {
    nav.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "メニューを開く");
    document.body.classList.remove("is-locked");
  }

  navToggle.addEventListener("click", () => {
    nav.classList.contains("is-open") ? closeNav() : openNav();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  /* ---------------------------
     スクロール時のヘッダー / トップへ戻るボタン
     --------------------------- */
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 60);
    toTop.classList.toggle("is-visible", y > window.innerHeight * 0.8);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------
     現在のセクションをナビでハイライト
     --------------------------- */
  const sections = document.querySelectorAll("main section[id]");

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-current", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  /* ---------------------------
     スクロールでフェードイン
     --------------------------- */
  const fadeObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll(".fade-in").forEach((el) => fadeObserver.observe(el));

  /* ---------------------------
     メニューのタブ切り替え
     --------------------------- */
  const tabs = document.querySelectorAll(".menu__tab");
  const panels = document.querySelectorAll(".menu__panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.dataset.target;

      tabs.forEach((t) => {
        const isActive = t === tab;
        t.classList.toggle("is-active", isActive);
        t.setAttribute("aria-selected", String(isActive));
      });

      panels.forEach((panel) => {
        const isActive = panel.id === targetId;
        panel.classList.toggle("is-active", isActive);
        panel.hidden = !isActive;
      });
    });
  });

  /* ---------------------------
     お問い合わせフォームのバリデーション
     --------------------------- */
  const contactForm = document.getElementById("contactForm");
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const contactRules = [
    {
      field: document.getElementById("contactName"),
      validate: (value) => (value ? "" : "お名前を入力してください。"),
    },
    {
      field: document.getElementById("contactEmail"),
      validate: (value) => {
        if (!value) return "メールアドレスを入力してください。";
        if (!EMAIL_PATTERN.test(value)) return "メールアドレスの形式が正しくありません。";
        return "";
      },
    },
    {
      field: document.getElementById("contactMessage"),
      validate: (value) => (value ? "" : "お問い合わせ内容を入力してください。"),
    },
  ];

  const validateField = ({ field, validate }) => {
    const message = validate(field.value.trim());
    const error = document.getElementById(field.getAttribute("aria-describedby"));
    error.textContent = message;
    field.setAttribute("aria-invalid", String(Boolean(message)));
    return !message;
  };

  contactRules.forEach((rule) => {
    // 一度エラーになった項目は、入力のたびに再チェックしてエラーを消す
    rule.field.addEventListener("input", () => {
      if (rule.field.getAttribute("aria-invalid") === "true") validateField(rule);
    });
    rule.field.addEventListener("blur", () => {
      if (rule.field.value.trim()) validateField(rule);
    });
  });

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const invalidRule = contactRules
      .map((rule) => ({ rule, isValid: validateField(rule) }))
      .find(({ isValid }) => !isValid);

    if (invalidRule) {
      invalidRule.rule.field.focus();
      return;
    }

    alert("送信しました");
    contactForm.reset();
    contactRules.forEach(({ field }) => field.removeAttribute("aria-invalid"));
  });

  /* ---------------------------
     フッターの年
     --------------------------- */
  document.getElementById("year").textContent = new Date().getFullYear();
});
