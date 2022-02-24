# tripple-exercise

- 글자가 잘 안보이면 ppt 파일을 첨부했으니 참고해주시면 감사하겠습니다!
- API 진행시 중간중간 마다 흐름을 파악할 수 있도록 logger를 출력했습니다!

## 실행 순서
(터미널, docker cli 기준)
1. git clone https://github.com/biuea3866/tripple-exercise.git 
2. cd tripple-exercise
3. docker-compose up –-force-recreate --build –d
4. docker exec -it tripple/mysql /bin/sh
5. mysql –u root –p (비밀번호 10a10a)
(docker 컨테이너 실행 시 init.sql이 실행 되어 유저 데이터와 장소 데이터가 자동 생성됩니다!) 
6. select * from users
   select * from places
7. 조회한 user_id와 place_id로 API 요청 수행


## 주요 API 구현 설명
CloudAMQP를 이용한 리뷰 API, 포인트 API
- 리뷰 API와 포인트 처리 API
1. 리뷰 작성, 수정, 삭제 API는 리뷰 서비스에 HTTP 요청을 통하여 진행됩니다.
2. 각 API 수행 시 서비스 클래스에서 마일리지 포인트에 대한 로직을 처리하고, 마일리지 포인트를 처리하기 위한 메시지를 생성합니다. 
3. 생성한 메시지를 Message Queue로 전송하고, 응답 메시지가 돌아올 때까지 대기합니다.
4. 포인트 서비스에서는 포인트 증가, 포인트 감소를 담당하는 Message Queue를 구독하고, 메시지가 들어오면 데이터를 받아옵니다. 
5. 받아온 데이터를 서비스 클래스에서 포인트 증감과 포인트 내역 저장에 대한 로직을 처리하고, 응답 메시지를 생성합니다.
6. 생성한 메시지를 응답 결과를 담당하는 Message Queue로 전송합니다.
7. 리뷰 서비스의 서비스 클래스에서는 응답 메시지를 구독하고, 메시지가 들어오면 데이터를 받아옵니다.
8. 최종 결과에 대한 처리를 진행한 후 결과 값을 반환합니다.

## 프로젝트 구성도
<img src="https://user-images.githubusercontent.com/59189504/155479786-633d50a1-c2bb-4df9-a275-4f6352ad382a.png" width="100%" height="568px">

## 요구사항 확인
<img src="https://user-images.githubusercontent.com/59189504/155480413-0983102d-a46d-41c7-bec6-0ad78a19f231.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480433-34e5bc51-1974-46db-9b8a-5a9e558d112c.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480440-18a7c22b-84a0-457e-81bc-7e866d16779d.png" width="100%" height="568px">

## 데이터베이스 구조도
<img src="https://user-images.githubusercontent.com/59189504/155480509-e9877a31-a181-4624-957c-a145a74b7db2.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480516-c7d3143b-acc8-4043-80e9-2a9bdd80e793.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480517-e2400d95-540d-48d8-b0c2-0cd3843f478b.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480521-c045263b-8779-4955-92b5-54859e73051e.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480522-32b7fb8e-97d1-463b-a34b-be3407b99b9a.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480525-ea0948d2-a1ff-4099-b87a-b97bb2e7219d.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480528-ca28eac3-1a21-450f-adc6-5aa8045dbbd5.png" width="100%" height="568px">

## API 명세서
<img src="https://user-images.githubusercontent.com/59189504/155480730-eba765f7-cb4e-413d-820d-02b5da66ba08.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480753-6ee2625f-b882-4500-b113-06d3e5f9023c.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480757-b194e417-7089-4f63-bcb0-7a2edbd132fa.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480760-860e3877-0723-483e-8933-9f9a92de4771.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480765-c7c45c42-89db-42a3-893a-1d8ee7f8f3fb.png" width="100%" height="568px">

## 테스트 케이스
<img src="https://user-images.githubusercontent.com/59189504/155480818-ee9a4b47-9e5e-4970-b5e9-c0c5e7126c55.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480821-b23ee556-9171-4d81-bb37-494c45afc259.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480824-feff9cfa-15a9-4208-ae59-6a80cd5d1b2f.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480828-8136697f-fbb8-4b94-aff7-c606957c6572.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480830-a6bb3d43-18e0-4a72-8aab-233efec58cb0.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480831-969a23e5-686e-4096-aad6-050e5c3203bc.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480834-c5f0c576-b5c6-4ea2-9bce-3bcbc68595be.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480837-622e27f4-efe4-45ca-989e-91adc016ebb4.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480838-48690a01-8af3-49d5-bb92-f5e25499527b.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480842-9df60af7-e44f-4139-aeb2-1492755c57b7.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480844-ffb52eac-70e0-4242-b90f-49b8147dad79.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480845-ef67349c-a684-4a45-97d5-3c636a06691c.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480846-152ab79b-7f6a-4023-916d-e40a227c7ebb.png" width="100%" height="568px">
<img src="https://user-images.githubusercontent.com/59189504/155480849-0a5806cf-db63-43e2-8713-399298e76a6c.png" width="100%" height="568px">
