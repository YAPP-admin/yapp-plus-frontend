# 데이터 모델 변경 경계

단일 진실 공급원은 입력 OpenAPI이며 이 문서에 스키마를 복제하지 않는다.
기존 회원 상세의 이름·전화번호 nullable과 accountDeleted, 출결보고 enum 축소,
수동 출결 정정 checkedInAt 추가가 확인되었다. 새 모델은 관련 operation과 함께 생성한다.
DB나 브라우저 저장 데이터의 마이그레이션은 수행하지 않는다.
