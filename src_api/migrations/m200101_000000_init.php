<?php

use yii\db\Migration;

class m200101_000000_init extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            // http://stackoverflow.com/questions/766809/whats-the-difference-between-utf8-general-ci-and-utf8-unicode-ci
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('role', [
            'id' => $this->primaryKey(),
            'name' => $this->string()->notNull()->unique(),
            'description' => $this->text(),
            'is_active' => $this->smallInteger()->notNull()->defaultValue(1),
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer(),
            'deleted_at' => $this->integer(),
            'created_by' => $this->bigInteger(),
            'updated_by' => $this->bigInteger(),
        ], $tableOptions);

        $this->createTable('user', [
            'id' => $this->bigPrimaryKey(),
            'role_id' => $this->integer()->notNull(),
            'username' => $this->string(16)->notNull()->unique(),
            'auth_key' => $this->string(32),
            'password_hash' => $this->string()->notNull(),
            'email' => $this->string()->notNull()->unique(),
            'verification_token' => $this->string(32),
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer(),
            'deleted_at' => $this->integer(),
            'created_by' => $this->bigInteger(),
            'updated_by' => $this->bigInteger(),
        ], $tableOptions);

        $this->createTable('refresh_token', [
            'value' => $this->string()->notNull(),
            'user_id' => $this->bigInteger()->notNull(),
            'user_ip' => $this->string(32)->notNull(),
        ], $tableOptions);
        $this->createIndex('value', 'refresh_token', ['value'], true);
        $this->createIndex('uid_ip', 'refresh_token', ['user_id', 'user_ip'], true);

        $this->seed();
    }

    public function seed()
    {
        $this->insert('role', ['id' => 1, 'name' => 'Administrator', 'created_at' => time(), 'created_by' => 1]);

        $this->insert('user', [
            'id' => 1,
            'username' => 'admin',
            'password_hash' => '$2b$10$NSV6c/D123eMGdjgYK.sRewGWHzS3rFCcjHDrHrQs2Imea7lgUFCi', // password=123456789
            'role_id' => 1,
            'email' => 'admin@system.app',
            'auth_key' => '',
            'created_at' => time(),
            'created_by' => 1,
        ]);
    }
}
