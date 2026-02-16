// State
let questions = [];
let templates = [];
let currentTab = 'status';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupLoginForm();
    setupTabs();
});

// Login functionality
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/dashboard/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            if (response.ok) {
                document.getElementById('login-screen').classList.add('hidden');
                document.getElementById('dashboard-screen').classList.remove('hidden');
                await loadDashboard();
            } else {
                showToast('Invalid password', 'error');
            }
        } catch (error) {
            showToast('Login failed', 'error');
        }
    });
}

async function logout() {
    try {
        await fetch('/api/dashboard/logout', { method: 'POST' });
        location.reload();
    } catch (error) {
        showToast('Logout failed', 'error');
    }
}

// Tab functionality
function setupTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });

    currentTab = tabName;

    // Load data for specific tabs
    if (tabName === 'history') {
        loadHistory();
    }
}

// Load dashboard data
async function loadDashboard() {
    await Promise.all([
        loadStatus(),
        loadQuestions(),
        loadSettings(),
        loadTemplates()
    ]);
}

// Status
async function loadStatus() {
    try {
        const response = await fetch('/api/dashboard/status');
        const data = await response.json();

        document.getElementById('status-morning-time').textContent = data.schedule.morningTime;
        document.getElementById('status-girlfriend-time').textContent = data.schedule.girlfriendSendTime;
        document.getElementById('status-timezone').textContent = data.schedule.timezone;
        document.getElementById('status-my-phone').textContent = data.phoneNumbers.my;
        document.getElementById('status-gf-phone').textContent = data.phoneNumbers.girlfriend;
        document.getElementById('status-my-channels').textContent = data.channels.my.join(', ');
        document.getElementById('status-gf-channels').textContent = data.channels.girlfriend.join(', ');
    } catch (error) {
        showToast('Failed to load status', 'error');
    }
}

async function sendTestQuestions() {
    if (!confirm('Send morning questions now?')) return;

    try {
        setLoading(true);
        const response = await fetch('/api/dashboard/test/questions', { method: 'POST' });
        const data = await response.json();

        if (data.success) {
            showToast('Morning questions sent!', 'success');
        } else {
            showToast(data.error || 'Failed to send questions', 'error');
        }
    } catch (error) {
        showToast('Failed to send questions', 'error');
    } finally {
        setLoading(false);
    }
}

async function sendTestGirlfriend() {
    if (!confirm('Send test girlfriend message now?')) return;

    try {
        setLoading(true);
        const response = await fetch('/api/dashboard/test/girlfriend', { method: 'POST' });
        const data = await response.json();

        if (data.success) {
            showToast('Test girlfriend message sent!', 'success');
        } else {
            showToast(data.error || 'Failed to send message', 'error');
        }
    } catch (error) {
        showToast('Failed to send message', 'error');
    } finally {
        setLoading(false);
    }
}

// Questions
async function loadQuestions() {
    try {
        const response = await fetch('/api/dashboard/questions');
        const data = await response.json();
        questions = data.questions;
        renderQuestions();
    } catch (error) {
        showToast('Failed to load questions', 'error');
    }
}

