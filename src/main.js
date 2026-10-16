// 컴포지션 루트: 저장소 → 프로바이더 → 컨트롤러 순으로 생성·주입
import './style.css';
import { byId } from './core/dom.js';
import { applyFormScrollLock, applyKeyboardInset } from './core/viewport.js';
import { createHttpClient } from './data/http.js';
import { createJsonStorage } from './data/storage.js';
import { createMemberRepository } from './data/memberRepository.js';
import { createEntryRepository } from './data/entryRepository.js';
import { createSessionRepository } from './data/sessionRepository.js';
import { createAuthProvider } from './providers/authProvider.js';
import { createEntryProvider } from './providers/entryProvider.js';
import { createToast } from './widgets/toast.js';
import { createNavigator } from './controllers/navigator.js';
import { createLoginController } from './controllers/loginController.js';
import { createSessionController } from './controllers/sessionController.js';
import { createHomeController } from './controllers/homeController.js';
import { createFormController } from './controllers/formController.js';
import { createRecordsController } from './controllers/recordsController.js';
import { createDetailController } from './controllers/detailController.js';
import { createExcelController } from './controllers/excelController.js';

const today = new Date();

// ── DATA ──
const http = createHttpClient();
const storage = createJsonStorage();
const memberRepository = createMemberRepository({ http });
const entryRepository = createEntryRepository({ http, storage });
const sessionRepository = createSessionRepository({ storage });

// ── PROVIDERS ──
const auth = createAuthProvider({ memberRepository, sessionRepository });
const entries = createEntryProvider({ entryRepository, auth });

// ── CONTROLLERS ──
const toast = createToast(byId('toast'));
const nav = createNavigator();
const detail = createDetailController({ entries, toast });
const form = createFormController({ entries, auth, nav, toast, today });
const home = createHomeController({ entries, today, openForm: form.open, openDetail: detail.open });
const records = createRecordsController({ entries, auth, today, openDetail: detail.open });
const excel = createExcelController({ auth, entries, getFiltered: records.getFiltered, toast });

let session = null;
const login = createLoginController({ auth, onSignedIn: () => session.signIn() });
session = createSessionController({ auth, entries, nav, home, records, login, today });

nav.setOnShowRecords(records.render);
nav.bind({ onOpenForm: (type) => form.open(type, null), onOpenUpload: excel.openUpload });
[login, session, home, form, records, detail, excel].forEach((c) => c.bind());

// ── BOOT ──
applyKeyboardInset();
applyFormScrollLock();
session.boot();
