# Table Query

## user

- ID
- 이름
- 닉네임
- 이메일
- 마지막 로그인

```mysql
CREATE TABLE IF NOT EXISTS user (
	id VARCHAR(30) NOT NULL COMMENT 'ID (PK)',
    name VARCHAR(20) NOT NULL COMMENT '이름',
    nickname VARCHAR(20) NOT NULL COMMENT '별명',
    email VARCHAR(50) NOT NULL COMMENT '이메일',
    intro VARCHAR(100) NULL COMMENT '소개',
    created_time DATETIME NOT NULL DEFAULT NOW() COMMENT '생성시간',
    last_login TIMESTAMP NULL COMMENT '마지막 로그인',
    PRIMARY KEY (id),
    UNIQUE KEY (nickname, email)
) COMMENT '유저';
```

## password

> 보안을 위해 비밀번호를 따로 관리도 가능

- User ID
- salt
- 비밀번호
  - renewed (메일로 임시 비밀번호를 보내 비밀번호 초기화 후 변경을 강제할 때 필요)

```mysql
CREATE TABLE IF NOT EXISTS password (
	user_id VARCHAR(30) NOT NULL COMMENT 'USER ID (PK)',
    salt VARCHAR(50) NOT NULL COMMENT 'salt',
    password VARCHAR(255) NOT NULL COMMENT '비밀번호',
    created_time DATETIME NOT NULL DEFAULT NOW() COMMENT '생성시간',
    modified_time TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정시간',
    PRIMARY KEY (user_id)
) COMMENT '비밀번호';
```

### refresh_token

- ID
- User ID
- Token Value
- Expiration

```mysql
CREATE TABLE IF NOT EXISTS refresh_token (
	id INT NOT NULL AUTO_INCREMENT COMMENT 'ID (PK)',
	user_id VARCHAR(30) NOT NULL COMMENT 'USER ID',
    token text NOT NULL COMMENT 'Access Token',
    expiration_time TIMESTAMP NOT NULL COMMENT '만료시간',
    created_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성시간',
    PRIMARY KEY (ID)
) COMMENT '리프레시 토큰';
```

## follow

- Follower ID
- Following ID

```mysql
CREATE TABLE IF NOT EXISTS follow (
	follower_id VARCHAR(30) NOT NULL COMMENT '팔로워 ID',
    following_id VARCHAR(30) NOT NULL COMMENT '팔로잉 ID',
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT follow_follower_id_fk FOREIGN KEY (follower_id) REFERENCES user (id) ON DELETE CASCADE,
    CONSTRAINT follow_following_id_fk FOREIGN KEY (following_id) REFERENCES user (id) ON DELETE CASCADE
) COMMENT '팔로우';
```

## organization

- ID
- 이름
- 코드

```mysql
CREATE TABLE IF NOT EXISTS organization (
	id INT NOT NULL AUTO_INCREMENT COMMENT 'ID (PK)',
    name VARCHAR(50) NOT NULL COMMENT '이름',
    master VARCHAR(30) NOT NULL COMMENT '마스터 ID',
    code VARCHAR(6) NOT NULL COMMENT '가입코드',
    created_time DATETIME NOT NULL DEFAULT NOW() COMMENT '생성시간',
    modified_time TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정시간',
    PRIMARY KEY (id),
    UNIQUE KEY (name)
) COMMENT '단체';
```

### user_organization_map

- Organization ID
- User ID

```mysql
CREATE TABLE IF NOT EXISTS user_organization_map (
	organization_id INT NOT NULL COMMENT '단체 ID',
    user_id VARCHAR(30) NOT NULL COMMENT '유저 ID',
    PRIMARY KEY (organization_id, user_id),
    CONSTRAINT user_organization_map_user_id_fk FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    CONSTRAINT user_organization_map_organization_id_fk FOREIGN KEY (organization_id) REFERENCES organization (id) ON DELETE CASCADE
) COMMENT '유저 단체 매핑 테이블';
```