function renderQuestions() {
    const list = document.getElementById('questions-list');
    list.innerHTML = '';

    questions.forEach((q, index) => {
        const div = document.createElement('div');
        div.className = 'question-item';
        div.innerHTML = `
            <span class="question-number">${q.number}.</span>
            <input type="text" class="question-text" value="${escapeHtml(q.text)}"
                   onchange="updateQuestion(${index}, this.value)">
            <div class="question-actions">
                <button class="btn-sm" onclick="moveQuestion(${index}, -1)" ${index === 0 ? 'disabled' : ''}>↑</button>
                <button class="btn-sm" onclick="moveQuestion(${index}, 1)" ${index === questions.length - 1 ? 'disabled' : ''}>↓</button>
                <button class="btn-sm secondary" onclick="deleteQuestion(${index})">Delete</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function updateQuestion(index, text) {
    questions[index].text = text;
}

function addQuestion() {
    const newNumber = questions.length + 1;
    questions.push({
        number: newNumber,
        text: 'New question'
    });
    renderQuestions();
}

function deleteQuestion(index) {
    if (!confirm('Delete this question?')) return;
    questions.splice(index, 1);
    // Renumber questions
    questions.forEach((q, i) => q.number = i + 1);
    renderQuestions();
}

function moveQuestion(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const temp = questions[index];
    questions[index] = questions[newIndex];
    questions[newIndex] = temp;

    // Renumber questions
    questions.forEach((q, i) => q.number = i + 1);
    renderQuestions();
}

async function saveQuestions() {
    try {
        setLoading(true);
        const response = await fetch('/api/dashboard/questions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questions })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Questions saved!', 'success');
        } else {
            showToast(data.error || 'Failed to save questions', 'error');
        }
    } catch (error) {
        showToast('Failed to save questions', 'error');
    } finally {
        setLoading(false);
    }
}

// Settings
async function loadSettings() {
    try {
        const response = await fetch('/api/dashboard/settings');
        const data = await response.json();

        document.getElementById('morning-time').value = data.morningTime;
        document.getElementById('girlfriend-time').value = data.girlfriendSendTime;
        document.getElementById('timezone').value = data.timezone;

        // Setup form submission
        const form = document.getElementById('schedule-form');
        form.onsubmit = async (e) => {
            e.preventDefault();
            await saveSettings();
        };
    } catch (error) {
        showToast('Failed to load settings', 'error');
    }
}

async function saveSettings() {
    const settings = {
        morningTime: document.getElementById('morning-time').value,
        girlfriendSendTime: document.getElementById('girlfriend-time').value,
        timezone: document.getElementById('timezone').value
    };

    try {
        setLoading(true);
        const response = await fetch('/api/dashboard/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });

        const data = await response.json();

        if (data.success) {
            showToast('Settings saved! Restart the app to apply changes.', 'success');
            await loadStatus();
        } else {
            showToast(data.error || 'Failed to save settings', 'error');
        }
    } catch (error) {
        showToast('Failed to save settings', 'error');
    } finally {
        setLoading(false);
    }
}

// Templates
async function loadTemplates() {
    try {
        const response = await fetch('/api/dashboard/templates');
        const data = await response.json();
        templates = data.templates;
        renderTemplates();
    } catch (error) {
        showToast('Failed to load templates', 'error');
    }
}

function renderTemplates() {
    const list = document.getElementById('templates-list');
    list.innerHTML = '';

    templates.forEach((template, index) => {
        const div = document.createElement('div');
        div.style.marginBottom = '2rem';
        div.innerHTML = `
            <label>Template ${index + 1}</label>
            <textarea rows="6" onchange="updateTemplate(${index}, this.value)">${escapeHtml(template)}</textarea>
            <button class="btn-sm" onclick="previewTemplate(${index})">Preview</button>
            ${templates.length > 1 ? `<button class="btn-sm secondary" onclick="deleteTemplate(${index})">Delete</button>` : ''}
            <div id="preview-${index}" class="template-preview hidden"></div>
        `;
        list.appendChild(div);
    });
}

function updateTemplate(index, text) {
    templates[index] = text;
}

function addTemplate() {
    templates.push('Good morning! 💕\n\n{loveNote}\n\n{gratitude}\n\n{encouragement}\n\nLove you! ❤️');
    renderTemplates();
}

function deleteTemplate(index) {
    if (!confirm('Delete this template?')) return;
    templates.splice(index, 1);
    renderTemplates();
}

function previewTemplate(index) {
    const preview = document.getElementById(`preview-${index}`);
    const sampleAnswers = {
        loveNote: 'Your smile brightens my day',
        gratitude: "I'm grateful for your love and support",
        encouragement: "You're going to do amazing things today!"
    };

    const previewText = templates[index]
        .replace('{loveNote}', sampleAnswers.loveNote)
        .replace('{gratitude}', sampleAnswers.gratitude)
        .replace('{encouragement}', sampleAnswers.encouragement);

    preview.textContent = previewText;
    preview.classList.toggle('hidden');
}

async function saveTemplates() {
    try {
        setLoading(true);
        const response = await fetch('/api/dashboard/templates', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ templates })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Templates saved!', 'success');
        } else {
            showToast(data.error || 'Failed to save templates', 'error');
        }
    } catch (error) {
        showToast('Failed to save templates', 'error');
    } finally {
        setLoading(false);
    }
}

// History
async function loadHistory() {
    try {
        setLoading(true);
        const response = await fetch('/api/dashboard/history');
        const data = await response.json();

        const list = document.getElementById('history-list');
        list.innerHTML = '';

        if (data.history.length === 0) {
            list.innerHTML = '<p>No message history yet.</p>';
            return;
        }

        data.history.reverse().forEach(entry => {
            const div = document.createElement('div');
            div.className = 'history-entry';
            div.innerHTML = `
                <div class="history-header">
                    <span class="history-type ${entry.type}">${entry.type.replace('_', ' ')}</span>
                    <span class="history-status">${entry.status} • ${entry.channel} • ${formatDate(entry.timestamp)}</span>
                </div>
                <div class="history-message">${escapeHtml(truncate(entry.message, 200))}</div>
                ${entry.error ? `<div style="color: var(--del-color); font-size: 0.875rem; margin-top: 0.5rem;">Error: ${escapeHtml(entry.error)}</div>` : ''}
            `;
            list.appendChild(div);
        });
    } catch (error) {
        showToast('Failed to load history', 'error');
    } finally {
        setLoading(false);
    }
}

// Utility functions
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function setLoading(loading) {
    const dashboard = document.getElementById('dashboard-screen');
    if (loading) {
        dashboard.classList.add('loading');
    } else {
        dashboard.classList.remove('loading');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}
