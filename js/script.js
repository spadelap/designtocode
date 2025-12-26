/* ==========================================================================
   공통 스크립트
   - 화면 전환은 데모용으로만 제공 (html01~html09)
   - 실제 API/비즈니스 로직은 제외
   ========================================================================== */

(function () {
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

    function getPageName() {
        const parts = window.location.pathname.split('/');
        return parts[parts.length - 1] || '';
    }

    // 실시간 시계(초 단위 화면에서만)
    function startClock() {
        const el = $('.timer__value');
        if (!el) return;
        if ((el.textContent || '').split(':').length !== 3) return;

        const tick = () => {
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            const ss = String(now.getSeconds()).padStart(2, '0');
            el.textContent = `${hh}:${mm}:${ss}`;
        };
        tick();
        window.setInterval(tick, 1000);
    }

    // 로그인
    function bindLogin() {
        const form = $('#loginForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const company = ($('#company')?.value || '').trim();
            const userId = ($('#userId')?.value || '').trim();
            const pw = ($('#password')?.value || '').trim();

            if (!company) return alert('회사명을 입력해 주세요.');
            if (!userId) return alert('아이디를 입력해 주세요.');
            if (!pw) return alert('비밀번호를 입력해 주세요.');

            window.location.href = 'html02.html';
        });
    }

    // 헤더 우측 아이콘(두번째)을 메뉴로 연결(데모)
    function bindHeaderMenuShortcut() {
        const menuBtn = $('[data-action="open-menu"]');
        if (!menuBtn) return;
        menuBtn.addEventListener('click', () => {
            window.location.href = 'html08.html';
        });
    }

    // 출근/퇴근 버튼(데모 흐름)
    function bindActionButtons() {
        const checkIn = $('#checkInBtn');
        const checkOut = $('#checkOutBtn');
        const requestOut = $('#requestOutBtn');

        if (checkIn) {
            checkIn.addEventListener('click', () => {
                // 출근 완료 화면
                window.location.href = 'html04.html';
            });
        }

        if (checkOut) {
            checkOut.addEventListener('click', () => {
                // 퇴근 시간 입력/신청이 있는 경우 모달 화면으로
                const page = getPageName();
                if (page === 'html05.html' || page === 'html06.html') {
                    window.location.href = 'html09.html';
                    return;
                }
                // 퇴근 완료(근무시간)
                window.location.href = 'html07.html';
            });
        }

        if (requestOut) {
            requestOut.addEventListener('click', () => {
                window.location.href = 'html09.html';
            });
        }
    }

    // 메뉴 닫기
    function bindMenuClose() {
        const btn = $('#menuCloseBtn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            window.location.href = 'html02.html';
        });
    }

    // 바텀시트(퇴근신청)
    function bindSheet() {
        const overlay = $('#overlay');
        const submit = $('#submitBtn');
        const reason = $('#reason');

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) window.location.href = 'html06.html';
            });
        }

        if (submit) {
            submit.addEventListener('click', () => {
                const val = (reason?.value || '').trim();
                if (!val) return alert('사유를 입력해 주세요.');
                window.location.href = 'html07.html';
            });
        }
    }

    // 네비 active 처리
    function setNavActive() {
        const page = getPageName();
        const map = {
            'html02.html': 'attendance',
            'html03.html': 'attendance',
            'html04.html': 'attendance',
            'html05.html': 'attendance',
            'html06.html': 'attendance',
            'html07.html': 'attendance',
            'html08.html': 'attendance',
            'html09.html': 'attendance'
        };
        const activeKey = map[page];
        if (!activeKey) return;

        $$('[data-nav]').forEach((a) => {
            a.classList.toggle('is-active', a.getAttribute('data-nav') === activeKey);
        });
    }

    function init() {
        bindLogin();
        bindHeaderMenuShortcut();
        bindActionButtons();
        bindMenuClose();
        bindSheet();
        setNavActive();
        startClock();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

/* ============================================
   출퇴근 관리 시스템 - 공통 스크립트
   ============================================ */

/* ============================================
   전역 변수
   ============================================ */
const loginForm = document.getElementById('loginForm');
const companyInput = document.getElementById('companyInput');
const idInput = document.getElementById('idInput');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');

const checkInBtn = document.getElementById('checkInBtn');
const checkOutBtn = document.getElementById('checkOutBtn');

const sideMenu = document.getElementById('sideMenu');
const closeMenuBtn = document.getElementById('closeMenuBtn');

const modalOverlay = document.getElementById('modalOverlay');
const submitBtn = document.getElementById('submitBtn');
const reasonInput = document.getElementById('reasonInput');

/* ============================================
   시간 표시 함수
   ============================================ */
function updateCurrentTime() {
    const timeElements = document.querySelectorAll('.time-display__time');
    
    timeElements.forEach(el => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        el.textContent = `${hours}:${minutes}:${seconds}`;
    });
}

