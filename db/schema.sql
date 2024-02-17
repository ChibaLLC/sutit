create table if not exists `users`
(
    `id`         integer unsigned not null auto_increment,
    `name`       varchar(255)     not null,
    `email`      varchar(255)     not null unique,
    `password`   varchar(255)     not null,
    `salt`       varchar(255)     not null,
    `is_deleted` boolean,
    `created_at` timestamp        not null default current_timestamp,
    `updated_at` timestamp        not null default current_timestamp on update current_timestamp,
    primary key (`id`)
);
create table if not exists `sessions`
(
    `id`         integer unsigned not null auto_increment,
    `user_id`    integer unsigned not null,
    `token`      varchar(255)     not null unique,
    `is_valid`   boolean          not null default true,
    `created_at` timestamp        not null default current_timestamp,
    `updated_at` timestamp        not null default current_timestamp on update current_timestamp,
    primary key (`id`),
    foreign key (`user_id`) references `users` (`id`)
);
alter table `sessions`
    add index `token_index` (`token`);

create table if not exists `payment_details`
(
    `id`         integer unsigned not null auto_increment,
    `form_id`    integer unsigned not null,
    `amount`     integer unsigned not null,
    `created_at` timestamp        not null default current_timestamp,
    `updated_at` timestamp        not null default current_timestamp on update current_timestamp,
    primary key (`id`)
);

create table if not exists `forms`
(
    `id`               integer unsigned not null auto_increment,
    `form_uuid`        varchar(255)     not null unique,
    `user_id`          integer unsigned not null,
    `form_name`        varchar(255)     not null,
    `form_description` text,
    `payment_details`  integer unsigned,
    `created_at`       timestamp        not null default current_timestamp,
    `updated_at`       timestamp        not null default current_timestamp on update current_timestamp,
    primary key (`id`),
    foreign key (`user_id`) references `users` (`id`) on delete cascade,
    foreign key (`payment_details`) references `payment_details` (`id`) on delete set null
);

alter table `payment_details`
    add foreign key (`form_id`) references `forms` (`id`) on delete cascade;

create table if not exists `form_payments`
(
    `id`           integer unsigned not null auto_increment,
    `form_id`      integer unsigned not null,
    `phone_number` varchar(15)      not null,
    `reference_code` varchar(255)   not null,
    `amount`       integer unsigned not null,
    `created_at`   timestamp        not null default current_timestamp,
    `updated_at`   timestamp        not null default current_timestamp on update current_timestamp,
    primary key (`id`),
    foreign key (`form_id`) references `forms` (`id`) on delete cascade
);
create table if not exists `form_fields`
(
    `id`                integer unsigned not null auto_increment,
    `form_id`           integer unsigned not null,
    `field_name`        varchar(255)     not null,
    `field_description` text,
    `field_type`        varchar(255)     not null,
    `field_options`     json,
    `form_position`     integer unsigned not null,
    `created_at`        timestamp        not null default current_timestamp,
    `updated_at`        timestamp        not null default current_timestamp on update current_timestamp,
    `required`          boolean          not null default false,
    primary key (`id`),
    foreign key (`form_id`) references `forms` (`id`) on delete cascade
);
create table if not exists `responses`
(
    `id`         integer unsigned not null auto_increment,
    `form_id`    integer unsigned not null,
    `user_id`    integer unsigned unique,
    `user_ulid`  varchar(255)     unique,
    `created_at` timestamp        not null default current_timestamp,
    `updated_at` timestamp        not null default current_timestamp on update current_timestamp,
    primary key (`id`),
    foreign key (`form_id`) references `forms` (`id`) on delete cascade,
    foreign key (`user_id`) references `users` (`id`) on delete cascade,
    check ((`user_id` is not null and `user_ulid` is null) or (`user_id` is null and `user_ulid` is not null))
);
create table if not exists `response_data`
(
    `id`            integer unsigned not null auto_increment,
    `response_id`   integer unsigned not null,
    `form_field_id` integer unsigned not null,
    `value`         text,
    primary key (`id`),
    foreign key (`response_id`) references `responses` (`id`) on delete cascade,
    foreign key (`form_field_id`) references `form_fields` (`id`) on delete cascade
);
create table if not exists payments
(
    id         integer unsigned not null auto_increment,
    user_id    integer unsigned not null,
    amount     integer unsigned not null,
    created_at timestamp        not null default current_timestamp,
    updated_at timestamp        not null default current_timestamp on update current_timestamp,
    primary key (id),
    foreign key (user_id) references users (id)
);

create table if not exists sys_logs
(
    id         integer unsigned not null auto_increment,
    type       varchar(10)      not null,
    message    text             not null,
    created_at timestamp        not null default current_timestamp,
    primary key (id)
);