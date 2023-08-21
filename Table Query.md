# Table Query

## user

- ID
- 이름
- 닉네임
- 이메일

```mysql
CREATE TABLE IF NOT EXISTS user (
	id VARCHAR(30) NOT NULL COMMENT 'ID (PK)',
    name VARCHAR(20) NOT NULL COMMENT '이름',
    nickname VARCHAR(20) NOT NULL COMMENT '별명',
    email VARCHAR(50) NOT NULL COMMENT '이메일',
    intro VARCHAR(100) NULL COMMENT '소개',
    created_time DATETIME NOT NULL DEFAULT NOW() COMMENT '생성시간',
    modified_time TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정시간',
    PRIMARY KEY (id),
    UNIQUE KEY (id, nickname)
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

## follow

- Follower ID
- Following ID

```mysql
CREATE TABLE IF NOT EXISTS follow (
	follower_id VARCHAR(30) NOT NULL COMMENT '팔로워 ID',
    following_id VARCHAR(30) NOT NULL COMMENT '팔로잉 ID',
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT follower_id_fk FOREIGN KEY (follower_id) REFERENCES user (id) ON DELETE CASCADE,
    CONSTRAINT following_id_fk FOREIGN KEY (following_id) REFERENCES user (id) ON DELETE CASCADE
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
    code VARCHAR(6) NOT NULL COMMENT '가입코드',
    created_time DATETIME NOT NULL DEFAULT NOW() COMMENT '생성시간',
    modified_time TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정시간',
    PRIMARY KEY (id),
    UNIQUE KEY (id, name)
) COMMENT '단체';
```

## userOrganizationMap

- Organization ID
- User ID

```mysql
CREATE TABLE IF NOT EXISTS user_organization_map (
	organization_id INT NOT NULL COMMENT '단체 ID',
    user_id VARCHAR(30) NOT NULL COMMENT '유저 ID',
    PRIMARY KEY (organization_id, user_id),
    CONSTRAINT user_id_fk FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    CONSTRAINT organization_id_fk FOREIGN KEY (organization_id) REFERENCES organization (id) ON DELETE CASCADE
) COMMENT '유저 단체 매핑 테이블';
```

## question

- ID
- 제목
- 작성자
- 출처 - 어떤 식으로 관리할지 (구분값을 따로 만들지, 도메인주소를 적을지에 따라 다름)
- 질문유형
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
    type VARCHAR(10) NOT NULL COMMENT '질문 유형',
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
- 마지막 답변 id

```mysql
CREATE TABLE IF NOT EXISTS question_info (
	question_id INT NOT NULL COMMENT 'Question ID (PK)',
    view_cnt INT NOT NULL DEFAULT 0 COMMENT '조회 수',
    like_cnt INT NOT NULL DEFAULT 0 COMMENT '좋아요 수',
    answer_cnt INT NOT NULL DEFAULT 0 COMMENT '답변 수',
    comment_cnt INT NOT NULL DEFAULT 0 COMMENT '댓글 수',
    PRIMARY KEY (question_id),
    CONSTRAINT question_info_id_fk FOREIGN KEY (question_id) REFERENCES question (id) ON DELETE CASCADE
) COMMENT '질문 정보';
```

## answer

- ID
- Question ID
- User ID
- 답변내용
- 좋아요 수
- 생성시간
- 수정시간

```mysql
CREATE TABLE IF NOT EXISTS answer (
	id INT NOT NULL AUTO_INCREMENT COMMENT 'ID (PK)',
	question_id INT NOT NULL COMMENT 'Question ID',
	user_id VARCHAR(30) NOT NULL COMMENT 'User ID',
    content VARCHAR(3000) NOT NULL COMMENT '내용',
    like_cnt INT NOT NULL DEFAULT 0 COMMENT '좋아요 수',
    created_time DATETIME NOT NULL DEFAULT NOW() COMMENT '생성시간',
    modified_time TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정시간',
    PRIMARY KEY (id)
) COMMENT '답변';
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

## notification

- ID
- User ID
- 