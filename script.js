const INITIAL_ENLISTMENT = 7982020674;
let currentEnlistment = INITIAL_ENLISTMENT;
let enlistmentTimer = null;

const topSubtitleContent = "不认真观看视为叛国 ★ 为超级地球而战 ★ 传播民主消灭异端 ★ 自由不是免费的 ★ 加入绝地潜兵，获得荣耀 ★ 你就是银河系的希望 ★ ";
const bottomSubtitleContent = "观看此视频1秒自动视为加入绝地潜兵 ★ 超级地球需要你！ ★ 自由！民主！光荣！ ★ 现在就宣誓效忠超级地球 ★ 你的家人会以你为荣 ★ 为了民主的未来而战 ★ ";

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function animateNumber(element, target, duration = 3000, callback = null) {
    const start = parseInt(element.textContent.replace(/,/g, '')) || 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (target - start) * easeOutQuart);
        
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else if (callback) {
            callback();
        }
    }
    
    requestAnimationFrame(update);
}

function incrementEnlistment() {
    const countElement = document.getElementById('enlistmentCount');
    if (countElement) {
        const randomIncrease = Math.floor(Math.random() * 99901) + 100;
        currentEnlistment += randomIncrease;
        animateNumber(countElement, currentEnlistment, 500);
    }
}

function startEnlistmentIncrement() {
    if (enlistmentTimer) {
        clearInterval(enlistmentTimer);
    }
    enlistmentTimer = setInterval(incrementEnlistment, 5000);
}

function showStatus(message, type = 'success') {
    const statusEl = document.getElementById('statusMessage');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
        setTimeout(() => {
            statusEl.className = 'status-message';
        }, 3000);
    }
}

function getApplicants() {
    const data = localStorage.getItem('helldiversApplicants');
    return data ? JSON.parse(data) : [];
}

function saveApplicantLocal(data) {
    const applicants = getApplicants();
    const applicant = {
        id: Date.now(),
        ...data,
        created_at: new Date().toISOString()
    };
    applicants.push(applicant);
    localStorage.setItem('helldiversApplicants', JSON.stringify(applicants));
    return { success: true, applicant };
}

function clearApplicantsLocal() {
    localStorage.removeItem('helldiversApplicants');
    return { success: true };
}

function updateAdminPanel(applicants = []) {
    const totalApplicants = document.getElementById('totalApplicants');
    const totalAssault = document.getElementById('totalAssault');
    const totalSupport = document.getElementById('totalSupport');
    const totalHeavy = document.getElementById('totalHeavy');
    const applicantsList = document.getElementById('applicantsList');

    const assaultCount = applicants.filter(a => a.role === 'assault').length;
    const supportCount = applicants.filter(a => a.role === 'support').length;
    const engineerCount = applicants.filter(a => a.role === 'engineer').length;
    const medicCount = applicants.filter(a => a.role === 'medic').length;
    const heavyCount = applicants.filter(a => a.role === 'heavy').length;

    if (totalApplicants) totalApplicants.textContent = applicants.length;
    if (totalAssault) totalAssault.textContent = assaultCount + engineerCount;
    if (totalSupport) totalSupport.textContent = supportCount + medicCount;
    if (totalHeavy) totalHeavy.textContent = heavyCount;

    if (applicantsList) {
        if (applicants.length === 0) {
            applicantsList.innerHTML = `
                <p class="no-data">
                    <span class="no-data-icon">📭</span>
                    暂无报名数据，快去宣传吧！
                </p>
            `;
        } else {
            applicantsList.innerHTML = applicants.reverse().map(applicant => `
                <div class="applicant-card">
                    <div class="applicant-header">
                        <div class="applicant-name">🎖️ ${applicant.name}</div>
                        <div class="applicant-time">📅 ${new Date(applicant.created_at).toLocaleString('zh-CN')}</div>
                    </div>
                    <div class="applicant-details">
                        <div class="applicant-detail"><span>年龄</span> ${applicant.age}岁</div>
                        <div class="applicant-detail"><span>兵种</span> ${getRoleName(applicant.role)}</div>
                        <div class="applicant-detail"><span>邮箱</span> ${applicant.email}</div>
                        <div class="applicant-detail"><span>电话</span> ${applicant.phone}</div>
                        ${applicant.motto ? `<div class="applicant-motto"><span>战斗宣言</span> ${applicant.motto}</div>` : ''}
                    </div>
                </div>
            `).join('');
        }
    }
}

