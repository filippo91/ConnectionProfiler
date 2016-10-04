create table users(
	username varchar_ignorecase(50) not null primary key,
	email varchar_ignorecase(50) not null,
	password varchar_ignorecase(50) not null,
	id int not null,
	enabled boolean not null,
	accountNonExpired boolean not null,
	accountNonLocked boolean not null,
	credentialsNonExpired boolean not null
);

create table user_authority (
	username varchar_ignorecase(50) not null,
	authority varchar_ignorecase(50) not null,
	constraint fk_authorities_users foreign key(username) references users(username)
);
create unique index ix_auth_username on user_authority (username,authority);
 
create table authorities (
	authority varchar_ignorecase(50) not null primary key
);
      
create table verificationToken (
	id int not null primary key,
	token varchar_ignorecase(50) not null,
	username varchar_ignorecase(50) not null references users(username),
	expiryDate datetime not null, 
	verified boolean not null
);