## question

- ID
- 제목
- 작성자
- 출처 - 어떤 식으로 관리할지 (구분값을 따로 만들지, 도메인주소를 적을지에 따라 다름)
- 질문유형
- 언어
- 코드
- 질문내용
- 생성시간
- 수정시간

```mysql
CREATE TABLE IF NOT EXISTS question (
	id INT NOT NULL AUTO_INCREMENT COMMENT 'ID (PK)',
    title VARCHAR(100) NOT NULL COMMENT '제목',
    user_id VARCHAR(30) NOT NULL COMMENT '작성자',
    source VARCHAR(50) NOT NULL COMMENT '출처',
    link VARCHAR(255) NOT NULL COMMENT '문제링크',
    type VARCHAR(50) NOT NULL COMMENT '질문 유형',
    language VARCHAR(10) NOT NULL COMMENT '언어',
    code VARCHAR(3000) NULL COMMENT '코드',
    content VARCHAR(3000) NOT NULL COMMENT '내용',
    created_time DATETIME NOT NULL DEFAULT NOW() COMMENT '생성시간',
    modified_time TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정시간',
    PRIMARY KEY (id)
) COMMENT '질문';
```

### question_info

- Question ID
- 조회 수
- 좋아요 수
- 답변 수
- 댓글 수
- * 생성시간
- * 이름
- * 문제 출처
- * 질문 유형
- * 답변 여부

```mysql
CREATE TABLE IF NOT EXISTS question_info (
	question_id INT NOT NULL COMMENT 'Question ID (PK)',
    view_cnt INT NOT NULL DEFAULT 0 COMMENT '조회 수',
    like_cnt INT NOT NULL DEFAULT 0 COMMENT '좋아요 수',
    answer_cnt INT NOT NULL DEFAULT 0 COMMENT '답변 수',
    comment_cnt INT NOT NULL DEFAULT 0 COMMENT '댓글 수',
    PRIMARY KEY (question_id),
    CONSTRAINT question_info_question_id_fk FOREIGN KEY (question_id) REFERENCES question (id) ON DELETE CASCADE
) COMMENT '질문 정보';
```

## scrap

- User ID
- Question ID
- 생성시간

```mysql
CREATE TABLE IF NOT EXISTS scrap (
	user_id VARCHAR(30) NOT NULL COMMENT 'User ID',
	question_id INT NOT NULL COMMENT 'Question ID',
    created_time DATETIME NOT NULL DEFAULT NOW() COMMENT '생성시간',
    PRIMARY KEY (user_id, question_id),
    CONSTRAINT scrap_user_id_fk FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    CONSTRAINT scrap_question_id_fk FOREIGN KEY (question_id) REFERENCES question (id) ON DELETE CASCADE
) COMMENT '스크랩';
```

## question_like

- User ID
- Question ID
- 생성시간

```mysql
CREATE TABLE IF NOT EXISTS question_like (
	user_id VARCHAR(30) NOT NULL COMMENT 'User ID',
	question_id INT NOT NULL COMMENT 'Question ID',
    created_time DATETIME NOT NULL DEFAULT NOW() COMMENT '생성시간',
    PRIMARY KEY (user_id, question_id),
    CONSTRAINT question_like_user_id_fk FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    CONSTRAINT question_like_question_id_fk FOREIGN KEY (question_id) REFERENCES question (id) ON DELETE CASCADE
) COMMENT '질문 좋아요';
```

## question_comment

- ID
- Question ID
- User ID
- 내용
- 좋아요 수
- 생성시간
- 수정시간

```mysql
CREATE TABLE IF NOT EXISTS question_comment (
	id INT NOT NULL AUTO_INCREMENT COMMENT 'ID (PK)',
	question_id INT NOT NULL COMMENT 'Question ID',
	user_id VARCHAR(30) NOT NULL COMMENT 'User ID',
    content VARCHAR(200) NOT NULL COMMENT '내용',
    like_cnt INT NOT NULL DEFAULT 0 COMMENT '좋아요 수',
    created_time DATETIME NOT NULL DEFAULT NOW() COMMENT '생성시간',
    modified_time TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정시간',
    PRIMARY KEY (id)
) COMMENT '질문 댓글';
```

