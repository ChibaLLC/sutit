create table if not exists `users`
(
    `id`         int(11) unsigned not null auto_increment,
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
    `id`         int(11) unsigned not null auto_increment,
    `user_id`    int(11) unsigned not null,
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
    `id`         int(11) unsigned not null auto_increment,
    `user_id`    int(11) unsigned not null,
    `paybill`    varchar(30)      not null,
    `amount`     int(11) unsigned not null,
    `created_at` timestamp        not null default current_timestamp,
    `updated_at` timestamp        not null default current_timestamp on update current_timestamp,
    primary key (`id`),
    foreign key (`user_id`) references `users` (`id`)
);

create table if not exists `forms`
(
    `id`               int(11) unsigned not null auto_increment,
    `form_uuid`        varchar(255)     not null unique,
    `user_id`          int(11) unsigned not null,
    `form_name`        varchar(255)     not null,
    `form_description` text,
    `payment_details`  int(11) unsigned,
    `created_at`       timestamp        not null default current_timestamp,
    `updated_at`       timestamp        not null default current_timestamp on update current_timestamp,
    primary key (`id`),
    foreign key (`user_id`) references `users` (`id`) on delete cascade,
    foreign key (`payment_details`) references `payment_details` (`id`) on delete set null
);

create table if not exists `form_payments`
(
    `id`         int(11) unsigned not null auto_increment,
    `form_id`    int(11) unsigned not null,
    `amount`     int(11) unsigned not null,
    `paybill`    varchar(30)      not null,
    `created_at` timestamp        not null default current_timestamp,
    `updated_at` timestamp        not null default current_timestamp on update current_timestamp,
    primary key (`id`),
    foreign key (`form_id`) references `forms` (`id`) on delete cascade
);


create table if not exists `form_fields`
(
    `id`                int(11) unsigned not null auto_increment,
    `form_id`           int(11) unsigned not null,
    `field_name`        varchar(255)     not null unique,
    `field_description` text,
    `field_type`        varchar(255)     not null,
    `field_options`     json,
    `form_position`     int(11) unsigned not null,
    `created_at`        timestamp        not null default current_timestamp,
    `updated_at`        timestamp        not null default current_timestamp on update current_timestamp,
    `required`          boolean          not null default false,
    primary key (`id`),
    foreign key (`form_id`) references `forms` (`id`) on delete cascade
);
create table if not exists `responses`
(
    `id`         int(11) unsigned not null auto_increment,
    `form_id`    int(11) unsigned not null,
    `user_id`    int(11) unsigned not null unique,
    `created_at` timestamp        not null default current_timestamp,
    `updated_at` timestamp        not null default current_timestamp on update current_timestamp,
    primary key (`id`),
    foreign key (`form_id`) references `forms` (`id`) on delete cascade,
    foreign key (`user_id`) references `users` (`id`) on delete cascade
);
create table if not exists `response_data`
(
    `id`            int(11) unsigned not null auto_increment,
    `response_id`   int(11) unsigned not null,
    `form_field_id` int(11) unsigned not null,
    `value`         text,
    primary key (`id`),
    foreign key (`response_id`) references `responses` (`id`) on delete cascade,
    foreign key (`form_field_id`) references `form_fields` (`id`) on delete cascade
);
create table if not exists payments
(
    id         int(11) unsigned not null auto_increment,
    user_id    int(11) unsigned not null,
    amount     int(11) unsigned not null,
    created_at timestamp        not null default current_timestamp,
    updated_at timestamp        not null default current_timestamp on update current_timestamp,
    primary key (id),
    foreign key (user_id) references users (id)
);
create table if not exists sys_logs
(
    id         int(11) unsigned not null auto_increment,
    type       varchar(10)      not null,
    message    text             not null,
    created_at timestamp        not null default current_timestamp,
    primary key (id)
);

create table if not exists `orders`
(
    id         int(11) unsigned not null auto_increment primary key,
    order_id   varchar(255)     not null,
    phone      varchar(255)     not null,
    amount     int(11) unsigned not null,
    paid       boolean          not null default false,
    created_at timestamp        not null default current_timestamp,
    updated_at timestamp        not null default current_timestamp on update current_timestamp
);