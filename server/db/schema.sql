create or replace function update_timestamp()
    returns trigger as
$$
begin
    new.updated_at = current_timestamp;
    return new;
end;
$$ language plpgsql;

create table if not exists users
(
    ulid       varchar(255) not null unique,
    name       varchar(255) not null,
    email      varchar(255) not null unique,
    password   varchar(255) not null,
    salt       varchar(255) not null,
    is_deleted boolean,
    created_at timestamp    not null default current_timestamp,
    updated_at timestamp    not null default current_timestamp,
    primary key (ulid)
);
create or replace trigger users_updated_at_trigger
    before update
    on users
    for each row
execute function update_timestamp();

create table if not exists sessions
(
    ulid       varchar(255) not null unique,
    user_ulid  varchar(255) not null references users (ulid) on delete cascade,
    token      varchar(255) not null unique,
    is_valid   boolean      not null default true,
    created_at timestamp    not null default current_timestamp,
    updated_at timestamp    not null default current_timestamp,
    primary key (ulid)
);
create index if not exists token_index on sessions (token);
create or replace trigger sessions_updated_at_trigger
    before update
    on sessions
    for each row
execute function update_timestamp();

create table if not exists payments
(
    ulid           varchar(255) not null unique,
    reference_code varchar(30)  not null unique,
    phone_number   varchar(30)  not null,
    amount         integer      not null,
    created_at     timestamp    not null default current_timestamp,
    updated_at     timestamp    not null default current_timestamp,
    primary key (ulid)
);
create or replace trigger payments_updated_at_trigger
    before update
    on payments
    for each row
execute function update_timestamp();

create table if not exists forms
(
    ulid             varchar(255) not null,
    form_name        varchar(255) not null,
    form_description text,
    pages            jsonb        not null,
    price            integer      not null,
    user_ulid        varchar(255) not null references users (ulid) on delete cascade,
    created_at       timestamp    not null default current_timestamp,
    updated_at       timestamp    not null default current_timestamp,
    primary key (ulid)
);
create or replace trigger forms_updated_at_trigger
    before update
    on forms
    for each row
execute function update_timestamp();

create table if not exists stores
(
    ulid       varchar(255) not null,
    form_ulid  varchar(255) not null references forms (ulid) on delete cascade,
    store      jsonb        not null,
    created_at timestamp    not null default current_timestamp,
    updated_at timestamp    not null default current_timestamp,
    primary key (ulid)
);
create or replace trigger stores_updated_at_trigger
    before update
    on stores
    for each row
execute function update_timestamp();

create table if not exists form_payments
(
    form_ulid    varchar(255) not null references forms (ulid) on delete cascade,
    payment_ulid varchar(255) not null references payments (ulid) on delete cascade,
    created_at   timestamp    not null default current_timestamp,
    updated_at   timestamp    not null default current_timestamp,
    primary key (form_ulid, payment_ulid)
);
create or replace trigger form_payments_updated_at_trigger
    before update
    on form_payments
    for each row
execute function update_timestamp();

create table store_payments
(
    store_ulid   varchar(255) not null references stores (ulid) on delete cascade,
    payment_ulid varchar(255) not null references payments (ulid) on delete cascade,
    created_at   timestamp    not null default current_timestamp,
    updated_at   timestamp    not null default current_timestamp,
    primary key (store_ulid, payment_ulid)
);
create or replace trigger store_payments_updated_at_trigger
    before update
    on store_payments
    for each row
execute function update_timestamp();

create table if not exists form_responses
(
    form_ulid  varchar(255) not null references forms (ulid) on delete cascade,
    user_ulid  varchar(255) not null references users (ulid) on delete cascade,
    response   jsonb        not null,
    created_at timestamp    not null default current_timestamp,
    updated_at timestamp    not null default current_timestamp,
    primary key (form_ulid, user_ulid)
);
create or replace trigger form_responses_updated_at_trigger
    before update
    on form_responses
    for each row
execute function update_timestamp();

create table if not exists store_responses
(
    store_ulid varchar(255) not null references stores (ulid) on delete cascade,
    user_ulid  varchar(255) not null references users (ulid) on delete cascade,
    response   jsonb,
    created_at timestamp    not null default current_timestamp,
    updated_at timestamp    not null default current_timestamp,
    primary key (store_ulid, user_ulid)
);

create or replace trigger store_responses_updated_at_trigger
    before update
    on store_responses
    for each row
execute function update_timestamp();

create table if not exists sys_logs
(
    id         serial primary key,
    level      varchar(10) not null,
    message    text        not null,
    created_at timestamp   not null default current_timestamp
);
create or replace trigger sys_logs_updated_at_trigger
    before update
    on sys_logs
    for each row
execute function update_timestamp();