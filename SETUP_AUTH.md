# 🔐 로그인 기능 설정 가이드

구글/카카오/네이버 로그인을 Firebase Auth + Firestore로 구현했습니다.
Vercel에 배포하기 전 **환경변수 설정**과 **OAuth 앱 등록**이 필요해요.

---

## 1️⃣ Firebase 프로젝트 생성

1. https://console.firebase.google.com 접속
2. **프로젝트 추가** → 프로젝트 이름 입력 (예: `my-cardnews`)
3. 프로젝트 생성 완료 후 좌측 메뉴 **Build** → **Authentication** 클릭
4. **Get started** 버튼 클릭
5. **Sign-in method** 탭에서 **Google** 활성화 → 프로젝트 공개 이름 입력 → 저장

### 웹 앱 등록 (클라이언트 SDK 설정)
1. 프로젝트 개요 페이지 → 웹 아이콘 `</>` 클릭
2. 앱 닉네임 입력 → **앱 등록**
3. 표시된 `firebaseConfig` 객체의 값들을 `.env.local` 또는 Vercel 환경변수에 복사:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

### 서비스 계정 (서버 전용, 카카오/네이버에 필요)
1. 프로젝트 설정 (톱니바퀴) → **서비스 계정** 탭
2. **새 비공개 키 생성** → JSON 파일 다운로드
3. JSON 파일에서 아래 3개 값을 환경변수에 복사:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` *(중요: 큰따옴표로 감싸서 `\n`을 그대로 유지)*

### 승인된 도메인 추가
Authentication → Settings → **Authorized domains** 탭에 아래 도메인 추가:
- `my-cardnews-app.vercel.app`
- `localhost` (이미 있을 수 있음)

### Firestore 활성화 (클라우드 저장 기능)
1. 좌측 메뉴 **Build** → **Firestore Database**
2. **Create database** → **Start in production mode** → 리전 선택 (`asia-northeast3` 서울 추천)
3. **Rules** 탭에서 아래로 교체:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 본인 데이터만 읽기/쓰기 가능
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

## 2️⃣ 카카오 로그인 설정

1. https://developers.kakao.com 접속 후 로그인
2. **내 애플리케이션** → **애플리케이션 추가** → 앱 이름/사업자명 입력
3. **앱 설정** → **앱 키** 탭의 **REST API 키**를 복사 → `NEXT_PUBLIC_KAKAO_REST_API_KEY`
4. **앱 설정** → **플랫폼** → **Web 플랫폼 등록**
   - 사이트 도메인: `https://my-cardnews-app.vercel.app`
5. **제품 설정** → **카카오 로그인** → **활성화 설정** ON
6. **Redirect URI** 등록:
   - `https://my-cardnews-app.vercel.app/api/auth/kakao/callback`
7. **보안** 탭에서 **Client Secret** 생성 → `KAKAO_CLIENT_SECRET`
8. **동의항목** 설정 → **닉네임**, **프로필 사진**, **카카오계정(이메일)** 선택 항목으로 활성화

---

## 3️⃣ 네이버 로그인 설정

1. https://developers.naver.com/apps 접속 후 로그인
2. **Application 등록** → 애플리케이션 이름 입력
3. **사용 API** → **네이버 로그인** 선택 → 필수 제공 정보 체크 (이메일, 닉네임, 프로필 사진)
4. **서비스 환경** → **PC웹**
   - 서비스 URL: `https://my-cardnews-app.vercel.app`
   - Callback URL: `https://my-cardnews-app.vercel.app/api/auth/naver/callback`
5. 등록 후 **Client ID** → `NEXT_PUBLIC_NAVER_CLIENT_ID`
6. **Client Secret** → `NAVER_CLIENT_SECRET`

---

## 4️⃣ Vercel 환경변수 등록

1. https://vercel.com/dashboard → 프로젝트 클릭
2. **Settings** 탭 → **Environment Variables**
3. 아래 항목들을 각각 추가 (Production/Preview/Development 모두 체크):

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
NEXT_PUBLIC_KAKAO_REST_API_KEY
KAKAO_CLIENT_SECRET
NEXT_PUBLIC_NAVER_CLIENT_ID
NAVER_CLIENT_SECRET
NEXT_PUBLIC_SITE_URL
```

4. 환경변수 저장 후 **Deployments** → 최신 배포 → `⋯` → **Redeploy** (Build Cache 해제)

---

## 5️⃣ 로컬 테스트 (선택)

```bash
# 프로젝트 루트에서
cp .env.local.example .env.local
# .env.local 파일에 위에서 얻은 모든 값 입력
npm install
npm run dev
```

카카오/네이버 OAuth는 Redirect URI 때문에 **로컬에서 테스트하려면** 개발자 콘솔에 `http://localhost:3000/api/auth/kakao/callback` 같은 로컬 URL도 추가 등록해야 합니다.

---

## 🎯 구현된 기능

### 현재 동작
- ✅ 홈 헤더 "로그인" 버튼 → `/login` 페이지
- ✅ 3가지 소셜 로그인 (구글/카카오/네이버)
- ✅ 로그인 후 헤더에 프로필 사진 + 드롭다운 메뉴
- ✅ `/profile` 페이지 — 프로필 정보 + 로그아웃
- ✅ 로그아웃 기능

### 추후 연동 필요
- 📝 라이브러리 저장 시 클라우드 자동 동기화 (코드는 준비됨: `lib/firestore-library.ts`)
- 📝 기기 간 카드뉴스 공유

---

## ❓ 트러블슈팅

**"Firebase 환경변수가 설정되지 않았어요" 경고가 로그인 페이지에 보여요**
→ Vercel 환경변수 설정 후 Redeploy 필수. Browser cache도 확인.

**카카오 로그인 버튼 누르면 "KOE006" 오류**
→ 카카오 개발자 콘솔의 Redirect URI가 정확히 `/api/auth/kakao/callback`인지 확인.

**네이버 로그인 후 "naver_token_failed" 오류**
→ Client Secret이 올바른지, 서비스 환경의 PC웹 Callback URL이 정확한지 확인.

**`FIREBASE_ADMIN_PRIVATE_KEY` 줄바꿈 문제**
→ Vercel 환경변수에 넣을 때는 JSON 원본 그대로 복사 (따옴표 포함 또는 미포함 둘 다 OK). `\n` 문자열로 저장되며 코드에서 자동으로 실제 줄바꿈으로 변환합니다.
