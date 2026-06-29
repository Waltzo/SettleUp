# 💸 SettleUp — 더치페이 정산

활동별로 누가 얼마를 냈고 누가 참여했는지 입력하면, **누가 누구에게 얼마를 보내야 하는지** 최소 송금 횟수로 계산해주는 정적 웹페이지.

- 백엔드 없음. 작성 데이터는 브라우저 **localStorage**에 저장됨 (새로고침해도 유지, 링크엔 안 담김).
- 정산 결과는 **영수증 이미지**로 공유.
- 활동별 균등 분할 정산.
- GitHub Pages 호스팅.

## 로컬 실행

```bash
npm install
npm run dev
```

## 빌드 / 미리보기

```bash
npm run build
npm run preview
```

## GitHub Pages 배포

1. 저장소를 GitHub에 `SettleUp` 이름으로 푸시 (`main` 브랜치).
   - 저장소 이름이 다르면 `vite.config.js`의 `base: '/SettleUp/'`를 실제 이름(대소문자 일치)으로 변경.
2. GitHub 저장소 → **Settings → Pages → Build and deployment → Source** 를 **GitHub Actions** 로 설정.
3. `main`에 푸시하면 `.github/workflows/deploy.yml`이 자동 빌드·배포.
4. `https://<사용자명>.github.io/SettleUp/` 에서 접속.

## 사용법

1. 참여 인원 추가
2. 활동 추가 (이름·결제자·금액·참여자 선택)
3. 정산 결과에서 송금 내역 확인
4. **🧾 공유하기** → 영수증 이미지 저장·전달
