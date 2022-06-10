<?php
namespace app\models\auth;

use Yii;
use yii\base\Model;

class Session extends Model
{
    public $type;
    public $username;
    public $password;
    public $rememberMe = true;
    private $_user = false;
    private $_rt;

    /**
     * @return array the validation rules.
     */
    public function rules()
    {
        return [
            ['type', 'required'],
            ['username', 'trim'],
            ['rememberMe', 'boolean'],
            [['username', 'password'], 'safe'],
        ];
    }

    public function getPrimaryKey()
    {
        return [$this->token];
    }

    public function save()
    {
        if (!$this->validate()) {
            return;
        }

        if ($this->type === 'basic') {
            $this->validateBasic() && $this->createRefreshToken();
        } else {
            $this->validateRefreshToken();
        }

        return !$this->hasErrors();
    }

    /**
     * Validates the password.
     * This method serves as the inline validation for password.
     *
     * @param string $attribute the attribute currently being validated
     * @param array $params the additional name-value pairs given in the rule
     */
    public function validateBasic()
    {
        $user = $this->getUser();
        if (!$user || !$user->validatePassword($this->password)) {
            return $this->addError('password', 'Periksa lagi username atau password yang anda masukkan.');
        }
        return true;
    }

    public function validateRefreshToken()
    {
        $this->_rt = $token = RefreshToken::find()->joinWith('user')->where(['value' => $this->password])->one();

        if (!$token) {
            return $this->addError('password', 'Invalid token');
        }

        if ($token->expired_at < time()) {
            return $this->addError('password', 'Token Expired');
        }

        return $this->_user = $token->user;
    }
    
    /**
     * Finds user by [[username]]
     *
     * @return User|null
     */
    public function getUser() { 
        if ($this->_user === false) {
            $this->_user = User::find()
                ->where(['username' => $this->username])
                ->andWhere("deleted_at is null")
                ->one();
        }
        return $this->_user;
    }

    public function fields()
    {
        return [
            'identity' => fn() => $this->user,
            'token' => fn() => $this->token,
            'refresh_token' => fn() => $this->refreshToken->value,
        ];
    }
    
    public function getToken()
    {
        return $this->user->jwt;
    }

    public function getRefreshToken()
    {
        if (!$this->_rt) {
            $this->createRefreshToken();
        }

        return $this->_rt;
    }

    protected function createRefreshToken()
    {
        $data = [
            'user_ip' => Yii::$app->request->userIP,
            'user_id' => $this->user->id,
        ];

        $this->_rt = RefreshToken::findOne($data);

        if (!$this->_rt) {
            $this->_rt = new RefreshToken($data);
        }
        
        $this->_rt->expired_at = time() + 60 * 60 * 24;
        $this->_rt->value = Yii::$app->security->generateRandomString();

        return $this->_rt->save(false);
    }
}
