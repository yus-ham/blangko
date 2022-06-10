<?php

namespace app\models\auth;

use Yii;

class RefreshToken extends \yii\db\ActiveRecord
{
    public static function tableName()
    {
        return 'refresh_token';
    }

    public function getUser()
    {
        return $this->hasOne(User::class, ['id' => 'user_id']);
    }
}
