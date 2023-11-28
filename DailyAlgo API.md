# DailyAlgo API

> GET은 query에다가,
>
> POST, PUT, DELETE는 body에다가 데이터를 담아 전송합니다.

## /user

- GET /oauth/google

  - req : None
  - res : 리다이렉트

- GET /kauth/kakao

  - req : None
  - res : 리다이렉트

- POST /sign_up/email

  - `5자리 난수 인증번호 메일로 전송`
  - req
    - { id, email }

- POST /sign_up/validate

  - `5자리 난수 인증번호 확인`
  - req
    - { id, num }

- POST /find/email

  - `아이디 찾기 이메일`
  - req
    - { email }

- POST /find/validate

  - `아이디 찾기`
  - req
    - { email, num }
  - res
    - id

- POST /sign_up

  - `회원가입`
  - req
    - { id, name, nickname, emial, password, organization_code }
  - res
    - `개발용 임시 토큰` { token }

- GET /check/id

  - `ID 중복확인`
  - req
    - query ? id
  - res
    - T/F

- GET /check/nickname

  - `닉네임 중복확인`
  - req
    - query ? nickname
  - res
    - T/F

- POST /sign_in

  - `로그인`
  - req
    - { id, password }
  - res
    - `개발용 임시 토큰` { token }

- GET /:id

  - `회원정보 조회`

  - req

    - {

       id: string

       name: string

       nickname: string

       intro: string

       email: string

       created_time: Date

       organizations: string[]

       question_cnt: number

       answer_cnt: number

       view_cnt: number

       follower_cnt: number

       following_cnt: number

      }

- PUT /:id

  - `회원정보 수정`
  - 로그인 필요
  - req
    - { nickname, intro }

- DELETE /:id

  - `회원탈퇴`
  - 로그인 필요

- PUT /:id/password

  - `비밀번호 변경`
  - 로그인 필요
  - req
    - { newPassword }

- PUT /:id/follow

  - `팔로우`
  - 로그인 필요

- GET /:id/follower

  - `팔로워 조회`

  - res

    - [{

       id: string

       nickname: string

       intro?: string

      }]

- GET /:id/following

  - `팔로잉 조회`

  - res

    - [{

       id: string

       nickname: string

       intro?: string

      }]

- GET /:id/question

  - `질문 조회`

  - res

    - [{

       id: string

       title: string

       source: string

       type: string

       tags: string[]

       user_id: string

       answer_created_time: Date

      }]

- GET /:id/answer

  - `답변 조회`

  - res

    - [{

       id: string

       title: string

       source: string

       type: string

       tags: string[]

       user_id: string

       answer_created_time: Date

      }]

- GET /:id/scrap

  - `스크랩 조회`

  - res

    - [{

       id: string

       title: string

       source: string

       type: string

       tags: string[]

       user_id: string

       answer_created_time: Date

      }]

- GET /authorization

  - `이메일 클릭 시 사용자 인증`
  - 로그인 필요

- POST /password/reset/email

  - `비밀번호 리셋 이메일 발송`
  - req
    - { id, email }

- POST /password/reset/validate

  - `비밀번호 리셋 인증번호`
  - req
    - { email, num }

- PUT /password/reset

  - `비밀전호 리셋`
  - req
    - { email, num, newPassword }



## /organization

- POST /

  - `단체 생성`
  - 로그인 필요
  - req
    - { name }

- GET /code

  - `단체 조회`

  - req

    - query ? code

  - res

    - {

       id: number

       name: string

       code: string

       master: string

       created_time: Date

      }

- DELET /:id

  - `단체 삭제`
  - 로그인 필요

- POST /:id/join

  - `가입`
  - 로그인 필요

- DELETE /:id/withdraw

  - `탈퇴`
  - 로그인 필요



## /question

- GET /search

  - `질문 검색`

  - req

    - query ? keyword

  - res

    - [{

       id: string

       title: string

       source: string

       type: string

       view_cnt: number

       like_cnt: number

       answer_cnt: number

       comment_cnt: number

       tags: string[]

       user_id: string

       created_time: Date

      }]

- POST /tag

  - `신규 태그 생성`
  - req
    - { name }

- GET /tag

  - `태그 조회`
  - req
    - { name }
    - 해당 없을 경우 새로 생성 (즉 조회한 태그는 무조건 존재 -> POST랑 기능이 겹침)