## question_comment_like

- User ID
- Question Comment ID
- 생성시간

```mysql
CREATE TABLE IF NOT EXISTS question_comment_like (
	user_id VARCHAR(30) NOT NULL COMMENT 'User ID',
	question_comment_id INT NOT NULL COMMENT 'Question Comment ID',
    created_time DATETIME NOT NULL DEFAULT NOW() COMMENT '생성시간',
    PRIMARY KEY (user_id, question_comment_id),
    CONSTRAINT question_comment_like_user_id_fk FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    CONSTRAINT question_comment_like_question_id_fk FOREIGN KEY (question_comment_id) REFERENCES question_comment (id) ON DELETE CASCADE
) COMMENT '질문 댓글 좋아요';
```

## question_tag

- ID
- 태그이름

```mysql
CREATE TABLE IF NOT EXISTS question_tag (
    id INT NOT NULL AUTO_INCREMENT COMMENT 'ID (PK)',
    name VARCHAR(10) NOT NULL COMMENT '태그명',
    PRIMARY KEY (id),
    UNIQUE KEY (name)
) COMMENT '질문 태그';
```

### question_tag_map

- Tag ID
- Question ID

```mysql
CREATE TABLE IF NOT EXISTS question_tag_map (
    tag_id INT NOT NULL COMMENT 'Tag ID (PK)',
    question_id INT NOT NULL COMMENT 'Question ID (PK)',
    PRIMARY KEY (tag_id, question_id),
    CONSTRAINT question_tag_map_tag_id_fk FOREIGN KEY (tag_id) REFERENCES question_tag (id) ON DELETE CASCADE,
    CONSTRAINT question_tag_map_question_id_fk FOREIGN KEY (question_id) REFERENCES question (id) ON DELETE CASCADE
) COMMENT '질문 태그 매핑 테이블';
```

## answer

- ID
- Question ID
- User ID
- 언어
- 코드
- 답변내용
- 좋아요 수
- 생성시간
- 수정시간

```mysql
CREATE TABLE IF NOT EXISTS answer (
	id INT NOT NULL AUTO_INCREMENT COMMENT 'ID (PK)',
    title VARCHAR(100) NOT NULL COMMENT '제목',
	question_id INT NOT NULL COMMENT 'Question ID',
	user_id VARCHAR(30) NOT NULL COMMENT 'User ID',
    language VARCHAR(10) NOT NULL COMMENT '언어',
    code VARCHAR(3000) NULL COMMENT '코드',
    content VARCHAR(3000) NOT NULL COMMENT '내용',
    like_cnt INT NOT NULL DEFAULT 0 COMMENT '좋아요 수',
    created_time DATETIME NOT NULL DEFAULT NOW() COMMENT '생성시간',
    modified_time TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정시간',
    PRIMARY KEY (id)
) COMMENT '답변';
```

## answer_like

- User ID
- Answer ID
- 생성시간

```mysql
CREATE TABLE IF NOT EXISTS answer_like (
	user_id VARCHAR(30) NOT NULL COMMENT 'User ID',
	answer_id INT NOT NULL COMMENT 'Answer ID',
    created_time DATETIME NOT NULL DEFAULT NOW() COMMENT '생성시간',
    PRIMARY KEY (user_id, answer_id),
    CONSTRAINT answer_like_user_id_fk FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    CONSTRAINT answer_like_answer_id_fk FOREIGN KEY (answer_id) REFERENCES answer (id) ON DELETE CASCADE
) COMMENT '답변 좋아요';
```

## answer_comment_like

- User ID
- Answer Comment ID
- 생성시간