/* ============================================
   로그인 폼 처리
   ============================================ */
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const company = companyInput ? companyInput.value.trim() : '';
        const id = idInput ? idInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';
        
        // 유효성 검사
        if (!company) {
            alert('회사명을 입력해주세요.');
            companyInput.focus();
            return;
        }
        
        if (!id) {
            alert('아이디를 입력해주세요.');
            idInput.focus();
            return;
        }
        
        if (!password) {
            alert('비밀번호를 입력해주세요.');
            passwordInput.focus();
            return;
        }
        
        console.log('로그인 시도:', { company, id });
        
        // 로그인 성공 시 메인 페이지로 이동
        window.location.href = 'page02.html';
    });
}

/* ============================================
   입력 필드 포커스 효과
   ============================================ */
document.querySelectorAll('.input-group__input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
});

/* ============================================
   출근하기 버튼
   ============================================ */
if (checkInBtn) {
    checkInBtn.addEventListener('click', function() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        console.log('출근 처리:', timeString);
        alert(`출근이 완료되었습니다.\n출근 시간: ${timeString}`);
        
        // 출근 완료 페이지로 이동
        window.location.href = 'page04.html';
    });
}

/* ============================================
   퇴근하기 버튼
   ============================================ */
if (checkOutBtn) {
    checkOutBtn.addEventListener('click', function() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        console.log('퇴근 처리:', timeString);
        alert(`퇴근이 완료되었습니다.\n퇴근 시간: ${timeString}`);
        
        // 퇴근 완료 페이지로 이동
        window.location.href = 'page07.html';
    });
}

/* ============================================
   사이드 메뉴 제어
   ============================================ */
if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', function() {
        if (sideMenu) {
            sideMenu.style.display = 'none';
        }
    });
}

// 메뉴 버튼 클릭 시 사이드 메뉴 열기
document.querySelectorAll('.header__actions .icon').forEach((icon, index) => {
    if (index === 1) { // 두 번째 아이콘 (메뉴)
        icon.style.cursor = 'pointer';
        icon.addEventListener('click', function() {
            window.location.href = 'page08.html';
        });
    }
});

/* ============================================
   모달 제어
   ============================================ */
if (modalOverlay) {
    // 오버레이 클릭 시 모달 닫기
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    });
}

if (submitBtn) {
    submitBtn.addEventListener('click', function() {
        const reason = reasonInput ? reasonInput.value.trim() : '';
        
        if (!reason) {
            alert('사유를 입력해주세요.');
            reasonInput.focus();
            return;
        }
        
        console.log('퇴근신청:', reason);
        alert('퇴근신청이 완료되었습니다.');
        
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    });
}

/* ============================================
   하단 네비게이션 활성화 표시
   ============================================ */
function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('.bottom-nav__item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage) {
            item.classList.add('bottom-nav__item--active');
        }
    });
}

/* ============================================
   초기화 함수
   ============================================ */
function init() {
    console.log('페이지 초기화 완료');
    
    // 시간 표시가 있는 페이지에서 실시간 업데이트
    const timeDisplay = document.querySelector('.time-display__time');
    if (timeDisplay && timeDisplay.textContent.includes(':')) {
        // 초 단위까지 표시되는 경우에만 업데이트
        if (timeDisplay.textContent.split(':').length === 3) {
            setInterval(updateCurrentTime, 1000);
        }
    }
    
    // 네비게이션 활성화 설정
    setActiveNav();
}

// DOM 로드 완료 후 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

