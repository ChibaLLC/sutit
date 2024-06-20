create or replace function update_timestamp()
    returns trigger as $$
begin
    new.updated_at = current_timestamp;
    return new;
end;
$$ language plpgsql;

create table if not exists users
(
    id         serial primary key,
    name       varchar(255) not null,
    email      varchar(255) not null unique,
    password   varchar(255) not null,
    salt       varchar(255) not null,
    is_deleted boolean,
    created_at timestamp    not null default current_timestamp,
    updated_at timestamp    not null default current_timestamp
);
create trigger users_updated_at_trigger
    before update
    on users
    for each row
execute function update_timestamp();

create table if not exists sessions
(
    id         serial primary key,
    user_id    integer      not null references users (id),
    token      varchar(255) not null unique,
    is_valid   boolean      not null default true,
    created_at timestamp    not null default current_timestamp,
    updated_at timestamp    not null default current_timestamp
);
create index if not exists token_index on sessions (token);
create trigger sessions_updated_at_trigger
    before update
    on sessions
    for each row
execute function update_timestamp();

create table if not exists payments
(
    id         serial primary key,
    user_id    integer   not null references users (id),
    amount     integer   not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);
create trigger payments_updated_at_trigger
    before update
    on payments
    for each row
execute function update_timestamp();

create table if not exists forms
(
    id               serial primary key,
    form_name        varchar(255) not null,
    user_id          integer      not null references users (id) on delete cascade,
    form_name        varchar(255) not null,
    form_description text,
    form             jsonb,
    created_at       timestamp    not null default current_timestamp,
    updated_at       timestamp    not null default current_timestamp
);
create trigger forms_updated_at_trigger
    before update
    on forms
    for each row
execute function update_timestamp();

create table if not exists form_payments
(
    id             serial primary key,
    form_id        integer      not null references forms (id) on delete cascade,
    payment_id     integer      not null references payments (id) on delete cascade,
    created_at     timestamp    not null default current_timestamp,
    updated_at     timestamp    not null default current_timestamp
);
create trigger form_payments_updated_at_trigger
    before update
    on form_payments
    for each row
execute function update_timestamp();


create table if not exists responses
(
    id         serial primary key,
    form_id    integer   not null references forms (id) on delete cascade,
    user_id    integer references users (id) on delete cascade,
    response   text,
    field     varchar(255) not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);
alter table responses
add constraint single_response_per_form unique (form_id, user_id);
create trigger responses_updated_at_trigger
    before update
    on responses
    for each row
execute function update_timestamp();

create table if not exists sys_logs
(
    id         serial primary key,
    level       varchar(10) not null,
    message    text        not null,
    created_at timestamp   not null default current_timestamp
);
create trigger sys_logs_updated_at_trigger
    before update
    on sys_logs
    for each row
execute function update_timestamp();