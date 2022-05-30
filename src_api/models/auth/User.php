<?php

namespace app\models\auth;

use Yii;
use Firebase\JWT\JWT;

class User extends \yii\db\ActiveRecord implements \yii\web\IdentityInterface
{
    const STATUS_DELETED = 0;
    const STATUS_INACTIVE = 9;
    const STATUS_ACTIVE = 10;
    const STATUS_UNVERIFIED = 20;

    public $password_repeat;
    public $old_password;
    public $new_password;
    public $new_password_repeat;
    public $user_role;

    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'user';
    }

    /**
     * {@inheritdoc}
     */
    public function behaviors()
    {
        return [
            new \yii\behaviors\TimestampBehavior([
                'value' => fn() => date('Y-m-d H:i:s'),
            ]),
        ];
    }

    public function rules()
    {
        return [
            [['username', 'role_id'], 'required'],
            ['email', 'email'],
            ['username', 'unique', 'message' => 'Username ini sudah digunakan.', 'filter' => ['deleted' => 0]],
            ['email', 'unique', 'message' => 'Alamat Email ini sudah digunakan.', 'filter' => ['deleted' => 0]],

            ['new_password', 'string', 'min' => 6],
            ['new_password_repeat', 'compare', 'compareAttribute' => 'new_password', 'message' => "Password Tidak Cocok"],

            [['new_password', 'new_password_repeat', 'old_password'], 'required', 'on' => 'update'],
            ['new_password', 'string', 'min' => 6],
            ['new_password_repeat', 'compare', 'compareAttribute' => 'new_password', 'message' => "Kata Sandi Tidak Cocok"],
        ];
    }

    public function beforeSave($insert)
    {
        if (!parent::beforeSave($insert)) {
            return;
        }

        if ($this->isNewRecord) {
            $this->generateAuthKey();
            $this->password = '1234';
        }

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'role_id' => 'User Role',
            'jenis_layanan_id' => 'Jenis Layanan',
            'password' => 'Kata Sandi',
            'password_repeat' => 'Konfirmasi Kata Sandi',
            'old_password' => 'Kata Sandi Saat Ini',
            'new_password' => 'Kata Sandi Baru',
            'new_password_repeat' => 'Konfirmasi Kata Sandi Baru',
        ];
    }

    /**
     * {@inheritdoc}
     */
    public static function findIdentity($id)
    {
        return static::findOne(['id' => $id, 'is_active' => 1]);
    }

    /**
     * {@inheritdoc}
     */
    public static function findIdentityByAccessToken($token, $type = null)
    {
        try {

            $jwt = JWT::decode($token, Yii::$app->params['jwt']['key'], [Yii::$app->params['jwt']['algorithm']]);
            return static::findOne($jwt->jti);
        } catch (\Exception $e) {
        }
    }

    public static function findIdentityByRefreshToken($token)
    {
        return static::find()->alias('u')->innerJoinWith('refreshToken')->where(['value' => $token])->one();
    }

    /**
     * {@inheritdoc}
     */
    public function getId()
    {
        return $this->getPrimaryKey();
    }

    /**
     * {@inheritdoc}
     */
    public function getAuthKey()
    {
    }

    /**
     * {@inheritdoc}
     */
    public function validateAuthKey($authKey)
    {
        return $this->getAuthKey() === $authKey;
    }

    /**
     * Validates password
     *
     * @param string $password password to validate
     * @return bool if password provided is valid for current user
     */
    public function validatePassword($password)
    {
        return Yii::$app->security->validatePassword($password, $this->password_hash);
    }

    /**
     * Generates password hash from password and sets it to the model
     *
     * @param string $password
     */
    public function setPassword($password)
    {
        $this->password_hash = Yii::$app->security->generatePasswordHash($password);
    }

    public function fields()
    {
        return [
            'id',
            'username',
            'email',
            'role_id',
            'role' => fn () => $this->role->name ?? '',
        ];
    }

    public function getRefreshToken()
    {
        return $this->hasOne(RefreshToken::class, ['user_id' => 'id']);
    }

    public function getJwt()
    {
        $issuedAt       = time();
        $notBefore      = $issuedAt;
        $expiredTime    = $issuedAt + 60 * 3; // 3 menit
        $hostInfo       = Yii::$app->request->hostInfo;

        $token = [
            'iat' => $issuedAt,
            'jti' => $this->getId(),
            'iss' => $hostInfo,
            'aud' => $hostInfo,
            'nbf' => $notBefore,
            'exp' => $expiredTime,
        ];

        return JWT::encode($token, Yii::$app->params['jwtKey'], 'HS512');
    }
}
