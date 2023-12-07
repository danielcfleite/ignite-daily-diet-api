import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('Meals', (table)=>{
        table.uuid('id').primary()
        table.uuid('user_id').unsigned()
        table.foreign('user_id').references('id').inTable('users');
            table.text('title').notNullable()
            table.text('description').defaultTo('no description')
            table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
            table.boolean('is_on_diet').notNullable()
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('Meals')
}