- POST /

  - `질문 생성`

  - 로그인 필요

  - req

    - {
      title: 제목, 
      source: 출처(백준인지 프로그래머스인지 등등), 
      link: 문제 원문 링크, 
      type: 질문 유형, 
      content: 본문내용,

      launguage: 언어,

      code: 코드 영역,

      tages: 태그 이름을 리스트 형태로
      }

- GET /

  - `질문 리스트 조회`

  - req

    - query ? offest
    - 오프셋이 없을 경우 0부터

  - res

    - [{

       id: string

       title: string

       source: string

       type: string

       view_cnt: number

       like_cnt: number

       answer_cnt: number

       comment_cnt: number

       tags: string[]

       user_id: string

       created_time: Date

      }]

    - 10개의 글 제공

- GET /:id

  - `질문 조회`

  - res

    - {

       id: number

       title: string

       user_id: string

       user_nickname: string

       source: string

       link: string

       type: string

       content: string

       language: string

       code: string

       created_time: Date

       modified_time?: Date

       view_cnt: number

       like_cnt: number

       answer_cnt: number

       comment_cnt: number

       tags: string[]

      isScrap: boolean (로그인 안 되어있을 경우 null)

      }

- PUT /:id

  - `질문 수정`

  - 로그인 필요

  - req

    - {

      title,
      source,
      link,
      type,
      content,
      language,
      code,
      tags
      }

- DELETE /:id

  - `질문 삭제`
  - 로그인 필요

- PUT /:id/like

  - `질문 좋아요`
  - 로그인 필요

- PUT /:id/scrap

  - `질문 스크랩`
  - 로그인 필요

- GET /:id/comment

  - `댓글 조회`

  - res

    - [{

       id: number

       question_id: number

       user_id: string

       content: string

       like_cnt: number

       created_time?: Date

       modified_time?: Date

      }]

- POST /:id/comment

  - `댓글 작성`
  - 로그인 필요
  - req
    - { content }

- PUT /:id/comment

  - `댓글 수정`
  - 로그인 필요
  - req
    - { content }

- DELETE /:id/comment

  - `댓글 삭제`
  - 로그인 필요

- PUT  /:id/comment/like

  - `댓글 좋아요`
  - 로그인 필요



## /answer

- POST /tag

  - `신규 태그 생성`
  - req
    - { name }

- GET /tag

  - `태그 조회 (없으면 생성)`
  - req
    - { name }
    - 해당 없을 경우 새로 생성 (즉 조회한 태그는 무조건 존재 -> POST랑 기능이 겹침)

- POST /

  - `답변 생성`

  - 로그인 필요

  - req

    - {
      title: 제목,
      language: 언어,
      code: 코드 영역,
      content: 본문,
      tags: 리스트 형태의 태그명

      }

- GET /:question_id

  - `답변 리스트 조회`

  - res

    - [{

       id: number

       question_id: number

       title: string

       user_id: string

       language: string

       code: string

       content: string

       like_cnt: number

       created_time?: Date

       modified_time?: Date

       tags: string[]

      }]

- PUT /:id

  - `답변 수정`
  - 로그인 필요
  - req
    - {
      title,
      language,
      code,
      content
      }

- DELETE /:id

  - `답변 삭제`
  - 로그인 필요

- PUT /:id/like

  - `답변 좋아요`
  - 로그인 필요

- GET /:id/comment

  - `답변 댓글 조회`

  - res

    - [{

       id: number

       answer_id: number

       user_id: string

       content: string

       like_cnt: number

       created_time?: Date

       modified_time?: Date

      }]

- POST /:id/comment

  - `댓글 생성`
  - 로그인 필요
  - req
    - { content }

- PUT /:id/comment

  - `댓글 수정`
  - 로그인 필요
  - req
    - { content }

- DELETE /:id/comment

  - `댓글 삭제`
  - 로그인 필요

- PUT /:id/comment/like

  - `댓글 좋아요`
  - 로그인 필요



## /notification

- GET /

  - `알림 리스트 조회`

  - 로그인 필요

  - res

    - [{

       id: number

       is_read: boolean

       user_id: string

       type: string

       subject?: string

       subject_id?: string

       subject_name?: string

       object: string

       object_id: string

       object_name: string

       target_url?: string

       content?: string

       created_time: Date

      }]

- GET /count

  - `알림 여부 확인`
  - 로그인 필요
  - res
    - 알림 개수

- GET /:id

  - `알림 정보로 이동`
  - 로그인 필요
  - res
    - 리다이렉트

- DELETE /:id

  - `알림 삭제`
  - 로그인 필요