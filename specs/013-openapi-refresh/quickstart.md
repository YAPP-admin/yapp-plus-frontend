# 검증과 복구

```sh
OPENAPI_INPUT="$PWD/.context/sdk-openapi.json" mise exec -- pnpm --filter @yapp-plus/api generate
mise exec -- node --run check
mise exec -- node --run build
```

입력 SHA-256을 research.md와 비교한다. 서버 URL을 다시 내려받은 결과가 다르면
같은 검증 입력으로 간주하지 않는다. 각 PR은 직전 단계 브랜치를 base로 검토한다.
롤백 시 해당 생성물·필터·mock 연결을 함께 되돌리고 후속 소비자를 확인한다.
