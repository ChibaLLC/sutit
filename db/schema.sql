create table if not exists `users` (
    `id` int(11) unsigned not null auto_increment,
    `name` varchar(255) not null,
    `email` varchar(255) not null unique,
    `password` varchar(255) not null,
    `salt` varchar(255) not null,
    `created_at` timestamp not null default current_timestamp,
    `updated_at` timestamp not null default current_timestamp on update current_timestamp,
    primary key (`id`)
);
create table if not exists `sessions` (
    `id` int(11) unsigned not null auto_increment,
    `user_id` int(11) unsigned not null,
    `token` varchar(255) not null unique,
    `is_valid` boolean not null default true,
    `created_at` timestamp not null default current_timestamp,
    `updated_at` timestamp not null default current_timestamp on update current_timestamp,
    primary key (`id`),
    foreign key (`user_id`) references `users` (`id`)
);
create table if not exists `forms` (
    `id` int(11) unsigned not null auto_increment,
    `user_id` int(11) unsigned not null,
    `form_name` varchar(255) not null,
    `created_at` timestamp not null default current_timestamp,
    `updated_at` timestamp not null default current_timestamp on update current_timestamp,
    primary key (`id`),
    foreign key (`user_id`) references `users` (`id`)
);
create table if not exists `form_fields` (
    `id` int(11) unsigned not null auto_increment,
    `form_id` int(11) unsigned not null,
    `field_name` varchar(255) not null,
    `field_type` varchar(255) not null,
    primary key (`id`),
    foreign key (`form_id`) references `forms` (`id`)
);
create table if not exists `responses` (
    `id` int(11) unsigned not null auto_increment,
    `form_id` int(11) unsigned not null,
    `user_id` int(11) unsigned not null,
    `created_at` timestamp not null default current_timestamp,
    `updated_at` timestamp not null default current_timestamp on update current_timestamp,
    primary key (`id`),
    foreign key (`form_id`) references `forms` (`id`),
    foreign key (`user_id`) references `users` (`id`)
);
create table if not exists `response_data` (
    `id` int(11) unsigned not null auto_increment,
    `response_id` int(11) unsigned not null,
    `form_field_id` int(11) unsigned not null,
    `value` text not null,
    primary key (`id`),
    foreign key (`response_id`) references `responses` (`id`),
    foreign key (`form_field_id`) references `form_fields` (`id`)
);