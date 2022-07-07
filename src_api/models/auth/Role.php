<?php

namespace app\models\auth;

use Yii;

/**
 * This is the model class for table "user_role".
 *
 * @property int $id
 * @property string $name
 */
class Role extends \yii\db\ActiveRecord
{
    use \app\models\Listable;

    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'role';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['id'], 'integer'],
            [['name'], 'string', 'max' => 255],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name' => 'Role',
        ];
    }

    public function fields()
    {
        return ['id', 'name'];
    }
}
