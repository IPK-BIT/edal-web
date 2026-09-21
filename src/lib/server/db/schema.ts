import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const submissions = sqliteTable('submissions', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	gitlab_token: text('gitlab_token'),
	rocrate_link: text('rocrate_link'),
	user_id: integer(),
	arc_id: integer(),
	access_token_hash: text('access_token_hash').notNull(),
	submitted_at: integer('submitted_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

export const scorpion = sqliteTable('scorpion', {
	token: text('token')
});
