# DailyAlgo API

> GET은 query에다가,
>
> POST, PUT, DELETE는 body에다가 데이터를 담아 전송합니다.

```
[Refresh Token]

- 기존 : 토큰이 필요한 모든 요청에서, cookie의 토큰 만료시 자동으로 refresh 후 응답에 새로운 cookie를 넣어 update

- 변경 : 토큰이 필요한 모든 요청에서, 요청의 토큰 만료시 Error 응답, TokenExpiredError 메시지 전송
  - (PUT) /user/token 으로 토큰 갱신

```

## /user

- GET /oauth/google

  - req : None
  - res : 리다이렉트

- GET /kauth/kakao

  - req : None
  - res : 리다이렉트

- POST /sign_up/email

  - `5자리 난수 인증번호 메일로 전송`
  - req : None
  - req
    - { id, email }

- POST /sign_up/validate

  - `5자리 난수 인증번호 확인`
  - req
    - { id, num }
  - res : Boolean

- POST /find/email

  - `아이디 찾기 이메일 전송`
  - req
    - { email }
  - res : None

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

  - res : None

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

- PUT /

  - `회원정보 수정`
  - `로그인 필요`
  - req
    - { nickname, intro }
  - res : None

- DELETE /

  - `회원탈퇴`
  - `로그인 필요`
  - req : None
  - res : None

- PUT /password

  - `비밀번호 변경`
  - `로그인 필요`
  - req
    - { password, newPassword }
  - res : None

- PUT /:id/follow

  - `팔로우`
  - `로그인 필요`
  - req : None
  - res : None

- GET /:id/follower

  - `팔로워 조회`

  - req : None

  - res

    - [{

       id: string

       nickname: string

       intro?: string

       is_following: boolean (본인이 팔로우 중이면 True)

      }]

- GET /:id/following

  - `팔로잉 조회`

  - req : None

  - res

    - [{

       id: string

       nickname: string

       intro?: string

       is_following: boolean (본인이 팔로우 중이면 True)

      }]

- GET /:id/question

  - `질문 조회`

  - req : query ? offest (없으면 0)

  - res

    - {
      total_cnt: number
      nextIndex: number
      question_list: [{

        id: string

        title: string

        source: string

        type: string
        
        tags: string[]
        
        user_id: string
        
        answer_created_time: Date
        
        is_scrap: boolean
        
        is_like: boolean
        
        }]
    }

- GET /:id/answer

  - `답변 조회`

  - req : query ? offest (없으면 0)

  - res

    - {
      total_cnt: number
      nextIndex: number
      question_list: [{
        
        id: string
        
        title: string
        
        source: string
        
        type: string
        
        tags: string[]
        
        user_id: string
        
        answer_created_time: Date
        
        is_like: boolean
        
        }]
    }

- GET /:id/scrap

  - `스크랩 조회`

  - req : query ? offest (없으면 0)

  - res

    - {
      total_cnt: number
      nextIndex: number
      question_list: [{
        
        id: string
        
        title: string
        
        source: string
        
        type: string
        
        tags: string[]
        
        user_id: string
        
        answer_created_time: Date
        
        is_scrap: boolean
        
        is_like: boolean
        
        }]
    }

- POST /password/reset/email

  - `비밀번호 리셋 이메일 발송`
  - req
    - { id, email }
  - res : None

- POST /password/reset/validate

  - `비밀번호 리셋 인증번호`
  - req
    - { email, num }
  - res : T/F

- PUT /password/reset

  - `비밀전호 리셋`
  - req
    - { email, num, newPassword }
  - res : None

- PUT /token

  - `토큰 갱신`
  - `로그인 필요`
  - req : None
  - res : { token, message }



## /organization

- POST /

  - `단체 생성`
  - `로그인 필요`
  - req
    - { name }
  - res : { code } // 가입용 코드

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
  - `로그인 필요`
  - req : None
  - res : None

- POST /:id/join

  - `가입`
  - `로그인 필요`
  - req : None
  - res : None

- DELETE /:id/withdraw

  - `탈퇴`
  - `로그인 필요`
  - req : None
  - res : None



## /question

- POST /tag

  - `신규 태그 생성`
  - req
    - { name }
  - res : None

- GET /tag

  - `태그 조회`
  - req
    - { name }
    - 해당 없을 경우 새로 생성 (즉 조회한 태그는 무조건 존재 -> POST랑 기능이 겹침)
  - res : None

- POST /

  - `질문 생성`

  - `로그인 필요`

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

  - res : None
  
