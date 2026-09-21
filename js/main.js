// GitHub ID만 변경하면 프로젝트 목록 API가 해당 계정의 저장소를 요청합니다.
const GITHUB_USERNAME = 'YOUR_GITHUB_ID';
const NAVBAR_SCROLL_Y = 60;
const SCROLL_TOP_Y = 300;
const OBSERVER_THRESHOLD = 0.2;

const themeState = { theme: 'light' };
const projectState = { status: 'idle', projects: [], error: null };
const formState = { errors: { name: '', email: '', message: '' }, success: '' };

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const themeButton = document.querySelector('.theme-toggle');
const projectList = document.querySelector('#project-list');
const scrollTopButton = document.querySelector('#scroll-top');
const contactForm = document.querySelector('#contact-form');
const fields = ['name', 'email', 'message'];

const renderTheme = () => {
  document.documentElement.dataset.theme = themeState.theme;
  const isDark = themeState.theme === 'dark';
  themeButton.innerHTML = `<span aria-hidden="true">${isDark ? '☀' : '☾'}</span>`;
  themeButton.setAttribute('aria-label', isDark ? '라이트 모드로 전환' : '다크 모드로 전환');
  themeButton.setAttribute('aria-pressed', String(isDark));
};

const initTheme = () => {
  const savedTheme = localStorage.getItem('portfolio-theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  themeState.theme = savedTheme || (systemDark ? 'dark' : 'light');
  renderTheme();
};

const toggleTheme = () => {
  themeState.theme = themeState.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('portfolio-theme', themeState.theme);
  renderTheme();
};

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character]));

const renderProjects = () => {
  const { status, projects, error } = projectState;
  if (status === 'idle') {
    projectList.innerHTML = '<div class="project-state"><strong>프로젝트를 준비하고 있습니다.</strong>잠시 후 저장소 목록을 불러옵니다.</div>';
    return;
  }
  if (status === 'loading') {
    projectList.innerHTML = '<div class="project-state"><span class="loader" aria-hidden="true"></span><strong>프로젝트를 불러오는 중입니다.</strong>GitHub API에 요청하고 있습니다.</div>';
    return;
  }
  if (status === 'error') {
    projectList.innerHTML = `<div class="project-state"><strong>프로젝트를 불러오지 못했습니다.</strong><span>${escapeHtml(error)}</span><br /><button class="button button-primary retry-button" type="button">다시 시도</button></div>`;
    projectList.querySelector('.retry-button').addEventListener('click', fetchProjects);
    return;
  }
  if (status === 'empty') {
    projectList.innerHTML = '<div class="project-state"><strong>표시할 프로젝트가 없습니다.</strong>공개 저장소를 추가한 뒤 다시 확인해 주세요.</div>';
    return;
  }

  projectList.innerHTML = projects.map((repo) => {
    const { name, description, html_url, language, stargazers_count, forks_count } = repo;
    return `<article class="project-card"><h3>${escapeHtml(name)}</h3><p>${escapeHtml(description || '프로젝트 설명이 아직 작성되지 않았습니다.')}</p><div class="project-meta"><span>${escapeHtml(language || 'Language 미지정')}</span><span>★ ${stargazers_count}</span><span>⑂ ${forks_count}</span></div><a class="project-link" href="${html_url}" target="_blank" rel="noreferrer">Repository 보기 <span aria-hidden="true">↗</span></a></article>`;
  }).join('');
};

const fetchProjects = async () => {
  projectState.status = 'loading';
  projectState.error = null;
  renderProjects();
  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`);
    if (response.status === 403) throw new Error('GitHub API 요청 제한(Rate Limit)일 수 있습니다. 잠시 후 다시 시도해 주세요.');
    if (!response.ok) throw new Error(`GitHub API 요청에 실패했습니다. (HTTP ${response.status})`);
    const repos = await response.json();
    projectState.projects = repos.filter((repo) => !repo.fork);
    projectState.status = projectState.projects.length ? 'success' : 'empty';
  } catch (error) {
    projectState.status = 'error';
    projectState.error = error.message || '알 수 없는 오류가 발생했습니다.';
  }
  renderProjects();
};

const validateField = (fieldName) => {
  const input = document.querySelector(`#${fieldName}`);
  const value = input.value.trim();
  if (!value) return '필수 입력 항목입니다.';
  if (fieldName === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '올바른 이메일 형식을 입력해 주세요.';
  return '';
};

const renderFormErrors = () => {
  fields.forEach((fieldName) => {
    const input = document.querySelector(`#${fieldName}`);
    const errorElement = document.querySelector(`#${fieldName}-error`);
    const error = formState.errors[fieldName];
    errorElement.textContent = error;
    input.classList.toggle('invalid', Boolean(error));
    input.setAttribute('aria-invalid', String(Boolean(error)));
  });
  document.querySelector('#form-success').textContent = formState.success;
};

const validateForm = () => {
  fields.forEach((fieldName) => { formState.errors[fieldName] = validateField(fieldName); });
  return !Object.values(formState.errors).some(Boolean);
};

const initNavigation = () => {
  menuButton.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('active');
    menuButton.classList.toggle('active', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
  document.querySelectorAll('.nav-menu a, .hero-actions a, .text-link').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      menuButton.classList.remove('active');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
};

const renderScrollState = () => {
  header.classList.toggle('scrolled', window.scrollY > NAVBAR_SCROLL_Y);
  scrollTopButton.classList.toggle('visible', window.scrollY > SCROLL_TOP_Y);
};

const initScrollAnimations = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: OBSERVER_THRESHOLD });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
};

const initForm = () => {
  fields.forEach((fieldName) => {
    document.querySelector(`#${fieldName}`).addEventListener('input', () => {
      formState.errors[fieldName] = validateField(fieldName);
      formState.success = '';
      renderFormErrors();
    });
  });
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    formState.success = '';
    if (!validateForm()) { renderFormErrors(); return; }
    formState.success = '메시지가 정상적으로 작성되었습니다.';
    contactForm.reset();
    renderFormErrors();
  });
};

const init = () => {
  document.querySelector('#current-year').textContent = new Date().getFullYear();
  document.querySelector('#github-link').href = `https://github.com/${GITHUB_USERNAME}`;
  initTheme(); initNavigation(); initForm(); initScrollAnimations();
  window.addEventListener('scroll', renderScrollState, { passive: true });
  scrollTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  renderScrollState(); renderProjects(); fetchProjects();
};

init();