```mysql
CREATE TABLE IF NOT EXISTS answer_comment_like (
	user_id VARCHAR(30) NOT NULL COMMENT 'User ID',
	answer_comment_id INT NOT NULL COMMENT 'Answer Comment ID',
    created_time DATETIME NOT NULL DEFAULT NOW() COMMENT '생성시간',
    PRIMARY KEY (user_id, answer_comment_id),
    CONSTRAINT answer_comment_like_user_id_fk FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    CONSTRAINT answer_comment_like_answer_id_fk FOREIGN KEY (answer_comment_id) REFERENCES answer_comment (id) ON DELETE CASCADE
) COMMENT '질문 댓글 좋아요';
```

## answer_comment

- ID
- AnswerID
- User ID
- 내용
- 좋아요 수
- 생성시간
- 수정시간

```mysql
CREATE TABLE IF NOT EXISTS answer_comment (
	id INT NOT NULL AUTO_INCREMENT COMMENT 'ID (PK)',
	question_id INT NOT NULL COMMENT 'Answer ID',
	user_id VARCHAR(30) NOT NULL COMMENT 'User ID',
    content VARCHAR(200) NOT NULL COMMENT '내용',
    like_cnt INT NOT NULL DEFAULT 0 COMMENT '좋아요 수',
    created_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성시간',
    modified_time TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정시간',
    PRIMARY KEY (id)
) COMMENT '답변 댓글';
```

## answer_tag

- ID
- 태그이름

```mysql
CREATE TABLE IF NOT EXISTS answer_tag (
    id INT NOT NULL AUTO_INCREMENT COMMENT 'ID (PK)',
    name VARCHAR(10) NOT NULL COMMENT '태그명',
    PRIMARY KEY (id),
    UNIQUE KEY (name)
) COMMENT '답변 태그';
```

### answer_tag_map

- Tag ID
- Answer ID

```mysql
CREATE TABLE IF NOT EXISTS answer_tag_map (
    tag_id INT NOT NULL COMMENT 'Tag ID (PK)',
    answer_id INT NOT NULL COMMENT 'Answer ID (PK)',
    PRIMARY KEY (tag_id, answer_id),
    CONSTRAINT answer_tag_map_tag_id_fk FOREIGN KEY (tag_id) REFERENCES answer_tag (id) ON DELETE CASCADE,
    CONSTRAINT answer_tag_map_answer_id_fk FOREIGN KEY (answer_id) REFERENCES answer (id) ON DELETE CASCADE
) COMMENT '답변 태그 매핑 테이블';
```

## notification

- ID
- User ID
- 읽음 여부
- Subject (user)
- Subject ID
- Subject 이름
- Type (like, comment, reply, follow, join)
- Object (question, answer, question_comment, user)
- Object ID
- Object 이름
- Target Url
- 내용
- 생성시간

```
CREATE TABLE IF NOT EXISTS notification (
    id INT NOT NULL AUTO_INCREMENT COMMENT 'ID (PK)',
    is_read TINYINT NOT NULL DEFAULT FALSE COMMENT '읽음',
	user_id VARCHAR(30) NOT NULL COMMENT 'User ID',
    subject VARCHAR(30) NULL COMMENT '알림 발생자',
    subject_id VARCHAR(255) NULL COMMENT '발생자 ID',
    subject_name VARCHAR(255) NULL COMMENT '발생자 이름',
    type VARCHAR(20) NOT NULL COMMENT '알림 타입',
    object VARCHAR(20) NOT NULL COMMENT '알림 대상', 
    object_id VARCHAR(255) NOT NULL COMMENT '대상 ID',
    object_name VARCHAR(255) NOT NULL COMMENT '대상 이름',
    target_url VARCHAR(255) NULL COMMENT 'Target URL',
    content VARCHAR(100) NULL COMMENT '내용',
    created_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성시간',    
    PRIMARY KEY (id),
    CONSTRAINT notification_user_id_fk FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
) COMMENT '알림';
```