function refreshApplicants() {
    const applicants = getApplicants();
    updateAdminPanel(applicants);
    showStatus('✅ 数据刷新成功！');
}

function clearApplicants() {
    if (confirm('⚠️ 确定要清除所有报名数据吗？此操作不可恢复！')) {
        clearApplicantsLocal();
        updateAdminPanel([]);
        showStatus('✅ 数据已清除！');
    }
}

function exportApplicants() {
    const applicants = getApplicants();
    if (applicants.length > 0) {
        const csvContent = [
            ['ID', '姓名', '年龄', '邮箱', '电话', '兵种', '战斗宣言', '报名时间'].join(','),
            ...applicants.map(a => [
                a.id,
                `"${a.name}"`,
                a.age,
                `"${a.email}"`,
                `"${a.phone}"`,
                `"${getRoleName(a.role)}"`,
                `"${a.motto || ''}"`,
                `"${new Date(a.created_at).toLocaleString('zh-CN')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `helldivers_recruits_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        showStatus('✅ 数据导出成功！');
    } else {
        showStatus('❌ 暂无数据可导出！', 'error');
    }
}

function getRoleName(role) {
    const roles = {
        'assault': '突击兵',
        'support': '支援兵',
        'engineer': '工程兵',
        'medic': '医疗兵',
        'heavy': '重火力'
    };
    return roles[role] || role;
}

function openVideoModal() {
    const videoModal = document.getElementById('videoModal');
    const video = document.getElementById('propagandaVideo');
    const topSubtitle = document.getElementById('topSubtitle');
    const bottomSubtitle = document.getElementById('bottomSubtitle');
    
    if (topSubtitle) {
        topSubtitle.textContent = topSubtitleContent + topSubtitleContent + topSubtitleContent;
    }
    
    if (bottomSubtitle) {
        bottomSubtitle.textContent = bottomSubtitleContent + bottomSubtitleContent + bottomSubtitleContent;
    }
    
    if (videoModal && video) {
        videoModal.classList.add('active');
        video.currentTime = 0;
        video.play();
    }
}

function closeVideoModal() {
    const videoModal = document.getElementById('videoModal');
    const video = document.getElementById('propagandaVideo');
    if (videoModal && video) {
        videoModal.classList.remove('active');
        video.pause();
        video.currentTime = 0;
    }
}

function openAdminModal() {
    const adminModal = document.getElementById('adminModal');
    if (adminModal) {
        adminModal.classList.add('active');
        refreshApplicants();
    }
}

function closeAdminModal() {
    const adminModal = document.getElementById('adminModal');
    if (adminModal) {
        adminModal.classList.remove('active');
    }
}

function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        scrollToSection(targetId);
        
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

document.getElementById('recruitForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        age: document.getElementById('age').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        role: document.getElementById('role').value,
        motto: document.getElementById('motto').value
    };
    
    saveApplicantLocal(formData);
    
    window.location.href = 'success.html';
});

document.querySelectorAll('.benefit-card').forEach(card => {
    card.addEventListener('click', function() {
        const isActive = this.classList.contains('active');
        
        document.querySelectorAll('.benefit-card').forEach(c => c.classList.remove('active'));
        
        if (!isActive) {
            this.classList.add('active');
        }
    });
});

window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const countElement = document.getElementById('enlistmentCount');
    if (countElement) {
        currentEnlistment = INITIAL_ENLISTMENT;
        animateNumber(countElement, INITIAL_ENLISTMENT, 4000, function() {
            startEnlistmentIncrement();
        });
    }
    
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', openAdminModal);
    }
    
    const adminModal = document.getElementById('adminModal');
    if (adminModal) {
        adminModal.addEventListener('click', function(e) {
            if (e.target === adminModal) {
                closeAdminModal();
            }
        });
    }
    
    const propagandaBtn = document.getElementById('propagandaBtn');
    if (propagandaBtn) {
        propagandaBtn.addEventListener('click', openVideoModal);
    }
    
    const closeVideoBtn = document.getElementById('closeVideoBtn');
    if (closeVideoBtn) {
        closeVideoBtn.addEventListener('click', closeVideoModal);
    }
    
    const videoModal = document.getElementById('videoModal');
    if (videoModal) {
        videoModal.addEventListener('click', function(e) {
            if (e.target === videoModal) {
                closeVideoModal();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            closeAdminModal();
        }
    });

    setTimeout(function() {
        openVideoModal();
    }, 500);
});