- GET /

  - `질문 리스트 조회,검색`

  - req

    - query ? keyword, offest, source, type, status, order
      - keyword : 검색어
      - offset : 다음 검색 (10개)
      - source : 문제출처
        - all 인 경우 전체 조회
      - type : 질문 타입
        - all 인 경우 전체 조회
      - status : 답변 여부
        - all / answered / not_answered
      - order : 정렬 순서
        - 현재는 new 뿐
    - 오프셋이 없을 경우 0부터

  - res

    - {
        
        total_cnt: number
        
        nextIndex: number
        
        question_list: [{
        
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
        
        is_scrap: boolean
        
        is_like: boolean
        
        }]
      
      }

    - 10개의 글 제공

- GET /:id

  - `질문 조회`

  - req : None

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
        
       is_scrap: boolean
      
       is_like: boolean

      }

- PUT /:id

  - `질문 수정`

  - `로그인 필요`

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

  - res : None

- DELETE /:id

  - `질문 삭제`
  - `로그인 필요`
  - req : None
  - res : None

- PUT /:id/like

  - `질문 좋아요`
  - `로그인 필요`
  - req : None
  - res : None

- PUT /:id/scrap

  - `질문 스크랩`
  - `로그인 필요`
  - req : None
  - res : None

- GET /:id/comment

  - `댓글 조회`

  - req : None

  - res

    - [{

       id: number

       question_id: number

       user_id: string

       content: string

       like_cnt: number

       created_time?: Date

       modified_time?: Date
        
       is_like: boolean

      }]

- POST /:id/comment

  - `댓글 작성`
  - `로그인 필요`
  - req
    - { content }
  - res : None

- PUT /comment/:id

  - `댓글 수정`
  - `로그인 필요`
  - req
    - { content }
  - res : None

- DELETE /comment/:id

  - `댓글 삭제`
  - `로그인 필요`
  - req : None
  - res : None

- PUT  /comment/:id/like

  - `댓글 좋아요`
  - `로그인 필요`
  - req : None
  - res : None



## /answer

- POST /tag

  - `신규 태그 생성`
  - req
    - { name }
  - res : None

- GET /tag

  - `태그 조회 (없으면 생성)`
  - req
    - { name }
    - 해당 없을 경우 새로 생성 (즉 조회한 태그는 무조건 존재 -> POST랑 기능이 겹침)
  - res : None

- POST /

  - `답변 생성`

  - `로그인 필요`

  - req

    - {
      question_id: question_id
      title: 제목,
      language: 언어,
      code: 코드 영역,
      content: 본문,
      tags: 리스트 형태의 태그명

      }

  - res : None

- GET /:question_id

  - `답변 리스트 조회`

  - req : None

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
        
       is_like: boolean

      }]

- PUT /:id

  - `답변 수정`
  - `로그인 필요`
  - req
    - {
      title,
      language,
      code,
      content
      }
  - res : None

- DELETE /:id

  - `답변 삭제`
  - `로그인 필요`
  - req : None
  - res : None

- PUT /:id/like

  - `답변 좋아요`
  - `로그인 필요`
  - req : None
  - res : None

- GET /:id/comment

  - `답변 댓글 조회`

  - req : None

  - res

    - [{

       id: number

       answer_id: number

       user_id: string

       content: string

       like_cnt: number

       created_time?: Date

       modified_time?: Date
        
       is_like: boolean

      }]

- POST /:id/comment

  - `댓글 생성`
  - `로그인 필요`
  - req
    - { content }
  - res : None

- PUT /comment/:id

  - `댓글 수정`
  - `로그인 필요`
  - req
    - { content }
  - res : None

- DELETE /comment/:id

  - `댓글 삭제`
  - `로그인 필요`
  - req : None
  - res : None

- PUT /comment/:id/like

  - `댓글 좋아요`
  - `로그인 필요`
  - req : None
  - res : None



## /notification

```
[SUBJECT / OBJECT 테이블]
question
question_comment
answer
answer_comment
user
```

```
[TYPE 종류]
comment : 댓글이 달렷을 때
answer : 답변이 달릴 시
like : 글, 댓글 좋아요 시
join : organization 가입 시
follow : follow 시
```



- GET /

  - `알림 리스트 조회`

  - `로그인 필요`

  - req : query ? unreadOnly & offset
    - unreadOnly : true면 읽지 않은 것만 보여줌
    - offset : 없으면 0번째부터

  - res
    - 10개씩 보여줌
    - {
        
        total_cnt: number
        
        nextIndex: number
        
        notification_list: [{

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

        }

- GET /count

  - `알림 여부 확인`
  - `로그인 필요`
  - req : None
  - res
    - 알림 개수

- GET /:id

  - `알림 정보로 이동`
  - `로그인 필요`
  - req : None
  - res
    - 리다이렉트

- DELETE /:id

  - `알림 삭제`
  - `로그인 필요`
  - req : None
  - res : None